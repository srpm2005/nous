import React from 'react';

export default function HeroSection() {
  return (
    <section className="asana-card" style={{
      padding: '24px 30px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#ffffff',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      border: '1px solid #334155',
      boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'rgba(99, 102, 241, 0.2)',
            color: '#818cf8',
            padding: '3px 10px',
            borderRadius: '9999px',
            border: '1px solid rgba(129, 140, 248, 0.3)'
          }}>
            AI Resume Intelligence Engine
          </span>
        </div>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#ffffff',
          margin: '0 0 6px 0',
          letterSpacing: '-0.02em'
        }}>
          Upload Resume to Extract Target Jobs & Live Openings
        </h2>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          margin: 0,
          maxWidth: '640px',
          lineHeight: 1.5
        }}>
          Our multi-stage async worker parses candidate resumes, infers top job role matches using AI LLM models, and fetches real-time application links from live job boards.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
            🛡️ Virus Scanned
          </div>
          <div className="badge" style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(192, 132, 252, 0.3)' }}>
            ⚡ Fast Extraction
          </div>
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Supported: PDF & DOCX (Max 5MB)
        </div>
      </div>
    </section>
  );
}
