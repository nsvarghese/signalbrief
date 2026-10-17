import { describe, expect, it, vi } from 'vitest'
import type { ActionContext, ActionTools } from 'deepspace/worker'
import type { Env } from '../../worker'
import { research, reserve, synthesize } from './briefs'
import { example } from '../domain/example'

function context(overrides: Partial<ActionTools> = {}): ActionContext<Env> {
  return { userId: 'alice', callerJwt: 'test-token', env: { ENABLE_PAID_RESEARCH: 'true' } as Env, params: {}, tools: {
    create: vi.fn().mockResolvedValue({ success: true, data: { recordId: 'brief-1' } }),
    update: vi.fn().mockResolvedValue({ success: true, data: { recordId: 'brief-1' } }),
    get: vi.fn(), integration: vi.fn(), ...overrides,
  } as unknown as ActionTools }
}

describe('research actions', () => {
  it('reserves a different durable slot after a collision, then refuses at the cap', async () => {
    const create = vi.fn().mockResolvedValue({ success: false, error: 'Duplicate: key' })
    const ctx = context({ create })
    await expect(reserve(ctx.tools, 'user-day', 3)).rejects.toThrow('daily demo allowance')
    expect(create).toHaveBeenCalledTimes(3)
    expect(create.mock.calls.map(call => call[1].key)).toEqual(['user-day:0','user-day:1','user-day:2'])
  })
  it('fails closed when usage reservation is unavailable', async () => {
    const ctx = context({ create: vi.fn().mockResolvedValue({ success: false, error: 'Service unavailable' }) })
    ctx.params = { domain: 'linear.app', seller: 'We build technical onboarding software', criteria: ['B2B software'] }
    expect((await research(ctx)).success).toBe(false)
    expect(ctx.tools.integration).not.toHaveBeenCalled()
  })
  it('keeps usable search evidence when extraction fails', async () => {
    const integration = vi.fn().mockResolvedValueOnce({ success: true, data: { results: [{ title: 'Product', url: 'https://linear.app/product', text: 'Software for product teams.' }] } }).mockResolvedValueOnce({ success: false, error: 'Timeout' })
    const ctx = context({ integration })
    ctx.params = { domain: 'linear.app', seller: 'We build technical onboarding software', criteria: ['B2B software'] }
    expect((await research(ctx)).success).toBe(true)
    const calls = vi.mocked(ctx.tools.create).mock.calls
    const saved = calls.find(call => call[0] === 'briefs')![1]
    expect(JSON.parse(String(saved.sourcesJson))).toHaveLength(1)
    expect(JSON.parse(String(saved.warningsJson))).toHaveLength(1)
  })
  it('denies another user before any paid synthesis call', async () => {
    const ctx = context({ get: vi.fn().mockResolvedValue({ success: true, data: { record: { createdBy: 'bob', data: {} } } }) })
    ctx.params = { recordId: 'bobs-brief' }
    expect((await synthesize(ctx)).success).toBe(false)
    expect(ctx.tools.integration).not.toHaveBeenCalled()
    expect(ctx.tools.update).not.toHaveBeenCalled()
  })
  it('does not overwrite evidence or draft when a model response is invalid', async () => {
    const ctx = context({ get: vi.fn().mockResolvedValue({ success: true, data: { record: { createdBy: 'alice', data: { domain: 'linear.app', seller: 'We build technical onboarding software', criteriaJson: JSON.stringify(example.criteria), sourcesJson: JSON.stringify(example.sources) } } } }), integration: vi.fn().mockResolvedValue({ success: true, data: { content: [{ type: 'text', text: 'not json' }] } }) })
    ctx.params = { recordId: 'brief-1' }
    expect((await synthesize(ctx)).success).toBe(false)
    expect(ctx.tools.update).not.toHaveBeenCalled()
  })
})
