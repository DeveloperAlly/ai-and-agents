import { useState, useCallback, useRef } from 'react'
import { useAgent } from './hooks/useAgent'
import Header from './components/Header'
import LeftPanel from './components/LeftPanel'
import IterationBar from './components/IterationBar'
import LogStream from './components/LogStream'
import JsonViewer from './components/JsonViewer'
import ExecutionsPanel from './components/ExecutionsPanel'

const TABS = ['Log', 'Workflow JSON', 'Executions']

export default function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [n8nUrl, setN8nUrl] = useState('https://n8n-j39n.sliplane.app')
  const [n8nKey, setN8nKey] = useState('')
  const debounceRef = useRef(null)

  const {
    logs, executions, workflowJson,
    status, iteration, maxIterations,
    connectionStatus,
    run, stop, reset, testConnection,
  } = useAgent()

  const handleCredChange = useCallback((url, key) => {
    setN8nUrl(url)
    setN8nKey(key)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => testConnection(url, key), 600)
  }, [testConnection])

  function handleRun(params) {
    setActiveTab(0)
    run({ ...params, n8nUrl, n8nKey })
  }

  const tabCounts = [logs.length, null, executions.length]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header connectionStatus={connectionStatus} onCredChange={handleCredChange} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <LeftPanel status={status} onRun={handleRun} onStop={stop} onReset={reset} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <IterationBar iteration={iteration} maxIterations={maxIterations} status={status} />
          <div style={{ display: 'flex', background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 20px', flexShrink: 0 }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '11px 16px', marginBottom: -1,
                fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: activeTab === i ? 'var(--cyan)' : 'var(--text3)',
                borderBottom: `2px solid ${activeTab === i ? 'var(--cyan)' : 'transparent'}`,
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                {tab}
                {tabCounts[i] != null && tabCounts[i] > 0 && (
                  <span style={{
                    background: activeTab === i ? 'var(--cyan-dim)' : 'var(--surface3)',
                    color: activeTab === i ? 'var(--cyan)' : 'var(--text3)',
                    border: `1px solid ${activeTab === i ? 'var(--cyan-border)' : 'var(--border)'}`,
                    borderRadius: 10, padding: '1px 6px', fontSize: 9,
                  }}>
                    {tabCounts[i]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
            {activeTab === 0 && <LogStream logs={logs} />}
            {activeTab === 1 && <JsonViewer workflowJson={workflowJson} />}
            {activeTab === 2 && <ExecutionsPanel executions={executions} />}
          </div>
        </div>
      </div>
    </div>
  )
}
