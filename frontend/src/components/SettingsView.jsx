import React, { useState } from 'react';

/**
 * SettingsView Component - Preferences and system configuration dashboard.
 */
export default function SettingsView({ onShowToast }) {
  const [provider, setProvider] = useState('top500');
  const [llmMode, setLlmMode] = useState('auto');
  const [cronEnabled, setCronEnabled] = useState(true);
  const [defaultLocation, setDefaultLocation] = useState('Remote');
  const [userId, setUserId] = useState('anonymous');
  const [apiKey, setApiKey] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    if (onShowToast) {
      onShowToast('⚙️ Preferences and API settings saved successfully!');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all local scan history and cached resume previews?')) {
      localStorage.clear();
      if (onShowToast) {
        onShowToast('🗑️ Local cache & history cleared.');
      }
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }} className="animate-fade-in">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
          System Settings & Preferences
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Manage AI role matching providers, enterprise crawl schedule & privacy controls
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 1. Job Search Engine Strategy */}
        <div className="asana-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💼 Job Search Provider Strategy
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
            Select the primary external API or crawler strategy used during resume scan execution
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              { id: 'top500', name: 'Top 500 Enterprise Portals', desc: 'Verified openings scraped directly from top enterprise hiring portals' }
            ].map((item) => (
              <label
                key={item.id}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: provider === item.id ? '#2563eb' : '#e2e8f0',
                  background: provider === item.id ? '#eff6ff' : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <input
                    type="radio"
                    name="jobProvider"
                    checked={provider === item.id}
                    onChange={() => setProvider(item.id)}
                  />
                  <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>{item.name}</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', paddingLeft: '22px' }}>{item.desc}</div>
              </label>
            ))}
          </div>

          <div style={{ marginTop: '18px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Default Target Location
              </label>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>

        {/* 2. AI Role Matching Settings */}
        <div className="asana-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🤖 AI Matching Preferences
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
            Configure role matching sensitivity and intelligence model options
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                AI Analysis Mode
              </label>
              <select
                value={llmMode}
                onChange={(e) => setLlmMode(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  background: '#ffffff'
                }}
              >
                <option value="auto">Automatic (AI Cloud with Smart Fallback)</option>
                <option value="llm_only">Strict AI Cloud Analysis Only</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Custom Gemini / OpenAI Key (Optional)
              </label>
              <input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>

        {/* 3. Automated Daily Crawl Schedule */}
        <div className="asana-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⏰ Top 500 Enterprise Cron Schedule
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
            Automated screening schedule for top enterprise hiring portals
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Daily Screening Cron (12:00 PM IST)</div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Triggers full batch crawl across active portals every day at noon</div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={cronEnabled}
                onChange={(e) => setCronEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600, color: cronEnabled ? '#059669' : '#64748b' }}>
                {cronEnabled ? 'Active' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>

        {/* 4. Privacy & Data Maintenance */}
        <div className="asana-card" style={{ padding: '24px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔒 Privacy & Storage Maintenance
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 18px 0' }}>
            Identity management & local cache cleanup
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            <button
              type="button"
              onClick={handleClearHistory}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Clear Local Cache & History
            </button>
          </div>
        </div>

        {/* Save Controls */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            style={{
              padding: '11px 32px',
              borderRadius: '9999px',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            Save Preference Changes
          </button>
        </div>
      </form>
    </div>
  );
}
