import React, { useState, useEffect } from 'react';
import { getJobListings, getJobListingsByResumeId, getSuggestedRoles, getSuggestedRolesByResumeId, getTop500Companies } from '../services/api';
import JobCard from './JobCard';
import JobFilterControls from './JobFilterControls';

/**
 * Master Phase 4 Live Job Search Dashboard container.
 * Categorizes and groups enterprise job postings by candidate skills & target roles.
 */
export function JobListingsView({ scanId, resumeId, scanStatus, roles: initialRoles = [] }) {
  const [jobs, setJobs] = useState([]);
  const [roles, setRoles] = useState(initialRoles);
  const [allCompanies, setAllCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('ALL');
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    async function fetchCompanyDirectory() {
      try {
        const data = await getTop500Companies();
        if (isMounted && data && Array.isArray(data)) {
          const names = data
            .map(c => c.name)
            .filter(name => name && !name.toLowerCase().startsWith('enterprise partner'));
          setAllCompanies(names);
        }
      } catch (e) {
        console.warn('Could not fetch enterprise company directory', e);
      }
    }
    fetchCompanyDirectory();
    return () => { isMounted = false; };
  }, []);
  
  // View mode state: 'categorized' (default skill groups) | 'grid' (2-column cards) | 'list' (single column)
  const [viewMode, setViewMode] = useState('categorized');

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      if (!scanId && !resumeId) {
        setJobs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let jobData = [];
        if (scanId) {
          jobData = await getJobListings(scanId);
        }

        if ((!jobData || jobData.length === 0) && resumeId) {
          jobData = await getJobListingsByResumeId(resumeId);
        }

        // Also fetch roles if not passed
        let rolesData = initialRoles;
        if ((!rolesData || rolesData.length === 0)) {
          if (scanId) {
            rolesData = await getSuggestedRoles(scanId).catch(() => []);
          }
          if ((!rolesData || rolesData.length === 0) && resumeId) {
            rolesData = await getSuggestedRolesByResumeId(resumeId).catch(() => []);
          }
        }

        if (isMounted) {
          setJobs(jobData || []);
          if (rolesData && rolesData.length > 0) {
            setRoles(rolesData);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed fetching live job listings', err);
          setError(err.message || 'Could not load live job listings.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, [scanId, resumeId, scanStatus]);

  // Helper to accurately match job against a target role's domain keywords
  const matchesRoleDomain = (job, matchedRole) => {
    if (!job || !matchedRole) return true;
    if (job.roleId && matchedRole.id && job.roleId === matchedRole.id) {
      return true;
    }

    const jobTitle = (job.title || '').toLowerCase();
    const roleTitle = (matchedRole.roleTitle || '').toLowerCase();

    const genericWords = new Set(['software', 'engineer', 'developer', 'senior', 'principal', 'lead', 'staff', 'ii', 'iii', 'iv', 'team', 'openings']);
    
    const roleTerms = roleTitle.split(/[\s/-]+/).filter(w => w.length > 1 && !genericWords.has(w));
    const rawSkills = Array.isArray(matchedRole.keySkills)
      ? matchedRole.keySkills
      : (matchedRole.keySkillsCsv ? matchedRole.keySkillsCsv.split(',') : []);
    const skillTerms = rawSkills.map(s => s.toLowerCase().split(/[\s/-]+/)).flat().filter(w => w.length > 1 && !genericWords.has(w));

    const domainKeywords = [...new Set([...roleTerms, ...skillTerms])];

    if (domainKeywords.length === 0) return true;

    return domainKeywords.some(k => jobTitle.includes(k));
  };

  // Filter jobs based on keyword, location, role selection, and platform selection
  const filteredJobs = jobs.filter((j) => {
    if (selectedRoleId !== 'ALL') {
      const matchedRole = roles.find(r => (r.id && r.id === selectedRoleId) || r.roleTitle === selectedRoleId);
      if (matchedRole && !matchesRoleDomain(j, matchedRole)) {
        return false;
      }
    }

    if (selectedPlatform !== 'ALL') {
      const p = selectedPlatform.toLowerCase();
      const matchCompany = j.company?.toLowerCase().includes(p);
      const matchSource = j.sourceApi?.toLowerCase().includes(p);
      if (!matchCompany && !matchSource) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = j.title?.toLowerCase().includes(q);
      const matchCompany = j.company?.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany) return false;
    }

    if (locationQuery.trim()) {
      const l = locationQuery.toLowerCase();
      const matchLoc = j.location?.toLowerCase().includes(l);
      if (!matchLoc) return false;
    }

    return true;
  });

  // Skill clusters definitions for categorizing jobs
  const skillCategories = [
    {
      id: 'java_spring',
      title: '☕ Java, Spring Boot & Backend Systems',
      subtitle: 'Enterprise backend architecture, microservices, and Spring ecosystem roles',
      icon: '☕',
      badgeBg: '#eff6ff',
      badgeColor: '#1d4ed8',
      matchKeywords: ['java', 'spring', 'backend', 'back-end', 'jvm', 'hibernate']
    },
    {
      id: 'cloud_infra',
      title: '☁️ Cloud Infrastructure, AWS & Microservices',
      subtitle: 'Scalable distributed systems, cloud platforms (AWS/Azure/GCP), & DevOps',
      icon: '☁️',
      badgeBg: '#f0f9ff',
      badgeColor: '#0369a1',
      matchKeywords: ['cloud', 'azure', 'aws', 'gcp', 'microservice', 'devops', 'kubernetes', 'docker']
    },
    {
      id: 'fullstack_api',
      title: '🌐 Full Stack & API Platform Development',
      subtitle: 'End-to-end web engineering, REST API design, & frontend/backend integration',
      icon: '🌐',
      badgeBg: '#f3e8ff',
      badgeColor: '#7e22ce',
      matchKeywords: ['fullstack', 'full stack', 'full-stack', 'api', 'rest', 'react', 'node', 'web']
    },
    {
      id: 'senior_arch',
      title: '👑 Staff, Lead & Principal Architecture',
      subtitle: 'Senior engineering, technical leadership, & high-impact system architecture',
      icon: '👑',
      badgeBg: '#fff7ed',
      badgeColor: '#c2410c',
      matchKeywords: ['principal', 'staff', 'lead', 'architect', 'senior', 'head']
    }
  ];

  // Helper to categorize filtered jobs into skill buckets
  const getCategorizedJobs = () => {
    const buckets = [];
    const assignedIds = new Set();

    const activeRoles = selectedRoleId === 'ALL'
      ? roles
      : roles.filter(r => (r.id && r.id === selectedRoleId) || r.roleTitle === selectedRoleId);

    // 1. Create buckets from candidate target roles
    if (activeRoles && activeRoles.length > 0) {
      activeRoles.forEach((r, idx) => {
        const matching = filteredJobs.filter(j => {
          if (assignedIds.has(j.id)) return false;
          return matchesRoleDomain(j, r);
        });

        const rawSkills = Array.isArray(r.keySkills)
          ? r.keySkills
          : (r.keySkillsCsv ? r.keySkillsCsv.split(',') : ['Target Skill Set']);

        if (matching.length > 0) {
          matching.forEach(j => assignedIds.add(j.id));
          buckets.push({
            id: r.id || `role-${idx}`,
            title: `🎯 Target Role: ${r.roleTitle}`,
            subtitle: `Matched candidate skills: ${rawSkills.slice(0, 5).join(', ')}`,
            badgeBg: '#eff6ff',
            badgeColor: '#2563eb',
            jobs: matching
          });
        }
      });
    }

    // 2. Group remaining jobs into core skill clusters (only if ALL selected)
    if (selectedRoleId === 'ALL') {
      skillCategories.forEach(cat => {
        const matching = filteredJobs.filter(j => {
          if (assignedIds.has(j.id)) return false;
          const jt = (j.title || '').toLowerCase();
          return cat.matchKeywords.some(k => jt.includes(k));
        });

        if (matching.length > 0) {
          matching.forEach(j => assignedIds.add(j.id));
          buckets.push({
            id: cat.id,
            title: cat.title,
            subtitle: cat.subtitle,
            badgeBg: cat.badgeBg,
            badgeColor: cat.badgeColor,
            jobs: matching
          });
        }
      });
    }

    // 3. Catch all remaining jobs
    const remaining = filteredJobs.filter(j => !assignedIds.has(j.id));
    if (remaining.length > 0) {
      const activeSingleRole = selectedRoleId !== 'ALL' ? activeRoles[0] : null;
      const rawSkills = activeSingleRole
        ? (Array.isArray(activeSingleRole.keySkills) ? activeSingleRole.keySkills : (activeSingleRole.keySkillsCsv ? activeSingleRole.keySkillsCsv.split(',') : ['Target Skill Set']))
        : [];

      const bucketTitle = activeSingleRole
        ? `🎯 Target Role: ${activeSingleRole.roleTitle}`
        : '🚀 Verified Enterprise Openings';

      const bucketSubtitle = activeSingleRole
        ? `Matched candidate skills: ${rawSkills.slice(0, 5).join(', ')}`
        : 'Additional top-tier software engineering openings from enterprise hiring portals';

      buckets.push({
        id: 'other_enterprise',
        title: bucketTitle,
        subtitle: bucketSubtitle,
        badgeBg: '#eff6ff',
        badgeColor: '#2563eb',
        jobs: remaining
      });
    }

    return buckets;
  };

  const categorizedBuckets = getCategorizedJobs();

  return (
    <div
      className="asana-card animate-fade-in"
      style={{
        padding: '24px',
        marginTop: '20px',
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        borderRadius: 'var(--radius-md)'
      }}
    >
      {/* Header section */}
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            Jobs Categorized by Your Skills
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            Openings grouped into target skill categories & multi-column grid cards matching your resume profile
          </p>
        </div>

        {/* View Mode Toggle Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e2e8f0', padding: '3px', borderRadius: '10px' }}>
          <button
            onClick={() => setViewMode('categorized')}
            title="Categorized Skill View"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'categorized' ? '#ffffff' : 'transparent',
              color: viewMode === 'categorized' ? '#0f172a' : '#64748b',
              fontWeight: viewMode === 'categorized' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: viewMode === 'categorized' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Categorized by Role
          </button>

          <button
            onClick={() => setViewMode('grid')}
            title="All Openings Grid View"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? '#0f172a' : '#64748b',
              fontWeight: viewMode === 'grid' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            All Openings (Grid)
          </button>

          <button
            onClick={() => setViewMode('list')}
            title="Compact List View"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              background: viewMode === 'list' ? '#ffffff' : 'transparent',
              color: viewMode === 'list' ? '#0f172a' : '#64748b',
              fontWeight: viewMode === 'list' ? 700 : 500,
              fontSize: '12.5px',
              cursor: 'pointer',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            Compact List
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
          <p style={{ fontSize: '14px' }}>Querying enterprise portal job engine & categorizing by skills...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--status-rose-bg)',
          border: '1px solid var(--status-rose-border)',
          color: 'var(--status-rose-text)',
          fontSize: '13px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Content State */}
      {!loading && !error && (
        <>
          {jobs.length === 0 ? (
            <div style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: 'var(--color-background-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border)',
              color: 'var(--color-text-muted)'
            }}>
              <p style={{ fontSize: '14px', margin: 0 }}>
                {(scanStatus === 'PROCESSING' || scanStatus === 'PENDING')
                  ? '⏳ Background pipeline is fetching live job openings for your extracted roles...'
                  : 'No live job listings available yet. Upload a resume to run the full async pipeline.'}
              </p>
            </div>
          ) : (
            <>
              {/* Unified Job Filter Controls */}
              <JobFilterControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                locationQuery={locationQuery}
                onLocationChange={setLocationQuery}
                selectedRoleId={selectedRoleId}
                onRoleSelect={setSelectedRoleId}
                selectedPlatform={selectedPlatform}
                onPlatformSelect={setSelectedPlatform}
                roles={roles}
                companies={Array.from(new Set([...allCompanies, ...jobs.map(j => j.company).filter(Boolean)])).sort()}
                totalCount={jobs.length}
                filteredCount={filteredJobs.length}
              />

              {/* RENDER MODE 1: CATEGORIZED SKILL GROUPS (Default) */}
              {viewMode === 'categorized' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  {categorizedBuckets.map((bucket) => (
                    <div
                      key={bucket.id}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Category Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid #cbd5e1',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 3px 0' }}>
                            {bucket.title}
                          </h4>
                          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                            {bucket.subtitle}
                          </p>
                        </div>

                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          background: bucket.badgeBg || '#eff6ff',
                          color: bucket.badgeColor || '#2563eb',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          border: '1px solid #bfdbfe'
                        }}>
                          {bucket.jobs.length} Openings
                        </span>
                      </div>

                      {/* Multi-Column Responsive Card Grid inside Skill Category */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '18px'
                      }}>
                        {bucket.jobs.map((job, idx) => (
                          <JobCard
                            key={job.id || `${bucket.id}-${idx}`}
                            job={job}
                            activePlatform={selectedPlatform}
                            viewMode="grid"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* RENDER MODE 2: MULTI-COLUMN GRID VIEW */}
              {viewMode === 'grid' && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '18px'
                }}>
                  {filteredJobs.map((job, idx) => (
                    <JobCard
                      key={job.id || idx}
                      job={job}
                      activePlatform={selectedPlatform}
                      viewMode="grid"
                    />
                  ))}
                </div>
              )}

              {/* RENDER MODE 3: SINGLE LINE LIST VIEW */}
              {viewMode === 'list' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {filteredJobs.map((job, idx) => (
                    <JobCard
                      key={job.id || idx}
                      job={job}
                      activePlatform={selectedPlatform}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}

            </>
          )}
        </>
      )}

    </div>
  );
}

export default JobListingsView;
