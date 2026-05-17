import { CheckCircle, XCircle } from 'lucide-react'

export default function ExecutionsPanel({ executions }) {
  if (!executions.length) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>No executions yet</div>
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {executions.map(ex => (
        <div key={ex.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `3px solid ${ex.success ? 'var(--green)' : 'var(--red)'}`, borderRadius: 6, padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: ex.error ? 8 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {ex.success ? <CheckCircle size={14} color="var(--green)" /> : <XCircle size={14} color="var(--red)" />}
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: ex.success ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ex.success ? 'passed' : 'failed'}</span>
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>iteration {ex.iteration} · {ex.ts.toLocaleTimeString()}</span>
          </div>
          {ex.error && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--red)', background: 'var(--red-dim)', borderRadius: 4, padding: '8px 10px', lineHeight: 1.6, wordBreak: 'break-word' }}>{ex.error}</div>}
          {ex.success && <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--green)', marginTop: 4 }}>Workflow executed without errors</div>}
        </div>
      ))}
    </div>
  )
}
