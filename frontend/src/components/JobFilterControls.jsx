import React from 'react';

/**
 * Filter controls component for searching live job listings by keyword, location, and role.
 * Formatted with modern sleek SaaS design system tokens.
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
    { id: 'ALL', label: 'All Top 500 Enterprise Portals', color: '#2563eb', icon: <span style={{ fontSize: '14px' }}>🏛️</span> },
    ...(companies && companies.length > 0
      ? companies.map((c) => ({ id: c.toUpperCase(), label: c, color: '#2563eb', icon: <span style={{ fontSize: '14px' }}>🏢</span> }))
      : [
          { id: 'MICROSOFT', label: 'Microsoft', color: '#00a4ef', icon: <span style={{ fontSize: '14px' }}>🪟</span> },
          { id: 'AMAZON', label: 'Amazon', color: '#ff9900', icon: <span style={{ fontSize: '14px' }}>📦</span> },
          { id: 'GOOGLE', label: 'Google', color: '#ea4335', icon: <span style={{ fontSize: '14px' }}>🔍</span> },
          { id: 'META', label: 'Meta', color: '#0668e1', icon: <span style={{ fontSize: '14px' }}>♾️</span> },
          { id: 'APPLE', label: 'Apple', color: '#475569', icon: <span style={{ fontSize: '14px' }}>🍎</span> },
          { id: 'NETFLIX', label: 'Netflix', color: '#e50914', icon: <span style={{ fontSize: '14px' }}>🎬</span> },
          { id: 'ADOBE', label: 'Adobe', color: '#fa0f00', icon: <span style={{ fontSize: '14px' }}>🎨</span> },
          { id: 'STRIPE', label: 'Stripe', color: '#635bfc', icon: <span style={{ fontSize: '14px' }}>💳</span> },
          { id: 'FIGMA', label: 'Figma', color: '#f24e1e', icon: <span style={{ fontSize: '14px' }}>❖</span> },
          { id: 'TCS', label: 'TCS', color: '#0284c7', icon: <span style={{ fontSize: '14px' }}>🏢</span> },
          { id: 'INFOSYS', label: 'Infosys', color: '#007cc3', icon: <span style={{ fontSize: '14px' }}>💻</span> },
          { id: 'ACCENTURE', label: 'Accenture', color: '#a100ff', icon: <span style={{ fontSize: '14px' }}>⚡</span> }
        ])
  ];

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        transition: 'box-shadow 200ms ease'
      }}
    >
      {/* Upper Line: Platform Search Selector Tabs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Job Search Platform & Company Portals
          </span>
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
            {platforms.length - 1} connected portals
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {platforms.map((p) => {
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformSelect && onPlatformSelect(p.id)}
                style={{
                  padding: '7px 15px',
                  borderRadius: '10px',
                  border: isSelected ? `1.5px solid ${p.color}` : '1px solid #e2e8f0',
                  background: isSelected ? p.color : '#f8fafc',
                  color: isSelected ? '#ffffff' : '#334155',
                  fontSize: '12.5px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 180ms ease-in-out',
                  boxShadow: isSelected ? `0 4px 12px ${p.color}33` : '0 1px 2px rgba(0,0,0,0.02)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  transform: isSelected ? 'translateY(-1px)' : 'none'
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
        <div style={{ flex: '1 1 220px', minWidth: '190px', position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Search title, role or company..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#0f172a',
              padding: '10px 14px',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'all 180ms ease-in-out',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
            }}
          />
        </div>

        {/* Location Filter Input */}
        <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
          <input
            type="text"
            placeholder="📍 Filter by location (e.g. Remote, India)..."
            value={locationQuery}
            onChange={(e) => onLocationChange(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#0f172a',
              padding: '10px 14px',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'all 180ms ease-in-out',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
            }}
          />
        </div>

        {/* Company Dropdown Selector */}
        <div style={{ flex: '0 0 auto', minWidth: '170px' }}>
          <select
            value={selectedPlatform}
            onChange={(e) => onPlatformSelect && onPlatformSelect(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              color: '#0f172a',
              padding: '10px 14px',
              fontSize: '13.5px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 180ms ease-in-out'
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
          <div style={{ flex: '0 0 auto', minWidth: '170px' }}>
            <select
              value={selectedRoleId}
              onChange={(e) => onRoleSelect(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                color: '#0f172a',
                padding: '10px 14px',
                fontSize: '13.5px',
                outline: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 180ms ease-in-out'
              }}
            >
              <option value="ALL">All Target Roles ({roles.length})</option>
              {roles.map((r, idx) => (
                <option key={r.id || idx} value={r.id || r.roleTitle}>
                  🎯 {r.roleTitle}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Matching Count Summary & Clear Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#64748b', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          Showing <strong style={{ color: '#0f172a', fontWeight: 700 }}>{filteredCount}</strong> of <strong style={{ color: '#0f172a', fontWeight: 600 }}>{totalCount}</strong> verified postings
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
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              borderRadius: '8px',
              padding: '4px 12px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 150ms ease-in-out',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ✕ Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}

export default JobFilterControls;
