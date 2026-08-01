import React from 'react';

/**
 * Renders a visual status pill for Phase 2 async scan states:
 * PENDING, PROCESSING, COMPLETE, PARTIAL, FAILED.
 */
export default function ScanStatusBadge({ status = 'PENDING' }) {
  const statusConfig = {
    PENDING: {
      label: 'PENDING',
      bgClass: 'badge-amber',
      icon: '⏳'
    },
    PROCESSING: {
      label: 'PROCESSING',
      bgClass: 'badge-purple',
      icon: '⚙️'
    },
    COMPLETE: {
      label: 'COMPLETE',
      bgClass: 'badge-emerald',
      icon: '✅'
    },
    PARTIAL: {
      label: 'PARTIAL',
      bgClass: 'badge-amber',
      icon: '⚠️'
    },
    FAILED: {
      label: 'FAILED',
      bgClass: 'badge-rose',
      icon: '❌'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <span className={`badge ${config.bgClass}`} style={{ gap: '6px' }}>
      <span>{config.icon}</span>
      <span style={{ fontWeight: 600 }}>{config.label}</span>
    </span>
  );
}
