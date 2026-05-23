import React, { useState } from 'react';
import { api } from '../api';

export default function SummarizerView({ onShowToast }) {
  const [filters, setFilters] = useState({
    category: '', // Empty means ALL for summary
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Default Jan 1 of current year
    endDate: new Date().toISOString().split('T')[0] // Default today
  });

  const [useLlm, setUseLlm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Preset Date Selectors
  const applyPreset = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = today;

    if (preset === 'SPRINT') {
      // 2 Weeks ago
      start.setDate(today.getDate() - 14);
    } else if (preset === 'MONTH') {
      start.setMonth(today.getMonth() - 1);
    } else if (preset === 'QUARTER') {
      // Current Quarter start
      const quarter = Math.floor(today.getMonth() / 3);
      start = new Date(today.getFullYear(), quarter * 3, 1);
    } else if (preset === 'YEAR') {
      start = new Date(today.getFullYear(), 0, 1);
    }

    setFilters({
      category: '',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSummary('');
    try {
      const data = await api.getSummary(filters, useLlm);
      setSummary(data.summary);
    } catch (err) {
      console.error(err);
      onShowToast(`Failed to generate summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setIsCopied(true);
    onShowToast("Summary copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Simple custom Markdown-to-HTML parser to display it elegantly
  const renderMarkdown = (text) => {
    if (!text) return <p className="text-muted" style={{textAlign:'center', marginTop:'2rem'}}>No summary generated yet. Configure filters and click "Generate".</p>;
    
    const lines = text.split('\n');
    let listOpen = false;
    const elements = [];

    const parseInlineStyles = (txt) => {
      // Very basic parser for bold **text** and italic *text*
      const parts = [];
      let i = 0;
      
      // Simple regex split to find **bold** and *italic*
      // Matches double asterisks or single asterisks
      const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
      const splitText = txt.split(regex);

      return splitText.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={idx}>{part.slice(1, -1)}</em>;
        }
        return part;
      });
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        elements.push(<h1 key={`h1-${idx}`}>{parseInlineStyles(trimmed.slice(2))}</h1>);
      } else if (trimmed.startsWith('## ')) {
        elements.push(<h2 key={`h2-${idx}`}>{parseInlineStyles(trimmed.slice(3))}</h2>);
      } else if (trimmed.startsWith('### ')) {
        elements.push(<h3 key={`h3-${idx}`}>{parseInlineStyles(trimmed.slice(4))}</h3>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={`li-${idx}`} style={{ marginLeft: '1.5rem', marginBottom: '0.4rem' }}>
            {parseInlineStyles(trimmed.slice(2))}
          </li>
        );
      } else if (trimmed === '---') {
        elements.push(<hr key={`hr-${idx}`} />);
      } else if (trimmed === '') {
        elements.push(<br key={`br-${idx}`} />);
      } else {
        elements.push(<p key={`p-${idx}`} style={{ marginBottom: '0.8rem' }}>{parseInlineStyles(line)}</p>);
      }
    });

    return elements;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appraisal Summarizer</h1>
          <p className="page-subtitle">Aggregate your accomplishments into copy-pasteable performance self-assessments.</p>
        </div>
      </div>

      <div className="summarizer-layout">
        {/* Left Column - Filters */}
        <div className="glass-card summary-filter-card">
          <h2 className="card-title" style={{marginBottom:'1.25rem'}}>
            <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Summary Settings
          </h2>

          <div style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
            <div className="form-group">
              <span className="form-label">Presets</span>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem'}}>
                <button type="button" className="btn btn-secondary" style={{padding:'0.5rem', fontSize:'0.8rem'}} onClick={() => applyPreset('SPRINT')}>This Sprint</button>
                <button type="button" className="btn btn-secondary" style={{padding:'0.5rem', fontSize:'0.8rem'}} onClick={() => applyPreset('MONTH')}>Last 30 Days</button>
                <button type="button" className="btn btn-secondary" style={{padding:'0.5rem', fontSize:'0.8rem'}} onClick={() => applyPreset('QUARTER')}>This Quarter</button>
                <button type="button" className="btn btn-secondary" style={{padding:'0.5rem', fontSize:'0.8rem'}} onClick={() => applyPreset('YEAR')}>This Year</button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                className="form-control"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                className="form-control"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">Category Filter</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">All Categories (Recommended)</option>
                <option value="WORK">Deliverables only</option>
                <option value="APPRECIATION">Appreciations only</option>
                <option value="AWARD">Awards only</option>
                <option value="LEARNING">Learnings only</option>
              </select>
            </div>

            <div style={{display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem'}}>
              <input
                type="checkbox"
                id="useLlm"
                style={{width:'16px', height:'16px', accentColor:'var(--primary)'}}
                checked={useLlm}
                onChange={(e) => setUseLlm(e.target.checked)}
              />
              <label htmlFor="useLlm" style={{fontSize:'0.85rem', fontWeight:500, cursor:'pointer'}}>
                Translate to Corporate AI Summary
              </label>
            </div>

            <button className="btn" style={{marginTop:'1rem', width:'100%'}} onClick={handleGenerate} disabled={loading}>
              {loading ? 'Analyzing Logs...' : 'Generate Summary'}
            </button>
          </div>
        </div>

        {/* Right Column - Summary Preview */}
        <div className="glass-card summary-preview-card">
          <div className="summary-header-actions">
            <h2 className="card-title" style={{margin:0}}>
              <svg style={{width:'18px', height:'18px', fill:'none', stroke:'currentColor', strokeWidth:2}} viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Draft Preview
            </h2>
            {summary && (
              <button className="btn btn-secondary" style={{padding:'0.4rem 0.8rem', fontSize:'0.85rem'}} onClick={handleCopy}>
                {isCopied ? 'Copied!' : 'Copy Summary'}
              </button>
            )}
          </div>

          {loading ? (
            <div className="loader-wrapper" style={{flexGrow:1}}>
              <div className="loader"></div>
              <span>Analyzing entries and compiling performance draft...</span>
            </div>
          ) : (
            <div className="markdown-preview">
              {renderMarkdown(summary)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
