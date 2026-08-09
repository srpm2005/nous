import React, { useState } from 'react';
import { getResumeById } from '../services/api';

export default function RecentUploadsList({ resumes = [], activeResumeId, onSelectResume, onDeleteResume, onAddResume }) {
  const [lookupId, setLookupId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupId.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const data = await getResumeById(lookupId.trim());
      if (onAddResume) onAddResume(data);
      if (onSelectResume) onSelectResume(data);
      setLookupId('');
    } catch (err) {
      setSearchError(err.message || 'Resume not found.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="asana-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 className="asana-heading" style={{ fontSize: '16px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Recent Resumes ({resumes.length})
        </h3>
      </div>

      {/* ID Lookup Form */}
      <form onSubmit={handleLookup} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <input
          type="text"
          placeholder="Lookup UUID..."
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            fontFamily: 'var(--font-mono)'
          }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={isSearching || !lookupId.trim()}
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          {isSearching ? 'Searching...' : 'Find'}
        </button>
      </form>

      {searchError && (
        <div style={{ fontSize: '12px', color: 'var(--status-rose-text)', marginBottom: '10px' }}>
          ⚠️ {searchError}
        </div>
      )}

      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 12px',
          color: 'var(--color-text-muted)',
          fontSize: '13px',
          background: 'var(--color-background-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--color-border)'
        }}>
          No recent uploads yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
          {resumes.map((r) => {
            const isActive = r.id === activeResumeId;
            return (
              <div
                key={r.id}
                onClick={() => onSelectResume && onSelectResume(r)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? '#eff6ff' : 'var(--color-surface)',
                  border: `1px solid ${isActive ? '#3b82f6' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? '#1d4ed8' : 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {r.originalFilename || 'Resume'}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    ID: {r.id.substring(0, 14)}...
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {r.isDuplicate && (
                    <span className="badge badge-emerald" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Dedup
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {r.extractedCharCount ? r.extractedCharCount : 0}c
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
