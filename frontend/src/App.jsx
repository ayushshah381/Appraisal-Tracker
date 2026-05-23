import React, { useState, useEffect } from 'react';
import { api } from './api';
import DashboardView from './components/DashboardView';
import LoggerView from './components/LoggerView';
import SummarizerView from './components/SummarizerView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Custom API key stored in LocalStorage for dynamic LLM execution
  const [apiKey, setApiKey] = useState(localStorage.getItem('copilot_api_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Toast Helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Fetch all logs from the backend
  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading logs. Make sure the Spring Boot server is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleAddLog = async (logData) => {
    try {
      const newLog = await api.createLog(logData);
      setLogs(prev => [newLog, ...prev]);
      showToast('Log entry saved successfully!');
    } catch (err) {
      console.error(err);
      showToast(`Failed to save log: ${err.message}`);
    }
  };

  const handleUpdateLog = async (id, logData) => {
    try {
      const updatedLog = await api.updateLog(id, logData);
      setLogs(prev => prev.map(log => log.id === id ? updatedLog : log));
      showToast('Log entry updated successfully!');
    } catch (err) {
      console.error(err);
      showToast(`Failed to update log: ${err.message}`);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      await api.deleteLog(id);
      setLogs(prev => prev.filter(log => log.id !== id));
      showToast('Log entry deleted successfully.');
    } catch (err) {
      console.error(err);
      showToast(`Failed to delete log: ${err.message}`);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('copilot_api_key', apiKey);
    showToast('AI API key saved in local storage!');
    setShowKeyInput(false);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('copilot_api_key');
    setApiKey('');
    showToast('AI API key cleared.');
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <svg viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brand-name">SelfAppraise</span>
        </div>

        <nav>
          <ul className="nav-links">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <svg viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
                Dashboard
              </button>
            </li>
            
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'logger' ? 'active' : ''}`}
                onClick={() => setActiveTab('logger')}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Work Timeline
              </button>
            </li>

            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'summarizer' ? 'active' : ''}`}
                onClick={() => setActiveTab('summarizer')}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                Summarizer
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer - AI Summary Config */}
        <div className="sidebar-footer">
          <div className="key-config">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontWeight:600, color:'var(--text-muted)'}}>AI Summary Config</span>
              <button 
                className="action-btn" 
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Configure AI API Key"
              >
                <svg style={{width:'14px', height:'14px', fill:'none', stroke:'currentColor', strokeWidth:2.5}} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
            </div>
            
            {localStorage.getItem('copilot_api_key') ? (
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', color:'var(--success)', marginTop:'0.25rem', fontSize:'0.75rem'}}>
                <span style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                  <span style={{display:'inline-block', width:'6px', height:'6px', borderRadius:'50%', backgroundColor:'var(--success)'}}></span>
                  AI Mode Active
                </span>
                <button 
                  style={{background:'none', border:'none', color:'var(--danger)', fontSize:'0.7rem', cursor:'pointer', padding:0}}
                  onClick={handleClearApiKey}
                >
                  Clear Key
                </button>
              </div>
            ) : (
              <span style={{color:'var(--text-muted)', fontSize:'0.75rem'}}>Local summary template only</span>
            )}

            {showKeyInput && (
              <form onSubmit={handleSaveApiKey} style={{marginTop:'0.5rem', display:'flex', flexDirection:'column', gap:'0.4rem'}}>
                <div className="key-input-wrapper">
                  <input
                    type="password"
                    className="key-input"
                    placeholder="Enter API Key..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-secondary" style={{padding:'0.3rem', fontSize:'0.75rem', width:'100%'}}>
                  Save Key
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        {loading ? (
          <div className="loader-wrapper" style={{height:'80vh'}}>
            <div className="loader"></div>
            <span>Connecting to backend database services...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView 
                logs={logs} 
                onNavigate={setActiveTab} 
              />
            )}
            {activeTab === 'logger' && (
              <LoggerView 
                logs={logs} 
                onAddLog={handleAddLog} 
                onUpdateLog={handleUpdateLog} 
                onDeleteLog={handleDeleteLog} 
              />
            )}
            {activeTab === 'summarizer' && (
              <SummarizerView 
                onShowToast={showToast} 
              />
            )}
          </>
        )}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <svg style={{width:'18px', height:'18px', fill:'none', stroke:'var(--success)', strokeWidth:2.5}} viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
