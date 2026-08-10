import React from 'react';

export default function Navbar({ activeTab = 'scanner', setActiveTab }) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 32px',
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        marginBottom: '32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Left Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: '#2563eb',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          ✓
        </div>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Nous
        </span>
      </div>

      {/* Center Nav Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={() => setActiveTab && setActiveTab('scanner')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'scanner' ? '#eff6ff' : 'transparent',
            color: activeTab === 'scanner' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'scanner' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out'
          }}
        >
          Upload
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('history')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'history' ? '#eff6ff' : 'transparent',
            color: activeTab === 'history' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'history' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out'
          }}
        >
          My scans
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('crawls')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'crawls' ? '#eff6ff' : 'transparent',
            color: activeTab === 'crawls' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'crawls' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out'
          }}
        >
          🏛️ Top 500 Crawls
        </button>

        <button
          onClick={() => setActiveTab && setActiveTab('settings')}
          style={{
            padding: '7px 18px',
            borderRadius: '9999px',
            border: 'none',
            background: activeTab === 'settings' ? '#eff6ff' : 'transparent',
            color: activeTab === 'settings' ? '#2563eb' : '#64748b',
            fontWeight: activeTab === 'settings' ? 600 : 500,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 150ms ease-in-out'
          }}
        >
          ⚙️ Settings
        </button>

      </div>

      {/* Right User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#dbeafe',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          A
        </div>
      </div>
    </header>
  );
}



