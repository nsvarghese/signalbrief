import { describe, expect, it } from 'vitest'
import { companyUrl, normalizeDomain, parseReport, priority, requestSchema } from './brief'
import { example } from './example'

describe('public company inputs', () => {
  it('normalizes a company domain and rejects private or ambiguous destinations', () => {
    expect(normalizeDomain(' https://www.linear.app/ ')).toBe('linear.app')
    expect(requestSchema.safeParse({ domain: 'localhost', seller: 'A product for engineering teams', criteria: ['B2B software'] }).success).toBe(false)
    for (const domain of ['http://linear.app', '127.0.0.1', 'localhost', 'https://user:pass@linear.app', 'linear.app/about', 'metadata.internal']) {
      expect(() => normalizeDomain(domain), domain).toThrow()
    }
  })
  it('bounds the seller context and the criteria list', () => {
    expect(requestSchema.safeParse({ domain: 'linear.app', seller: 'too short', criteria: ['B2B software'] }).success).toBe(false)
    expect(requestSchema.safeParse({ domain: 'linear.app', seller: 'A product for engineering teams', criteria: Array(4).fill('B2B software') }).success).toBe(false)
  })
  it('accepts company subdomains but rejects lookalike domains and unsafe links', () => {
    expect(companyUrl('https://docs.linear.app/start', 'linear.app')).toContain('docs.linear.app')
    expect(companyUrl('https://linear.app.evil.com/', 'linear.app')).toBeNull()
    expect(companyUrl('javascript:alert(1)', 'linear.app')).toBeNull()
  })
})

describe('model output trust boundary', () => {
  it('parses structured output and derives an explainable recommendation', () => {
    const report = parseReport(JSON.stringify(example.report), example.sources, 3)
    expect(priority(report).label).toBe('Review for outreach')
  })
  it('rejects invented citations and missing criterion coverage', () => {
    expect(() => parseReport(JSON.stringify({ ...example.report, summary: { text: 'Unsupported', sourceIds: ['invented'] } }), example.sources, 3)).toThrow('unknown source')
    expect(() => parseReport(JSON.stringify({ ...example.report, assessments: [example.report.assessments[0], example.report.assessments[0], example.report.assessments[2]] }), example.sources, 3)).toThrow('exactly once')
  })
  it('rejects confident assessments without evidence', () => {
    const report = structuredClone(example.report)
    report.assessments[0].sourceIds = []
    expect(() => parseReport(JSON.stringify(report), example.sources, 3)).toThrow('must cite')
  })
})

