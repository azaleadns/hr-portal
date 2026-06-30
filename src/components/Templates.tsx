import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText, ExternalLink, Settings, X, Plus, Search,
  Trash2, HelpCircle, Check, Info, ChevronRight, Download, Eye, EyeOff
} from 'lucide-react';
import './Templates.css';

interface GoogleDocTemplate {
  id: string;
  name: string;
  docId: string;
  tabId?: string;
  category: string;
}

const DEFAULT_TEMPLATES: GoogleDocTemplate[] = [
  { id: 'memorandum', name: 'Memorandum', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.8g79cxhate5e', category: 'General' },
  { id: 'acknowledgement-assumption', name: 'Acknowledgement and Assumption', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.bkfhemroriw9', category: 'Employment' },
  { id: 'policy-template', name: 'Policy Template', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.so6j1s07um4', category: 'General' },
  { id: 'ip-termination-letter', name: 'IP: Termination Letter', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.0', category: 'Disciplinary' },
  { id: 'ip-proposal-univ', name: 'IP: Proposal - UNIV', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.85rfdft53bdg', category: 'Partnership' },
  { id: 'lifting-rendering-period', name: 'Lifting of rendering period', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.hbt5a06bmozs', category: 'Offboarding' },
  { id: 'ip-letter-intent', name: 'IP: Letter of Intent', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.qztij7jvdspn', category: 'Onboarding' },
  { id: 'intent-letter-vs', name: 'Intent Letter - VS', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.4dap9opg08wu', category: 'Onboarding' },
  { id: 'ip-letter-agreement', name: 'IP: Letter of Agreement', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.mzt983b3v9j5', category: 'Partnership' },
  { id: 'ip-acceptance-letter', name: 'IP: Acceptance Letter', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.mzt983b3v9j5', category: 'Partnership' },
  { id: 'ip-certificate-partnership', name: 'IP: Certificate of Partnership', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.yv3mju5y2ve', category: 'Partnership' },
  { id: 'ip-certification', name: 'IP: Certification', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.agkx92btur1d', category: 'Partnership' },
  { id: 'ip-internship-plan', name: 'IP: Internship Plan', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.ovovbzoqtcqt', category: 'Onboarding' },
  { id: 'ee-agreement-ca', name: 'EE: Agreement CA', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.5xe24kt381m2', category: 'Employment' },
  { id: 'recruitment', name: 'Recruitment', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.sfyuu1q7ty3h', category: 'Recruitment' },
  { id: 'nerf', name: 'NERF', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.74vadavupr9t', category: 'Onboarding' },
  { id: '201-logbook', name: '201 Logbook', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.ivznplubihoc', category: 'General' },
  { id: 'notice-separation', name: 'Notice of Separation', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.fd83bg2lvfn5', category: 'Disciplinary' },
  { id: 'employment-contract', name: 'Employment Contract', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.6bjc346kfq0p', category: 'Employment' },
  { id: 'coe', name: 'COE', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.qxy7x93eanuq', category: 'Employment' },
  { id: 'revenue', name: 'Revenue', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.d8w5tmltgi3b', category: 'Finance' },
  { id: 'recruitment-criteria', name: 'Recruitment Criteria', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.heauzkscizf9', category: 'Recruitment' },
  { id: 'kpi-kra', name: 'KPI KRA', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.73wf832dch6l', category: 'Performance' },
  { id: 'reception', name: 'Reception', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.qocdh3v6r3lh', category: 'General' },
  { id: 'exit-clearance', name: 'Exit Clearance', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.gf1pq2wn7w0r', category: 'Offboarding' },
  { id: 'exit-interview', name: 'Exit Interview', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.vvpmscsb3ow1', category: 'Offboarding' },
  { id: 'exit-interview-mkst', name: 'Exit Interview - MKST', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.cn5kxg9wj12', category: 'Offboarding' },
  { id: 'exit-interview-sr', name: 'Exit Interview - SR', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.jg4xzch61k4z', category: 'Offboarding' },
  { id: 'incident-report', name: 'Incident Report', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.tev471xeuur9', category: 'Disciplinary' },
  { id: 'nte', name: 'NTE', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.qb8odztq1nzk', category: 'Disciplinary' },
  { id: 'nod-nor', name: 'NOD/NOR', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.15svcq4uwwup', category: 'Disciplinary' },
  { id: 'copy-nod-nor', name: 'Copy of NOD/NOR', docId: '1WszrPsokKgeMIj_3jAYfjR6gAUZvZ3cxjdJThmSeB_c', tabId: 't.v95qcrk930ky', category: 'Disciplinary' }
];

function extractGoogleDocInfo(input: string): { docId: string | null; tabId: string | null } {
  const trimmed = input.trim();
  let docId: string | null = null;
  let tabId: string | null = null;

  try {
    const url = new URL(trimmed);
    const searchParams = url.searchParams;
    if (searchParams.has('tab')) {
      tabId = searchParams.get('tab');
    }
  } catch (e) {
    const tabMatch = trimmed.match(/[?&]tab=([a-zA-Z0-9-_.]+)/);
    if (tabMatch && tabMatch[1]) {
      tabId = tabMatch[1];
    }
  }

  if (/^[a-zA-Z0-9-_]{25,}$/.test(trimmed)) {
    docId = trimmed;
  } else {
    const match = trimmed.match(/\/document\/d\/([a-zA-Z0-9-_]{25,})/);
    if (match && match[1]) {
      docId = match[1];
    }
  }

  return { docId, tabId };
}

export default function Templates() {
  const [templates, setTemplates] = useState<GoogleDocTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('stlaf_google_docs_templates_v3');
      return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    return templates.length > 0 ? templates[0].id : '';
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);

  const [newDocName, setNewDocName] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('General');
  const [addError, setAddError] = useState('');

  const [editDocUrl, setEditDocUrl] = useState('');
  const [editDocName, setEditDocName] = useState('');
  const [editDocCategory, setEditDocCategory] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    localStorage.setItem('stlaf_google_docs_templates_v3', JSON.stringify(templates));
  }, [templates]);

  const activeTemplate = useMemo(() => {
    return templates.find(t => t.id === selectedTemplateId) || null;
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (activeTemplate) {
      setEditDocName(activeTemplate.name);
      setEditDocCategory(activeTemplate.category);
      const url = activeTemplate.tabId
        ? `https://docs.google.com/document/d/${activeTemplate.docId}/edit?tab=${activeTemplate.tabId}`
        : `https://docs.google.com/document/d/${activeTemplate.docId}/edit`;
      setEditDocUrl(url);
      setEditError('');
    }
  }, [activeTemplate]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    if (!newDocName.trim()) {
      setAddError('Document Name is required.');
      return;
    }

    const { docId, tabId } = extractGoogleDocInfo(newDocUrl);
    if (!docId) {
      setAddError('Invalid Google Doc URL or Document ID.');
      return;
    }

    const newTemplate: GoogleDocTemplate = {
      id: `custom-${Date.now()}`,
      name: newDocName.trim(),
      docId,
      tabId: tabId || undefined,
      category: newDocCategory
    };

    setTemplates(prev => [...prev, newTemplate]);
    setSelectedTemplateId(newTemplate.id);
    setNewDocName('');
    setNewDocUrl('');
    setNewDocCategory('General');
    setShowAddModal(false);
  };

  const handleExportPDF = async () => {
    if (!activeTemplate) return;

    // I-construct ang Google Docs export link
    const exportUrl = `https://docs.google.com/document/d/${activeTemplate.docId}/export?format=pdf${activeTemplate.tabId ? `&tab=${activeTemplate.tabId}` : ''
      }`;

    try {
      // I-fetch ang PDF data mula sa Google Docs
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('Network response was not ok');

      const blob = await response.blob();

      // Dito natin pinupwersa ang custom file name gamit ang File object
      const customFileName = `${activeTemplate.name}.pdf`;
      const file = new File([blob], customFileName, { type: 'application/pdf' });

      // Gumawa ng temporary URL para sa bagong file object
      const blobUrl = window.URL.createObjectURL(file);

      // Gumawa ng temporary anchor element para ma-trigger ang download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = customFileName;

      // I-execute ang download
      document.body.appendChild(link);
      link.click();

      // Linisin ang DOM at memory pagkatapos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      // Fallback: Kung magka-issue sa network, bubuksan na lang ito sa bagong tab
      window.open(exportUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!activeTemplate) return;

    if (!editDocName.trim()) {
      setEditError('Document Name is required.');
      return;
    }

    const { docId, tabId } = extractGoogleDocInfo(editDocUrl);
    if (!docId) {
      setEditError('Invalid Google Doc URL or Document ID.');
      return;
    }

    setTemplates(prev =>
      prev.map(t =>
        t.id === selectedTemplateId
          ? { ...t, name: editDocName.trim(), docId, tabId: tabId || undefined, category: editDocCategory }
          : t
      )
    );

    setShowEditPanel(false);
  };

  const handleDeleteTemplate = (idToDelete: string) => {
    if (confirm('Are you sure you want to delete this custom Google Doc template?')) {
      const remaining = templates.filter(t => t.id !== idToDelete);
      setTemplates(remaining);
      if (selectedTemplateId === idToDelete && remaining.length > 0) {
        setSelectedTemplateId(remaining[0].id);
      }
      setShowEditPanel(false);
    }
  };

  // Compute workspace iFrame source URL depending on whether the toolbar option is open
  const iframeSrc = useMemo(() => {
    if (!activeTemplate) return '';
    const endpoint = showToolbar ? 'edit' : 'preview';
    return activeTemplate.tabId
      ? `https://docs.google.com/document/d/${activeTemplate.docId}/${endpoint}?tab=${activeTemplate.tabId}`
      : `https://docs.google.com/document/d/${activeTemplate.docId}/${endpoint}`;
  }, [activeTemplate, showToolbar]);

  return (
    <div className="gdocs-templates-container">
      {/* SIDEBAR */}
      <aside className={`gdocs-sidebar ${showSidebar ? 'open' : 'collapsed'}`}>
        <div className="gdocs-sidebar-header">
          <div className="sidebar-title-wrapper">
            <FileText size={18} className="text-blue-500" />
            <span className="sidebar-title">HR Templates</span>
          </div>
          <button className="sidebar-close-button" onClick={() => setShowSidebar(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="gdocs-sidebar-body">
          <button className="add-doc-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Link Google Doc</span>
          </button>

          <div className="gdocs-search-container">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="gdocs-search-input"
            />
          </div>

          <div className="templates-list-section">
            <h4 className="section-label">All Templates ({filteredTemplates.length})</h4>
            <div className="templates-list">
              {filteredTemplates.length === 0 ? (
                <div className="no-templates-msg">No templates found</div>
              ) : (
                filteredTemplates.map(t => (
                  <button
                    key={t.id}
                    className={`template-list-item-btn ${selectedTemplateId === t.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedTemplateId(t.id);
                      setShowEditPanel(false);
                    }}
                  >
                    <FileText size={15} className="item-icon" />
                    <div className="item-details">
                      <span className="item-name">{t.name}</span>
                      <span className="item-category">{t.category}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <section className="gdocs-main-workspace">
        <header className="workspace-header">
          <div className="header-left">
            {!showSidebar && (
              <button className="menu-expand-btn" onClick={() => setShowSidebar(true)}>
                <FileText size={16} />
                <span>Show Templates</span>
                <ChevronRight size={14} />
              </button>
            )}
            {activeTemplate && (
              <div className="active-doc-info">
                <h1 className="active-doc-title">{activeTemplate.name}</h1>
                <span className="active-doc-badge">{activeTemplate.category}</span>
              </div>
            )}
          </div>

          <div className="header-actions">
            {activeTemplate && (
              <>
                {/* TOOLBAR SHOW AND HIDE BUTTON */}
                <button
                  className={`header-action-btn border-btn ${showToolbar ? 'active-toolbar-btn' : ''}`}
                  onClick={() => setShowToolbar(!showToolbar)}
                  title={showToolbar ? "Hide Google Docs toolbar" : "Show Google Docs toolbar"}
                >
                  {showToolbar ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showToolbar ? "Hide Toolbar" : "Show Toolbar"}</span>
                </button>

                {/* EXPORT PDF BUTTON */}
                <button
                  onClick={handleExportPDF}
                  className="header-action-btn border-btn cursor-pointer pdf-export-navy-btn"
                  title="Export this document to PDF format"
                >
                  <Download size={14} />
                  <span>Export PDF</span>
                </button>

                <a
                  href={activeTemplate.tabId
                    ? `https://docs.google.com/document/d/${activeTemplate.docId}/edit?tab=${activeTemplate.tabId}`
                    : `https://docs.google.com/document/d/${activeTemplate.docId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-action-btn border-btn cursor-pointer"
                  title="Open in official Google Docs website"
                >
                  <ExternalLink size={14} />
                  <span>Open GDocs</span>
                </a>
                <button className="header-action-btn primary-btn-gold" onClick={() => setShowEditPanel(true)}>
                  <Settings size={14} />
                </button>
              </>
            )}
            <button
              className={`header-action-btn info-btn ${showGuide ? 'active' : ''}`}
              onClick={() => setShowGuide(!showGuide)}
              title="Show integration tutorial"
            >
              <HelpCircle size={15} />
            </button>
          </div>
        </header>

        {/* WORK AREA */}
        <div className="workspace-body">
          <div className="workspace-layout">
            <div className="iframe-pane">
              {activeTemplate ? (
                <div className="iframe-wrapper">
                  <iframe
                    key={iframeSrc}
                    src={iframeSrc}
                    title={activeTemplate.name}
                    className="google-doc-iframe"
                    allow="autoplay"
                  />
                </div>
              ) : (
                <div className="empty-state-card">
                  <FileText size={48} className="empty-icon text-slate-300" />
                  <h3>No Google Doc Linked</h3>
                  <p>Please select a template from the sidebar or link a custom Google Doc to get started.</p>
                  <button className="add-doc-btn mt-4 inline-flex" onClick={() => setShowAddModal(true)}>
                    <Plus size={16} />
                    <span>Link Google Doc</span>
                  </button>
                </div>
              )}
            </div>

            {/* INTEGRATION GUIDE PANEL */}
            {showGuide && (
              <div className="integration-guide-pane">
                <div className="guide-card">
                  <div className="guide-header">
                    <Info size={16} className="text-yellow-500" />
                    <h4>Integration Instructions</h4>
                    <button className="guide-close-btn" onClick={() => setShowGuide(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="guide-content">
                    <p className="guide-lead">Make your Google Docs interactive inside the HR Portal in 3 easy steps:</p>
                    <ol className="guide-steps">
                      <li>
                        <strong>Create or Select a Doc:</strong> Write your template inside Google Docs.
                      </li>
                      <li>
                        <strong>Configure Sharing Access:</strong>
                        <ul>
                          <li>In Google Docs, click the blue <strong>Share</strong> button at the top-right.</li>
                          <li>Under <em>General access</em>, change <strong>"Restricted"</strong> to <strong>"Anyone with the link"</strong>.</li>
                          <li>Set the role to <strong>"Editor"</strong> to edit docs inside the portal, or <strong>"Viewer"</strong> for read-only templates.</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Paste the Link in Portal:</strong>
                        <ul>
                          <li>Copy the sharing URL from your browser or Google Docs share dialog.</li>
                          <li>Click <strong>Setting icon</strong> in the top header.</li>
                          <li>Paste the URL/ID and save. Your template is now fully integrated!</li>
                        </ul>
                      </li>
                    </ol>
                    <div className="guide-note">
                      <Check size={14} className="text-green-500 mr-1.5 flex-shrink-0" />
                      <span>Changes made inside the embedded Google Doc auto-save instantly to your Google Drive!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* EDIT TEMPLATE MODAL */}
      {showEditPanel && activeTemplate && (
        <div className="modal-overlay" onClick={() => setShowEditPanel(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure Google Doc Integration</h3>
              <button className="modal-close-btn" onClick={() => setShowEditPanel(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleUpdateTemplate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Template Title</label>
                <input
                  type="text"
                  value={editDocName}
                  onChange={e => setEditDocName(e.target.value)}
                  className="form-input"
                  placeholder="Exit Clearance Form..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={editDocCategory}
                  onChange={e => setEditDocCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="General">General</option>
                  <option value="Employment">Employment</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Offboarding">Offboarding</option>
                  <option value="Disciplinary">Disciplinary</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Performance">Performance</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Google Doc URL or Document ID</label>
                <input
                  type="text"
                  value={editDocUrl}
                  onChange={e => setEditDocUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://docs.google.com/document/d/..."
                />
                <span className="form-help-text">
                  Paste the full sharing URL (including tab query parameters) or the alphanumeric ID.
                </span>
              </div>

              {editError && <div className="form-error-msg">{editError}</div>}

              <div className="modal-footer">
                {selectedTemplateId.startsWith('custom-') ? (
                  <button
                    type="button"
                    className="delete-template-btn"
                    onClick={() => handleDeleteTemplate(selectedTemplateId)}
                  >
                    <Trash2 size={14} />
                    <span>Delete Template</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="footer-actions-right">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowEditPanel(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="save-btn-gold">
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LINK NEW DOCUMENT MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Link a New Google Doc Template</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTemplate} className="modal-form">
              <div className="form-group">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  value={newDocName}
                  onChange={e => setNewDocName(e.target.value)}
                  className="form-input"
                  placeholder="e.g. Employee Handbook, Welcome Letter"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={newDocCategory}
                  onChange={e => setNewDocCategory(e.target.value)}
                  className="form-select"
                >
                  <option value="General">General</option>
                  <option value="Employment">Employment</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Offboarding">Offboarding</option>
                  <option value="Disciplinary">Disciplinary</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Performance">Performance</option>
                  <option value="Recruitment">Recruitment</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Google Doc URL or Document ID</label>
                <input
                  type="text"
                  value={newDocUrl}
                  onChange={e => setNewDocUrl(e.target.value)}
                  className="form-input"
                  placeholder="https://docs.google.com/document/d/..."
                />
                <span className="form-help-text">
                  Supports pasting full URLs with `?tab=t.xxxx` parameters to link specific document tabs.
                </span>
              </div>

              {addError && <div className="form-error-msg">{addError}</div>}

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn-gold">
                  Link Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}