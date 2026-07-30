import React from 'react';

export default function Navbar({ activePhase = 'Phase 1' }) {
  return (
    <header className="asana-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderRadius: 'var(--radius-md)',
      marginBottom: '24px',
      background: 'var(--color-surface)',
      borderColor: 'var(--color-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Asana-inspired logo icon */}
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
              Nous
            </span>
            <span className="badge badge-neutral" style={{ fontSize: '11px', fontWeight: 600 }}>
              WORKFLOW ENGINE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Resume Intelligence & Work Management for AI Teams
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="badge badge-emerald">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></span>
          Backend API Online
        </span>

        <span className="badge badge-neutral">
          {activePhase}: Ingestion & Extraction
        </span>
      </div>
    </header>
  );
}
