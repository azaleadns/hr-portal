import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Eye,
  Edit3,
  Settings2,
  RotateCcw,
  FileText,
  Info,
  X,
  Scale,
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Plus,
  Tag,
  Strikethrough,
  GitBranch
} from 'lucide-react';
import './Templates.css';

import { TEMPLATES_DATA, TemplateDef } from '../data/templatesData';

export default function Templates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    TEMPLATES_DATA[0]?.id || 'memo_fixed_assets'
  );
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [showConditionMenu, setShowConditionMenu] = useState(false);

  // Professional options
  const [themeFont, setThemeFont] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState('12px');
  const [showMarginGuide, setShowMarginGuide] = useState(true);
  const [showOfficeHeader, setShowOfficeHeader] = useState(true);

  // Form editable variables
  const [candidateName, setCandidateName] = useState('Elena Santos');
  const [position, setPosition] = useState('Junior Associate Counsel');
  const [department, setDepartment] = useState('Human Resources');
  const [startDate, setStartDate] = useState('2026-06-15');
  const [salary, setSalary] = useState('45,000.00');
  const [allowance, setAllowance] = useState('5,000.00');
  const [responseDeadline, setResponseDeadline] = useState('2026-06-12');
  const [supervisingOfficer, setSupervisingOfficer] = useState('Atty. Kathrina Mishael Sadsad-Tamesis');
  const [executionPlace, setExecutionPlace] = useState('777 Emerald Avenue, Ortigas, Pasig City');
  const [terminationNotice, setTerminationNotice] = useState('30 Days');

  // Custom user overrides for templates (per template ID)
  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('stlaf_custom_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load custom templates', e);
      }
    }
    return {};
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const currentTemplate = useMemo(() => {
    return TEMPLATES_DATA.find(t => t.id === selectedTemplateId) || TEMPLATES_DATA[0];
  }, [selectedTemplateId]);

  // Helper to convert plain text to HTML
  const formatTextToHtml = (text: string) => {
    if (!text) return '';
    if (
      text.includes('<span class="live-token"') ||
      text.includes('<span class="condition-token"') ||
      text.includes('</div>') ||
      text.includes('</p>') ||
      text.includes('<br>')
    ) {
      return text;
    }
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');

    html = html.replace(/\{([a-zA-Z0-9_]+)\}/g, (match) => {
      return `<span class="live-token" contenteditable="false">${match}</span>`;
    });

    return html;
  };

  const currentHtmlText = useMemo(() => {
    const raw = customDrafts[selectedTemplateId] !== undefined
      ? customDrafts[selectedTemplateId]
      : currentTemplate.defaultText;
    return formatTextToHtml(raw);
  }, [selectedTemplateId, customDrafts, currentTemplate]);

  // When selected template changes, load into innerHTML
  useEffect(() => {
    if (editorRef.current && !isPreview) {
      editorRef.current.innerHTML = currentHtmlText;
    }
  }, [selectedTemplateId, currentHtmlText, isPreview]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      const updated = { ...customDrafts, [selectedTemplateId]: newHtml };
      setCustomDrafts(updated);
      localStorage.setItem('stlaf_custom_templates', JSON.stringify(updated));
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
      }
    }
  };

  // Compute date once or maintain UTC
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, []);

  // Filter templates list based on search
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return TEMPLATES_DATA;
    const term = searchTerm.toLowerCase();
    return TEMPLATES_DATA.filter(
      t => t.name.toLowerCase().includes(term) || t.subject.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Compiled HTML representation
  const compiledHtml = useMemo(() => {
    let res = currentHtmlText;

    const getFieldValue = (field: string) => {
      switch (field) {
        case 'candidateName': return candidateName;
        case 'position': return position;
        case 'department': return department;
        case 'startDate': return startDate;
        case 'salary': return salary;
        case 'allowance': return allowance;
        case 'responseDeadline': return responseDeadline;
        case 'supervisingOfficer': return supervisingOfficer;
        case 'executionPlace': return executionPlace;
        case 'terminationNotice': return terminationNotice;
        case 'Date': return todayFormatted;
        case 'AuthorName': return supervisingOfficer;
        case 'DepartmentName': return department;
        case 'currentDate': return todayFormatted;
        default: return '';
      }
    };

    // 1. Evaluate conditional blocks
    const condSpanRegex = /<span[^>]*class="[^"]*condition-token[^"]*"[^>]*>\{if\s+([a-zA-Z0-9_]+)\s*(==|!=|&gt;|&lt;|>|<)\s*["&quot;]([^"&quot;]*?)["&quot;]\}<\/span>([\s\S]*?)<span[^>]*class="[^"]*condition-token[^"]*"[^>]*>\{endif\}<\/span>/gi;
    res = res.replace(condSpanRegex, (match, field, operator, value, content) => {
      const fieldValue = getFieldValue(field);
      let conditionMet = false;
      const op = operator.replace('&gt;', '>').replace('&lt;', '<');
      const val = value.trim();
      const fVal = fieldValue.trim();

      if (op === '==') {
        conditionMet = (fVal.toLowerCase() === val.toLowerCase());
      } else if (op === '!=') {
        conditionMet = (fVal.toLowerCase() !== val.toLowerCase());
      } else if (op === '>') {
        conditionMet = (parseFloat(fVal) > parseFloat(val));
      } else if (op === '<') {
        conditionMet = (parseFloat(fVal) < parseFloat(val));
      }
      return conditionMet ? content : '';
    });

    const condRawRegex = /\{if\s+([a-zA-Z0-9_]+)\s*(==|!=|&gt;|&lt;|>|<)\s*"([^"]*)"\}([\s\S]*?)\{endif\}/gi;
    res = res.replace(condRawRegex, (match, field, operator, value, content) => {
      const fieldValue = getFieldValue(field);
      let conditionMet = false;
      const op = operator.replace('&gt;', '>').replace('&lt;', '<');
      const val = value.trim();
      const fVal = fieldValue.trim();

      if (op === '==') {
        conditionMet = (fVal.toLowerCase() === val.toLowerCase());
      } else if (op === '!=') {
        conditionMet = (fVal.toLowerCase() !== val.toLowerCase());
      } else if (op === '>') {
        conditionMet = (parseFloat(fVal) > parseFloat(val));
      } else if (op === '<') {
        conditionMet = (parseFloat(fVal) < parseFloat(val));
      }
      return conditionMet ? content : '';
    });

    // 2. Replace live tokens
    const replaceToken = (tokenName: string, val: string) => {
      const displayVal = val || '________________';
      const spanPattern = new RegExp(`<span[^>]*class="[^"]*live-token[^"]*"[^>]*>{${tokenName}}<\/span>`, 'gi');
      res = res.replace(spanPattern, displayVal);
      const rawPattern = new RegExp(`{${tokenName}}`, 'gi');
      res = res.replace(rawPattern, displayVal);
    };

    replaceToken('candidateName', candidateName);
    replaceToken('position', position);
    replaceToken('department', department);
    replaceToken('startDate', startDate);
    replaceToken('salary', salary);
    replaceToken('allowance', allowance);
    replaceToken('responseDeadline', responseDeadline);
    replaceToken('supervisingOfficer', supervisingOfficer);
    replaceToken('executionPlace', executionPlace);
    replaceToken('terminationNotice', terminationNotice);
    replaceToken('Date', todayFormatted);
    replaceToken('AuthorName', supervisingOfficer);
    replaceToken('DepartmentName', department);
    replaceToken('currentDate', todayFormatted);

    return res;
  }, [
    currentHtmlText,
    candidateName,
    position,
    department,
    startDate,
    salary,
    allowance,
    responseDeadline,
    supervisingOfficer,
    executionPlace,
    terminationNotice,
    todayFormatted
  ]);

  // Statistics compiled plain text
  const compiledText = useMemo(() => {
    let text = compiledHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '');
    text = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return text;
  }, [compiledHtml]);

  // Statistics
  const textStats = useMemo(() => {
    const rawLen = compiledText.length;
    const wordCount = compiledText.trim() === "" ? 0 : compiledText.trim().split(/\s+/).length;
    return { chars: rawLen, words: wordCount };
  }, [compiledText]);

  // Copy text to clipboard
  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  // Export PDF execution using jsPDF and html2canvas
  const handleExportPdf = async () => {
    const element = document.querySelector('.paper-sheet');
    if (!element) return;
    const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    // Use the template name or subject as the PDF filename, sanitized
    const safeName = (currentTemplate.name || currentTemplate.subject || 'template')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();
    pdf.save(`${safeName}.pdf`);
  };

  // Reset current template state
  const handleReset = () => {
    if (window.confirm('Are you sure you want to revert the current template to defaults? This will erase custom inline modifications.')) {
      const updated = { ...customDrafts };
      delete updated[selectedTemplateId];
      setCustomDrafts(updated);
      localStorage.setItem('stlaf_custom_templates', JSON.stringify(updated));
    }
  };

  // Insert standard token tag at cursor position
  const injectToken = (token: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) {
      if (editorRef.current) {
        const span = document.createElement('span');
        span.className = 'live-token';
        span.textContent = token;
        span.setAttribute('contenteditable', 'false');
        editorRef.current.appendChild(span);
        handleEditorInput();
      }
      return;
    }

    const span = document.createElement('span');
    span.className = 'live-token';
    span.textContent = token;
    span.setAttribute('contenteditable', 'false');

    range.deleteContents();
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.setStartAfter(span);
    newRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(newRange);

    saveSelection();
    handleEditorInput();
  };

  const applySelectionStyle = (cssProperty: string, value: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    if (!selection || !selection.rangeCount) return;

    if (cssProperty === 'bold') {
      document.execCommand('bold', false);
    } else if (cssProperty === 'italic') {
      document.execCommand('italic', false);
    } else if (cssProperty === 'underline') {
      document.execCommand('underline', false);
    } else if (cssProperty === 'strikethrough') {
      document.execCommand('strikeThrough', false);
    } else if (cssProperty === 'alignment') {
      document.execCommand(value, false);
    } else if (cssProperty === 'color') {
      document.execCommand('foreColor', false, value);
    } else if (cssProperty === 'fontName') {
      document.execCommand('fontName', false, value);
    } else if (cssProperty === 'fontSize') {
      document.execCommand('fontSize', false, value);
    }

    saveSelection();
    handleEditorInput();
  };

  const insertCondition = (field: string, operator: string, value: string) => {
    const condStart = `{if ${field} ${operator} "${value}"}`;
    const condEnd = `{endif}`;

    if (editorRef.current) {
      editorRef.current.focus();
    }
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
    }

    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (!range) {
      if (editorRef.current) {
        const startSpan = document.createElement('span');
        startSpan.className = 'condition-token';
        startSpan.textContent = condStart;
        startSpan.setAttribute('contenteditable', 'false');

        const endSpan = document.createElement('span');
        endSpan.className = 'condition-token';
        endSpan.textContent = condEnd;
        endSpan.setAttribute('contenteditable', 'false');

        const textNode = document.createTextNode(' Conditional Content ');

        editorRef.current.appendChild(startSpan);
        editorRef.current.appendChild(textNode);
        editorRef.current.appendChild(endSpan);
        handleEditorInput();
      }
      return;
    }

    const startSpan = document.createElement('span');
    startSpan.className = 'condition-token';
    startSpan.textContent = condStart;
    startSpan.setAttribute('contenteditable', 'false');

    const endSpan = document.createElement('span');
    endSpan.className = 'condition-token';
    endSpan.textContent = condEnd;
    endSpan.setAttribute('contenteditable', 'false');

    if (range.collapsed) {
      const textNode = document.createTextNode(' Conditional Content ');
      range.insertNode(endSpan);
      range.insertNode(textNode);
      range.insertNode(startSpan);

      const newRange = document.createRange();
      newRange.setStart(textNode, 0);
      newRange.setEnd(textNode, textNode.length);
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    } else {
      const content = range.extractContents();
      range.insertNode(endSpan);
      range.insertNode(content);
      range.insertNode(startSpan);

      const newRange = document.createRange();
      newRange.setStartAfter(endSpan);
      newRange.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    }

    saveSelection();
    handleEditorInput();
  };

  const selectedFontClass = () => {
    switch (themeFont) {
      case 'serif': return 'font-serif-editor';
      case 'mono': return 'font-mono-editor';
      case 'sans': return 'font-sans-editor';
      default: return 'font-serif-editor';
    }
  };

  return (
    <div className={`templates-container ${isFullscreen ? 'fullscreen-mode-active' : ''}`} id="templates-root-view">

      {/* Search & Selection Sidebar */}
      <aside className={`workspace-sidebar no-print ${showSidebar ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header-custom">
          <div className="sidebar-brand-title">

            <span>Document Control</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={() => setShowSidebar(false)}
            title="Collapse Control Sidebar"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sidebar-scrollable-content">

          {/* Search Field */}
          <div className="sidebar-group">
            <label className="sidebar-group-title">Search Templates</label>
            <div className="search-box-container">
              <Search size={14} className="search-icon-inside" />
              <input
                type="text"
                className="search-sidebar-input"
                placeholder="Search 24 templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Selection List */}
          <div className="sidebar-group">
            <label className="sidebar-group-title">Select Template ({filteredTemplates.length})</label>
            <div className="templates-list-scrollable">
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  className={`template-list-item ${selectedTemplateId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplateId(t.id)}
                >
                  <FileText size={14} className="file-icon" />
                  <div className="item-txt-meta">
                    <span className="item-title">{t.name}</span>
                    <span className="item-sub">{t.subject.substring(0, 42)}...</span>
                  </div>
                </button>
              ))}
              {filteredTemplates.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-6">No matching templates.</div>
              )}
            </div>
          </div>

        </div>
      </aside>

      {/* Main workspace section with Sticky Header & Parchment layout */}
      <section className="workspace-main" id="templates-workspace-main">

        {/* Sticky Action Controls Header */}
        <header className="sticky-action-controls no-print flex flex-col gap-3" id="sticky-header">
          {/* Top Row: Title & Action Buttons */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {!showSidebar && (
                <button
                  className="icon-control-btn mr-3"
                  onClick={() => setShowSidebar(true)}
                  title="Expand Control Panel"
                >
                  <Settings2 size={15} />
                </button>
              )}
              <h1 className="page-title text-base font-bold text-slate-800 tracking-tight">
                Edit a Template
              </h1>
            </div>

            <div className="right-controls-row flex items-center gap-2">
              <button
                className={`icon-control-btn toggle-preview-btn ${isPreview ? 'premium-purple-active' : ''}`}
                onClick={() => setIsPreview(!isPreview)}
                title={isPreview ? "Switch to editing mode" : "Preview completed document paper"}
              >
                {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                <span>{isPreview ? 'Edit Draft' : 'Preview'}</span>
              </button>

              <button
                className="action-pill-btn-gold"
                onClick={handleExportPdf}
                title="Export PDF"
              >
                <Printer size={14} />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Rich Text Styling & Token/Condition Dropdowns (Visible in Edit Mode only) */}
          {!isPreview && (
            <div className="flex flex-col gap-2 w-full pt-1.5 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full mt-2">

                {/* Font Size Selection */}
                <div className="flex items-center justify-center h-8 px-2.5 bg-white border border-slate-200 rounded-md shadow-sm toolbar-section">
                  <span className="text-[10px] font-bold text-slate-400 mr-1.5">Size</span>
                  <select
                    className="size-select-input text-xs bg-transparent border-none outline-none font-semibold text-slate-700 cursor-pointer"
                    value={fontSize}
                    onChange={(e) => { setFontSize(e.target.value); applySelectionStyle('fontSize', e.target.value); }}
                    title="Font Size"
                  >
                    <option value="10px">10px</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="22px">22px</option>
                    <option value="24px">24px</option>
                  </select>
                </div>

                {/* Text Styling (Bold, Italic, Underline, Strikethrough) */}
                <div className="flex items-center h-8 bg-white border border-slate-200 rounded-md shadow-sm px-1 toolbar-section">
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors font-bold"
                    onClick={() => applySelectionStyle('bold', '')}
                    title="Bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors italic"
                    onClick={() => applySelectionStyle('italic', '')}
                    title="Italic"
                  >
                    <Italic size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors underline"
                    onClick={() => applySelectionStyle('underline', '')}
                    title="Underline"
                  >
                    <Underline size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors line-through"
                    onClick={() => applySelectionStyle('strikethrough', '')}
                    title="Strikethrough"
                  >
                    <Strikethrough size={13} />
                  </button>
                </div>

                {/* Text Alignment */}
                <div className="flex items-center h-8 bg-white border border-slate-200 rounded-md shadow-sm px-1 toolbar-section">
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={() => applySelectionStyle('alignment', 'justifyLeft')}
                    title="Align Left"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={() => applySelectionStyle('alignment', 'justifyCenter')}
                    title="Align Center"
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={() => applySelectionStyle('alignment', 'justifyRight')}
                    title="Align Right"
                  >
                    <AlignRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="toolbar-btn p-1 text-slate-600 hover:text-slate-900 transition-colors"
                    onClick={() => applySelectionStyle('alignment', 'justifyFull')}
                    title="Justify"
                  >
                    <AlignJustify size={13} />
                  </button>
                </div>

                {/* Dynamic Tags Dropdown */}
                <div className="relative ml-auto">
                  <button
                    type="button"
                    className="icon-control-btn h-8 px-5 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold flex items-center gap-2"
                    onClick={() => setShowTagsMenu(!showTagsMenu)}
                    title="Quick Insert Tokens"
                  >
                    <Tag size={12} className="text-slate-400" />
                    <span>{`{Date}, {AuthorName}, {DepartmentName}`}</span>
                    <ChevronDown size={11} className="text-slate-400" />
                  </button>

                  {showTagsMenu && (
                    /* CHANGED: Changed right-0 to right-2 (pulls it away from the screen edge) and w-60 to w-64 (gives it more horizontal breathing room) */
                    <div className="absolute top-full right-0 ml-12 mt-1.5 w-40 bg-white border border-slate-200  shadow-lg z-50 py-1.5 px-2 max-h-60 overflow-y-auto">
                      <div className="text-[10px] pl-2 font-bold uppercase tracking-wider text-slate-400 px-3 py-1 border-b border-slate-100">Requested Tokens</div>

                      {/* ADDED: whitespace-nowrap to all text buttons below so the tokens never squeeze or break into lines */}
                      <button type="button" onClick={() => { injectToken('{Date}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap">{`{Date}`}</button>
                      <button type="button" onClick={() => { injectToken('{AuthorName}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap">{`{AuthorName}`}</button>
                      <button type="button" onClick={() => { injectToken('{DepartmentName}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap">{`{DepartmentName}`}</button>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 border-t border-b border-slate-100 mt-1">Variables</div>
                      <button type="button" onClick={() => { injectToken('{candidateName}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{candidateName}`}</button>
                      <button type="button" onClick={() => { injectToken('{position}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{position}`}</button>
                      <button type="button" onClick={() => { injectToken('{department}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{department}`}</button>
                      <button type="button" onClick={() => { injectToken('{startDate}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{startDate}`}</button>
                      <button type="button" onClick={() => { injectToken('{salary}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{salary}`}</button>
                      <button type="button" onClick={() => { injectToken('{allowance}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{allowance}`}</button>
                      <button type="button" onClick={() => { injectToken('{responseDeadline}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{responseDeadline}`}</button>
                      <button type="button" onClick={() => { injectToken('{supervisingOfficer}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{supervisingOfficer}`}</button>
                      <button type="button" onClick={() => { injectToken('{executionPlace}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{executionPlace}`}</button>
                      <button type="button" onClick={() => { injectToken('{terminationNotice}'); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs text-slate-600 whitespace-nowrap">{`{terminationNotice}`}</button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </header>

        {/* Paper Parchment Stage Area */}
        <div className="parchment-desk-stage">
          <div className={`paper-sheet ${selectedFontClass()} ${showMarginGuide ? 'margin-line-active' : ''}`}>

            {/* STLAF Header */}
            {showOfficeHeader && (
              <div className="stlaf-header-container">
                <div className="logo-section">
                  <img src="/MAIN.png" alt="STLAF Logo" className="logo-image" />
                </div>
                <div className="contact-section">
                  <p className="contact-item">7F, Victoria Sports Tower,<br />EDSA, South Triangle, Quezon City</p>
                  <p className="contact-item">legal@sadsadtamesislaw.com</p>
                  <p className="contact-item">(02) 8463-4941 / 0948-961-2397</p>
                </div>
              </div>
            )}

            {/* Subject/Title banner */}
            <h2 className="legal-document-heading">
              {currentTemplate.subject}
            </h2>

            {/* Document core body text area */}
            <div className="legal-document-editor-container">
              {isPreview ? (
                // PREVIEW MODE: Stripped distraction-free pure reading sheet
                <div
                  className="compiled-preview-paper text-justify whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: compiledHtml }}
                />
              ) : (
                // EDITING MODE: Native responsive writing draft
                <div className="relative w-full h-full flex flex-col">
                  <div
                    id="document-editor"
                    ref={editorRef}
                    contentEditable={true}
                    onInput={handleEditorInput}
                    onBlur={saveSelection}
                    onMouseUp={saveSelection}
                    onKeyUp={saveSelection}
                    className="document-drafting-editor flex-1 w-full"
                    style={{ outline: 'none', minHeight: '550px' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
