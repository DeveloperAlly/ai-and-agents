import { useState, useRef, useCallback } from 'react'
import { N8nClient, parseExecutionError, isExecSuccess, pollExecution, sleep } from '../lib/n8n'
import { callClaude, parseWorkflowJson } from '../lib/claude'

export const LOG_TAGS = { AGENT: 'agent', N8N: 'n8n', SYS: 'sys', OK: 'ok', ERR: 'err' }

let logId = 0

export function useAgent() {
  const [logs, setLogs] = useState([])
  const [executions, setExecutions] = useState([])
  const [workflowJson, setWorkflowJson] = useState(null)
  const [status, setStatus] = useState('idle')
  const [iteration, setIteration] = useState(0)
  const [maxIterations, setMaxIterations] = useState(3)
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const abortRef = useRef(false)
  const workflowIdRef = useRef(null)

  const addLog = useCallback((tag, msg, variant = 'default') => {
    setLogs(prev => [...prev, { id: logId++, tag, msg, variant, ts: new Date() }])
  }, [])

  const addExecution = useCallback((iterNum, exec, error) => {
    setExecutions(prev => [{ id: logId++, iteration: iterNum, success: !error, error, ts: new Date(), exec }, ...prev])
  }, [])

  const testConnection = useCallback(async (url, key) => {
    if (!url || !key) { setConnectionStatus('disconnected'); return false }
    setConnectionStatus('checking')
    try {
      const client = new N8nClient(url, key)
      await client.ping()
      setConnectionStatus('connected')
      return true
    } catch (e) {
      setConnectionStatus('error')
      return false
    }
  }, [])

  const run = useCallback(async ({ spec, credHints, n8nUrl, n8nKey, maxRetries, testMode, webhookPayload }) => {
    abortRef.current = false
    setStatus('running')
    setLogs([])
    setExecutions([])
    setWorkflowJson(null)
    setIteration(0)
    setMaxIterations(maxRetries)
    workflowIdRef.current = null

    const client = new N8nClient(n8nUrl, n8nKey)
    const messages = []
    let lastError = null

    try {
      for (let i = 0; i < maxRetries; i++) {
        if (abortRef.current) break
        setIteration(i + 1)

        if (i === 0) {
          addLog(LOG_TAGS.AGENT, 'Generating workflow from spec...', 'highlight')
          messages.push({ role: 'user', content: `Generate an n8n workflow for this spec:\n\n${spec}\n\nReturn only the raw JSON workflow object.` })
        } else {
          addLog(LOG_TAGS.AGENT, `Iteration ${i + 1} — fixing: ${lastError?.substring(0, 120)}...`, 'warn')
          messages.push({ role: 'user', content: `The workflow failed with this error:\n\n${lastError}\n\nFix the issue and return the complete corrected workflow JSON. Return only raw JSON.` })
        }

        addLog(LOG_TAGS.AGENT, 'Calling Claude...')
        let rawJson
        try {
          rawJson = await callClaude(messages, credHints)
          messages.push({ role: 'assistant', content: rawJson })
        } catch (e) {
          addLog(LOG_TAGS.ERR, `Claude API error: ${e.message}`, 'error')
          lastError = e.message; continue
        }

        let wf
        try {
          wf = parseWorkflowJson(rawJson)
          setWorkflowJson(wf)
          addLog(LOG_TAGS.AGENT, `Parsed — ${wf.nodes?.length ?? 0} nodes, ${Object.keys(wf.connections ?? {}).length} connections`)
        } catch (e) {
          addLog(LOG_TAGS.ERR, `JSON parse failed: ${e.message}`, 'error')
          lastError = `JSON parse error: ${e.message}\n\nRaw (first 400 chars):\n${rawJson.substring(0, 400)}`
          continue
        }

        if (abortRef.current) break

        addLog(LOG_TAGS.N8N, 'Deploying to n8n...')
        let deployed
        try {
          if (workflowIdRef.current) { try { await client.deleteWorkflow(workflowIdRef.current) } catch (_) {} }
          deployed = await client.createWorkflow(wf)
          workflowIdRef.current = deployed.id
          await client.activateWorkflow(deployed.id)
          addLog(LOG_TAGS.N8N, `Deployed + activated — id: ${deployed.id}`, 'highlight')
        } catch (e) {
          addLog(LOG_TAGS.ERR, `Deploy failed: ${e.message}`, 'error')
          lastError = `n8n deployment error: ${e.message}`
          addExecution(i + 1, null, lastError); continue
        }

        if (abortRef.current) break

        addLog(LOG_TAGS.N8N, `Triggering execution (${testMode})...`)
        let exec
        try {
          let execId
          if (testMode === 'webhook') {
            let payload = {}
            try { payload = JSON.parse(webhookPayload || '{}') } catch (_) {}
            const resp = await client.triggerWebhook(n8nUrl, deployed.id, payload)
            execId = resp.executionId
          } else {
            const resp = await client.runWorkflow(deployed.id)
            execId = resp.executionId || resp.id
          }
          if (!execId) {
            await sleep(4000)
            const recent = await client.getRecentExecution(deployed.id)
            execId = recent?.id
          }
          if (!execId) throw new Error('Could not obtain execution ID')
          addLog(LOG_TAGS.N8N, `Execution started: ${execId}`)
          exec = await pollExecution(client, execId, (secs) => { addLog(LOG_TAGS.N8N, `Waiting... ${secs}s`) })
        } catch (e) {
          addLog(LOG_TAGS.ERR, `Execution error: ${e.message}`, 'error')
          lastError = `Execution error: ${e.message}`
          addExecution(i + 1, null, lastError); continue
        }

        if (isExecSuccess(exec)) {
          addLog(LOG_TAGS.OK, `✓ Workflow passed on iteration ${i + 1}`, 'success')
          addExecution(i + 1, exec, null)
          setStatus('success'); return
        } else {
          const errMsg = parseExecutionError(exec)
          addLog(LOG_TAGS.ERR, `Execution failed: ${errMsg}`, 'error')
          lastError = errMsg
          addExecution(i + 1, exec, errMsg)
          if (i < maxRetries - 1) addLog(LOG_TAGS.AGENT, 'Planning fix...', 'warn')
        }
      }
      if (!abortRef.current) {
        addLog(LOG_TAGS.AGENT, `Max iterations (${maxRetries}) reached without success`, 'error')
        setStatus('failed')
      }
    } catch (e) {
      if (!abortRef.current) {
        addLog(LOG_TAGS.ERR, `Unexpected error: ${e.message}`, 'error')
        setStatus('failed')
      }
    }
  }, [addLog, addExecution])

  const stop = useCallback(() => { abortRef.current = true; setStatus('stopped') }, [])

  const reset = useCallback(() => {
    abortRef.current = true
    setStatus('idle'); setLogs([]); setExecutions([]); setWorkflowJson(null); setIteration(0)
    workflowIdRef.current = null
  }, [])

  return { logs, executions, workflowJson, status, iteration, maxIterations, connectionStatus, run, stop, reset, testConnection }
}
