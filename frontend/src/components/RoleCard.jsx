import React from 'react';

/**
 * RoleCard component displays an individual AI target job recommendation card
 * featuring match score percentage badge, rank order badge, rationale text, and skill tags.
 */
export function RoleCard({ role }) {
  const matchPercentage = Math.round((role.confidenceScore || 0) * 100);

  // Dynamic styling depending on match confidence level
  const getBadgeStyle = (pct) => {
    if (pct >= 90) {
      return {
        background: 'rgba(16, 185, 129, 0.15)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      };
    }
    if (pct >= 75) {
      return {
        background: 'rgba(59, 130, 246, 0.15)',
        color: '#60a5fa',
        border: '1px solid rgba(59, 130, 246, 0.3)'
      };
    }
    return {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#fbbf24',
      border: '1px solid rgba(245, 158, 11, 0.3)'
    };
  };

  return (
    <div
      className="role-card card-glow"
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'transform 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Header: Rank + Title + Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'var(--color-accent-light)'
          }}>
            #{role.rank || 1} Recommendation
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
            {role.roleTitle}
          </h3>
        </div>

        <span style={{
          padding: '6px 14px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          ...getBadgeStyle(matchPercentage)
        }}>
          {matchPercentage}% Match
        </span>
      </div>

      {/* Rationale Text */}
      {role.matchReason && (
        <p style={{
          fontSize: '13.5px',
          color: 'var(--color-text-muted)',
          lineHeight: '1.55',
          margin: 0
        }}>
          {role.matchReason}
        </p>
      )}

      {/* Skills Badges */}
      {role.keySkills && role.keySkills.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
          {role.keySkills.map((skill, index) => (
            <span
              key={index}
              style={{
                padding: '4px 10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'var(--color-text-secondary)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500
              }}
            >
              {skill}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoleCard;
