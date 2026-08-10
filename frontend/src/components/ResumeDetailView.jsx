import React, { useState } from 'react';
import { deleteResume } from '../services/api';
import ScanStatusBadge from './ScanStatusBadge';
import SuggestedRolesView from './SuggestedRolesView';
import JobListingsView from './JobListingsView';

export default function ResumeDetailView({ resume, onDeleteSuccess, onCopyToast }) {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'text' | 'tech'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!resume) {
    return (
      <div className="asana-card" style={{
        padding: '56px 24px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '380px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '1px solid #bfdbfe',
          color: '#2563eb'
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h4 style={{ fontSize: '19px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 8px 0' }}>No Active Resume Selected</h4>
        <p style={{ fontSize: '14px', maxWidth: '420px', margin: 0, lineHeight: 1.5 }}>
          Upload a PDF or Word resume on the left, or select an existing resume from your recent list to view AI target job matches and live openings.
        </p>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteResume(resume.id);
      setShowDeleteConfirm(false);
      if (onDeleteSuccess) {
        onDeleteSuccess(resume.id);
      }
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyText = () => {
    const textToCopy = resume.extractedText || resume.extractedTextPreview || '';
    navigator.clipboard.writeText(textToCopy);
    if (onCopyToast) onCopyToast('Extracted text copied to clipboard!');
  };

  const textToDisplay = resume.extractedText || resume.extractedTextPreview || 'No text extracted.';

  const renderHighlightedText = () => {
    if (!searchTerm.trim()) return textToDisplay;

    const parts = textToDisplay.split(new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <mark key={index} style={{ background: '#fef08a', color: '#854d0e', padding: '1px 3px', borderRadius: '2px' }}>
          {part}
        </mark>
      ) : part
    );
  };

  const formattedDate = resume.uploadedAt 
    ? new Date(resume.uploadedAt).toLocaleString()
    : 'Just now';

  return (
    <div className="asana-card animate-fade-in" style={{ padding: '24px', position: 'relative', minWidth: 0, overflow: 'hidden' }}>
      {/* Header Bar & Quick Summary Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h3 className="asana-heading" style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
              📄 {resume.originalFilename || 'Uploaded Resume'}
            </h3>

            {resume.isDuplicate && (
              <span className="badge badge-emerald" title="Instant Deduplication Match">
                ⚡ Verified Resume
              </span>
            )}

            <ScanStatusBadge status={resume.scanStatus || 'COMPLETE'} />
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Uploaded: {formattedDate} • User: <strong style={{ color: 'var(--color-text)' }}>{resume.userId || 'anonymous'}</strong>
          </p>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ fontSize: '13px', padding: '6px 14px', borderRadius: 'var(--radius-md)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      </div>


      {/* Modern Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        background: 'var(--color-background-subtle)',
        padding: '4px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('matches')}
          style={{
            flex: '1 1 0px',
            minWidth: 0,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'matches' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'matches' ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'matches' ? 600 : 400,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeTab === 'matches' ? 'var(--shadow-card)' : 'none',
            transition: 'all var(--motion-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          🎯 Target Jobs & AI Matches
        </button>

        <button
          onClick={() => setActiveTab('text')}
          style={{
            flex: '1 1 0px',
            minWidth: 0,
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: activeTab === 'text' ? 'var(--color-surface)' : 'transparent',
            color: activeTab === 'text' ? 'var(--color-text)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'text' ? 600 : 400,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: activeTab === 'text' ? 'var(--shadow-card)' : 'none',
            transition: 'all var(--motion-fast)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            whiteSpace: 'nowrap'
          }}
        >
          📝 Parsed Resume Text
        </button>
      </div>

      {/* TAB 1: TARGET JOBS & AI MATCHES */}
      {activeTab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <SuggestedRolesView scanId={resume.scanId} resumeId={resume.id} scanStatus={resume.scanStatus} />
          <JobListingsView scanId={resume.scanId} resumeId={resume.id} scanStatus={resume.scanStatus} />
        </div>
      )}

      {/* TAB 2: EXTRACTED TEXT PREVIEW */}
      {activeTab === 'text' && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          color: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Parsed Resume Plaintext ({textToDisplay.length.toLocaleString()} chars)
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: 'var(--radius-sm)',
                  color: '#f8fafc',
                  padding: '5px 12px',
                  fontSize: '13px',
                  width: '200px'
                }}
              />

              <button className="btn btn-secondary" onClick={handleCopyText} style={{ fontSize: '12px', padding: '5px 12px', background: '#334155', borderColor: '#475569', color: '#ffffff' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
            </div>
          </div>

          <div style={{
            maxHeight: showFullText ? '600px' : '320px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#cbd5e1',
            background: '#020617',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid #1e293b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            transition: 'max-height var(--motion-base)'
          }}>
            {renderHighlightedText()}
          </div>

          {textToDisplay.length > 300 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                onClick={() => setShowFullText(!showFullText)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {showFullText ? 'Collapse Text View ▲' : 'Expand Full Text View ▼'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div className="asana-card animate-fade-in" style={{ maxWidth: '440px', width: '90%', padding: '24px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 8px 0', color: 'var(--status-rose-text)' }}>
              Delete Resume Permanently?
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
              This will remove the file from physical disk and erase the DB record and scan history for resume ID <code>{resume.id}</code> (GDPR right to erasure compliance).
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
