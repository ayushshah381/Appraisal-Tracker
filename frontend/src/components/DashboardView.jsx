import React from 'react';

export default function DashboardView({ logs, onNavigate }) {
  // Calculate metric counts
  const totalLogs = logs.length;
  const workCount = logs.filter(l => l.category === 'WORK').length;
  const appreciationCount = logs.filter(l => l.category === 'APPRECIATION').length;
  const awardCount = logs.filter(l => l.category === 'AWARD').length;
  const learningCount = logs.filter(l => l.category === 'LEARNING').length;

  const recentLogs = logs.slice(0, 4);

  // Math for SVG Donut Chart
  const categories = [
    { name: 'Deliverables', count: workCount, color: '#6366f1', class: 'work' },
    { name: 'Appreciations', count: appreciationCount, color: '#a855f7', class: 'appreciation' },
    { name: 'Awards', count: awardCount, color: '#f59e0b', class: 'award' },
    { name: 'Learnings', count: learningCount, color: '#10b981', class: 'learning' }
  ];

  const chartTotal = totalLogs || 1; // avoid divide by zero
  let accumulatedPercentage = 0;

  const donutSegments = categories.map(cat => {
    const percentage = (cat.count / chartTotal) * 100;
    const strokeDash = `${percentage} ${100 - percentage}`;
    const strokeOffset = 100 - accumulatedPercentage + 25; // 25 to start at top (12 o'clock)
    accumulatedPercentage += percentage;
    return {
      ...cat,
      percentage,
      strokeDash,
      strokeOffset: strokeOffset % 100
    };
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Your accomplishments and performance tracker for the year.</p>
        </div>
        <button className="btn" onClick={() => onNavigate('logger')}>
          <svg style={{width:'16px', height:'16px', fill:'none', stroke:'currentColor', strokeWidth:2.5}} viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Quick Add Log
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="glass-card metric-card">
          <div className="metric-icon-box work">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{workCount}</span>
            <span className="metric-label">Deliverables</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box appreciation">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{appreciationCount}</span>
            <span className="metric-label">Appreciations</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box award">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{awardCount}</span>
            <span className="metric-label">Awards</span>
          </div>
        </div>

        <div className="glass-card metric-card">
          <div className="metric-icon-box learning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-value">{learningCount}</span>
            <span className="metric-label">Learnings</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Info */}
      <div className="dashboard-details-grid">
        {/* Category Breakdown Chart */}
        <div className="glass-card chart-card">
          <h2 className="card-title">
            <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
            </svg>
            Category Distribution
          </h2>
          <div className="chart-container">
            {totalLogs === 0 ? (
              <div className="empty-state" style={{padding: '1.5rem'}}>
                <p>No distribution data. Add your first log entry to visualize!</p>
              </div>
            ) : (
              <>
                <svg width="160" height="160" viewBox="0 0 42 42" className="svg-donut">
                  <circle className="donut-hole" cx="21" cy="21" r="15.915" fill="transparent"></circle>
                  <circle className="donut-ring" cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4.5"></circle>
                  
                  {donutSegments.map((segment, index) => (
                    segment.count > 0 && (
                      <circle
                        key={index}
                        className="donut-segment"
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="4.5"
                        strokeDasharray={segment.strokeDash}
                        strokeDashoffset={segment.strokeOffset}
                      ></circle>
                    )
                  ))}
                </svg>
                <div className="chart-legends">
                  {donutSegments.map((segment, index) => (
                    <div key={index} className="legend-item">
                      <div className="legend-color-dot" style={{ backgroundColor: segment.color }}></div>
                      <span style={{ fontWeight: 500 }}>{segment.name}:</span>
                      <span className="text-muted">{segment.count} ({Math.round(segment.percentage)}%)</span>
                    </div>
                  ))}
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem', fontSize: '0.85rem' }}>
                    <strong>Total Logs:</strong> {totalLogs}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Recent logs overview */}
        <div className="glass-card recent-card">
          <h2 className="card-title">
            <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Recent Activity
          </h2>
          {recentLogs.length === 0 ? (
            <div className="empty-state" style={{padding: '1.5rem'}}>
              <p>Your work timeline is empty. Start logging today!</p>
              <button className="btn btn-secondary" style={{marginTop:'1rem', fontSize:'0.85rem'}} onClick={() => onNavigate('logger')}>
                Go to Logger
              </button>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
              {recentLogs.map((log) => (
                <div key={log.id} style={{paddingBottom:'0.75rem', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:'0.25rem'}}>
                    <span>{new Date(log.date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</span>
                    <span style={{
                      textTransform: 'uppercase', 
                      color: log.category === 'WORK' ? 'var(--primary)' : 
                             log.category === 'APPRECIATION' ? 'var(--accent)' : 
                             log.category === 'AWARD' ? 'var(--warning)' : 'var(--success)',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}>{log.category}</span>
                  </div>
                  <p style={{fontSize:'0.9rem', color:'var(--text-main)', overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical'}}>
                    {log.content}
                  </p>
                </div>
              ))}
              <button className="btn btn-secondary" style={{width:'100%', fontSize:'0.85rem', marginTop:'0.5rem'}} onClick={() => onNavigate('logger')}>
                View Full Timeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
