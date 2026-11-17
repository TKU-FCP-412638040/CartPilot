import { appendFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildIssuePayload } from './create-jira-issue.mjs'

export function formatIssuePreview(payload) {
  const json = JSON.stringify(payload, null, 2).replaceAll('`', '\\u0060')
  return `## Jira issue pending approval\n\nReview this exact payload before approving the \`jira-write\` environment.\n\n\`\`\`json\n${json}\n\`\`\`\n`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const payload = buildIssuePayload({
    projectKey: process.env.JIRA_PROJECT_KEY,
    issueType: process.env.ISSUE_TYPE,
    summary: process.env.ISSUE_SUMMARY,
    description: process.env.ISSUE_DESCRIPTION,
  })
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (!summaryPath) {
    throw new Error('GITHUB_STEP_SUMMARY is required.')
  }
  appendFileSync(summaryPath, formatIssuePreview(payload))
}
