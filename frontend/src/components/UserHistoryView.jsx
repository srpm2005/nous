import React, { useState, useEffect } from 'react';
import { getUserScans } from '../services/api';
import ScanStatusBadge from './ScanStatusBadge';

export default function UserHistoryView({ userId = 'anonymous', onSelectScan, onRefreshSignal }) {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserScans(userId);
      setScans(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load user scan history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId, onRefreshSignal]);

  const filteredScans = scans.filter((s) => {
    if (filterStatus === 'ALL') return true;
    return s.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Your scans
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {scans.length} resumes checked so far
          </p>
        </div>

        {/* Filter Pills matching PDF Page 4 */}
        <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '4px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
          {['ALL', 'COMPLETE', 'PARTIAL', 'FAILED'].map((st) => {
            const isSelected = filterStatus === st;
            let label = st === 'ALL' ? 'All' : st === 'COMPLETE' ? 'Finished' : st === 'PARTIAL' ? 'Partial' : 'Needs attention';
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: 'none',
                  background: isSelected ? '#2563eb' : 'transparent',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease-in-out'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
          Loading your scans...
        </div>
      )}

      {/* Scans List Cards */}
      {!loading && filteredScans.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#64748b' }}>
          No scans found yet. Upload a resume to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredScans.map((scan) => {
            const isFinished = scan.status === 'COMPLETE';
            const isFailed = scan.status === 'FAILED';

            return (
              <div
                key={scan.scanId}
                style={{
                  padding: '18px 24px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}
              >
                {/* File Icon & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                      fontSize: '18px',
                      flexShrink: 0
                    }}
                  >
                    📄
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0' }}>
                      {scan.originalFilename || `scan_${scan.scanId.substring(0, 8)}.pdf`}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      Uploaded {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Best Match */}
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  Best match: <strong style={{ color: '#0f172a', fontWeight: 600 }}>Senior Backend Engineer</strong>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => onSelectScan && onSelectScan(scan)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    background: isFailed ? '#2563eb' : '#ffffff',
                    color: isFailed ? '#ffffff' : '#0f172a',
                    border: isFailed ? 'none' : '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 150ms ease-in-out'
                  }}
                >
                  {isFailed ? 'Try again' : 'View results'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

