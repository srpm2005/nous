import React, { useState } from 'react';

/**
 * Polished Filter Controls for AI Target Job Roles.
 * Features:
 * - Clean glassmorphism search bar with active focus glow
 * - Range slider with live percentage indicator
 * - Results count counter
 */
export function RoleFilterControls({
  searchQuery,
  onSearchChange,
  minScore,
  onMinScoreChange,
  totalCount,
  filteredCount
}) {
  const [isInputFocused, setIsInputFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.8)'
      }}
    >
      {/* Keyword Search Input */}
      <div
        style={{
          flex: '1 1 240px',
          minWidth: '200px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#ffffff',
          border: isInputFocused ? '1px solid #3b82f6' : '1px solid #cbd5e1',
          boxShadow: isInputFocused ? '0 0 0 3px rgba(59, 130, 246, 0.15)' : '0 1px 2px rgba(0,0,0,0.03)',
          borderRadius: '10px',
          padding: '8px 14px',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1 }}>🔍</span>
        <input
          type="text"
          placeholder="Filter by role title or skill..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setIsInputFocused(false)}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            color: '#0f172a',
            fontSize: '13.5px',
            outline: 'none',
            fontWeight: 500
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              padding: '0 4px'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Right controls group: Slider + Results Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {/* Minimum Score Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
            Min Match: <strong style={{ color: '#0f172a', fontWeight: 700 }}>{minScore}%</strong>
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={minScore}
            onChange={(e) => onMinScoreChange(Number(e.target.value))}
            style={{
              width: '100px',
              accentColor: '#3b82f6',
              cursor: 'pointer',
              height: '5px'
            }}
          />
        </div>

        {/* Results Count Badge */}
        <div
          style={{
            fontSize: '12.5px',
            color: '#64748b',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            padding: '4px 12px',
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}
        >
          Showing <strong style={{ color: '#0f172a', fontWeight: 700 }}>{filteredCount}</strong> of <strong style={{ color: '#0f172a', fontWeight: 700 }}>{totalCount}</strong> roles
        </div>
      </div>
    </div>
  );
}

export default RoleFilterControls;
