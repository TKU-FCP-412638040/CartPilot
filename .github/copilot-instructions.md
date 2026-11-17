# CartPilot Copilot instructions

Follow the repository-wide rules in [`AGENTS.md`](../AGENTS.md), then read the relevant product spec and decision cards before changing behavior. The AI-assisted workflow and validation gates are documented in [`specs/ai-assisted-development-workflow.md`](../specs/ai-assisted-development-workflow.md).

CartPilot is a measurable e-commerce support assistant. Treat refunds, order state transitions, authorization, audit records, and customer data as high-risk boundaries. Use fabricated data only; never perform a refund or data write without explicit human confirmation.

All coding-agent work must run in a GitHub Copilot cloud sandbox; do not ask the user to start local services or run local commands. For frontend changes, run `cd frontend && npm run lint` and `cd frontend && npm run build`. GitHub-hosted Actions runs these checks for pushes and pull requests, plus `node --test .github/scripts/create-jira-issue.test.mjs`. There is no frontend test or AI evaluation runner; report that gap rather than implying those checks passed. Verify the current cloud session's available Jira connector before relying on it. Jira writes must use the manually triggered workflow and its required `jira-write` Environment approval; never call Jira write tools directly.
