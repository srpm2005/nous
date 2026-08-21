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

    const timers = [];

    try {
      timers.push(setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Scanning file for security & magic bytes...',
          progress: 55
        } : prev);
      }, 400));

      timers.push(setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Extracting text content...',
          progress: 75
        } : prev);
      }, 900));

      timers.push(setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Connecting to cloud server...',
          progress: 88
        } : prev);
      }, 2500));

      timers.push(setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Waking up cloud backend container (~20-30s on first request)...',
          progress: 92
        } : prev);
      }, 6000));

      timers.push(setTimeout(() => {
        setUploadState(prev => prev.status === 'uploading' ? {
          ...prev,
          step: 'Initializing server instance & AI pipelines... almost ready!',
          progress: 96
        } : prev);
      }, 15000));

      const data = await uploadResume(file, userId || 'anonymous');

      timers.forEach(clearTimeout);

      setUploadState({
        status: 'success',
        step: 'Upload Complete! Launching AI Analysis...',
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
      }, 1200);

    } catch (err) {
      timers.forEach(clearTimeout);
      setUploadState({
        status: 'error',
        step: '',
        progress: 0,
        errorMessage: err.message || 'Upload failed. Please check backend connection.'
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
    <div
      className="asana-card"
      style={{
        padding: '36px 32px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        background: '#ffffff',
        boxShadow: '0 8px 30px -4px rgba(15, 23, 42, 0.05)',
        width: '100%',
        maxWidth: '720px',
        margin: '0 auto'
      }}
    >
      {/* Drag & Drop Card Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
          background: isDragging ? '#eff6ff' : '#f8fafc',
          boxShadow: isDragging ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 200ms ease-in-out',
          cursor: 'pointer'
        }}
        onClick={() => uploadState.status !== 'uploading' && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleSelectFile}
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
        />

        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '1px solid #bfdbfe',
          boxShadow: '0 6px 16px -2px rgba(37, 99, 235, 0.15)'
        }}>
          {uploadState.status === 'uploading' ? (
            <svg className="spinner" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          )}
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Drag your resume here
        </h3>

        <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 20px 0' }}>
          or click anywhere to choose a file from your computer
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (uploadState.status !== 'uploading') fileInputRef.current?.click();
          }}
          style={{
            padding: '10px 24px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '13.5px',
            border: 'none',
            cursor: uploadState.status === 'uploading' ? 'wait' : 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            transition: 'all 180ms ease-in-out'
          }}
        >
          {uploadState.status === 'uploading' ? 'Uploading...' : 'Choose File'}
        </button>

        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 0 0', fontWeight: 500 }}>
          Supports PDF (.pdf) and Word (.docx) formats, up to 5MB
        </p>

        {uploadState.status === 'uploading' && (
          <div style={{ marginTop: '20px', maxWidth: '380px', margin: '20px auto 0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '6px', fontWeight: 600 }}>
              <span>{uploadState.step}</span>
              <span>{uploadState.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${uploadState.progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                transition: 'width 250ms ease-in-out'
              }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Badges */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        marginTop: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Private & Secure Extraction
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Sub-second Resume Parsing
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', fontWeight: 600 }}>
          <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span> Instant Data Erasure Control
        </div>
      </div>

      {/* Error Banner */}
      {uploadState.status === 'error' && uploadState.errorMessage && (
        <div className="animate-fade-in" style={{
          marginTop: '24px',
          padding: '14px 18px',
          borderRadius: '14px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          fontSize: '14px',
          fontWeight: 500,
          maxWidth: '640px',
          margin: '24px auto 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>⚠️</span>
          <span>{uploadState.errorMessage}</span>
        </div>
      )}
    </div>
  );
}
