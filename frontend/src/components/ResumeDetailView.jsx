import React, { useState } from 'react';
import { deleteResume } from '../services/api';
import ScanStatusBadge from './ScanStatusBadge';
import SuggestedRolesView from './SuggestedRolesView';

export default function ResumeDetailView({ resume, onDeleteSuccess, onCopyToast }) {

  const [searchTerm, setSearchTerm] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!resume) {
    return (
      <div className="asana-card" style={{
        padding: '48px 24px',
        textAlign: 'center',
        color: 'var(--color-text-muted)'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-background-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '1px solid var(--color-border)',
          color: 'var(--color-primary)'
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <h4 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 6px 0' }}>No Active Resume Selected</h4>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Upload a new resume or select an existing scan from history to inspect extracted text and metadata.
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
    <div className="asana-card animate-fade-in" style={{ padding: '28px', position: 'relative' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h3 className="asana-heading" style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
              {resume.originalFilename || 'Uploaded Resume'}
            </h3>

            {resume.isDuplicate ? (
              <span className="badge badge-emerald" title="Deduplicated by SHA-256 hash matching">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Duplicate Matched (200 OK)
              </span>
            ) : (
              <span className="badge badge-neutral">
                Fresh Async Ingestion (202 Accepted)
              </span>
            )}

            {/* Phase 2 Pipeline Status */}
            <ScanStatusBadge status={resume.scanStatus || 'COMPLETE'} />
          </div>


          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
            Uploaded: {formattedDate} • User: <code style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{resume.userId || 'anonymous'}</code>
          </p>
        </div>

        <button
          className="btn btn-danger"
          onClick={() => setShowDeleteConfirm(true)}
          style={{ fontSize: '13px', padding: '6px 14px' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </button>
      </div>

      {/* Extracted Text Inspector */}
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: 'var(--radius-md)',
        padding: '18px',
        color: '#f8fafc',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Extracted Text Content
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search extracted text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: '#1e293b',
                border: '1px solid #475569',
                borderRadius: 'var(--radius-sm)',
                color: '#f8fafc',
                padding: '4px 10px',
                fontSize: '12px',
                width: '180px'
              }}
            />

            <button className="btn btn-secondary" onClick={handleCopyText} style={{ fontSize: '12px', padding: '4px 10px', background: '#334155', borderColor: '#475569', color: '#ffffff' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              Copy Text
            </button>
          </div>
        </div>

        <div style={{
          maxHeight: showFullText ? '500px' : '220px',
          overflowY: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          lineHeight: '1.6',
          color: '#cbd5e1',
          background: '#020617',
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid #1e293b',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          transition: 'max-height var(--motion-base)'
        }}>
          {renderHighlightedText()}
        </div>

        {textToDisplay.length > 300 && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={() => setShowFullText(!showFullText)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showFullText ? 'Collapse Text View ▲' : 'Expand Full Text View ▼'}
            </button>
          </div>
        )}
      </div>

      {/* Deduplication Notice Banner */}
      {resume.isDuplicate && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--status-emerald-bg)',
          border: '1px solid var(--status-emerald-border)',
          color: 'var(--status-emerald-text)',
          fontSize: '13px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>
            <strong>Content Deduplication Triggered:</strong> This exact resume file content (SHA-256 hash) was already parsed previously. Returned existing record instantly without redundant extraction.
          </span>
        </div>
      )}

      {/* Metadata Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        <div style={{ background: 'var(--color-background-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Resume ID (UUID)</div>
          <div style={{
            fontSize: '13px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text)',
            marginTop: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} title={resume.id}>
            {resume.id}
          </div>
        </div>

        <div style={{ background: 'var(--color-background-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Detected Format</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--color-text)' }}>
            {resume.mimeType || 'application/pdf'}
          </div>
        </div>

        <div style={{ background: 'var(--color-background-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Extracted Chars</div>
          <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '4px', color: 'var(--color-accent)' }}>
            {resume.extractedCharCount ? resume.extractedCharCount.toLocaleString() : textToDisplay.length.toLocaleString()} chars
          </div>
        </div>
      </div>

      {/* Phase 3 AI Role Intelligence Section */}
      <SuggestedRolesView scanId={resume.scanId} resumeId={resume.id} scanStatus={resume.scanStatus} />


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
              This will remove the file from physical disk and erase the DB record for resume ID <code>{resume.id}</code> (GDPR right to erasure compliance).
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
