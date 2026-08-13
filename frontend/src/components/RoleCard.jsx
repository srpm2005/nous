import React from 'react';

/**
 * RoleCard component displays an individual AI target job recommendation card
 * featuring match score percentage badge, rank order badge, rationale text, and skill tags.
 */
export function RoleCard({ role }) {
  const matchPercentage = Math.round((role.confidenceScore || 0) * 100);

  const rank = role.rank || 1;

  // Match badge labels matching Nous UI spec
  let badgeLabel = 'Best match';
  let badgeBg = '#d1fae5';
  let badgeColor = '#047857';

  if (rank === 2) {
    badgeLabel = 'Good match';
    badgeBg = '#dbeafe';
    badgeColor = '#1d4ed8';
  } else if (rank >= 3) {
    badgeLabel = 'Possible match';
    badgeBg = '#fef3c7';
    badgeColor = '#b45309';
  }

  return (
    <div
      style={{
        padding: '24px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        gap: '16px'
      }}
    >
      <div>
        {/* Match Pill */}
        <div style={{ marginBottom: '14px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '9999px',
              background: badgeBg,
              color: badgeColor,
              display: 'inline-block'
            }}
          >
            {badgeLabel} · {matchPercentage}%
          </span>
        </div>

        {/* Role Title */}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 10px 0',
            lineHeight: 1.3
          }}
        >
          {role.roleTitle}
        </h3>

        {/* Match Rationale */}
        {role.matchReason && (
          <p
            style={{
              fontSize: '13.5px',
              color: '#475569',
              lineHeight: 1.5,
              margin: '0 0 16px 0'
            }}
          >
            {role.matchReason}
          </p>
        )}

        {/* Key Skill Chips */}
        {role.keySkills && role.keySkills.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            {role.keySkills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  borderRadius: '9999px',
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

    </div>
  );
}

export default RoleCard;

