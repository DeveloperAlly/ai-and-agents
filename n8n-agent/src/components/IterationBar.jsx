export default function IterationBar({ iteration, maxIterations, status }) {
  const labels = { idle: 'idle', running: `iteration ${iteration} / ${maxIterations}`, success: `passed on iteration ${iteration}`, failed: `failed after ${maxIterations} iterations`, stopped: 'stopped' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: 10, flexShrink: 0 }}>
      <span style={{ color: 'var(--text3)', letterSpacing: '0.08em', textTransform: 'uppercase', minWidth: 70 }}>iterations</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: Math.max(maxIterations, 3) }).map((_, i) => {
          let bg = 'var(--border)', anim = 'none'
          if (status === 'running') { if (i < iteration - 1) bg = 'var(--border2)'; else if (i === iteration - 1) { bg = 'var(--cyan)'; anim = 'pulse 1.2s ease-in-out infinite' } }
          else if (status === 'success') { if (i < iteration) bg = 'var(--green)' }
          else if (status === 'failed') { if (i < maxIterations - 1) bg = 'var(--border2)'; if (i === maxIterations - 1) bg = 'var(--red)' }
          else if (status === 'stopped') { if (i < iteration - 1) bg = 'var(--border2)' }
          return <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: bg, transition: 'background 0.3s', animation: anim }} />
        })}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <span style={{ color: status === 'success' ? 'var(--green)' : status === 'failed' ? 'var(--red)' : status === 'running' ? 'var(--cyan)' : 'var(--text3)' }}>{labels[status] || 'idle'}</span>
    </div>
  )
}
