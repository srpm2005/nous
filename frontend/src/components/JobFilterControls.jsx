import React from 'react';

/**
 * Interactive filter controls header for searching live job listings by keyword, location, and role.
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
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(51, 65, 85, 0.6)',
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
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-sm)',
              color: '#f8fafc',
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
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-sm)',
              color: '#f8fafc',
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
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: 'var(--radius-sm)',
                color: '#f8fafc',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
        <span>
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> verified job matches
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
              color: '#6366f1',
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
