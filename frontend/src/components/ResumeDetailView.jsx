import React, { useState } from 'react';
import { deleteResume } from '../services/api';
import ScanStatusBadge from './ScanStatusBadge';
import SuggestedRolesView from './SuggestedRolesView';
import JobListingsView from './JobListingsView';

export default function ResumeDetailView({ resume, onDeleteSuccess, onCopyToast }) {
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' | 'text'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!resume) {
    return (
      <div className="asana-card" style={{
        padding: '64px 28px',
        textAlign: 'center',
        color: '#64748b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        borderRadius: '16px',
        border: '1px dashed #cbd5e1',
        background: '#ffffff'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          border: '1px solid #bfdbfe',
          color: '#2563eb',
          boxShadow: '0 8px 16px -4px rgba(37, 99, 235, 0.15)'
        }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          No Resume Selected
        </h4>
        <p style={{ fontSize: '14px', maxWidth: '440px', margin: 0, lineHeight: 1.6, color: '#64748b' }}>
          Upload a PDF or Word resume on the left, or select an existing candidate file from your history list to view AI target job matches and live enterprise openings.
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
        <mark key={index} style={{ background: '#fef08a', color: '#854d0e', padding: '2px 4px', borderRadius: '4px', fontWeight: 600 }}>
          {part}
        </mark>
      ) : part
    );
  };

  const formattedDate = resume.uploadedAt 
    ? new Date(resume.uploadedAt).toLocaleString()
    : 'Just now';

  return (
    <div className="asana-card animate-fade-in" style={{
      padding: '28px',
      position: 'relative',
      minWidth: 0,
      overflow: 'hidden',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 4px 24px -4px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header Bar & Quick Summary Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📄</span>
              <span>{resume.originalFilename || 'Uploaded Resume'}</span>
            </h3>

            {resume.isDuplicate && (
              <span className="badge badge-emerald" style={{ padding: '4px 10px', fontSize: '11.5px', fontWeight: 700, borderRadius: '9999px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                ⚡ Instant Verified Match
              </span>
            )}

            <ScanStatusBadge status={resume.scanStatus || 'COMPLETE'} />
          </div>

          <p style={{ fontSize: '13px', color: '#64748b', margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>Uploaded: <strong style={{ color: '#334155' }}>{formattedDate}</strong></span>
            <span>•</span>
            <span>User ID: <strong style={{ color: '#334155' }}>{resume.userId || 'anonymous'}</strong></span>
          </p>
        </div>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            fontSize: '13px',
            padding: '8px 16px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 150ms ease-in-out'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete Resume
        </button>
      </div>


      {/* Modern Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        background: '#f1f5f9',
        padding: '5px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => setActiveTab('matches')}
          style={{
            flex: '1 1 0px',
            minWidth: 0,
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'matches' ? '#ffffff' : 'transparent',
            color: activeTab === 'matches' ? '#0f172a' : '#64748b',
            fontWeight: activeTab === 'matches' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'matches' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 180ms ease-in-out',
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
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'text' ? '#ffffff' : 'transparent',
            color: activeTab === 'text' ? '#0f172a' : '#64748b',
            fontWeight: activeTab === 'text' ? 700 : 500,
            fontSize: '13.5px',
            cursor: 'pointer',
            boxShadow: activeTab === 'text' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 180ms ease-in-out',
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
