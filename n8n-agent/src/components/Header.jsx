import { useState } from 'react'
import { Wifi, WifiOff, Loader } from 'lucide-react'

const statusConfig = {
  disconnected: { icon: WifiOff, label: 'not connected', color: 'var(--text3)', bg: 'var(--surface2)', border: 'var(--border)' },
  checking:     { icon: Loader,  label: 'checking...',   color: 'var(--amber)',  bg: 'var(--amber-dim)', border: 'rgba(255,179,64,0.2)' },
  connected:    { icon: Wifi,    label: 'connected',     color: 'var(--green)',  bg: 'var(--green-dim)', border: 'var(--green-border)' },
  error:        { icon: WifiOff, label: 'auth failed',   color: 'var(--red)',    bg: 'var(--red-dim)',   border: 'var(--red-border)' },
}

export default function Header({ connectionStatus, onCredChange }) {
  const [url, setUrl] = useState('https://n8n-j39n.sliplane.app')
  const [key, setKey] = useState('')
  const cfg = statusConfig[connectionStatus] || statusConfig.disconnected
  const Icon = cfg.icon

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)', animation: 'breathe 3s ease-in-out infinite' }} />
        <style>{`@keyframes breathe{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: 'var(--cyan)', letterSpacing: '0.04em' }}>n8n agent</span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CredInput label="n8n URL" value={url} type="text" width={260} onChange={v => { setUrl(v); if (v && key) onCredChange(v, key) }} />
        <CredInput label="API Key" value={key} type="password" width={200} onChange={v => { setKey(v); if (url && v) onCredChange(url, v) }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: cfg.bg, border: `1px solid ${cfg.border}`, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.07em', color: cfg.color, whiteSpace: 'nowrap' }}>
          <Icon size={11} style={{ animation: connectionStatus === 'checking' ? 'spin 1s linear infinite' : 'none' }} />
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          {cfg.label}
        </div>
      </div>
    </header>
  )
}

function CredInput({ label, value, type, width, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text3)' }}>{label}</span>
      <input type={type} value={value} style={{ width, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text)', outline: 'none' }}
        onFocus={e => e.target.style.borderColor = 'var(--cyan-border)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
        onChange={e => onChange(e.target.value)} placeholder={type === 'password' ? 'eyJhbGc...' : ''} />
    </div>
  )
}
