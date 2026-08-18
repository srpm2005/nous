import React, { useState } from 'react';
import { deleteResume } from '../services/api';
import ScanStatusBadge from './ScanStatusBadge';
import SuggestedRolesView from './SuggestedRolesView';
import JobListingsView from './JobListingsView';

export default function ResumeDetailView({ resume, onDeleteSuccess, onCopyToast, onUploadNew }) {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'text'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!resume) {
    return null;
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
        <mark key={index} style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px', borderRadius: '4px', fontWeight: 600 }}>
          {part}
        </mark>
      ) : part
    );
  };

  const formattedDate = resume.uploadedAt 
    ? new Date(resume.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Just now';

  return (
    <div style={{ width: '100%' }}>
      {/* Sleek Top Candidate Bar: File Info + Center Segmented Tabs + Right Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        padding: '12px 20px',
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)'
      }}>
        {/* Left: File Badge & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            📄
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.01em' }}>
                {resume.originalFilename || 'Uploaded Resume'}
              </h3>
              <ScanStatusBadge status={resume.scanStatus || 'COMPLETE'} />
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>
              Uploaded {formattedDate} · ID: {resume.id?.substring(0, 8)}
            </div>
          </div>
        </div>

        {/* Center: Segmented Tabs */}
        <div style={{
          display: 'flex',
          gap: '3px',
          background: '#f1f5f9',
          padding: '3px',
          borderRadius: '9px',
          border: '1px solid #e2e8f0'
        }}>
          <button
            onClick={() => setActiveTab('matches')}
            style={{
              padding: '6px 16px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'matches' ? '#ffffff' : 'transparent',
              color: activeTab === 'matches' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'matches' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'matches' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease'
            }}
          >
            🎯 Roles & Enterprise Openings
          </button>
          <button
            onClick={() => setActiveTab('text')}
            style={{
              padding: '6px 16px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'text' ? '#ffffff' : 'transparent',
              color: activeTab === 'text' ? '#0f172a' : '#64748b',
              fontWeight: activeTab === 'text' ? 700 : 500,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: activeTab === 'text' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 150ms ease'
            }}
          >
            📝 Extracted Resume Text
          </button>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onUploadNew && (
            <button
              onClick={onUploadNew}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.color = '#334155';
              }}
            >
              ➕ Upload Different
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* TAB 1: TARGET JOBS & AI MATCHES */}
      {activeTab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SuggestedRolesView scanId={resume.scanId} resumeId={resume.id} scanStatus={resume.scanStatus} />
          <JobListingsView scanId={resume.scanId} resumeId={resume.id} scanStatus={resume.scanStatus} />
        </div>
      )}

      {/* TAB 2: EXTRACTED TEXT PREVIEW */}
      {activeTab === 'text' && (
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '14px',
          padding: '24px',
          color: '#f8fafc',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#f8fafc' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              Parsed Resume Plaintext ({textToDisplay.length.toLocaleString()} characters)
            </h4>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Search inside text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  padding: '6px 14px',
                  fontSize: '13px',
                  outline: 'none',
                  width: '210px'
                }}
              />

              <button
                onClick={handleCopyText}
                style={{
                  fontSize: '12.5px',
                  padding: '6px 14px',
                  background: '#334155',
                  border: '1px solid #475569',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Text
              </button>
            </div>
          </div>

          <div style={{
            maxHeight: showFullText ? '650px' : '340px',
            overflowY: 'auto',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '13px',
            lineHeight: '1.65',
            color: '#cbd5e1',
            background: '#020617',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #1e293b',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            transition: 'max-height 250ms ease-in-out'
          }}>
            {renderHighlightedText()}
          </div>

          {textToDisplay.length > 300 && (
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                onClick={() => setShowFullText(!showFullText)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '4px 12px'
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="asana-card animate-fade-in" style={{ maxWidth: '460px', width: '90%', padding: '28px', borderRadius: '18px', border: '1px solid #fecaca', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h4 style={{ fontSize: '19px', fontWeight: 800, margin: '0 0 10px 0', color: '#dc2626' }}>
              Delete Resume Permanently?
            </h4>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px', lineHeight: 1.5 }}>
              This will remove the file from storage and erase all matching job data and scan history for resume ID <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#0f172a' }}>{resume.id}</code>.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  padding: '8px 20px',
                  borderRadius: '10px',
                  background: '#dc2626',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  cursor: isDeleting ? 'wait' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
