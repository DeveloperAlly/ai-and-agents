import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function highlight(json) {
  return JSON.stringify(json, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, m => {
      if (/^"/. test(m)) return /:$/.test(m) ? `<span style="color:var(--cyan)">${m}</span>` : `<span style="color:var(--text2)">${m}</span>`
      if (/true|false/.test(m)) return `<span style="color:var(--amber)">${m}</span>`
      if (/null/.test(m)) return `<span style="color:var(--text3)">${m}</span>`
      return `<span style="color:var(--green)">${m}</span>`
    })
}

export default function JsonViewer({ workflowJson }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    if (!workflowJson) return
    navigator.clipboard.writeText(JSON.stringify(workflowJson, null, 2))
    setCopied(true); setTimeout(() => setCopied(false), 1800)
  }
  if (!workflowJson) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontFamily: 'var(--mono)', fontSize: 12 }}>No workflow generated yet</div>
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text3)' }}>Generated workflow · {workflowJson.nodes?.length ?? 0} nodes</div>
        <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.07em', textTransform: 'uppercase', color: copied ? 'var(--green)' : 'var(--text3)', transition: 'all 0.15s' }}>
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? 'Copied' : 'Copy JSON'}
        </button>
      </div>
      <pre style={{ fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: '16px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }} dangerouslySetInnerHTML={{ __html: highlight(workflowJson) }} />
    </div>
  )
}
