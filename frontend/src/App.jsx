import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadZone from './components/UploadZone';
import ResumeDetailView from './components/ResumeDetailView';
import RecentUploadsList from './components/RecentUploadsList';

export default function App() {
  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
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

    if (newResume.isDuplicate) {
      showToast('⚡ Duplicate resume detected! Content matched via SHA-256 hash.');
    } else {
      showToast('✅ Resume successfully uploaded and text extracted!');
    }
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
    }
    showToast('🗑️ Resume deleted successfully.');
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar activePhase="Engine" />

      {/* Hero Header Banner */}
      <HeroSection />

      {/* Main Workspace Layout */}
      <div className="main-grid">
        {/* Left Column: Upload Zone + Active Resume Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <UploadZone
            onUploadSuccess={handleUploadSuccess}
            onError={(err) => showToast(`⚠️ Upload Error: ${err}`)}
          />

          <ResumeDetailView
            resume={activeResume}
            onDeleteSuccess={handleDeleteSuccess}
            onCopyToast={showToast}
          />
        </div>

        {/* Right Column: History & Direct Lookup */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <RecentUploadsList
            resumes={resumes}
            activeResumeId={activeResume?.id}
            onSelectResume={(r) => setActiveResume(r)}
            onDeleteResume={handleDeleteSuccess}
            onAddResume={handleAddResumeFromLookup}
          />
        </div>
      </div>

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
