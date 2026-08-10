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
 * Interactive Job Card displaying individual verified live job opening details.
 * Formatted with Asana clean light theme design system tokens.
 */
export function JobCard({ job, activePlatform = 'ALL' }) {
  const [saved, setSaved] = useState(false);

  if (!job) return null;

  // Determine company initial for avatar
  const companyName = job.company || 'Enterprise Partner';
  const initial = companyName.charAt(0).toUpperCase();

  // Direct Top 500 Enterprise job application URL
  let targetUrl = (job.applyUrl && job.applyUrl !== '#') 
    ? job.applyUrl 
    : `https://www.google.com/search?q=${encodeURIComponent(companyName + ' ' + job.title + ' official career page apply')}`;





  // Simulated match score (high relevance)
  const matchScore = 92 + (Math.abs(job.title.length * 7) % 7);

  // Determine 2-letter initials for avatar badge
  const words = companyName.split(' ').filter(Boolean);
  const initials = words.length >= 2 
    ? (words[0][0] + words[1][0]).toUpperCase()
    : companyName.substring(0, 2).toUpperCase();

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
      {/* Left Avatar & Job Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
        {/* Square Initials Avatar Badge */}
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

        {/* Title, Company & Location */}
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

      {/* Right Package & Apply Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        {/* Salary Package */}
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
          {formatSalaryDisplay(job.salaryRange)}
        </div>

        {/* Apply Action Button */}
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

export default JobCard;



