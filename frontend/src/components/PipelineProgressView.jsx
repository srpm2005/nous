import React from 'react';
import ScanStatusBadge from './ScanStatusBadge';
import { useScanStatus } from '../hooks/useScanStatus';

/**
 * PipelineProgressView - Real-time visual progress card for Phase 2 Async Scan Engine.
 * Shows step-by-step progress while processing, and collapses cleanly when complete.
 */
export default function PipelineProgressView({ scanId, onComplete }) {
  const { scanState, loading, error } = useScanStatus(scanId, 1500, onComplete);

  if (!scanId) return null;

  const currentStatus = scanState?.status || 'PENDING';

  // When complete, render a clean compact status banner instead of a huge list of step checkmarks
  if (currentStatus === 'COMPLETE') {
    return (
      <div className="asana-card animate-fade-in" style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--status-emerald-bg)',
        border: '1px solid var(--status-emerald-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--status-emerald-text)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>✓</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-emerald-text)' }}>
              Resume Analysis Completed Successfully
            </div>
            <div style={{ fontSize: '12px', color: '#047857' }}>
              Extracted text, AI target roles & live job matches ready
            </div>
          </div>
        </div>

        <ScanStatusBadge status="COMPLETE" />
      </div>
    );
  }

  // When partial, render an amber warning/info banner
  if (currentStatus === 'PARTIAL') {
    return (
      <div className="asana-card animate-fade-in" style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--status-amber-bg)',
        border: '1px solid var(--status-amber-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            background: 'var(--status-amber-text)', color: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700
          }}>!</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-amber-text)' }}>
              Pipeline Completed with Partial Results
            </div>
            <div style={{ fontSize: '12px', color: '#b45309' }}>
              {scanState?.errorReason || 'AI target roles identified; external job APIs returned partial listings.'}
            </div>
          </div>
        </div>

        <ScanStatusBadge status="PARTIAL" />
      </div>
    );
  }

  // When failed, render a rose error card
  if (currentStatus === 'FAILED') {
    return (
      <div className="asana-card animate-fade-in" style={{
        padding: '18px',
        borderRadius: 'var(--radius-md)',
        background: 'var(--status-rose-bg)',
        border: '1px solid var(--status-rose-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: 'var(--status-rose-text)', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 700
            }}>✕</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--status-rose-text)' }}>
                Async Pipeline Execution Failed
              </div>
              <div style={{ fontSize: '12px', color: '#991b1b' }}>
                {scanState?.errorReason || 'Pipeline encountered an unexpected processing error.'}
              </div>
            </div>
          </div>

          <ScanStatusBadge status="FAILED" />
        </div>
      </div>
    );
  }

  const percent = currentStatus === 'PROCESSING' ? 65 : 25;

  return (
    <div
      className="animate-fade-in"
      style={{
        padding: '36px 24px',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        maxWidth: '520px',
        margin: '0 auto 24px auto'
      }}
    >
      {/* Circular Progress Wheel */}
      <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 20px auto' }}>
        <svg width="84" height="84" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="#e2e8f0" strokeWidth="8" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="42"
            stroke="#2563eb"
            strokeWidth="8"
            fill="none"
            strokeDasharray="264"
            strokeDashoffset={264 - (264 * percent) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 400ms ease-in-out' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px',
            color: '#0f172a'
          }}
        >
          {percent}%
        </div>
      </div>

      <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
        Reading your resume...
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 28px 0' }}>
        usually takes less than 30 seconds
      </p>

      {/* Checklist Stepper */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
          maxWidth: '380px',
          margin: '0 auto 24px auto',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> Confirmed your file is safe to process
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#2563eb', fontWeight: 600 }}>
          <span className="spinner" style={{ width: '14px', height: '14px', border: '2px solid #bfdbfe', borderTopColor: '#2563eb', borderRadius: '50%', display: 'inline-block' }}></span>
          Reading your experience <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>· Almost there</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }}></span>
          Finding roles you're a great fit for
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#94a3b8' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid #cbd5e1', display: 'inline-block' }}></span>
          Searching for open jobs
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
        Feel free to leave this page — we'll save your results for when you're back.
      </p>
    </div>
  );
}

