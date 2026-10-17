# Verification evidence

Agent checks on October 17, 2026; these are not Nathan's personal verification.

- TypeScript: passes (`tsc --noEmit`).
- Unit tests: 12 passing across three files, including scaffold prerender checks.
- Live local pipeline: passed real Exa, Firecrawl, and Anthropic calls; evidence persisted before synthesis; draft edit survived reload; a second account could not see the first account's brief and was denied when invoking synthesis with its ID. The test deleted its created brief afterward.
- Desktop landing and mobile preview were captured and visually inspected; mobile layout test finds no horizontal overflow and can expand evidence text.
- Independent read-only review found and then confirmed fixes for invalid-domain handling and losing edits during an in-flight save. No outstanding concrete security/correctness finding remained at that review.
- Final ordinary browser suite: 13 passed, 1 intentional opt-in skip. The live pipeline test passed separately. A local workerd/Miniflare error on consecutive early-denial requests was resolved by bounding and consuming request bodies before early responses; the denial check now passes in both focused and full-suite runs.
- Credentials scan of tracked initial history found no private keys or standard provider/GitHub secret patterns. Local `.dev.vars`, credential stores, state, and screenshots are not tracked.
- Credit check after development calls: 490.35998 of 500 free credits remained, purchased allocation zero. No top-up or upgrade performed.

Deployment: https://signalbrief-nathan.app.space. DeepSpace confirmed serving and data plane on release rel_01M55YCQH7YJ9SA3Y0FT35NABC, with GitHub source nsvarghese/signalbrief. Production: 13 ordinary browser checks passed; the real three-provider pipeline, edit/reload, and privacy test passed separately. The initial concurrent production test hit an SDK login-cache write race before making provider calls; one-worker execution resolved it, and the suite now serializes fixture writers.

Nathan's review: pending; see NATHAN_REVIEW.md. The submission note intentionally retains a placeholder for his real checks.


Output review caught a model role-confusion issue: the seller offering was being attributed to the target company. The synthesis prompt now explicitly separates seller and potential customer, requires unclear for absent evidence, and limits contradicted to direct contrary evidence. This is a prompt correction, not a guarantee of factual model output.


Final corrected production output passed the live regression check and was visually reviewed: seller context remains separate from the target summary. The second release includes the prompt correction. The final local suite again passed 12 unit tests and 13 ordinary browser tests, with the opt-in live test intentionally skipped locally and passed separately in production. Total development verification used approximately $0.0964 of existing free credits; no purchased allocation or top-up. Model interpretations remain subject to human review.

