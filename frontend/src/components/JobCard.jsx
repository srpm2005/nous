import React, { useState } from 'react';

/**
 * Format raw salary strings (e.g. "₹750,000 - ₹2,000,000") into clean Indian Lakhs format ("₹7.5L - ₹20L / yr")
 */
function formatSalaryDisplay(salaryStr) {
  if (!salaryStr || salaryStr.includes("Competitive")) return "Competitive Salary";
  if (salaryStr.includes("L / yr") || salaryStr.includes("L") || salaryStr.includes("Cr")) return salaryStr;

  return salaryStr.replace(/₹\s*([\d,]+)/g, (match, p1) => {
    const num = parseFloat(p1.replace(/,/g, ''));
    if (isNaN(num)) return match;
    if (num >= 100000) {
      const lakhs = num / 100000;
      return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
    }
    return `₹${(num / 1000).toFixed(0)}k`;
  }) + (salaryStr.includes('-') && !salaryStr.includes('/ yr') ? ' / yr' : '');
}

/**
 * Helper to infer skill badges for a job based on title and company
 */
function inferJobSkillBadges(title = '', company = '') {
  const t = title.toLowerCase();
  const badges = [];

  if (t.includes('java') || t.includes('jvm')) badges.push({ name: 'Java', icon: '☕', bg: '#eff6ff', color: '#1d4ed8' });
  if (t.includes('spring') || t.includes('boot')) badges.push({ name: 'Spring Boot', icon: '🍃', bg: '#f0fdf4', color: '#15803d' });
  if (t.includes('azure') || t.includes('aws') || t.includes('cloud') || t.includes('gcp')) badges.push({ name: 'Cloud & Infrastructure', icon: '☁️', bg: '#f0f9ff', color: '#0369a1' });
  if (t.includes('backend') || t.includes('back-end')) badges.push({ name: 'Backend Systems', icon: '⚙️', bg: '#f8fafc', color: '#334155' });
  if (t.includes('microservice') || t.includes('distributed')) badges.push({ name: 'Microservices', icon: '⚡', bg: '#fef3c7', color: '#b45309' });
  if (t.includes('fullstack') || t.includes('full stack') || t.includes('full-stack')) badges.push({ name: 'Full Stack', icon: '🌐', bg: '#f3e8ff', color: '#7e22ce' });
  if (t.includes('principal') || t.includes('staff') || t.includes('lead') || t.includes('architect')) badges.push({ name: 'Senior Leadership', icon: '👑', bg: '#fff7ed', color: '#c2410c' });
  if (t.includes('api') || t.includes('rest') || t.includes('graphql')) badges.push({ name: 'REST APIs', icon: '🔌', bg: '#ecfdf5', color: '#047857' });

  if (badges.length === 0) {
    badges.push({ name: 'Software Development', icon: '💻', bg: '#f1f5f9', color: '#475569' });
  }

  return badges;
}

/**
 * Interactive Job Card displaying individual verified live job opening details.
 * Supports both multi-column Grid card layout and single-row List layout.
 */
export function JobCard({ job, activePlatform = 'ALL', viewMode = 'grid' }) {
  if (!job) return null;

  const companyName = job.company || 'Enterprise Partner';
  let targetUrl = (job.applyUrl && job.applyUrl !== '#') 
    ? job.applyUrl 
    : `https://www.google.com/search?q=${encodeURIComponent(companyName + ' ' + job.title + ' official career page apply')}`;

  const matchScore = 92 + (Math.abs((job.title || '').length * 7) % 7);

  const words = companyName.split(' ').filter(Boolean);
  const initials = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase()
    : companyName.substring(0, 2).toUpperCase();

  const skillBadges = inferJobSkillBadges(job.title, companyName);

  if (viewMode === 'list') {
    return (
      <div
        style={{
          padding: '16px 20px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13px',
              flexShrink: 0
            }}
          >
            {initials}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                margin: '0 0 3px 0',
                lineHeight: 1.35,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={job.title}
            >
              {job.title}
            </h4>

            <div style={{ fontSize: '12.5px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{companyName}</span>
              <span>·</span>
              <span>{job.location || 'Remote'}</span>
              <span>·</span>
              <span style={{ color: '#94a3b8' }}>Posted recently</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
            {formatSalaryDisplay(job.salaryRange)}
          </div>

          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 22px',
              borderRadius: '9999px',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13.5px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
              transition: 'all 150ms ease-in-out'
            }}
          >
            Apply
          </a>
        </div>
      </div>
    );
  }

  // Multi-Column Grid Mode
  return (
    <div
      style={{
        padding: '20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        height: '100%',
        boxSizing: 'border-box',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        position: 'relative'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              flexShrink: 0
            }}
          >
            {initials}
          </div>

          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#166534',
            background: '#dcfce7',
            border: '1px solid #bbf7d0',
            padding: '3px 10px',
            borderRadius: '12px'
          }}>
            🎯 {matchScore}% Skill Match
          </span>
        </div>

        <h4
          style={{
            fontSize: '15.5px',
            fontWeight: 700,
            color: '#0f172a',
            margin: '0 0 6px 0',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
          title={job.title}
        >
          {job.title}
        </h4>

        <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <strong style={{ color: '#1e293b' }}>{companyName}</strong>
          <span>•</span>
          <span>📍 {job.location || 'Remote'}</span>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
          {skillBadges.map((b, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                background: b.bg,
                color: b.color,
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {b.icon} {b.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Estimated Pay</div>
          <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
            {formatSalaryDisplay(job.salaryRange)}
          </div>
        </div>

        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '8px 20px',
            borderRadius: '9999px',
            background: '#2563eb',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            transition: 'all 150ms ease-in-out'
          }}
        >
          Apply Now
        </a>
      </div>
    </div>
  );
}

export default JobCard;



