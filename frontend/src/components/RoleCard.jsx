import React from 'react';

/**
 * RoleCard component displays an individual AI target job recommendation card
 * featuring match score percentage badge, rank order badge, rationale text, and skill tags.
 */
export function RoleCard({ role }) {
  const matchPercentage = Math.round((role.confidenceScore || 0) * 100);

  // Dynamic badge styling aligned with Asana status tokens
  const getBadgeStyle = (pct) => {
    if (pct >= 90) {
      return {
        background: 'var(--status-emerald-bg)',
        color: 'var(--status-emerald-text)',
        border: '1px solid var(--status-emerald-border)'
      };
    }
    if (pct >= 75) {
      return {
        background: 'var(--status-purple-bg)',
        color: 'var(--status-purple-text)',
        border: '1px solid var(--status-purple-border)'
      };
    }
    return {
      background: 'var(--status-amber-bg)',
      color: 'var(--status-amber-text)',
      border: '1px solid var(--status-amber-border)'
    };
  };

  return (
    <div
      className="asana-card animate-fade-in"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      {/* Header: Rank + Title + Match Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div>
          <span style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: 'var(--color-text-muted)'
          }}>
            #{role.rank || 1} RECOMMENDATION
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: '4px 0 0 0' }}>
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
          fontSize: '14px',
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
                background: 'var(--color-background-subtle)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                borderRadius: 'var(--radius-sm)',
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
