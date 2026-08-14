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
  selectedPlatform = 'ALL',
  onPlatformSelect,
  roles = [],
  companies = [],
  totalCount,
  filteredCount
}) {
  const platforms = [
    { id: 'ALL', label: 'All Top 500 Enterprise Portals', color: '#2563eb', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🏛️</span> },
    ...(companies && companies.length > 0
      ? companies.map((c) => ({ id: c.toUpperCase(), label: c, color: '#2563eb', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🏢</span> }))
      : [
          { id: 'MICROSOFT', label: 'Microsoft', color: '#00a4ef', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🪟</span> },
          { id: 'AMAZON', label: 'Amazon', color: '#ff9900', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>📦</span> },
          { id: 'GOOGLE', label: 'Google', color: '#ea4335', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🔍</span> },
          { id: 'META', label: 'Meta', color: '#0668e1', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>♾️</span> },
          { id: 'APPLE', label: 'Apple', color: '#64748b', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🍎</span> },
          { id: 'NETFLIX', label: 'Netflix', color: '#e50914', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🎬</span> },
          { id: 'ADOBE', label: 'Adobe', color: '#fa0f00', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🎨</span> },
          { id: 'STRIPE', label: 'Stripe', color: '#635bfc', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>💳</span> },
          { id: 'FIGMA', label: 'Figma', color: '#f24e1e', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>❖</span> },
          { id: 'TCS', label: 'TCS', color: '#0284c7', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>🏢</span> },
          { id: 'INFOSYS', label: 'Infosys', color: '#007cc3', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>💻</span> },
          { id: 'ACCENTURE', label: 'Accenture', color: '#a100ff', icon: <span style={{ fontSize: '13px', fontWeight: 800 }}>⚡</span> }
        ])
  ];

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
        gap: '14px'
      }}
    >
      {/* Upper Line: Platform Search Selector Tabs */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Select Job Search Platform:
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {platforms.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformSelect && onPlatformSelect(p.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: isSelected ? `1px solid ${p.color}` : '1px solid var(--color-border)',
                  background: isSelected ? p.color : 'var(--color-surface)',
                  color: isSelected ? '#ffffff' : 'var(--color-text)',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all var(--motion-fast)',
                  boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {p.icon}
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Keyword Input */}
        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
          <input
            type="text"
            placeholder="🔍 Search title or company..."
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

        {/* Company Dropdown Selector */}
        <div style={{ flex: '0 0 auto', minWidth: '160px' }}>
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformSelect && onPlatformSelect(e.target.value)}
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
            <option value="ALL">All Companies ({companies.length > 0 ? companies.length : 'Top 500'})</option>
            {(companies && companies.length > 0 ? companies : ['Microsoft', 'Amazon', 'Google', 'Meta', 'Apple', 'Netflix', 'Adobe', 'Stripe', 'Figma', 'TCS', 'Infosys', 'Accenture']).map((c, idx) => (
              <option key={idx} value={c.toUpperCase()}>
                🏢 {c}
              </option>
            ))}
          </select>
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
        {(searchQuery || locationQuery || selectedRoleId !== 'ALL' || selectedPlatform !== 'ALL') && (
          <button
            onClick={() => {
              onSearchChange('');
              onLocationChange('');
              onRoleSelect('ALL');
              if (onPlatformSelect) onPlatformSelect('ALL');
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
