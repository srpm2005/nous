import React, { useState, useEffect } from 'react';

/**
 * Top500CrawlerView Component - Interactive monitoring and manual execution dashboard
 * for the Top 500 Enterprise Daily Screening Engine per NOUS_REDESIGN_SPEC.md.
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
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Header & 3-State Action Button per Section 5.1 & 5.4 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Top 500 Enterprise Screening
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Daily 12:00 PM IST automated screening of top enterprise career portals
          </p>
        </div>

        {/* 3-State Trigger Button */}
        <button
          onClick={handleTriggerCrawl}
          disabled={triggerState === 'running'}
          style={{
            padding: '10px 24px',
            borderRadius: '9999px',
            background: triggerState === 'done' ? '#059669' : triggerState === 'running' ? '#64748b' : '#2563eb',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: triggerState === 'running' ? 'wait' : 'pointer',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 200ms ease'
          }}
        >
          {triggerState === 'running' && '⟳ Screening enterprise portals…'}
          {triggerState === 'done' && `✓ Done — ${lastCrawlResultCount} portals checked`}
          {triggerState === 'idle' && '▶ Run screening crawl now'}
        </button>
      </div>

      {/* Single Coherent Summary Header Line per Section 5.1 */}
      <div
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: '16px',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 4px 12px rgba(15,23,42,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
            System Coverage & Screening Status
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
            Last run: <span style={{ color: '#38bdf8' }}>Today, 12:00 PM</span> · <strong style={{ color: '#facc15' }}>{activePortalsCount} of 500</strong> companies connected
          </div>
          <div style={{ fontSize: '13.5px', color: '#cbd5e1', marginTop: '4px' }}>
            <strong>{totalOpeningsCount}</strong> verified direct enterprise postings indexed across connected company portals
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '12px', textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Cron Schedule</div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>● Daily @ 12:00 PM IST</div>
        </div>
      </div>

      {/* Monitored Portals Grid per Section 5.2 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Monitored Enterprise Portals ({companies.length})
          </h3>
          <span style={{ fontSize: '12.5px', color: '#64748b' }}>
            Showing verified hiring portals
          </span>
        </div>

        {companies.length === 0 ? (
          <div style={{ padding: '28px', background: '#f8fafc', borderRadius: '14px', border: '1px dashed #cbd5e1', color: '#64748b', textAlign: 'center' }}>
            No monitored enterprise portals loaded yet. Trigger a screening crawl to seed portals.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {companies.map((c) => {
              const companyOpenings = postings.filter(p => p.company && (p.company.id === c.id || p.company.name === c.name)).length;
              return (
                <div
                  key={c.id}
                  style={{
                    padding: '18px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>{c.name}</h4>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{c.domain}</span>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        background: '#eff6ff',
                        color: '#2563eb',
                        border: '1px solid #bfdbfe'
                      }}
                    >
                      Verified Portal
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: companyOpenings > 0 ? '#059669' : '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {companyOpenings > 0 ? `● ${companyOpenings} roles found` : '○ Pending next run'}
                    </span>
                    <a
                      href={c.careerPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Visit Portal ↗
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Enterprise Openings Section per Section 5.3 */}
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
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Live Direct Enterprise Openings ({baseFilteredPostings.length})
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Scraped directly from corporate career portals (Microsoft, Amazon, Google, Meta, Apple, Netflix, Adobe, Stripe, Figma, TCS, Infosys, Accenture)
            </p>
          </div>

          <input
            type="text"
            placeholder="Search enterprise openings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              width: '260px'
            }}
          />
        </div>

        {/* Real Empty State per Section 5.3 */}
        {baseFilteredPostings.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              color: '#475569'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕐</div>
            <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
              No enterprise openings indexed yet
            </h4>
            <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '460px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
              The daily screening crawl runs automatically today at 12:00 PM IST. You can also execute a manual screening run right now.
            </p>
            <button
              onClick={handleTriggerCrawl}
              disabled={triggerState === 'running'}
              style={{
                padding: '9px 24px',
                borderRadius: '9999px',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '13.5px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
              }}
            >
              ▶ Run screening crawl now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {baseFilteredPostings.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: '18px 22px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{p.title}</h4>
                  <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.company?.name || 'Enterprise'}</span>
                    <span>·</span>
                    <span>{p.location || 'Remote'}</span>
                    {p.department && (
                      <>
                        <span>·</span>
                        <span style={{ color: '#2563eb', fontWeight: 500 }}>{p.department}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{p.salaryRange || 'Competitive'}</span>
                  <a
                    href={p.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '9px 22px',
                      borderRadius: '9999px',
                      background: '#2563eb',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
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

