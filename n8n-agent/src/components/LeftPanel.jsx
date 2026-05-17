import { useState } from 'react'
import { Play, Square, RotateCcw } from 'lucide-react'

const EXAMPLES = [
  { label: 'Webhook → transform → respond', spec: 'Receive a POST webhook with a JSON body containing a "text" field. Trim and uppercase the text, then respond immediately with { result: "UPPERCASED_TEXT", length: N }.' },
  { label: 'GitHub README fetcher', spec: 'Accept a POST webhook with { "repo": "owner/repo" }. Fetch the raw README.md from the GitHub API (api.github.com). Return the first 500 characters of the README as JSON.' },
  { label: 'HTTP ping + respond', spec: 'On a POST webhook trigger, make a GET request to https://httpbin.org/get, extract the "origin" IP from the response, and return it as { ip: "..." }.' },
]

export default function LeftPanel({ status, onRun, onStop, onReset }) {
  const [spec, setSpec] = useState('')
  const [credHints, setCredHints] = useState('')
  const [maxRetries, setMaxRetries] = useState(3)
  const [testMode, setTestMode] = useState('manual')
  const [webhookPayload, setWebhookPayload] = useState('{"test": true}')
  const isRunning = status === 'running'

  const ta = (disabled) => ({ width: '100%', background: disabled ? 'var(--surface3)' : 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 300, color: 'var(--text)', resize: 'vertical', outline: 'none', lineHeight: 1.65, minHeight: 120, opacity: disabled ? 0.6 : 1 })
  const sel = { flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', outline: 'none', cursor: 'pointer', WebkitAppearance: 'none' }
  const inp = { flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '6px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', outline: 'none' }

  return (
    <aside style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--surface)', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <L>Workflow Spec</L>
        {status !== 'idle' && <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', borderRadius: 4 }}><RotateCcw size={12} /></button>}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <L>Quick examples</L>
          {EXAMPLES.map(ex => (
            <button key={ex.label} onClick={() => setSpec(ex.spec)} style={{ background: spec === ex.spec ? 'var(--cyan-dim)' : 'var(--surface2)', border: `1px solid ${spec === ex.spec ? 'var(--cyan-border)' : 'var(--border)'}`, borderRadius: 4, padding: '7px 10px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, color: spec === ex.spec ? 'var(--cyan)' : 'var(--text3)', textAlign: 'left', transition: 'all 0.15s', letterSpacing: '0.04em' }}>{ex.label}</button>
          ))}
        </div>
        <div><L>Describe the workflow</L><textarea value={spec} onChange={e => setSpec(e.target.value)} disabled={isRunning} rows={7} placeholder="When a webhook receives a POST with { url }, fetch that URL and return the response body." style={ta(isRunning)} /></div>
        <div>
          <L>Credential hints <span style={{ color: 'var(--text3)', fontWeight: 300 }}>(optional)</span></L>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', lineHeight: 1.7, marginBottom: 6 }}>Find IDs: <span style={{ color: 'var(--amber)' }}>Settings → Credentials → click → URL</span></div>
          <textarea value={credHints} onChange={e => setCredHints(e.target.value)} disabled={isRunning} rows={3} placeholder={"GitHub API → credId:abc123\nOpenAI → credId:def456"} style={{ ...ta(isRunning), minHeight: 'auto', fontSize: 11 }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <L>Settings</L>
          <Row label="Max iterations"><select value={maxRetries} onChange={e => setMaxRetries(Number(e.target.value))} disabled={isRunning} style={sel}><option value={2}>2</option><option value={3}>3</option><option value={5}>5</option><option value={8}>8</option></select></Row>
          <Row label="Test trigger"><select value={testMode} onChange={e => setTestMode(e.target.value)} disabled={isRunning} style={sel}><option value="manual">Manual run</option><option value="webhook">Webhook POST</option></select></Row>
          {testMode === 'webhook' && <Row label="Payload"><input value={webhookPayload} onChange={e => setWebhookPayload(e.target.value)} disabled={isRunning} style={inp} /></Row>}
        </div>
      </div>
      <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        {isRunning
          ? <Btn onClick={onStop} color="var(--red)" icon={<Square size={13} />} label="Stop" />
          : <Btn onClick={() => onRun({ spec, credHints, maxRetries, testMode, webhookPayload })} disabled={!spec.trim()} color="var(--cyan)" icon={<Play size={13} />} label="Generate + Deploy" />}
      </div>
    </aside>
  )
}

function L({ children }) { return <div style={{ fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text3)', marginBottom: 6 }}>{children}</div> }
function Row({ label, children }) { return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text3)', minWidth: 100 }}>{label}</span>{children}</div> }
function Btn({ onClick, disabled, color, icon, label }) {
  return <button onClick={onClick} disabled={disabled} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: disabled ? 'var(--surface3)' : color, color: disabled ? 'var(--text3)' : '#07090a', border: 'none', borderRadius: 6, padding: '11px', fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }} onMouseEnter={e => { if (!disabled) e.currentTarget.style.filter = 'brightness(1.1)' }} onMouseLeave={e => { e.currentTarget.style.filter = 'none' }}>{icon} {label}</button>
}
