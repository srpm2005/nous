import React, { useState, useRef } from 'react';
import { uploadResume } from '../services/api';

export default function UploadZone({ onUploadSuccess, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [userId, setUserId] = useState('anonymous');
  const [uploadState, setUploadState] = useState({
    status: 'idle', // 'idle' | 'uploading' | 'success' | 'error'
    step: '',
    progress: 0,
    errorMessage: null
  });

  const fileInputRef = useRef(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const validateFile = (file) => {
    if (!file) return 'No file selected.';

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      return `Invalid file extension .${ext}. Only PDF (.pdf) and Word (.docx) files are supported.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `File size (${sizeMB} MB) exceeds the maximum allowed limit of 5 MB.`;
    }

    return null;
  };

  const handleFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      setUploadState({
        status: 'error',
        step: '',
        progress: 0,
        errorMessage: error
      });
      if (onError) onError(error);
      return;
    }

    setUploadState({
      status: 'uploading',
      step: 'Validating file integrity...',
      progress: 30,
      errorMessage: null
    });

    try {
      setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Scanning for security & malware...',
          progress: 65
        } : prev);
      }, 400);

      setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Extracting text content...',
          progress: 88
        } : prev);
      }, 800);

      const data = await uploadResume(file, userId || 'anonymous');

      setUploadState({
        status: 'success',
        step: 'Extraction Complete!',
        progress: 100,
        errorMessage: null
      });


      if (onUploadSuccess) {
        onUploadSuccess(data);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setUploadState({
          status: 'idle',
          step: '',
          progress: 0,
          errorMessage: null
        });
      }, 1500);

    } catch (err) {
      setUploadState({
        status: 'error',
        step: '',
        progress: 0,
        errorMessage: err.message || 'Upload failed'
      });
      if (onError) onError(err.message);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectFile = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="asana-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 className="asana-heading" style={{ fontSize: '18px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Resume
          </h3>
          <p className="asana-body-muted" style={{ fontSize: '13px', margin: '2px 0 0 0' }}>
            Select or drag a candidate resume file below
          </p>
        </div>
      </div>


      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => uploadState.status !== 'uploading' && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-accent)' : '#cbd5e1'}`,
          borderRadius: 'var(--radius-md)',
          padding: '36px 20px',
          textAlign: 'center',
          background: isDragging ? '#f1f5f9' : 'var(--color-background-subtle)',
          cursor: uploadState.status === 'uploading' ? 'wait' : 'pointer',
          transition: 'all var(--motion-base)'
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleSelectFile}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: 'var(--color-surface)',
          color: 'var(--color-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          border: '1px solid var(--color-border)'
        }}>
          {uploadState.status === 'uploading' ? (
            <svg className="spinner" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          )}
        </div>

        <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', margin: '0 0 4px 0' }}>
          {isDragging ? 'Drop resume file here' : 'Drag & drop resume file, or click to browse'}
        </h4>

        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
          Supported Formats: <strong style={{ color: 'var(--color-text)' }}>PDF (.pdf)</strong> or <strong style={{ color: 'var(--color-text)' }}>Word (.docx)</strong> up to 5 MB
        </p>

        {uploadState.status === 'uploading' && (
          <div style={{ marginTop: '16px', maxWidth: '380px', margin: '16px auto 0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              <span>{uploadState.step}</span>
              <span>{uploadState.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                width: `${uploadState.progress}%`,
                height: '100%',
                background: 'var(--color-accent)',
                transition: 'width var(--motion-base)'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {uploadState.status === 'error' && uploadState.errorMessage && (
        <div className="animate-fade-in" style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--status-rose-bg)',
          border: '1px solid var(--status-rose-border)',
          color: 'var(--status-rose-text)',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ shrink: 0, marginTop: '2px' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong style={{ display: 'block', marginBottom: '2px' }}>Upload Failed</strong>
            {uploadState.errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
