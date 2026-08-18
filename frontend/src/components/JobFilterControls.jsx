import React from 'react';

const DEFAULT_COMPANIES = [
  // Core Baseline & Big Tech
  'Microsoft', 'Amazon', 'Google', 'Meta', 'Apple', 'Netflix', 'Adobe', 'Stripe', 'Figma', 'TCS', 'Infosys', 'Accenture',
  'NVIDIA', 'Intel', 'AMD', 'Qualcomm', 'Broadcom', 'Cisco', 'IBM', 'Oracle', 'Salesforce', 'ServiceNow', 'Workday',
  'Palo Alto Networks', 'CrowdStrike', 'Datadog', 'Snowflake', 'Databricks', 'Atlassian', 'MongoDB', 'Twilio', 'Cloudflare',
  'Zoom', 'Slack', 'Asana', 'Notion', 'Canva', 'Box', 'Dropbox', 'HubSpot', 'Zendesk', 'Okta', 'Splunk', 'Synopsys',
  'Cadence Design Systems', 'VMware', 'Red Hat', 'Docker', 'HashiCorp', 'Elastic', 'Confluent', 'GitLab', 'GitHub',
  'Postman', 'Freshworks', 'Hasura',
  // FinTech & High Growth
  'Uber', 'Airbnb', 'Lyft', 'DoorDash', 'Instacart', 'Pinterest', 'Snap Inc', 'Reddit', 'Spotify', 'eBay', 'Etsy',
  'Robinhood', 'Coinbase', 'Plaid', 'Affirm', 'Klarna', 'Brex', 'Ramp', 'Toast', 'Square (Block)', 'PayPal', 'Intuit',
  'Zomato', 'Swiggy', 'Paytm', 'PhonePe', 'CRED', 'Razorpay', 'Meesho', 'Groww', 'Zerodha', 'InMobi', 'Flipkart',
  'Ola Cabs', 'MakeMyTrip', 'Nykaa', 'BrowserStack', 'Druva', 'Chargebee',
  // IT Services & Consulting
  'Wipro', 'HCLTech', 'Cognizant', 'LTIMindtree', 'Tech Mahindra', 'Genpact', 'Capgemini', 'Deloitte', 'PwC', 'EY',
  'KPMG', 'McKinsey & Company', 'Boston Consulting Group (BCG)', 'Bain & Company', 'Booz Allen Hamilton', 'Gartner',
  // Investment Banking & Finance
  'JPMorgan Chase', 'Goldman Sachs', 'Morgan Stanley', 'Citi', 'Bank of America', 'Wells Fargo', 'Capital One',
  'Visa', 'Mastercard', 'American Express', 'Fidelity Investments', 'BlackRock', 'Vanguard', 'Bloomberg',
  'Thomson Reuters', 'S&P Global', "Moody's",
  // E-Commerce & Retail
  'Walmart', 'Target', 'Costco', 'Best Buy', 'The Home Depot', "Lowe's", 'Nike', 'Adidas', 'Lululemon', 'Starbucks', "McDonald's",
  // Automotive & Aerospace
  'Tesla', 'Rivian', 'Lucid Motors', 'General Motors', 'Ford Motor Company', 'BMW Group', 'Mercedes-Benz', 'Volkswagen Group',
  'Boeing', 'Airbus', 'Lockheed Martin', 'Northrop Grumman',
  // Hardware & Semiconductors
  'ASML', 'Applied Materials', 'Lam Research', 'TSMC', 'Micron Technology', 'SK Hynix', 'Marvell', 'MediaTek',
  'NXP Semiconductors', 'Texas Instruments', 'Sony Group', 'Samsung Electronics', 'Dell Technologies', 'HP Inc',
  'Lenovo', 'Siemens', 'Honeywell', 'General Electric', '3M', 'Caterpillar',
  // Healthcare & BioTech
  'Johnson & Johnson', 'Pfizer', 'Roche', 'Novartis', 'Merck & Co', 'AbbVie', 'AstraZeneca', 'Sanofi', 'GSK',
  'Eli Lilly', 'Amgen', 'Gilead Sciences', 'Moderna', 'Regeneron', 'Illumina', 'Thermo Fisher Scientific', 'Danaher',
  'Medtronic', 'Abbott Laboratories', 'UnitedHealth Group', 'CVS Health'
];

/**
 * Filter controls component for searching live job listings by keyword, location, company dropdown, and role.
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
  // Build a unique, clean, alphabetically sorted company list excluding generic placeholders
  const companyList = Array.from(
    new Set([
      ...DEFAULT_COMPANIES,
      ...(companies || [])
    ])
  )
    .filter((c) => c && !c.toLowerCase().startsWith('enterprise partner'))
    .sort((a, b) => a.localeCompare(b));

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
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search Keyword Input */}
        <div style={{ flex: '1 1 220px', minWidth: '190px' }}>
          <input
            type="text"
            placeholder="🔍 Search title, role or keyword..."
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
        <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
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
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.background = '#ffffff';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
            }}
          >
            <option value="ALL">🏢 All Companies ({companyList.length})</option>
            {companyList.map((c, idx) => (
              <option key={idx} value={c.toUpperCase()}>
                🏢 {c}
              </option>
            ))}
          </select>
        </div>

        {/* Role Selector Dropdown */}
        {roles && roles.length > 0 && (
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
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
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.background = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.background = '#f8fafc';
              }}
            >
              <option value="ALL">🎯 All Target Roles ({roles.length})</option>
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

