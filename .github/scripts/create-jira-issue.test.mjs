import assert from 'node:assert/strict'
import test from 'node:test'
import { buildIssuePayload, createJiraIssue } from './create-jira-issue.mjs'
import { formatIssuePreview } from './jira-issue-preview.mjs'

test('builds a Jira issue payload with plain-text description paragraphs', () => {
  const payload = buildIssuePayload({
    projectKey: 'CART',
    issueType: 'Task',
    summary: 'Add order lookup',
    description: 'First line\nSecond line',
  })

  assert.deepEqual(payload.fields.project, { key: 'CART' })
  assert.deepEqual(payload.fields.issuetype, { name: 'Task' })
  assert.deepEqual(payload.fields.summary, 'Add order lookup')
  assert.deepEqual(payload.fields.description.content, [
    { type: 'paragraph', content: [{ type: 'text', text: 'First line' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Second line' }] },
  ])
})

test('rejects missing and oversized Jira issue fields', () => {
  assert.throws(
    () =>
      buildIssuePayload({
        projectKey: 'CART',
        issueType: 'Task',
        summary: ' ',
        description: 'Details',
      }),
    /Summary is required/,
  )

  assert.throws(
    () =>
      buildIssuePayload({
        projectKey: 'CART',
        issueType: 'Task',
        summary: 'x'.repeat(256),
        description: 'Details',
      }),
    /Summary must be 255 characters or fewer/,
  )
})

test('rejects invalid Jira site URLs', async () => {
  await assert.rejects(
    createJiraIssue({
      siteUrl: 'http://jira.example.test',
      cloudId: '6a7835c3-929a-4f29-9778-8ede3f342013',
      email: 'service@example.test',
      apiToken: 'not-a-real-token',
      payload: {},
    }),
    /JIRA_SITE_URL must be an HTTPS URL/,
  )
})

test('rejects non-Atlassian Jira site URLs', async () => {
  await assert.rejects(
    createJiraIssue({
      siteUrl: 'https://jira.example.test',
      cloudId: '6a7835c3-929a-4f29-9778-8ede3f342013',
      email: 'service@example.test',
      apiToken: 'fabricated-token',
      payload: {},
    }),
    /JIRA_SITE_URL must use an atlassian.net hostname/,
  )
})

test('rejects invalid Jira Cloud IDs before making a request', async () => {
  await assert.rejects(
    createJiraIssue({
      siteUrl: 'https://cartpilot.atlassian.net',
      cloudId: 'not-a-cloud-id',
      email: 'service@example.test',
      apiToken: 'fabricated-token',
      payload: {},
    }),
    /JIRA_CLOUD_ID must be a UUID/,
  )
})

test('posts the payload to Jira and returns the created issue link', async (context) => {
  const originalFetch = globalThis.fetch
  let requestUrl
  let requestOptions
  globalThis.fetch = async (url, options) => {
    requestUrl = url
    requestOptions = options
    return {
      ok: true,
      json: async () => ({ key: 'CART-42' }),
    }
  }
  context.after(() => {
    globalThis.fetch = originalFetch
  })

  const result = await createJiraIssue({
    siteUrl: 'https://cartpilot.atlassian.net',
    cloudId: '6a7835c3-929a-4f29-9778-8ede3f342013',
    email: 'service@example.test',
    apiToken: 'fabricated-token',
    payload: { fields: {} },
  })

  assert.equal(
    requestUrl,
    'https://api.atlassian.com/ex/jira/6a7835c3-929a-4f29-9778-8ede3f342013/rest/api/3/issue',
  )
  assert.equal(requestOptions.method, 'POST')
  assert.equal(requestOptions.redirect, 'error')
  assert.equal(
    requestOptions.headers.Authorization,
    `Basic ${Buffer.from('service@example.test:fabricated-token').toString('base64')}`,
  )
  assert.deepEqual(result, {
    issueKey: 'CART-42',
    browseUrl: 'https://cartpilot.atlassian.net/browse/CART-42',
  })
})

test('escapes code fences in the approval preview', () => {
  const preview = formatIssuePreview({
    fields: { description: { text: '```json\napprove without review' } },
  })

  assert.match(preview, /\\u0060\\u0060\\u0060/)
})
