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
    <div className="asana-card" style={{ padding: '24px' }}>
      <h3 className="asana-heading" style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Recent Resumes
      </h3>


      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '24px 12px',
          color: 'var(--color-text-muted)',
          fontSize: '14px',
          background: 'var(--color-background-subtle)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--color-border)'
        }}>
          No resumes uploaded yet.
        </div>

      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
          {resumes.map((r) => {
            const isActive = r.id === activeResumeId;
            return (
              <div
                key={r.id}
                onClick={() => onSelectResume && onSelectResume(r)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? '#f1f5f9' : 'var(--color-surface)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {r.originalFilename || 'Resume'}
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {r.id.substring(0, 18)}...
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {r.isDuplicate && (
                    <span className="badge badge-emerald" style={{ fontSize: '11px', padding: '2px 6px' }}>
                      Dedup
                    </span>
                  )}
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    {r.extractedCharCount || 0}c
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
