# Nathan's review — complete before submission

Status: pending. The agent must not claim these checks were performed by Nathan.

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

Record actual outcomes here:

- Company researched:
- Evidence checked:
- Misleading or uncertain claim found:
- Draft edit made:
- Reload result:
- Code change personally made or verified:
- What remains unfinished:

Do not paste confidential employer, client, or school information into this app.
