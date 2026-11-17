import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function requiredText(value, name, maxLength) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} is required.`)
  }

  const text = value.trim()
  if (text.length > maxLength) {
    throw new Error(`${name} must be ${maxLength} characters or fewer.`)
  }

  return text
}

export function buildIssuePayload({
  projectKey,
  issueType,
  summary,
  description,
}) {
  const paragraphs = requiredText(description, 'Description', 10000)
    .split(/\r?\n/)
    .map((line) =>
      line.length === 0
        ? { type: 'paragraph' }
        : {
            type: 'paragraph',
            content: [{ type: 'text', text: line }],
          },
    )

  return {
    fields: {
      project: { key: requiredText(projectKey, 'Project key', 20) },
      issuetype: { name: requiredText(issueType, 'Issue type', 100) },
      summary: requiredText(summary, 'Summary', 255),
      description: {
        type: 'doc',
        version: 1,
        content: paragraphs,
      },
    },
  }
}

export async function createJiraIssue({
  siteUrl,
  cloudId,
  email,
  apiToken,
  payload,
}) {
  const jiraUrl = new URL(requiredText(siteUrl, 'JIRA_SITE_URL', 500))
  if (
    jiraUrl.protocol !== 'https:' ||
    jiraUrl.username ||
    jiraUrl.password ||
    jiraUrl.search ||
    jiraUrl.hash
  ) {
    throw new Error('JIRA_SITE_URL must be an HTTPS URL without credentials or query parameters.')
  }

  const siteHost = jiraUrl.hostname.toLowerCase()
  if (siteHost !== 'atlassian.net' && !siteHost.endsWith('.atlassian.net')) {
    throw new Error('JIRA_SITE_URL must use an atlassian.net hostname.')
  }

  const cloudIdentifier = requiredText(cloudId, 'JIRA_CLOUD_ID', 64)
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(cloudIdentifier)) {
    throw new Error('JIRA_CLOUD_ID must be a UUID.')
  }

  const username = requiredText(email, 'JIRA_EMAIL', 320)
  const token = requiredText(apiToken, 'JIRA_API_TOKEN', 500)
  const response = await fetch(
    `https://api.atlassian.com/ex/jira/${cloudIdentifier}/rest/api/3/issue`,
    {
      method: 'POST',
      redirect: 'error',
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  if (!response.ok) {
    throw new Error(`Jira issue creation failed with HTTP ${response.status}.`)
  }

  const result = await response.json()
  const issueKey = requiredText(result.key, 'Jira response issue key', 64)
  if (!/^[A-Z][A-Z0-9_]*-\d+$/.test(issueKey)) {
    throw new Error('Jira returned an invalid issue key.')
  }
  return {
    issueKey,
    browseUrl: new URL(`/browse/${encodeURIComponent(issueKey)}`, jiraUrl).href,
  }
}

async function main() {
  const payload = buildIssuePayload({
    projectKey: process.env.JIRA_PROJECT_KEY,
    issueType: process.env.ISSUE_TYPE,
    summary: process.env.ISSUE_SUMMARY,
    description: process.env.ISSUE_DESCRIPTION,
  })

  const result = await createJiraIssue({
    siteUrl: process.env.JIRA_SITE_URL,
    cloudId: process.env.JIRA_CLOUD_ID,
    email: process.env.JIRA_EMAIL,
    apiToken: process.env.JIRA_API_TOKEN,
    payload,
  })

  console.log(`Created Jira issue ${result.issueKey}: ${result.browseUrl}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
