import React, { useState } from 'react';

/**
 * Domain-specific icon and color theme selector
 */
function getRoleVisualTheme(roleTitle = '', rank = 1, matchScore = 90) {
  const t = roleTitle.toLowerCase();

  let icon = '⚡';
  let category = 'Engineering';
  let gradient = 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)';
  let iconBg = 'linear-gradient(135deg, #ecfdf5 0%, #cffafe 100%)';
  let iconColor = '#059669';

  if (t.includes('ai') || t.includes('machine learning') || t.includes('data') || t.includes('ml') || t.includes('research')) {
    icon = '🧠';
    category = 'Artificial Intelligence & ML';
    gradient = 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)';
    iconBg = 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 100%)';
    iconColor = '#7c3aed';
  } else if (t.includes('full stack') || t.includes('frontend') || t.includes('web') || t.includes('ui')) {
    icon = '💻';
    category = 'Full Stack & Web Architecture';
    gradient = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';
    iconBg = 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)';
    iconColor = '#2563eb';
  } else if (t.includes('backend') || t.includes('distributed') || t.includes('java') || t.includes('platform')) {
    icon = '⚡';
    category = 'Backend & Distributed Systems';
    gradient = 'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)';
    iconBg = 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)';
    iconColor = '#059669';
  } else if (t.includes('cloud') || t.includes('devops') || t.includes('sre') || t.includes('infra')) {
    icon = '☁️';
    category = 'Cloud Infrastructure & SRE';
    gradient = 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)';
    iconBg = 'linear-gradient(135deg, #f0f9ff 0%, #eff6ff 100%)';
    iconColor = '#0284c7';
  } else if (t.includes('mobile') || t.includes('ios') || t.includes('android')) {
    icon = '📱';
    category = 'Mobile Engineering';
    gradient = 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)';
    iconBg = 'linear-gradient(135deg, #fffbeb 0%, #fef2f2 100%)';
    iconColor = '#d97706';
  }

  // Override top bar gradient by rank if applicable
  if (rank === 1) {
    gradient = 'linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%)';
  } else if (rank === 2) {
    gradient = 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)';
  } else {
    gradient = 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)';
  }

  return { icon, category, gradient, iconBg, iconColor };
}

/**
 * Premium State-of-the-Art RoleCard component.
 * Features:
 * - Dynamic domain visual theme (icon, category badge)
 * - Gradient top accent bar corresponding to AI recommendation ranking
 * - Floating match percentage pill with confidence rating
 * - Responsive flex layout with pinned bottom skill chips
 * - Smooth hover translation and shadow glow micro-interaction
 */
export function RoleCard({ role }) {
  const [isHovered, setIsHovered] = useState(false);

  let score = role.confidenceScore ?? role.confidence ?? 0;
  if (score > 0 && score <= 1.0) {
    score = Math.round(score * 100);
  } else {
    score = Math.round(score);
  }

  const matchPercentage = Math.min(99, Math.max(50, score));
  const rank = role.rank || 1;
  const theme = getRoleVisualTheme(role.roleTitle, rank, matchPercentage);

  // Badge label and styling
  let badgeLabel = 'Best match';
  let badgeBg = 'rgba(16, 185, 129, 0.12)';
  let badgeColor = '#059669';
  let badgeBorder = 'rgba(16, 185, 129, 0.25)';

  if (matchPercentage >= 90) {
    badgeLabel = 'Best match';
    badgeBg = 'rgba(16, 185, 129, 0.12)';
    badgeColor = '#059669';
    badgeBorder = 'rgba(16, 185, 129, 0.25)';
  } else if (matchPercentage >= 80) {
    badgeLabel = 'Good match';
    badgeBg = 'rgba(59, 130, 246, 0.12)';
    badgeColor = '#2563eb';
    badgeBorder = 'rgba(59, 130, 246, 0.25)';
  } else {
    badgeLabel = 'Possible match';
    badgeBg = 'rgba(245, 158, 11, 0.12)';
    badgeColor = '#d97706';
    badgeBorder = 'rgba(245, 158, 11, 0.25)';
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: '#ffffff',
        border: isHovered ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
        borderRadius: '18px',
        boxShadow: isHovered
          ? '0 16px 32px -8px rgba(15, 23, 42, 0.09), 0 4px 12px -2px rgba(15, 23, 42, 0.04)'
          : '0 2px 8px rgba(15, 23, 42, 0.03)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Top Gradient Accent Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: isHovered ? '4px' : '3px',
          background: theme.gradient,
          transition: 'height 0.2s ease'
        }}
      />

      {/* Main Content Area */}
      <div style={{ padding: '24px 24px 16px 24px' }}>
        {/* Header: Icon + Category + Match Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '8px'
          }}
        >
          {/* Domain Icon & Rank Tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: theme.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)'
              }}
            >
              {theme.icon}
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748b'
                }}
              >
                #{rank} Fit
              </span>
            </div>
          </div>

          {/* Match Score Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '9999px',
              background: badgeBg,
              border: `1px solid ${badgeBorder}`,
              color: badgeColor,
              fontSize: '12.5px',
              fontWeight: 700,
              letterSpacing: '-0.01em'
            }}
          >
            <span style={{ fontSize: '10px' }}>●</span>
            {badgeLabel} · {matchPercentage}%
          </div>
        </div>

        {/* Role Title */}
        <h3
          style={{
            fontSize: '18.5px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 10px 0',
            lineHeight: 1.3,
            letterSpacing: '-0.02em'
          }}
        >
          {role.roleTitle}
        </h3>

        {/* Match Rationale / AI Reasoning */}
        {role.matchReason && (
          <p
            style={{
              fontSize: '13.5px',
              color: '#475569',
              lineHeight: 1.55,
              margin: '0 0 16px 0'
            }}
          >
            {role.matchReason}
          </p>
        )}
      </div>

      {/* Footer Area: Bottom Pinned Skill Tags */}
      {role.keySkills && role.keySkills.length > 0 && (
        <div
          style={{
            padding: '14px 24px 20px 24px',
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0) 0%, rgba(248, 250, 252, 0.7) 100%)',
            borderTop: '1px solid rgba(226, 232, 240, 0.6)'
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#94a3b8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}
          >
            Validated Skills
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {role.keySkills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '4px 10px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  color: '#334155',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleCard;
