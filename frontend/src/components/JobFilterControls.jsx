import React from 'react';

/**
 * Filter controls component for searching live job listings by keyword, location, and role.
 * Formatted with Asana clean light theme design system tokens.
 */
export function JobFilterControls({
  searchQuery,
  onSearchChange,
  locationQuery,
  onLocationChange,
  selectedRoleId,
  onRoleSelect,
  roles = [],
  totalCount,
  filteredCount
}) {
  return (
    <div
      style={{
        background: 'var(--color-background-subtle)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Keyword Input */}
        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
          <input
            type="text"
            placeholder="🔍 Filter by title or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Location Filter Input */}
        <div style={{ flex: '1 1 160px', minWidth: '150px' }}>
          <input
            type="text"
            placeholder="📍 Filter by location..."
            value={locationQuery}
            onChange={(e) => onLocationChange(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text)',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>

        {/* Role Selector Dropdown */}
        {roles && roles.length > 0 && (
          <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
            <select
              value={selectedRoleId}
              onChange={(e) => onRoleSelect(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                padding: '8px 12px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="ALL">All Target Roles ({roles.length})</option>
              {roles.map((r, idx) => (
                <option key={r.id || idx} value={r.id || r.roleTitle}>
                  {r.roleTitle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Matching Count Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <span>
          Showing <strong style={{ color: 'var(--color-text)' }}>{filteredCount}</strong> of <strong>{totalCount}</strong> verified job matches
        </span>
        {(searchQuery || locationQuery || selectedRoleId !== 'ALL') && (
          <button
            onClick={() => {
              onSearchChange('');
              onLocationChange('');
              onRoleSelect('ALL');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text)',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default JobFilterControls;
