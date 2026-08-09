import React from 'react';

/**
 * Interactive Job Card displaying individual live job opening details.
 * Aligned with Asana clean light theme design tokens.
 */
export function JobCard({ job }) {
  if (!job) return null;

  return (
    <div
      className="asana-card animate-fade-in"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      <div>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'var(--status-neutral-bg)',
              color: 'var(--status-neutral-text)',
              border: '1px solid var(--status-neutral-border)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {job.sourceApi || 'Job Board'}
          </span>

          {job.salaryRange && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--status-emerald-text)',
                background: 'var(--status-emerald-bg)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--status-emerald-border)'
              }}
            >
              {job.salaryRange}
            </span>
          )}
        </div>

        {/* Job Title */}
        <h4
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: '0 0 8px 0',
            lineHeight: 1.35
          }}
        >
          {job.title}
        </h4>

        {/* Company & Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-text)', fontWeight: 500 }}>
            🏢 {job.company || 'Enterprise Partner'}
          </span>
          <span>•</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            📍 {job.location || 'Remote'}
          </span>
        </div>
      </div>

      {/* Footer Action Row */}
      <div
        style={{
          paddingTop: '12px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          Verified Active Opening
        </span>
        <a
          href={job.applyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          Apply Now ↗
        </a>
      </div>
    </div>
  );
}

export default JobCard;
