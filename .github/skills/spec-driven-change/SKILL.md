---
name: spec-driven-change
description: Use when implementing or reviewing a CartPilot feature or bug fix that can change product behavior, data, or user-facing flows.
---

# Spec-driven change

Follow the repository's `AGENTS.md` and `specs/ai-assisted-development-workflow.md`; this skill does not override them.

1. Read the relevant spec, decision cards, existing code, and tests. Summarize the requested behavior and affected boundaries.
2. If behavior or acceptance is missing, update the relevant spec before implementation. Ask the user when a product decision cannot be derived safely.
3. Record significant trade-offs in `decisions/` before implementation. For cross-module or high-risk work, add a concise design note to the spec or a linked document.
4. Map each acceptance criterion to a focused test, evaluation, or explicit manual check. Use fabricated data only.
5. Implement one small slice at a time. Run the narrowest relevant check, fix failures at their cause, and rerun affected checks.
6. Review the diff against the spec, permissions, data-write boundaries, and regressions. Report actual command results and any unchecked acceptance criteria.
7. Prepare a PR summary with the spec link, acceptance evidence, validation results, and remaining risks. Do not claim external actions or product acceptance that did not occur.

For frontend changes, run `cd frontend && npm run lint` and `cd frontend && npm run build`. Do not execute refunds or other data writes; obtain human confirmation for any authorized write.
