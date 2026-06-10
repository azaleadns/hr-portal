import React, { useState } from 'react';
import { ExternalLink, RefreshCw, Settings, X, Copy, Check, Database, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getSyncConfig, saveSyncConfig, SyncConfig, fetchSpreadsheetCandidates, isValidAppsScriptUrl } from '../utils/googleSheetsSync';

export default function SpreadsheetEmbed() {
  const spreadsheetId = '1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk';
  const embedUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?rm=minimal`;
  
  const [config, setConfig] = useState<SyncConfig>(getSyncConfig());
  const [showSettings, setShowSettings] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });
  const [showGuide, setShowGuide] = useState(false);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawUrl = e.target.value;
    const isUrlOk = isValidAppsScriptUrl(rawUrl);
    const updated: SyncConfig = { 
      ...config, 
      webAppUrl: rawUrl, 
      method: isUrlOk ? 'apps_script' : 'local' 
    };
    setConfig(updated);
    saveSyncConfig(updated);
    if (!isUrlOk && rawUrl.trim().length > 0) {
      setTestResult({ 
        status: 'error', 
        message: 'This looks like a Google Sheets URL. Please make sure to paste the Apps Script Web App URL ending in /exec.' 
      });
    } else {
      setTestResult({ status: 'idle', message: '' });
    }
  };

  const triggerSaveAndRefresh = () => {
    saveSyncConfig(config);
    window.dispatchEvent(new Event('sheets_sync_config_updated'));
    setShowSettings(false);
    window.location.reload();
  };

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle', message: 'Testing server latency...' });
    try {
      if (!config.webAppUrl) {
        throw new Error('Please input a valid Google Apps Script Web App URL first.');
      }
      const candidates = await fetchSpreadsheetCandidates(config);
      if (candidates !== null) {
        setTestResult({ status: 'success', message: `Connected! Verified integration with candidates sheet.` });
      } else {
        throw new Error('Connection response did not contain expected data payload.');
      }
    } catch (err: any) {
      setTestResult({ status: 'error', message: err.message || 'Synchronization test failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const appsScriptCode = `function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var params = e.parameter;
  var action = params.action;
  
  var postData = null;
  if (e.postData && e.postData.contents) {
    try {
      postData = JSON.parse(e.postData.contents);
      if (!action) action = postData.action;
    } catch(err) {}
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === "read") {
    var candidates = getSheetData(ss, "New Candidates");
    var jobs = getSheetData(ss, "Job Openings");
    return jsonResponse({status: "success", candidates: candidates, jobs: jobs});
  }
  
  if (action === "write_candidate") {
    var candidate = postData.candidate;
    writeRow(ss, "New Candidates", candidate, "id");
    return jsonResponse({status: "success"});
  }
  
  if (action === "delete_candidate") {
    var id = postData.id;
    deleteRow(ss, "New Candidates", id, "id");
    return jsonResponse({status: "success"});
  }
  
  if (action === "write_job") {
    var job = postData.job;
    writeRow(ss, "Job Openings", job, "id");
    return jsonResponse({status: "success"});
  }
  
  if (action === "delete_job") {
    var id = postData.id;
    deleteRow(ss, "Job Openings", id, "id");
    return jsonResponse({status: "success"});
  }
  
  return jsonResponse({status: "error", message: "Invalid action: " + action});
}

function getSheetData(ss, sheetName) {
  if (sheetName === "new candidate" || sheetName === "new candidates") {
    sheetName = "New Candidates";
  }
  if (sheetName === "job openings" || sheetName === "jop openings" || sheetName === "Jop Openings") {
    sheetName = "Job Openings";
  }
  
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];
  var headers = values[0];
  var list = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    list.push(obj);
  }
  return list;
}

