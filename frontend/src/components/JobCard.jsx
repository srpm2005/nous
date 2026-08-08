import React from 'react';

/**
 * Interactive Job Card displaying individual live job opening details.
 * Features title, company, location, salary range badge, provider tag, and apply link.
 */
export function JobCard({ job }) {
  if (!job) return null;

  return (
    <div
      className="job-card transition-all"
      style={{
        background: 'rgba(30, 41, 59, 0.7)',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: 'var(--radius-md)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div>
        {/* Top Badges Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              borderRadius: '9999px',
              background: 'rgba(51, 65, 85, 0.6)',
              color: '#94a3b8',
              border: '1px solid rgba(71, 85, 105, 0.8)',
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
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
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
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 8px 0',
            lineHeight: 1.3
          }}
        >
          {job.title}
        </h4>

        {/* Company & Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: '#94a3b8',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#e2e8f0', fontWeight: 500 }}>
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
          borderTop: '1px solid rgba(51, 65, 85, 0.5)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}
      >
        <span style={{ fontSize: '11px', color: '#64748b' }}>Verified Active Opening</span>
        <a
          href={job.applyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{
            background: 'var(--color-accent)',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 600,
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
          }}
        >
          Apply Now ↗
        </a>
      </div>
    </div>
  );
}

export default JobCard;
