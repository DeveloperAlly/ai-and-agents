import { useEffect, useRef } from 'react'

const TAG_STYLES = {
  agent: { bg: 'rgba(61,214,240,0.1)', color: 'var(--cyan)', border: 'rgba(61,214,240,0.22)' },
  n8n:   { bg: 'rgba(255,179,64,0.1)', color: 'var(--amber)', border: 'rgba(255,179,64,0.22)' },
  ok:    { bg: 'rgba(46,255,160,0.1)', color: 'var(--green)', border: 'rgba(46,255,160,0.22)' },
  err:   { bg: 'rgba(255,79,94,0.1)',  color: 'var(--red)',   border: 'rgba(255,79,94,0.22)' },
  sys:   { bg: 'var(--surface3)',      color: 'var(--text3)', border: 'var(--border)' },
}

const VARIANT_COLORS = { default: 'var(--text2)', highlight: 'var(--text)', success: 'var(--green)', error: 'var(--red)', warn: 'var(--amber)' }

function fmt(d) { return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` }

export default function LogStream({ logs }) {
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])

  if (!logs.length) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--text3)' }}>
      <div style={{ fontSize: 28, opacity: 0.25 }}>◈</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em' }}>waiting for instructions</div>
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {logs.map(e => {
        const ts = TAG_STYLES[e.tag] || TAG_STYLES.sys
        return (
          <div key={e.id} style={{ display: 'flex', gap: 10, padding: '3px 0', fontFamily: 'var(--mono)', fontSize: 12 }}>
            <span style={{ color: 'var(--text3)', flexShrink: 0, fontSize: 10, paddingTop: 3, minWidth: 62 }}>{fmt(e.ts)}</span>
            <span style={{ flexShrink: 0, fontSize: 9, padding: '2px 7px', borderRadius: 3, letterSpacing: '0.08em', textTransform: 'uppercase', height: 'fit-content', marginTop: 2, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>{e.tag}</span>
            <span style={{ flex: 1, color: VARIANT_COLORS[e.variant] || VARIANT_COLORS.default, lineHeight: 1.6, wordBreak: 'break-word' }}>{e.msg}</span>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
