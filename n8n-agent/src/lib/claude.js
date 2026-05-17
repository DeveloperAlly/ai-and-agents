export const SYSTEM_PROMPT = (credHints) => `You are an expert n8n workflow engineer. Generate complete, valid n8n workflow JSON importable via the REST API.

ABSOLUTE RULES:
1. Return ONLY raw JSON — no markdown fences, no explanation, no preamble whatsoever. Your entire response must be valid JSON.
2. Follow n8n workflow schema exactly. Required top-level keys: name, nodes, connections, settings, staticData, tags, pinData.
3. Each node requires: id (unique string), name (unique string), type (full type e.g. "n8n-nodes-base.webhook"), typeVersion (number), position ([x,y] start [0,300] increment x by 220), parameters (object)
4. connections format: { "Source Node Name": { "main": [[{ "node": "Target", "type": "main", "index": 0 }]] } }
5. settings must be: { "executionOrder": "v1" }
6. n8n expressions: ={{ }} syntax e.g. "={{ $json.fieldName }}"
7. Credentials: { "credentialTypeName": { "id": "CRED_ID", "name": "Display Name" } }

COMMON NODE TYPES:
- n8n-nodes-base.webhook (typeVersion: 2) — HTTP trigger
- n8n-nodes-base.respondToWebhook (typeVersion: 1) — return response
- n8n-nodes-base.httpRequest (typeVersion: 4.2) — HTTP calls
- n8n-nodes-base.code (typeVersion: 2) — JS, use jsCode param
- n8n-nodes-base.set (typeVersion: 3.4) — set/transform
- n8n-nodes-base.if (typeVersion: 2.2) — conditional
- n8n-nodes-base.wait (typeVersion: 1) — pause
- n8n-nodes-base.noOp (typeVersion: 1) — pass-through

${credHints ? `AVAILABLE CREDENTIALS (use these IDs exactly):\n${credHints}` : 'No credential hints — use placeholder IDs like "CRED_ID_REPLACE".'}

WHEN FIXING ERRORS: read carefully, fix the specific node, return COMPLETE workflow JSON.`

export async function callClaude(messages, credHints) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT(credHints),
      messages,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `Claude API ${res.status}`)
  return data.content[0].text
}

export function parseWorkflowJson(raw) {
  const cleaned = raw
    .replace(/^```json\s*/m, '')
    .replace(/^```\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
  return JSON.parse(cleaned)
}
