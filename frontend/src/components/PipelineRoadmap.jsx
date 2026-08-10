import React from 'react';

export default function PipelineRoadmap() {
  const phases = [
    {
      number: '1',
      title: 'Upload & Text Extraction',
      description: 'MIME validation, Virus Scanning, SHA-256 Dedup, Apache PDFBox/POI text parsing',
      status: 'complete',
      badge: 'COMPLETED'
    },
    {
      number: '2',
      title: 'Async Pipeline & Polling Engine',
      description: '202 Accepted, scanId state machine (PENDING -> PROCESSING -> COMPLETE), React status polling engine',
      status: 'active',
      badge: 'ACTIVE & LIVE'
    },
    {
      number: '3',
      title: 'LLM Role Classification',
      description: 'Strict JSON prompt schema validation, role confidence scores, automatic retries',
      status: 'planned',
      badge: 'PHASE 3'
    },
    {
      number: '4',
      title: 'Job Board Aggregation',
      description: 'Parallel Adzuna/Jooble API queries, per-role timeouts, Redis response caching',
      status: 'planned',
      badge: 'PHASE 4'
    },
    {
      number: '5',
      title: 'Normalized Data Model',
      description: 'Relational persistence (`users`, `resumes`, `scans`, `suggested_roles`, `job_listings`)',
      status: 'planned',
      badge: 'PHASE 5'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '28px', marginTop: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"/>
              <polyline points="2 17 12 22 22 17"/>
              <polyline points="2 12 12 17 22 12"/>
            </svg>
            Nous Engineering Roadmap & Architecture Progress
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            High-level engineering pipeline milestone status
          </p>
        </div>

        <span className="badge badge-purple">
          Pipeline Processing Active
        </span>

      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {phases.map((p) => {
          const isActive = p.status === 'active';
          return (
            <div
              key={p.number}
              style={{
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)' 
                  : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)' : 'rgba(255, 255, 255, 0.06)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {p.number}
                </span>

                <span className={isActive ? 'badge badge-emerald' : 'badge badge-indigo'} style={{ fontSize: '0.68rem' }}>
                  {p.badge}
                </span>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px 0', color: isActive ? '#fff' : 'var(--text-main)' }}>
                {p.title}
              </h4>

              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {p.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
