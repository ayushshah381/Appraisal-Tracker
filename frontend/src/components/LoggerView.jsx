import React, { useState } from 'react';

export default function LoggerView({ logs, onAddLog, onUpdateLog, onDeleteLog }) {
  const [formData, setFormData] = useState({
    content: '',
    category: 'WORK',
    date: new Date().toISOString().split('T')[0],
    sprint: '',
    impact: ''
  });
  
  const [editingId, setEditingId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    if (editingId) {
      onUpdateLog(editingId, formData);
      setEditingId(null);
    } else {
      onAddLog(formData);
    }

    // Reset content/impact, keep date/category/sprint for fast consecutive logging
    setFormData(prev => ({
      ...prev,
      content: '',
      impact: ''
    }));
  };

  const handleEdit = (log) => {
    setEditingId(log.id);
    setFormData({
      content: log.content,
      category: log.category,
      date: log.date,
      sprint: log.sprint || '',
      impact: log.impact || ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      content: '',
      category: 'WORK',
      date: new Date().toISOString().split('T')[0],
      sprint: '',
      impact: ''
    });
  };

  const filteredLogs = logs.filter(log => {
    if (categoryFilter === 'ALL') return true;
    return log.category === categoryFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{editingId ? 'Edit Work Entry' : 'Log Daily / Sprint Work'}</h1>
          <p className="page-subtitle">Track today's contributions, appreciations, or continuous learning points.</p>
        </div>
      </div>

      {/* Log Input Form */}
      <div className="glass-card form-card">
        <h2 className="card-title" style={{marginBottom:'1rem'}}>
          <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          {editingId ? 'Modify Appraisal Entry' : 'Quick Logger'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="WORK">Deliverable / Task</option>
                <option value="APPRECIATION">Appreciation</option>
                <option value="AWARD">Award / Recognition</option>
                <option value="LEARNING">Learning / Skill</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sprint">Sprint (Optional)</label>
              <input
                type="text"
                id="sprint"
                name="sprint"
                className="form-control"
                placeholder="e.g. Sprint 24"
                value={formData.sprint}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="content">What did you accomplish?</label>
              <textarea
                id="content"
                name="content"
                rows="3"
                className="form-control"
                placeholder={
                  formData.category === 'WORK' 
                    ? "e.g. Resolved a memory leak in the core rendering engine, decreasing dashboard load times by 40%."
                    : formData.category === 'APPRECIATION'
                    ? "e.g. Received appreciation from Tech Lead Sarah for jumping in to fix a production hotfix under pressure."
                    : formData.category === 'AWARD'
                    ? "e.g. Won the Spot Award for Outstanding Contribution during the Q2 release."
                    : "e.g. Completed Kubernetes Fundamentals course and set up local dev clusters using Minikube."
                }
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="impact">Impact / Outcome Metrics (Optional)</label>
              <input
                type="text"
                id="impact"
                name="impact"
                className="form-control"
                placeholder="e.g. Improved API speed by 250ms, positive client sign-off, or certification completed"
                value={formData.impact}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{display:'flex', gap:'1rem', justifyContent:'flex-end', marginTop:'1.5rem'}}>
            {editingId && (
              <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                Cancel Edit
              </button>
            )}
            <button type="submit" className="btn">
              {editingId ? 'Update Log' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>

      {/* Log History timeline */}
      <div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
          <h2 className="card-title" style={{margin:0}}>
            <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            Activity Timeline
          </h2>
          <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
            <span style={{fontSize:'0.85rem', color:'var(--text-muted)'}}>Filter:</span>
            <select
              className="form-control"
              style={{padding:'0.4rem 1.5rem 0.4rem 0.75rem', fontSize:'0.85rem'}}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Entries</option>
              <option value="WORK">Deliverables</option>
              <option value="APPRECIATION">Appreciations</option>
              <option value="AWARD">Awards</option>
              <option value="LEARNING">Learnings</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="glass-card empty-state">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3>No entries found</h3>
            <p style={{marginTop:'0.5rem'}}>Try changing the filter or log some items above to populate your timeline.</p>
          </div>
        ) : (
          <div className="timeline-container">
            {filteredLogs.map((log) => (
              <div key={log.id} className="glass-card timeline-item">
                <span className={`timeline-badge ${log.category.toLowerCase()}`}>
                  {log.category === 'WORK' ? 'Deliverable' : log.category.toLowerCase()}
                </span>
                
                <span className="timeline-date">
                  {new Date(log.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                
                <p className="timeline-content">{log.content}</p>
                
                {(log.sprint || log.impact) && (
                  <div className="timeline-meta">
                    {log.sprint && (
                      <div className="timeline-meta-item">
                        <svg style={{width:'14px', height:'14px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span>{log.sprint}</span>
                      </div>
                    )}
                    {log.impact && (
                      <div className="timeline-meta-item">
                        <svg style={{width:'14px', height:'14px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <strong>Impact:</strong> <span>{log.impact}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="timeline-actions">
                  <button className="action-btn" title="Edit Entry" onClick={() => handleEdit(log)}>
                    <svg viewBox="0 0 24 24">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button className="action-btn delete" title="Delete Entry" onClick={() => {
                    if (window.confirm("Are you sure you want to delete this log?")) {
                      onDeleteLog(log.id);
                    }
                  }}>
                    <svg viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
