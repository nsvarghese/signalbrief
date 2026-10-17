import type { ActionHandler, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'
import { companyUrl, parseReport, requestSchema, synthesisMessages, type Evidence } from '../domain/brief'
import { z } from 'zod'

const searchSchema = z.object({ results: z.array(z.object({ title: z.string(), url: z.string(), text: z.string().optional(), publishedDate: z.string().nullable().optional() })) })
const scrapeSchema = z.object({ data: z.object({ markdown: z.string(), metadata: z.object({ title: z.string().optional() }).passthrough().optional() }) })
const completionSchema = z.object({ content: z.array(z.object({ type: z.string(), text: z.string().optional() })) })

/** Immutable unique slots make concurrent requests share a durable daily cap. */
export async function reserve(tools: ActionTools, key: string, limit: number) {
  for (let slot = 0; slot < limit; slot++) {
    const result = await tools.create('research-quota', { key: `${key}:${slot}` })
    if (result.success) return
    if (!result.error.startsWith('Duplicate:')) throw new Error('Usage checks are unavailable. No new paid calls were started.')
  }
  throw new Error('The daily demo allowance has been reached. Saved briefs remain available. Try again after midnight UTC.')
}

async function allowance(tools: ActionTools, userId: string, kind: 'research' | 'synthesis') {
  const day = new Date().toISOString().slice(0, 10)
  await reserve(tools, `${kind}:${day}:user:${userId}`, kind === 'research' ? 3 : 6)
  await reserve(tools, `${kind}:${day}:app`, kind === 'research' ? 12 : 24)
}

function failure(error: unknown) {
  return { success: false as const, error: error instanceof z.ZodError ? 'The input or provider response did not match the expected format. Check your input and retry this step.' : error instanceof Error ? error.message : 'This step could not finish. Try again.' }
}

export const research: ActionHandler<Env> = async ({ userId, params, tools, env }) => {
  try {
    const input = requestSchema.parse(params)
    if (env.ENABLE_PAID_RESEARCH !== 'true') return { success: false, error: 'Live research is not enabled yet. You can explore the labeled example.' }
    await allowance(tools, userId, 'research')
    const warnings: string[] = []
    const retrievedAt = new Date().toISOString()
    // Search first; extraction failure can keep the already-paid search evidence.
    const search = await tools.integration('exa/search', { query: `${input.domain} products customers integrations hiring announcements`, includeDomains: [input.domain], numResults: 3, contents: { text: { maxCharacters: 4000 } } })
    if (!search.success) return search
    const found = searchSchema.parse(search.data)
    const sources: Evidence[] = []
    const scrape = await tools.integration('firecrawl/scrape', { url: `https://${input.domain}/`, formats: ['markdown'], onlyMainContent: true, timeout: 20000 })
    if (scrape.success) {
      const parsed = scrapeSchema.safeParse(scrape.data)
      if (parsed.success && parsed.data.data.markdown.trim()) sources.push({ id: 'S1', title: parsed.data.data.metadata?.title ?? input.domain, url: `https://${input.domain}/`, text: parsed.data.data.markdown.slice(0, 4500), retrievedAt, publishedDate: null, kind: 'website' })
      else warnings.push('Website extraction returned no usable text. This brief uses search evidence only.')
    } else warnings.push('Website extraction did not finish. This brief uses search evidence only.')
    for (const item of found.results) {
      const url = companyUrl(item.url, input.domain)
      if (!url || !item.text?.trim() || sources.some(source => source.url.replace(/\/$/, '') === url.replace(/\/$/, ''))) continue
      sources.push({ id: `S${sources.length + 1}`, title: item.title.slice(0, 240), url, text: item.text.slice(0, 4500), retrievedAt, publishedDate: item.publishedDate ?? null, kind: 'search' })
    }
    if (!sources.length) return { success: false, error: 'No usable company-owned evidence was found. Check the domain or try another company.' }
    const saved = await tools.create('briefs', { domain: input.domain, seller: input.seller, criteriaJson: JSON.stringify(input.criteria), sourcesJson: JSON.stringify(sources), reportJson: '', draft: '', warningsJson: JSON.stringify(warnings) })
    if (!saved.success) { console.error('brief-save failed:', saved.error); return { success: false, error: 'Research finished, but the brief could not be saved. Please try again.' } }
    return { success: true, data: { recordId: saved.data.recordId } }
  } catch (error) { return failure(error) }
}

export const synthesize: ActionHandler<Env> = async ({ userId, params, tools, env }) => {
  try {
    const { recordId } = z.object({ recordId: z.string().min(1).max(200) }).parse(params)
    const record = await tools.get('briefs', recordId)
    // Action tools bypass collection RBAC: explicitly check the server-set creator.
    if (!record.success || record.data.record.createdBy !== userId) return { success: false, error: 'Brief not found or access denied.' }
    if (env.ENABLE_PAID_RESEARCH !== 'true') return { success: false, error: 'Live synthesis is not enabled yet.' }
    const data = record.data.record.data
    const input = requestSchema.parse({ domain: data.domain, seller: data.seller, criteria: JSON.parse(String(data.criteriaJson)) })
    const sources = z.array(z.object({ id: z.string(), title: z.string(), url: z.string(), text: z.string().max(4500), publishedDate: z.string().nullable(), retrievedAt: z.string(), kind: z.enum(['website', 'search']) })).min(1).max(4).parse(JSON.parse(String(data.sourcesJson)))
    await allowance(tools, userId, 'synthesis')
    const response = await tools.integration('anthropic/chat-completion', { model: 'claude-haiku-4-5', max_tokens: 1800, temperature: 0, ...synthesisMessages(input, sources) })
    if (!response.success) return response
    const completion = completionSchema.parse(response.data)
    const report = parseReport(completion.content.filter(block => block.type === 'text').map(block => block.text ?? '').join(''), sources, input.criteria.length)
    const saved = await tools.update('briefs', recordId, { reportJson: JSON.stringify(report), draft: report.openingMessage })
    if (!saved.success) return { success: false, error: 'The analysis could not be saved. Your research evidence is still available.' }
    return { success: true, data: { recordId } }
  } catch (error) { return failure(error) }
}

