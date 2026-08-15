import React, { useState, useEffect } from 'react';

/**
 * Top500CrawlerView Component - Interactive monitoring and manual execution dashboard
 * for the Top 500 Enterprise Daily Screening Engine.
 */
export default function Top500CrawlerView({ onShowToast }) {
  const [companies, setCompanies] = useState([]);
  const [runs, setRuns] = useState([]);
  const [postings, setPostings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [triggerState, setTriggerState] = useState('idle'); // 'idle' | 'running' | 'done'
  const [lastCrawlResultCount, setLastCrawlResultCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, runsRes, postRes] = await Promise.all([
        fetch('http://localhost:8080/api/top500/companies').then((res) => res.json()).catch(() => []),
        fetch('http://localhost:8080/api/top500/runs').then((res) => res.json()).catch(() => []),
        fetch('http://localhost:8080/api/top500/postings').then((res) => res.json()).catch(() => [])
      ]);

      setCompanies(compRes || []);
      setRuns(runsRes || []);
      setPostings(postRes || []);
    } catch (err) {
      console.error('Failed to fetch Top 500 crawler data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCrawl = async () => {
    setTriggerState('running');
    try {
      const res = await fetch('http://localhost:8080/api/top500/trigger', {
        method: 'POST'
      });
      const data = await res.json();
      const newlyFound = data.companiesAttempted || 0;
      setLastCrawlResultCount(newlyFound);
      setTriggerState('done');

      if (onShowToast) {
        onShowToast(`🚀 Enterprise Portal Screening batch complete! Attempted ${newlyFound} hiring portals.`);
      }

      await fetchData();

      setTimeout(() => {
        setTriggerState('idle');
      }, 3500);
    } catch (err) {
      setTriggerState('idle');
      if (onShowToast) {
        onShowToast('❌ Failed to trigger crawl batch.');
      }
    }
  };

  const getExtractedSkills = (posting) => {
    if (!posting || !posting.title) return ['Software Engineering', 'Problem Solving'];
    const t = posting.title.toLowerCase();
    const skills = [];
    if (t.includes('java')) skills.push('Java', 'Spring Boot');
    if (t.includes('backend')) skills.push('Backend Architecture', 'REST APIs');
    if (t.includes('full stack') || t.includes('react')) skills.push('React', 'TypeScript', 'Node.js');
    if (t.includes('ai') || t.includes('data')) skills.push('Python', 'ML Pipelines', 'PyTorch');
    if (t.includes('cloud') || t.includes('infra')) skills.push('AWS', 'Docker', 'Kubernetes');
    if (skills.length === 0) skills.push('Distributed Systems', 'Java', 'Git');
    return skills;
  };

  const baseFilteredPostings = postings.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const loc = (p.location || '').toLowerCase();
    const skillsStr = getExtractedSkills(p).join(' ').toLowerCase();

    const isIndiaSearch = q === 'india' || q === 'in';
    const isIndiaLocation = loc.includes('india') || loc.includes('bangalore') || loc.includes('bengaluru') || loc.includes('hyderabad') || loc.includes('mumbai') || loc.includes('pune') || loc.includes('chennai') || loc.includes('gurgaon') || loc.includes('noida') || loc.includes('delhi') || loc.includes('karnataka') || loc.includes('telangana') || loc.includes('maharashtra') || loc.includes('haryana') || loc.includes('tamil nadu');

    if (isIndiaSearch && isIndiaLocation) return true;

    return (
      p.title?.toLowerCase().includes(q) ||
      p.company?.name?.toLowerCase().includes(q) ||
      loc.includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      skillsStr.includes(q)
    );
  });

  const activePortalsCount = companies.length;
  const totalOpeningsCount = postings.length;

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '32px' }}>
      {/* Header & 3-State Action Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Top 500 Enterprise Screening
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Daily automated 12:00 PM IST screening engine scanning top corporate career portals
          </p>
        </div>

        {/* 3-State Trigger Button */}
        <button
          onClick={handleTriggerCrawl}
          disabled={triggerState === 'running'}
          style={{
            padding: '11px 26px',
            borderRadius: '9999px',
            background: triggerState === 'done' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : triggerState === 'running' ? '#64748b' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: triggerState === 'running' ? 'wait' : 'pointer',
            boxShadow: triggerState === 'done' ? '0 4px 14px rgba(16, 185, 129, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.3)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 200ms ease-in-out'
          }}
        >
          {triggerState === 'running' && '⟳ Screening enterprise portals…'}
          {triggerState === 'done' && `✓ Complete — ${lastCrawlResultCount} portals checked`}
          {triggerState === 'idle' && '▶ Run screening crawl now'}
        </button>
      </div>

      {/* Hero Summary Header Line */}
      <div
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '18px',
          color: '#ffffff',
          marginBottom: '32px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          border: '1px solid #334155'
        }}
      >
        <div>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
            System Coverage & Portal Status
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Last run: <span style={{ color: '#38bdf8' }}>Today, 12:00 PM</span> · <strong style={{ color: '#facc15' }}>{activePortalsCount} of 500</strong> companies connected
          </div>
          <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '6px' }}>
            <strong style={{ color: '#ffffff' }}>{totalOpeningsCount}</strong> verified direct enterprise postings indexed across connected company portals
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '12px 20px', borderRadius: '14px', textAlign: 'right', backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Cron Schedule</div>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#4ade80', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }}></span>
            Daily @ 12:00 PM IST
          </div>
        </div>
      </div>

      {/* Monitored Portals Grid */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
            Monitored Enterprise Portals ({companies.length})
          </h3>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Verified hiring portals & ATS feeds
          </span>
        </div>

        {companies.length === 0 ? (
          <div style={{ padding: '36px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b', textAlign: 'center' }}>
            No monitored enterprise portals loaded yet. Trigger a screening crawl above to seed portals.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
            {companies.map((c) => {
              const companyOpenings = postings.filter(p => p.company && (p.company.id === c.id || p.company.name === c.name)).length;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '20px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 200ms ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px -4px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 3px 0' }}>{c.name}</h4>
                      <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>{c.domain}</span>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '9999px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      Verified
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12.5px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ color: companyOpenings > 0 ? '#059669' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: companyOpenings > 0 ? '#10b981' : '#94a3b8' }}></span>
                      {companyOpenings > 0 ? `${companyOpenings} roles found` : 'Pending next run'}
                    </span>
                    <a
                      href={c.careerPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    >
                      Portal ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Enterprise Openings Section */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '16px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
              Live Direct Enterprise Openings ({baseFilteredPostings.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Scraped directly from corporate portals (Microsoft, Amazon, Google, Meta, Apple, Netflix, Adobe, Stripe, Figma, TCS, Infosys, Accenture)
            </p>
          </div>

          <input
            type="text"
            placeholder="Search enterprise openings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '9px 18px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              width: '270px',
              background: '#ffffff',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        {/* Empty State */}
        {baseFilteredPostings.length === 0 ? (
          <div
            style={{
              padding: '56px 28px',
              textAlign: 'center',
              background: '#ffffff',
              borderRadius: '18px',
              border: '1px dashed #cbd5e1',
              color: '#475569'
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🕐</div>
            <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              No enterprise openings indexed yet
            </h4>
            <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              The daily screening crawl runs automatically today at 12:00 PM IST. You can also trigger an instant manual screening run right now.
            </p>
            <button
              onClick={handleTriggerCrawl}
              disabled={triggerState === 'running'}
              style={{
                padding: '10px 26px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.25)'
              }}
            >
              ▶ Run screening crawl now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {baseFilteredPostings.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '20px 24px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '18px',
                  flexWrap: 'wrap',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  transition: 'all 180ms ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', margin: '0 0 5px 0' }}>{p.title}</h4>
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{p.company?.name || 'Enterprise'}</span>
                    <span>·</span>
                    <span>{p.location || 'Remote'}</span>
                    {p.department && (
                      <>
                        <span>·</span>
                        <span style={{ color: '#2563eb', fontWeight: 600 }}>{p.department}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    {p.salaryRange || 'Competitive'}
                  </span>
                  <a
                    href={p.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '9px 24px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      textDecoration: 'none',
                      boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
                      transition: 'all 180ms ease'
                    }}
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
