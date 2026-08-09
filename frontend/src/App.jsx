import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadZone from './components/UploadZone';
import PipelineProgressView from './components/PipelineProgressView';
import ResumeDetailView from './components/ResumeDetailView';
import RecentUploadsList from './components/RecentUploadsList';
import UserHistoryView from './components/UserHistoryView';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [activeScanId, setActiveScanId] = useState(null);
  const [refreshHistorySignal, setRefreshHistorySignal] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);

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

    if (newResume.isDuplicate) {
      showToast('⚡ Duplicate resume detected! Content matched via SHA-256 hash.');
    } else {
      showToast('🚀 Resume uploaded! Async scanning job started (202 Accepted).');
    }
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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Header Banner */}
      <HeroSection />

      {/* Main Tab Content */}
      {activeTab === 'scanner' ? (
        <div className="main-grid">
          {/* Left Column: Upload Zone + Pipeline Progress + Recent Resumes History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <UploadZone
              onUploadSuccess={handleUploadSuccess}
              onError={(err) => showToast(`⚠️ Upload Error: ${err}`)}
            />

            {activeScanId && (
              <PipelineProgressView
                key={activeScanId}
                scanId={activeScanId}
                onComplete={handleScanComplete}
              />
            )}

            <RecentUploadsList
              resumes={resumes}
              activeResumeId={activeResume?.id}
              onSelectResume={handleSelectResume}
              onDeleteResume={handleDeleteSuccess}
              onAddResume={handleAddResumeFromLookup}
            />
          </div>

          {/* Right Column: Active Resume Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <ResumeDetailView
              resume={activeResume}
              onDeleteSuccess={handleDeleteSuccess}
              onCopyToast={showToast}
            />
          </div>
        </div>
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

