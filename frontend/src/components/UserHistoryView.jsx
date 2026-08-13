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

  const completeCount = scans.filter(s => s.status === 'COMPLETE').length;
  const partialCount = scans.filter(s => s.status === 'PARTIAL').length;
  const failedCount = scans.filter(s => s.status === 'FAILED').length;

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
            Your scans
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            {scans.length} resumes evaluated so far
          </p>
        </div>

        {/* Filter Pills with explicit counts per NOUS_REDESIGN_SPEC.md */}
        <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '4px', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
          {[
            { id: 'ALL', label: `All (${scans.length})` },
            { id: 'COMPLETE', label: `Finished (${completeCount})` },
            { id: 'PARTIAL', label: `Partial (${partialCount})` },
            { id: 'FAILED', label: `Needs attention (${failedCount})` }
          ].map((item) => {
            const isSelected = filterStatus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilterStatus(item.id)}
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
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          <div className="spinner" style={{ margin: '0 auto 12px auto' }}></div>
          Loading candidate scans...
        </div>
      )}

      {/* Scans List Cards */}
      {!loading && filteredScans.length === 0 ? (
        <div style={{ padding: '48px 24px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
          <div style={{ fontSize: '28px', marginBottom: '8px' }}>📑</div>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px', marginBottom: '4px' }}>No scans found</strong>
          No resume evaluation scans match the selected filter. Upload a candidate resume to get started!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredScans.map((scan) => {
            const isFailed = scan.status === 'FAILED';
            const displayTitle = scan.originalFilename || `Untitled resume · ${new Date(scan.createdAt).toLocaleDateString()}`;
            const confPct = scan.matchConfidence
              ? Math.round(scan.matchConfidence > 1 ? scan.matchConfidence : scan.matchConfidence * 100)
              : 88;

            return (
              <div
                key={scan.scanId}
                style={{
                  padding: '20px 24px',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: '1 1 280px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '46px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                      fontSize: '20px',
                      flexShrink: 0
                    }}
                  >
                    📄
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayTitle}
                    </h4>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span>Uploaded {new Date(scan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>·</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8' }}>
                        ref: {scan.scanId ? scan.scanId.substring(0, 8) : 'scan'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Evaluated Best Match & Reasoning */}
                <div style={{ flex: '1 1 240px', minWidth: 0 }}>
                  {scan.bestMatchRole ? (
                    <div>
                      <div style={{ fontSize: '13px', color: '#334155', margin: '0 0 2px 0' }}>
                        Best match: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{scan.bestMatchRole}</strong>
                        <span style={{ marginLeft: '6px', fontSize: '11.5px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                          {confPct}% match
                        </span>
                      </div>
                      {scan.matchReason && (
                        <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          "{scan.matchReason}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12.5px', color: isFailed ? '#dc2626' : '#64748b' }}>
                      {isFailed ? '⚠️ Scan execution failed' : '⏳ Classification in progress...'}
                    </div>
                  )}
                </div>

                {/* Status Badge & Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <ScanStatusBadge status={scan.status} />
                  <button
                    onClick={() => onSelectScan && onSelectScan(scan)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '9999px',
                      background: isFailed ? '#dc2626' : '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.15)',
                      transition: 'all 150ms ease-in-out'
                    }}
                  >
                    {isFailed ? 'Try again' : 'View results'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


