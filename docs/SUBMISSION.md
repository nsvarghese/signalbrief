# Submission note — working draft

I built SignalBrief, an account-research app that turns one company domain and a short ICP into a saved GTM brief with source-linked fit assessments, a possible outreach trigger, and an editable opening message.

It uses three DeepSpace integrations: Exa to discover relevant company-owned pages, Firecrawl to extract homepage content, and Anthropic to synthesize a structured brief. DeepSpace provides authentication, private real-time records, server actions, and deployment. Evidence is persisted before synthesis so a model failure can be retried without repeating research.

The main tradeoff was depth on one account over bulk prospecting. I left out CRM sync, automatic sending, and scheduled monitoring to finish and verify the core flow. Company-owned sources reduce entity ambiguity but do not provide independent verification; the app shows uncertainty and keeps the source text inspectable.

The coding agent implemented the app, tests, and deployment workflow. It also used an independent review to check permissions and draft handling.

[Replace this paragraph with Nathan's actual verification and any personal changes. Do not submit it as a completed claim. See NATHAN_REVIEW.md.]

Known limits: excerpt selection can miss important context; citations are structurally validated but model interpretations still require review; the notebook shows up to fifty saved briefs. Next I would improve source selection and evidence-quality checks.