function writeRow(ss, sheetName, data, keyName) {
  if (sheetName === "new candidate" || sheetName === "new candidates") {
    sheetName = "New Candidates";
  }
  if (sheetName === "job openings" || sheetName === "jop openings" || sheetName === "Jop Openings") {
    sheetName = "Job Openings";
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = Object.keys(data);
    sheet.appendRow(headers);
  }
  
  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  
  Object.keys(data).forEach(function (k) {
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      sheet.getRange(1, headers.length).setValue(k);
    }
  });
  
  var freshValues = sheet.getDataRange().getValues();
  var finalHeaders = freshValues[0];
  var rowIndex = -1;
  var keyColIndex = finalHeaders.indexOf(keyName);
  
  for (var i = 1; i < freshValues.length; i++) {
    if (freshValues[i][keyColIndex] == data[keyName]) {
      rowIndex = i + 1;
      break;
    }
  }
  
  var rowValues = finalHeaders.map(function(k) {
    return data[k] !== undefined ? data[k] : "";
  });
  
  if (rowIndex !== -1) {
    sheet.getRange(rowIndex, 1, 1, finalHeaders.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  
  // Apply beautiful and clean table formatting
  formatSheetTable(sheet, sheetName);
}

function deleteRow(ss, sheetName, keyValue, keyName) {
  if (sheetName === "new candidate" || sheetName === "new candidates") {
    sheetName = "New Candidates";
  }
  if (sheetName === "job openings" || sheetName === "jop openings" || sheetName === "Jop Openings") {
    sheetName = "Job Openings";
  }

  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  var values = sheet.getDataRange().getValues();
  if (values.length <= 1) return;
  var headers = values[0];
  var keyColIndex = headers.indexOf(keyName);
  if (keyColIndex === -1) return;
  
  for (var i = values.length - 1; i >= 1; i--) {
    if (values[i][keyColIndex] == keyValue) {
      sheet.deleteRow(i + 1);
    }
  }
  
  // Re-apply formatting after delete
  formatSheetTable(sheet, sheetName);
}

function formatSheetTable(sheet, sheetName) {
  try {
    var lastRow = sheet.getLastRow();
    var lastColumn = sheet.getLastColumn();
    if (lastRow === 0 || lastColumn === 0) return;
    
    // Set modern styling font (Arial / Helvetica / Inter fallback)
    var fullRange = sheet.getRange(1, 1, lastRow, lastColumn);
    fullRange.setFontFamily("Arial");
    fullRange.setFontSize(10);
    fullRange.setVerticalAlignment("middle");
    
    // Format Header Row
    var headerRange = sheet.getRange(1, 1, 1, lastColumn);
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(10);
    headerRange.setFontColor("#ffffff");
    headerRange.setHorizontalAlignment("center");
    
    // Set custom theme color depending on sheet type
    if (sheetName.indexOf("Candidate") !== -1) {
      headerRange.setBackgroundColor("#1e3a8a"); // Rich Royal Navy Blue
    } else {
      headerRange.setBackgroundColor("#14532d"); // Rich Deep Forest Green
    }
    
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Zebra Striping background on rows for readability
    if (lastRow > 1) {
      for (var r = 2; r <= lastRow; r++) {
        var rowRange = sheet.getRange(r, 1, 1, lastColumn);
        if (r % 2 === 0) {
          rowRange.setBackgroundColor("#f8fafc"); // Slate-50 soft gray
        } else {
          rowRange.setBackgroundColor("#ffffff"); // pristine white
        }
      }
    }
    
    // Set light gray thin borders on cells
    fullRange.setBorder(true, true, true, true, true, true, "#e2e8f0", SpreadsheetApp.BorderStyle.SOLID);
    
    // Auto-adjust column widths
    for (var col = 1; col <= lastColumn; col++) {
      sheet.autoResizeColumn(col);
      var width = sheet.getColumnWidth(col);
      if (width < 96) width = 96; // Give healthy minimum size
      sheet.setColumnWidth(col, width + 16); // padding for icons / layout
    }
  } catch(err) {
    // Fail-safe catch block
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="page-layout" style={{ height: 'auto', minHeight: 'calc(100vh - 32px)', maxWidth: 'none', width: '100%', padding: '16px 24px 8px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', position: 'relative' }}>
      {/* Dynamic Header */}
      <header className="page-header" style={{ flexShrink: 0 }}>
        <div>
          <h1 className="page-title">Google Spreadsheet</h1>
          <p className="page-subtitle">Inspect and edit rows in real-time. Changes written here synchronize with the HR diagnostic suite.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            className="add-candidate-btn" 
            style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#1e293b' }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={14} />
            <span>Reload Document</span>
          </button>
          
          <button 
            className="add-candidate-btn" 
            style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155' }}
            onClick={() => setShowSettings(true)}
            title="Google Sheets Database Synchronization Settings"
          >
            <Settings size={14} />
            <span>Sync Settings</span>
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
      <div style={{ flex: 1, minHeight: '520px', background: '#fff', borderRadius: '16px', border: '1.5px solid #e1e8f0', boxShadow: '0 4px 12px rgba(15,23,42,0.02)', overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          width="100%"
          height="100%"
          style={{ border: 'none', minHeight: '520px' }}
          title="Google Spreadsheet Database Sync"
          allow="autoplay"
        ></iframe>
      </div>
      
      {/* Diagnostic status line */}
      <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748b', background: '#f8fafc', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', background: config.method !== 'local' ? '#22c55e' : '#f59e0b', borderRadius: '50%', display: 'inline-block' }}></span>
          <span>
            Sync Status:{' '}
            <button 
              onClick={() => setShowSettings(true)}
              style={{ background: 'none', border: 'none', textDecoration: 'underline', color: config.method !== 'local' ? '#22c55e' : '#f59e0b', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {config.method !== 'local' ? 'Connected to Google Sheets live' : 'Local database fallback active (Connect Spreadsheet)'}
            </button>
          </span>
        </div>
        <div>
          <span>Spreadsheet Document ID: {spreadsheetId}</span>
        </div>
      </footer>

      {/* Connection settings overlay modal */}
      {showSettings && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', display: 'flex', flexDirection: 'column', gap: '16px', animation: 'scaleUp 0.2s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database style={{ color: '#10b981' }} size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>Google Sheets Synchronization Setup</h3>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ background: 'transparent', border: 'none', padding: '4px', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              By connecting your Google Spreadsheet using a <strong>Google Apps Script Web App</strong>, any candidates or job openings you register in the applet will immediately synchronize writebacks directly inside your Google Sheet tabs.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                Google Apps Script Web App URL
              </label>
              <input 
                type="url" 
                placeholder="https://script.google.com/macros/s/.../exec" 
                value={config.webAppUrl}
                onChange={handleUrlChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', transition: 'border-color 0.15s ease' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Note: Leaving this blank falls back to offline-only storage.
              </span>
            </div>

            {/* Test connection row */}
            {config.webAppUrl && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <button 
                    onClick={testConnection}
                    disabled={isTesting}
                    style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{isTesting ? 'Verifying...' : 'Test Connection'}</span>
                  </button>

                  {testResult.message && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: testResult.status === 'success' ? '#16a34a' : '#ef4444' }}>
                      {testResult.status === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{testResult.message}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Copy code expander */}
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '12px' }}>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}
              >
                {showGuide ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                <span>{showGuide ? 'Hide Apps Script copy instructions' : 'Show 30-Seconds Apps Script copy code & instructions'}</span>
              </button>

              {showGuide && (
                <div style={{ marginTop: '10px', background: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>Easy Installation Guide:</span>
                  <ol style={{ margin: 0, paddingLeft: '18px', fontSize: '11.5px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <li>In your Google Sheet, click <strong>Extensions &gt; Apps Script</strong> in the top menu bar.</li>
                    <li>Clear any existing code in the code editor, click the copy code button below, and paste it.</li>
                    <li>Click the blue <strong>Deploy &gt; New deployment</strong> button on the top-right.</li>
                    <li>Set Select type to <strong>Web app</strong>, configure Execute as to <strong>Me</strong>, and Who has access to <strong>Anyone</strong>.</li>
                    <li>Click <strong>Deploy</strong>, grant permission, copy the resulting <strong>Web app URL</strong>, and paste it above!</li>
                  </ol>
                  <button 
                    onClick={copyToClipboard}
                    style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', color: '#1D8A48', border: '1px solid #1D8A48', borderRadius: '6px', padding: '6px 12px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {copiedScript ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                    <span>{copiedScript ? 'Copied script to clipboard!' : 'Copy Script Code'}</span>
                  </button>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                onClick={() => setShowSettings(false)}
                style={{ background: '#fff', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '8px', padding: '8px 16px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={triggerSaveAndRefresh}
                style={{ background: '#1D8A48', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
              >
                Save & Activate Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
