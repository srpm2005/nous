import React from 'react';

/**
 * Clean, modern, executive-grade Navbar.
 * Stripped of clutter, focused 100% on live AI analysis and new scan action.
 */
export default function Navbar({ activeTab = 'scanner', setActiveTab, onNewScan }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '16px',
        marginBottom: '24px',
        position: 'sticky',
        top: '12px',
        zIndex: 100,
        boxShadow: '0 4px 20px -4px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Left Brand Logo */}
      <div
        onClick={() => {
          if (onNewScan) onNewScan();
          if (setActiveTab) setActiveTab('scanner');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '15px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
          }}
        >
          ✓
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Nous
          </span>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, letterSpacing: '0.01em' }}>
            Live Career Intelligence
          </span>
        </div>
      </div>

      {/* Right: Live AI Indicator & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          onClick={() => setActiveTab && setActiveTab(activeTab === 'crawls' ? 'scanner' : 'crawls')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: activeTab === 'crawls' ? '#dcfce7' : '#f0fdf4',
            border: activeTab === 'crawls' ? '1px solid #86efac' : '1px solid #bbf7d0',
            color: '#15803d',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out'
          }}
        >
          <span style={{ fontSize: '9px', color: '#16a34a' }}>●</span>
          19 Verified Enterprise Portals Live
        </div>

        <button
          onClick={() => {
            if (onNewScan) onNewScan();
            if (setActiveTab) setActiveTab('scanner');
          }}
          style={{
            padding: '7px 16px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '13px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 150ms ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.25)';
          }}
        >
          <span>➕</span> New Scan
        </button>
      </div>
    </header>
  );
}
