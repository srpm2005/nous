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
      className="card-glow animate-fade-in"
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '24px',
        marginTop: '20px'
      }}
    >
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '22px' }}>💼</span>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Live Target Job Match Dashboard
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, marginTop: '2px' }}>
              Phase 4 — Parallel job API search engine aggregating live openings matching AI suggested roles
            </p>
          </div>
        </div>

        <span style={{
          fontSize: '11px',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          fontWeight: 600
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
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
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
              background: 'rgba(30, 41, 59, 0.3)',
              borderRadius: 'var(--radius-md)',
              border: '1px border-dashed var(--color-border)',
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
