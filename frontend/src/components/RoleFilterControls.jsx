import React from 'react';

/**
 * Filter controls component for filtering AI suggested job roles
 * by search query (title or skill) and minimum match score.
 */
export function RoleFilterControls({
  searchQuery,
  onSearchChange,
  minScore,
  onMinScoreChange,
  totalCount,
  filteredCount
}) {
  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      background: 'rgba(30, 41, 59, 0.4)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      marginBottom: '16px'
    }}>
      {/* Keyword Search Input */}
      <div style={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>🔍</span>
        <input
          type="text"
          placeholder="Filter by role title or skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Minimum Score Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          Min Match: {minScore}%
        </span>
        <input
          type="range"
          min="0"
          max="95"
          step="5"
          value={minScore}
          onChange={(e) => onMinScoreChange(Number(e.target.value))}
          style={{
            width: '110px',
            accentColor: 'var(--color-accent)'
          }}
        />
      </div>

      {/* Results Count Badge */}
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        Showing <strong style={{ color: '#ffffff' }}>{filteredCount}</strong> of {totalCount} roles
      </div>
    </div>
  );
}

export default RoleFilterControls;
