import React from 'react';

export default function Navbar({ activeTab = 'scanner', setActiveTab }) {
  return (
    <header className="asana-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderRadius: 'var(--radius-md)',
      marginBottom: '20px',
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border)',
      flexWrap: 'wrap',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="7" r="3.5" />
            <circle cx="6" cy="16" r="3.5" />
            <circle cx="18" cy="16" r="3.5" />
          </svg>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)'
            }}>
              Nous AI Resume Engine
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            AI-Powered Resume Intelligence & Job Matching Platform
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {setActiveTab && (
          <div style={{ display: 'flex', background: 'var(--color-background-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <button
              onClick={() => setActiveTab('scanner')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'scanner' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'scanner' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'scanner' ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'scanner' ? 'var(--shadow-card)' : 'none',
                transition: 'all var(--motion-fast)'
              }}
            >
              ⚡ Scanner Engine
            </button>

            <button
              onClick={() => setActiveTab('history')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeTab === 'history' ? 'var(--color-surface)' : 'transparent',
                color: activeTab === 'history' ? 'var(--color-text)' : 'var(--color-text-muted)',
                fontWeight: activeTab === 'history' ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeTab === 'history' ? 'var(--shadow-card)' : 'none',
                transition: 'all var(--motion-fast)'
              }}
            >
              📜 Phase 5 History
            </button>
          </div>
        )}

        <span className="badge badge-emerald">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
          System Ready
        </span>
      </div>
    </header>
  );
}


