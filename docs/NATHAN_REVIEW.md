# Nathan's review

Confirmed from Nathan's pasted results and follow-up:

- Researched Vapi, Retool, and LangChain in the deployed app using one consistent seller description and three fit criteria.
- Shared the generated briefs for review with the coding agent.
- Saved the revised Vapi opening message after that review.

The agent identified unsupported assumptions and an invented seller-experience claim in the generated drafts. Those findings must not be attributed to Nathan independently. Nathan has not separately confirmed opening source excerpts, reloading after the edit, trying invalid inputs, or personally modifying code. Automated persistence and privacy checks were performed by the agent.

Suggested remaining practice:

On the deployed app:

- Sign in with your own account and research a public company you understand.
- Expand at least two sources. Compare the exact text with one fit assessment and the suggested outreach trigger.
- Identify a claim you would soften or reject. Explain why.
- Rewrite the opening message in your own voice, save it, reload, and confirm the edit persisted.
- Try an invalid domain and explain what validation does.
- Explain why a trigger is not proof of buying intent and why a citation is not independent verification.

Code walkthrough:

1. In `src/actions/briefs.ts`, explain why evidence is saved before synthesis.
2. Explain why the explicit `createdBy` check is necessary even with collection RBAC.
3. In `src/domain/brief.ts`, trace input validation, output validation, citation validation, and `priority()`.
4. Explain the daily quota's unique-key reservation and why it survives concurrent requests.
5. Change one recommendation rule in `priority()` and update its test. Run the tests and explain the result.

Only add further personal checks or code changes after Nathan actually performs and confirms them.

Do not paste confidential employer, client, or school information into this app.
