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
    <div className="asana-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 className="asana-heading" style={{ fontSize: '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 9 0 0118 0z" />
            </svg>
            Phase 5 — Persistence & User Scan History
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            All historical scan runs persisted in PostgreSQL normalized schema for user: <strong style={{ color: 'var(--color-text)' }}>{userId}</strong>
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="asana-button-secondary"
          style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l5.64 5.36A9 9 0 0020.49 15" />
          </svg>
          Refresh History
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
        {['ALL', 'COMPLETE', 'PROCESSING', 'PENDING', 'FAILED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              background: filterStatus === st ? 'var(--color-accent)' : 'transparent',
              color: filterStatus === st ? '#ffffff' : 'var(--color-text-muted)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all var(--motion-fast)'
            }}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 12px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Loading scan history from backend...
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--status-rose-bg)', color: 'var(--status-rose-text)', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      ) : filteredScans.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '32px 12px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
          background: 'var(--color-background-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--color-border)'
        }}>
          No scans found for status: {filterStatus}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
          {filteredScans.map((scan) => (
            <div
              key={scan.scanId}
              onClick={() => onSelectScan && onSelectScan(scan)}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                cursor: 'pointer',
                transition: 'all var(--motion-fast)'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
                    Scan ID: {scan.scanId}
                  </span>
                  <ScanStatusBadge status={scan.status} />
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>Resume ID: <code style={{ fontFamily: 'var(--font-mono)' }}>{scan.resumeId}</code></span>
                  {scan.createdAt && (
                    <span>Created: {new Date(scan.createdAt).toLocaleString()}</span>
                  )}
                  {scan.completedAt && (
                    <span>Completed: {new Date(scan.completedAt).toLocaleString()}</span>
                  )}
                </div>

                {scan.errorReason && (
                  <div style={{ fontSize: '12px', color: 'var(--status-rose-text)', marginTop: '6px' }}>
                    Reason: {scan.errorReason}
                  </div>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 500 }}>
                View Scan Details →
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
