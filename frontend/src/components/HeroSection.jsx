import React from 'react';

export default function HeroSection() {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 20px' }}>
      <h1
        style={{
          fontSize: '34px',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 10px 0',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Find your best-fit job in one upload
      </h1>
      <p
        style={{
          fontSize: '15px',
          color: '#64748b',
          margin: '0 auto',
          maxWidth: '580px',
          lineHeight: 1.6
        }}
      >
        Upload your resume to extract candidate target roles, skillset match scores, and direct enterprise openings matched in real-time.
      </p>
    </div>
  );
}
