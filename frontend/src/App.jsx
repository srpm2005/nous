import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadZone from './components/UploadZone';
import PipelineProgressView from './components/PipelineProgressView';
import ResumeDetailView from './components/ResumeDetailView';
import UserHistoryView from './components/UserHistoryView';
import EnterpriseCrawlerView from './components/EnterpriseCrawlerView';
import SettingsView from './components/SettingsView';
import { getEnterpriseCompanies } from './services/api';


export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [activeScanId, setActiveScanId] = useState(null);
  const [refreshHistorySignal, setRefreshHistorySignal] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

  // Pre-warm backend container on page load to eliminate Render free-tier cold start latency
  React.useEffect(() => {
    getEnterpriseCompanies().catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleUploadSuccess = (newResume) => {
    setResumes((prev) => {
      const exists = prev.find((r) => r.id === newResume.id);
      if (exists) {
        return prev.map((r) => (r.id === newResume.id ? newResume : r));
      }
      return [newResume, ...prev];
    });

    setActiveResume(newResume);
    if (newResume.scanId) {
      setActiveScanId(newResume.scanId);
    }

    setRefreshHistorySignal((prev) => prev + 1);

    showToast('🚀 Resume uploaded! Resume processing pipeline started.');
  };


  const handleScanComplete = (scanResult) => {
    setRefreshHistorySignal((prev) => prev + 1);

    if (activeResume && activeResume.scanId === scanResult.scanId) {
      const updatedStatus = scanResult.status;
      setActiveResume((prev) => prev ? { ...prev, scanStatus: updatedStatus } : null);
      setResumes((prev) => prev.map((r) => r.scanId === scanResult.scanId ? { ...r, scanStatus: updatedStatus } : r));

      if (updatedStatus === 'COMPLETE') {
        showToast('🎉 Async scan pipeline completed successfully! Status: COMPLETE');
      } else if (updatedStatus === 'FAILED') {
        showToast(`❌ Async scan pipeline failed: ${scanResult.errorReason || 'Unknown error'}`);
      }
    }
  };

  const handleSelectResume = (r) => {
    setActiveResume(r);
    if (r.scanId) {
      setActiveScanId(r.scanId);
    }
    setActiveTab('scanner');
  };

  const handleAddResumeFromLookup = (lookupResume) => {
    setResumes((prev) => {
      const exists = prev.find((r) => r.id === lookupResume.id);
      if (exists) return prev;
      return [lookupResume, ...prev];
    });
  };

  const handleDeleteSuccess = (deletedId) => {
    setResumes((prev) => prev.filter((r) => r.id !== deletedId));
    if (activeResume && activeResume.id === deletedId) {
      setActiveResume(null);
      setActiveScanId(null);
    }
    setRefreshHistorySignal((prev) => prev + 1);
    showToast('🗑️ Resume & associated scan history deleted successfully.');
  };

  const handleSelectHistoryScan = (scan) => {
    setActiveScanId(scan.scanId);
    showToast(`🔍 Selected Scan ID: ${scan.scanId}`);
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewScan={() => {
          setActiveResume(null);
          setActiveScanId(null);
          setActiveTab('scanner');
        }}
      />

      {/* Hero Header Banner (Only shown on empty upload state) */}
      {!activeResume && activeTab === 'scanner' && <HeroSection />}

      {/* Main Tab Content */}
      {activeTab === 'scanner' ? (
        <div className="main-grid">
          {!activeResume ? (
            /* Empty state: Centered clean upload experience */
            <div className="upload-grid-empty">
              <UploadZone
                onUploadSuccess={handleUploadSuccess}
                onError={(err) => showToast(`⚠️ Upload Error: ${err}`)}
              />
            </div>
          ) : (
            /* Active scan state: Full-width expansive dashboard */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
              {/* Background Pipeline Status while running */}
              {activeScanId && activeResume.scanStatus !== 'COMPLETE' ? (
                <div style={{ maxWidth: '580px', margin: '30px auto 0 auto', width: '100%' }}>
                  <PipelineProgressView
                    key={activeScanId}
                    scanId={activeScanId}
                    onComplete={handleScanComplete}
                  />
                </div>
              ) : (
                /* Full Width Resume Analysis & Job Openings Dashboard when complete */
                <ResumeDetailView
                  resume={activeResume}
                  onDeleteSuccess={handleDeleteSuccess}
                  onCopyToast={showToast}
                  onUploadNew={() => {
                    setActiveResume(null);
                    setActiveScanId(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'crawls' ? (
        <EnterpriseCrawlerView onShowToast={showToast} />
      ) : activeTab === 'settings' ? (
        <SettingsView onShowToast={showToast} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <UserHistoryView
            userId="anonymous"
            onSelectScan={handleSelectHistoryScan}
            onRefreshSignal={refreshHistorySignal}
          />
        </div>
      )}


      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="animate-fade-in" style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--color-accent)',
          border: '1px solid var(--color-accent)',
          borderRadius: 'var(--radius-md)',
          color: '#ffffff',
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: 500,
          boxShadow: 'var(--shadow-elevated)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

