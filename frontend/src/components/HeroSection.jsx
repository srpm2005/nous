import React from 'react';

export default function HeroSection() {
  return (
    <section className="asana-card" style={{
      padding: '32px 36px',
      marginBottom: '24px',
      background: 'var(--color-surface)',
      position: 'relative'
    }}>
      <div style={{ maxWidth: '820px' }}>
        <div className="badge badge-purple" style={{ marginBottom: '14px' }}>
          Phase 1 Active — Work Management & Resume Ingestion Engine
        </div>

        <h2 className="asana-display" style={{
          fontSize: '28px',
          fontWeight: 500,
          lineHeight: 1.25,
          letterSpacing: '-0.02em',
          color: 'var(--color-text)',
          marginBottom: '12px'
        }}>
          Transform unstructured resumes into structured, actionable team data
        </h2>

        <p className="asana-body-muted" style={{
          fontSize: '15px',
          lineHeight: 1.6,
          color: 'var(--color-text-muted)',
          marginBottom: '24px'
        }}>
          Upload candidate resumes in PDF or DOCX format. The Phase 1 engine performs instant MIME validation, SHA-256 content deduplication, automated ClamAV security scanning, and high-fidelity text extraction via Apache PDFBox & POI.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px'
        }}>
          <div style={{
            background: 'var(--color-background-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ color: 'var(--color-primary)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Virus Scan Protected</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ClamAV Security</div>
            </div>
          </div>

          <div style={{
            background: 'var(--color-background-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ color: 'var(--status-emerald-text)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>SHA-256 Deduplication</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Zero redundant parsing</div>
            </div>
          </div>

          <div style={{
            background: 'var(--color-background-subtle)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ color: 'var(--color-accent)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 7 4 4 20 4 20 7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>PDF & DOCX Extraction</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Apache PDFBox & POI</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
