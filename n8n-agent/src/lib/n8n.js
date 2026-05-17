export class N8nClient {
  constructor(baseUrl, apiKey) {
    this.base = baseUrl.replace(/\/$/, '') + '/api/v1'
    this.key = apiKey
  }

  async request(method, path, body) {
    const res = await fetch(this.base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': this.key,
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
    return data
  }

  async ping() { return this.request('GET', '/workflows?limit=1') }
  async createWorkflow(wf) { return this.request('POST', '/workflows', wf) }
  async updateWorkflow(id, wf) { return this.request('PUT', `/workflows/${id}`, wf) }
  async deleteWorkflow(id) { return this.request('DELETE', `/workflows/${id}`) }
  async activateWorkflow(id) { return this.request('POST', `/workflows/${id}/activate`) }
  async runWorkflow(id) { return this.request('POST', `/workflows/${id}/run`, { runData: {} }) }
  async getExecution(id) { return this.request('GET', `/executions/${id}`) }
  async getRecentExecution(workflowId) {
    const res = await this.request('GET', `/executions?workflowId=${workflowId}&limit=1`)
    return res.data?.[0]
  }
  async triggerWebhook(baseUrl, workflowId, payload = {}) {
    const url = baseUrl.replace(/\/$/, '') + '/webhook-test/' + workflowId
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.json().catch(() => ({}))
  }
}

export function parseExecutionError(exec) {
  try {
    const runData = exec?.data?.resultData?.runData
    if (runData) {
      for (const [nodeName, nodeRuns] of Object.entries(runData)) {
        for (const run of nodeRuns) {
          if (run.error?.message) return `Node "${nodeName}": ${run.error.message}`
        }
      }
    }
    const topErr = exec?.data?.resultData?.error?.message
    if (topErr) return topErr
  } catch (_) {}
  return 'Execution failed — check n8n logs for details'
}

export function isExecSuccess(exec) {
  if (!exec) return false
  if (exec.status === 'success') return true
  if (exec.status === 'error' || exec.status === 'crashed') return false
  if (exec.finished === true && !exec.data?.resultData?.error) return true
  return false
}

export async function pollExecution(client, execId, onTick, maxWait = 90000) {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    await sleep(3000)
    const exec = await client.getExecution(execId)
    onTick(Math.round((Date.now() - start) / 1000))
    const done = exec.finished || exec.status === 'success' || exec.status === 'error' || exec.status === 'crashed'
    if (done) return exec
  }
  throw new Error('Execution timed out after 90s')
}

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }
