import React, { useState, useEffect } from 'react';
import { getJobListings, getJobListingsByResumeId } from '../services/api';
import JobCard from './JobCard';
import JobFilterControls from './JobFilterControls';

/**
 * Master Phase 4 Live Job Search Dashboard container.
 * Fetches, filters, and renders aggregated job postings retrieved from external job APIs (Adzuna / MockJobEngine).
 */
export function JobListingsView({ scanId, resumeId, scanStatus, roles = [] }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('ALL');

  useEffect(() => {
    let isMounted = true;
    async function fetchJobs() {
      if (!scanId && !resumeId) {
        setJobs([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let data = [];
        if (scanId) {
          data = await getJobListings(scanId);
        }

        // Fallback: If scanId returned empty or not passed, fetch by resumeId
        if ((!data || data.length === 0) && resumeId) {
          data = await getJobListingsByResumeId(resumeId);
        }

        if (isMounted) {
          setJobs(data || []);
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

    fetchJobs();
    return () => { isMounted = false; };
  }, [scanId, resumeId, scanStatus]);

  // Filter jobs based on keyword, location, and role selection
  const filteredJobs = jobs.filter((j) => {
    if (selectedRoleId !== 'ALL' && j.roleId !== selectedRoleId) {
      return false;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--status-emerald-bg)',
            color: 'var(--status-emerald-text)',
            border: '1px solid var(--status-emerald-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            💼
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
              Live Target Job Match Dashboard
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
              Phase 4 — Parallel job API search engine aggregating live openings matching AI suggested roles
            </p>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          padding: '4px 12px',
          borderRadius: '9999px',
          background: 'var(--status-emerald-bg)',
          color: 'var(--status-emerald-text)',
          border: '1px solid var(--status-emerald-border)',
          fontWeight: 600,
          letterSpacing: '0.03em'
        }}>
          Phase 4 Active
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
          <p style={{ fontSize: '14px' }}>Querying external job search providers (Adzuna / Job Engine)...</p>
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
              {/* Filter Controls */}
              <JobFilterControls
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                locationQuery={locationQuery}
                onLocationChange={setLocationQuery}
                selectedRoleId={selectedRoleId}
                onRoleSelect={setSelectedRoleId}
                roles={roles}
                totalCount={jobs.length}
                filteredCount={filteredJobs.length}
              />

              {/* Job Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '16px'
              }}>
                {filteredJobs.map((job, idx) => (
                  <JobCard key={job.id || idx} job={job} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default JobListingsView;
