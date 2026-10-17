# Verification evidence

Agent checks on October 17, 2026; these are not Nathan's personal verification.

- TypeScript: passes (`tsc --noEmit`).
- Unit tests: 12 passing across three files, including scaffold prerender checks.
- Live local pipeline: passed real Exa, Firecrawl, and Anthropic calls; evidence persisted before synthesis; draft edit survived reload; a second account could not see the first account's brief and was denied when invoking synthesis with its ID. The test deleted its created brief afterward.
- Desktop landing and mobile preview were captured and visually inspected; mobile layout test finds no horizontal overflow and can expand evidence text.
- Independent read-only review found and then confirmed fixes for invalid-domain handling and losing edits during an in-flight save. No outstanding concrete security/correctness finding remained at that review.
- Final ordinary browser suite: 13 passed, 1 intentional opt-in skip. The live pipeline test passed separately. A local workerd/Miniflare error on consecutive early-denial requests was resolved by bounding and consuming request bodies before early responses; the denial check now passes in both focused and full-suite runs.
- Credentials scan of tracked initial history found no private keys or standard provider/GitHub secret patterns. Local `.dev.vars`, credential stores, state, and screenshots are not tracked.
- Credit check after development calls: 494.94729 of 500 free credits remained, purchased allocation zero. No top-up or upgrade performed.

Deployment and production checks: pending first release. Update this section with observed results.

Nathan's review: pending; see NATHAN_REVIEW.md. The submission note intentionally retains a placeholder for his real checks.

