import type { Evidence, Report } from './brief'
export const example = {
  domain: 'Northstar Labs · fictional example',
  criteria: ['Sells a B2B software product', 'Has a technical customer deployment', 'Has evidence of an expanding product'],
  sources: [
    { id: 'S1', title: 'Fictional product page', url: 'https://example.com/', text: 'Northstar Labs builds workflow software for engineering teams. Customers connect their internal data during onboarding.', publishedDate: null, retrievedAt: '2026-10-17T12:00:00Z', kind: 'website' },
    { id: 'S2', title: 'Fictional product announcement', url: 'https://example.com/announcement', text: 'Northstar Labs announced a new connector SDK. Publication date is unknown.', publishedDate: null, retrievedAt: '2026-10-17T12:00:00Z', kind: 'search' },
  ] satisfies Evidence[],
  report: {
    summary: { text: 'Northstar Labs describes workflow software for engineering teams, with internal data connections during onboarding.', sourceIds: ['S1'] },
    assessments: [
      { criterionIndex: 0, verdict: 'supported', reason: 'Its stated audience is engineering teams using workflow software.', sourceIds: ['S1'] },
      { criterionIndex: 1, verdict: 'supported', reason: 'Connecting internal data suggests a technical onboarding step; implementation complexity remains unknown.', sourceIds: ['S1'] },
      { criterionIndex: 2, verdict: 'supported', reason: 'The connector SDK is evidence of a product addition. Its date is unknown.', sourceIds: ['S2'] },
    ],
    trigger: { text: 'The connector SDK could be a useful conversation starter about onboarding. It does not establish current buying intent.', sourceIds: ['S2'] },
    openingMessage: 'Hi Northstar team — I saw the connector SDK announcement. How are you helping customers get their first internal data connection running? We build deployment checklists for technical teams, and I would be interested to learn whether that part of onboarding is already well covered.',
    unknowns: ['Team size and budget are unknown.', 'No evidence establishes when the connector SDK launched.', 'Company statements have not been independently verified.'],
  } satisfies Report,
}
