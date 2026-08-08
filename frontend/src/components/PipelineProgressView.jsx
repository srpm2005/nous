import React from 'react';
import ScanStatusBadge from './ScanStatusBadge';
import { useScanStatus } from '../hooks/useScanStatus';

/**
 * PipelineProgressView - Real-time visual progress card for Phase 2 Async Scan Engine.
 * Consumes useScanStatus hook to poll backend status every 1.5s until terminal state.
 */
export default function PipelineProgressView({ scanId, onComplete }) {
  const { scanState, loading, error } = useScanStatus(scanId, 1500, onComplete);

  if (!scanId) return null;

  const currentStatus = scanState?.status || 'PENDING';

  return (
    <div className="asana-card animate-fade-in" style={{
      padding: '20px',
      marginBottom: '20px',
      borderLeft: '4px solid var(--color-accent)',
      background: 'var(--color-surface)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2.2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          Async Resume Processing Pipeline
        </h4>
        <ScanStatusBadge status={currentStatus} />
      </div>

      {/* Progress Steps Visualizer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Step 1: Ingestion & Validation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--status-emerald-bg)', color: 'var(--status-emerald-text)',
            border: '1px solid var(--status-emerald-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>✓</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
              Step 1: Upload & Security Validation
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              HTTP 202 Accepted • SHA-256 Deduplication & MIME verification
            </span>
          </div>
        </div>

        {/* Step 2: Asynchronous Worker Processing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: (currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-bg)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-bg)' 
                : 'var(--color-background-subtle)',
            color: (currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-text)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-text)' 
                : 'var(--color-text-muted)',
            border: `1px solid ${(currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-border)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-border)' 
                : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>
            {(currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') ? '✓' : currentStatus === 'PROCESSING' ? '⚙' : '2'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: currentStatus === 'PROCESSING' ? 'var(--color-primary)' : 'var(--color-text)' }}>
              Step 2: Text Extraction & Background Worker
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {currentStatus === 'PENDING' && 'Queued in ThreadPoolTaskExecutor (scanTaskExecutor)...'}
              {currentStatus === 'PROCESSING' && 'Extracting raw text (PDFBox/POI) & calculating metrics...'}
              {(currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') && 'Text parsing finished cleanly.'}
              {currentStatus === 'FAILED' && 'Task failed during execution.'}
            </span>
          </div>
        </div>

        {/* Step 3: AI Target Role Intelligence */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: (currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-bg)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-bg)' 
                : 'var(--color-background-subtle)',
            color: (currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-text)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-text)' 
                : 'var(--color-text-muted)',
            border: `1px solid ${(currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') 
              ? 'var(--status-emerald-border)' 
              : currentStatus === 'PROCESSING' 
                ? 'var(--status-purple-border)' 
                : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>
            {(currentStatus === 'COMPLETE' || currentStatus === 'PARTIAL') ? '✓' : '3'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>
              Step 3: AI Target Role Intelligence (LLM)
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Inferring candidate target roles & key skills via LLM schema model
            </span>
          </div>
        </div>

        {/* Step 4: Phase 4 Live Job Search Engine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: currentStatus === 'COMPLETE' 
              ? 'var(--status-emerald-bg)' 
              : currentStatus === 'FAILED' 
                ? 'var(--status-rose-bg)' 
                : 'var(--color-background-subtle)',
            color: currentStatus === 'COMPLETE' 
              ? 'var(--status-emerald-text)' 
              : currentStatus === 'FAILED' 
                ? 'var(--status-rose-text)' 
                : 'var(--color-text-muted)',
            border: `1px solid ${currentStatus === 'COMPLETE' 
              ? 'var(--status-emerald-border)' 
              : currentStatus === 'FAILED' 
                ? 'var(--status-rose-border)' 
                : 'var(--color-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>
            {currentStatus === 'COMPLETE' ? '✓' : currentStatus === 'FAILED' ? '✕' : '4'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: currentStatus === 'COMPLETE' ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
              Step 4: External Job Search Engine (Phase 4)
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {currentStatus === 'COMPLETE' && 'Live job listings fetched and persisted to PostgreSQL.'}
              {currentStatus === 'FAILED' && 'Pipeline failed during job search execution.'}
              {(currentStatus === 'PENDING' || currentStatus === 'PROCESSING') && 'Querying job APIs (Adzuna/Job Engine)...'}
            </span>
          </div>
        </div>
      </div>

      {/* Error alert banner */}
      {currentStatus === 'FAILED' && scanState?.errorReason && (
        <div style={{
          marginTop: '14px', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: 'var(--status-rose-bg)', border: '1px solid var(--status-rose-border)',
          color: 'var(--status-rose-text)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>⚠️</span>
          <span><strong>Pipeline Execution Error:</strong> {scanState.errorReason}</span>
        </div>
      )}
    </div>
  );
}
