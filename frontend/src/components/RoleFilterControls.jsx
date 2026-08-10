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
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 18px',
      background: 'var(--color-background-subtle)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--color-border)',
      marginBottom: '20px'
    }}>
      {/* Keyword Search Input */}
      <div style={{ flex: '1 1 200px', minWidth: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>🔍</span>
        <input
          type="text"
          placeholder="Filter by role title or skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            color: 'var(--color-text)',
            fontSize: '13px',
            outline: 'none'
          }}
        />
      </div>

      {/* Right controls group: Slider + Results Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Minimum Score Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Min Match: <strong>{minScore}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            style={{
              width: '90px',
              accentColor: 'var(--color-accent)',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Results Count Badge */}
        <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          Showing <strong style={{ color: 'var(--color-text)' }}>{filteredCount}</strong> of <strong>{totalCount}</strong> roles
        </div>
      </div>
    </div>
  );
}

export default RoleFilterControls;
