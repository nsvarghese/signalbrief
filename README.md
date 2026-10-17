# SignalBrief

A focused account-research app built by Nathan Varghese for the DeepSpace AI-Native GTM Engineer build exercise.

Live app: https://signalbrief-nathan.app.space

Repository: https://github.com/nsvarghese/signalbrief

Example outputs: [Vapi, Retool, and LangChain account briefs](docs/examples/README.md), including Nathan's saved Vapi opening-message revision and notes on generated claims that need review.

Enter one company domain, describe what you sell, and supply up to three fit criteria. SignalBrief finds company-owned evidence, assesses fit, proposes a cautious outreach angle, and saves an editable opening message alongside its sources.

## Run

Requires Node 22.15+, 24, or 26 and npm 11.6+.

```sh
npm ci
npx deepspace auth login
npx deepspace dev start
```

The deployed app name and immutable app ID are in `wrangler.toml`. To deploy an independent copy, follow DeepSpace's app-identity documentation; do not deploy a copy over this app. `ENABLE_PAID_RESEARCH` is the explicit live-call switch. All integrations bill the app owner's DeepSpace credits. No provider keys are stored in this repository.

## Useful integrations

| DeepSpace endpoint | Product purpose |
| --- | --- |
| `exa/search` | Discover up to three relevant pages on the target company's domain, with bounded text excerpts. |
| `firecrawl/scrape` | Extract readable content from the company's homepage. If it fails, keep usable search evidence and show a warning. |
| `anthropic/chat-completion` | Produce a structured assessment and outreach draft from the saved evidence, using Claude Haiku 4.5. |

DeepSpace also supplies OAuth sign-in, schema validation, records in a SQLite-backed Durable Object, server-side ownership permissions, real-time updates, confirmed mutations, server actions, hosting, and integration billing.

## Main tradeoff

Depth for one account rather than bulk prospecting. Research uses company-owned pages to avoid confusing similarly named companies, making the product useful for preparing an initial conversation. This also limits independent verification: company claims are not independently established facts, undated content is not called recent, and a product announcement does not prove buying intent. Every output needs human review.

Search/extraction and synthesis are separate server actions. Evidence is saved first, so a model failure does not force another search or extraction call. A retry reuses the evidence. This adds a small amount of state management but makes failures understandable and less wasteful.

## Read the code

- `src/domain/brief.ts`: domain validation, input/output schemas, citation checks, prompt, and the deterministic recommendation rule.
- `src/actions/briefs.ts`: bounded provider calls, durable usage reservations, evidence persistence, and synthesis ownership check.
- `src/schemas/briefs-schema.ts`: private briefs and server-only quota reservations.
- `src/pages/(app)/home.tsx`: research form, saved notebook, retry, confirmed edits, and deletion.
- `src/components/BriefView.tsx`: shared brief/evidence UI used by real records and the clearly labeled fictional preview.
- `worker.ts`: original DeepSpace assembly with direct integration access closed in favor of the bounded server actions.

## Security and cost boundaries

Briefs are private to their server-set creator for both members and admins. Server action tools bypass collection permissions, so synthesis explicitly compares `createdBy` to the authenticated caller before reading sources or making a paid call. Quota reservations are inaccessible to client mutations and use a Durable Object uniqueness constraint to enforce concurrent limits.

Research is capped at three runs per user and twelve across the app per UTC day; synthesis is capped at six per user and twenty-four across the app per UTC day. Failed attempts consume a slot deliberately. Inputs, source count, source length, and model output tokens are bounded. These are request limits, not a guaranteed dollar budget. The app never purchases credits or upgrades an account.

Source text is untrusted input. Model responses are validated as structured JSON; criteria must be covered exactly once, citations must reference stored evidence IDs, and supported/contradicted assessments require citations. Structural validation does not establish the truth of model interpretations. React renders source text as text rather than HTML.

`.dev.vars`, local DeepSpace state, credentials, test sessions, build output, and test screenshots are ignored by Git. Provider calls run server-side through DeepSpace's integration proxy. The app's raw browser integration route is closed so it cannot bypass the workflow's quota checks.

## Validation

```sh
npm run type-check
npm run test:unit
npx deepspace test run all
```

Most checks do not call paid services. The live browser test is opt-in:

```sh
# PowerShell
$env:SIGNALBRIEF_LIVE_TEST = '1'
npx deepspace test run all
```

That test uses two developer-owned DeepSpace test accounts from the SDK credential store and makes one real three-integration pipeline call. It checks source-backed generation, editing, reload persistence, another user's read isolation, and refusal of cross-user synthesis. Do not enable it without available credits. Unit tests cover invalid inputs, invented citations, quota failures, partial extraction failure, and ownership denial. See `docs/VERIFICATION.md` for observed results and limits.

## Intentionally omitted

Bulk imports, CRM sync, automated outreach, recurring monitoring, and an agent chat panel. They do not improve the small core workflow enough to justify their implementation and verification cost within this exercise.

Next improvements would be better source selection (especially clean changelog excerpts), deduplication across runs, and richer evidence-quality checks. The current app keeps at most fifty briefs visible in its notebook query; it does not implement pagination for a large archive.

## Agent and applicant work

The coding agent implemented the scaffold extensions, provider orchestration, UI, tests, documentation, and deployment workflow. An independent agent reviewed authorization and draft handling. Nathan's personal checks must be recorded separately in `docs/NATHAN_REVIEW.md`; agent-run tests are not presented as Nathan's own verification.

