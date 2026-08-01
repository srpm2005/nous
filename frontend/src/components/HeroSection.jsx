import React from 'react';

export default function HeroSection() {
  return (
    <section className="asana-card" style={{
      padding: '20px 24px',
      marginBottom: '20px',
      background: 'var(--color-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    }}>
      <div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: '0 0 4px 0'
        }}>
          Resume Intelligence & Text Extraction
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--color-text-muted)',
          margin: 0
        }}>
          Upload PDF or Word resumes to extract formatted content, verify integrity, and inspect candidate profiles.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <div className="badge badge-emerald" style={{ padding: '6px 12px', fontSize: '12px' }}>
          🛡️ Virus Protected
        </div>
        <div className="badge badge-neutral" style={{ padding: '6px 12px', fontSize: '12px' }}>
          ⚡ Fast Extraction
        </div>
        <div className="badge badge-purple" style={{ padding: '6px 12px', fontSize: '12px' }}>
          🔒 Hash Deduplicated
        </div>
      </div>
    </section>
  );
}
