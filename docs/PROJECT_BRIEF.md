# SignalBrief — provisional exercise scope

Status: planning; exact application task and deadline still needed.

## User and outcome
A technical founder or GTM engineer researching one target account needs a concise, evidence-backed reason to prioritize it and a relevant opening message.

## Core flow
1. Sign in and enter a company domain plus a short seller/ICP description.
2. Search for company information, extract selected public pages, then synthesize a structured brief.
3. Show evidence links, fit rationale, a possible buying trigger, uncertainties, and an editable opening message.
4. Save the brief and return to it later.

## Integration plan (unverified until CLI catalog inspection)
- Search provider for discovery.
- Extraction provider for page text.
- LLM provider for structured synthesis.
Do not count SDK auth or persistence as third-party integrations without the rubric saying they count.

## Scope boundary
One account per run. No bulk lists, CRM sync, automatic sending, arbitrary URL crawling, recurring jobs, or multi-agent orchestration.

## Engineering decisions
- Keep scoring deterministic and editable; explain the inputs rather than inventing precise confidence numbers.
- Keep research evidence separate from model interpretations.
- Validate model output and evidence references before storing it.
- Bound input size, source count, output size, execution time, and retry count.
- Treat retrieved page text as untrusted input.
- Require authentication and enforce record ownership server-side.
- Inspect platform billing and authorization before enabling paid calls.
- Keep credentials out of source, logs, browser bundles, and documentation.
- Make provider failure visible; never present demo fixtures as live results.

## Acceptance checks
- A real company produces a source-backed brief through three verified integrations.
- A brief survives reload and can be edited.
- Another user cannot read or change private briefs.
- Invalid domain, empty search, extraction failure, malformed model output, and provider timeout have understandable recovery paths.
- Production smoke test succeeds on the deployed DeepSpace URL.

## Five-day target (dates pending)
1. Validate requirements and provider access; scaffold and deploy a minimal vertical slice.
2. Implement research and evidence capture.
3. Add synthesis, editing, and persistence.
4. Test authorization and failure paths; verify deployment.
5. Polish documentation and rehearse an explain-and-change session.

## Submission evidence
Record actual integration endpoints, test results, deployment URL, and repository URL. Explain the main tradeoff: depth for one account over bulk prospecting. Attribute agent work accurately. Nathan's personal verification section remains pending until Nathan performs and reports the checks.
