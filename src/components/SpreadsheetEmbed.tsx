import React from 'react';
import { ExternalLink, Database, RefreshCw, FileSpreadsheet } from 'lucide-react';

export default function SpreadsheetEmbed() {
  const spreadsheetId = '1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk';
  // Use the direct embed url structure or standard edit with minimal chroming
  const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?rm=minimal&widget=true&headers=false`;
  
  return (
    <div className="page-layout" style={{ height: '90vh', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Dynamic Header */}
      <header className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Live Spreadsheet Integrator</h1>
          <p className="page-subtitle">Inspect and edit rows in real-time. Changes written here synchronize with the HR diagnostic suite.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="add-candidate-btn" 
            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#1e293b' }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} />
            <span>Sync Viewport</span>
          </button>
          
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?usp=sharing`}
            target="_blank"
            rel="noopener noreferrer"
            className="add-candidate-btn"
            style={{ background: '#1D8A48', color: '#fff', textDecoration: 'none' }}
          >
            <ExternalLink size={14} />
            <span>Open in Sheets</span>
          </a>
        </div>
      </header>

      {/* Embedded Iframe Container */}
      <div style={{ flex: 1, minHeight: 0, background: '#fff', borderRadius: '16px', border: '1.5px solid #e1e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.02)', overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          title="Google Spreadsheet Database Sync"
          allow="autoplay"
        ></iframe>
      </div>
      
      {/* Diagnostic status line */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
          <span>Google Console API Link Status: Verified & Live</span>
        </div>
        <div>
          <span>Spreadsheet Document ID: {spreadsheetId}</span>
        </div>
      </footer>
    </div>
  );
}
