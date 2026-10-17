export const integrations: Record<string, { billing: 'developer' | 'user'; anonymous?: boolean }> = {
  google: { billing: 'user' },
  exa: { billing: 'developer' },
  firecrawl: { billing: 'developer' },
  anthropic: { billing: 'developer' },
}
