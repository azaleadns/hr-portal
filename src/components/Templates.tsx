import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import {
  Printer,
  ChevronDown,
  Eye,
  Edit3,
  Settings2,
  FileText,
  X,
  Search,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Tag,
  Strikethrough,
  Type,
  List,
  ListOrdered,
  Image,
  Table,
  Undo2,
  Palette,
  Highlighter,
  Indent,
  Loader2
} from 'lucide-react';
import './Templates.css';

const DOCX_TEMPLATES = [
  { id: 'Exit Clearance', name: 'Exit Clearance', fileName: 'Exit Clearance.docx' },
  { id: 'Exit Interview - MKST', name: 'Exit Interview - MKST', fileName: 'Exit Interview - MKST.docx' },
  { id: 'Exit Interview - SR', name: 'Exit Interview - SR', fileName: 'Exit Interview - SR.docx' },
  { id: 'Exit Interview', name: 'Exit Interview', fileName: 'Exit Interview.docx' },
  { id: '201 Logbook', name: '201 Logbook', fileName: '201 Logbook.docx' },
  { id: 'ACKNOWLEDGMENT AND ASSUMPTION OF RESPONSIBILITY', name: 'ACKNOWLEDGMENT AND ASSUMPTION OF RESPONSIBILITY', fileName: 'ACKNOWLEDGMENT AND ASSUMPTION OF RESPONSIBILITY.docx' },
  { id: 'Certificate of Employment (COE)', name: 'Certificate of Employment (COE)', fileName: 'COE.docx' },
  { id: 'Notice of Decision (NOD - Alternative Copy)', name: 'Notice of Decision (NOD - Alternative Copy)', fileName: 'Copy of NOD_NOR.docx' },
  { id: 'EE: Agreement CA', name: 'EE: Agreement CA', fileName: 'EE_ Agreement CA.docx' },
  { id: 'Employment Contract', name: 'Employment Contract', fileName: 'Employment Contract.docx' },
  { id: 'IP_ Proposal - UNIV', name: 'IP_ Proposal - UNIV', fileName: 'IP_ Proposal - UNIV.docx' },
  { id: 'IP_ Termination Letter', name: 'IP_ Termination Letter', fileName: 'IP_ Termination Letter.docx' },
  { id: 'Incident Report', name: 'Incident Report', fileName: 'Incident Report.docx' },
  { id: 'Intent Letter - VS', name: 'Intent Letter - VS', fileName: 'Intent Letter - VS.docx' },
  { id: 'IP_ Acceptance Letter', name: 'IP_ Acceptance Letter', fileName: 'IP_ Acceptance Letter.docx' },
  { id: 'IP_ Certificate of Partnership', name: 'IP_ Certificate of Partnership', fileName: 'IP_ Certificate of Partnership.docx' },
  { id: 'IP_ Certification', name: 'IP_ Certification', fileName: 'IP_ Certification.docx' },
  { id: 'IP_ Internship Plan', name: 'IP_ Internship Plan', fileName: 'IP_ Internship Plan.docx' },
  { id: 'IP_ Letter of Agreement', name: 'IP_ Letter of Agreement', fileName: 'IP_ Letter of Agreement.docx' },
  { id: 'IP_ Letter of Intent', name: 'IP_ Letter of Intent', fileName: 'IP_ Letter of Intent.docx' },
  { id: 'MEMORANDUM', name: 'MEMORANDUM', fileName: 'MEMORANDUM.docx' },
  { id: 'NERF', name: 'NERF', fileName: 'NERF.docx' },
  { id: 'Notice of Decision / Resolution (NOD)', name: 'Notice of Decision / Resolution (NOD)', fileName: 'NOD_NOR.docx' },
  { id: 'Notice of Separation', name: 'Notice of Separation', fileName: 'Notice of Separation.docx' },
  { id: 'Notice to Explain (NTE)', name: 'Notice to Explain (NTE)', fileName: 'NTE.docx' },
  { id: 'POLICY TEMPLATE', name: 'POLICY TEMPLATE', fileName: 'POLICY TEMPLATE.docx' },
  { id: 'Reception', name: 'Reception', fileName: 'Reception.docx' },
  { id: 'Recruitment Criteria', name: 'Recruitment Criteria', fileName: 'Recruitment Criteria.docx' },
  { id: 'KPI KRA', name: 'KPI KRA', fileName: 'KPI KRA.docx' },
  { id: 'LIFTING OF RENDERING PERIOD', name: 'LIFTING OF RENDERING PERIOD', fileName: 'LIFTING OF RENDERING PERIOD.docx' },
  { id: 'Recruitment', name: 'Recruitment', fileName: 'Recruitment.docx' },
  { id: 'Revenue', name: 'Revenue', fileName: 'Revenue.docx' }
];

const COMMON_FONTS = [
  { label: 'Arial', value: "Arial, sans-serif" },
  { label: 'Barlow', value: "'Barlow', sans-serif" },
  { label: 'Book Antiqua', value: "'Book Antiqua', Palatino, 'Palatino Linotype', serif" },
  { label: 'Calibri', value: "Calibri, sans-serif" },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Source Serif Pro', value: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" }
];

const FONT_SIZES = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24'];

const VARIABLE_REGISTRY = [
  { token: '{EmployeeName}', display: 'Employee Full Name' },
  { token: '{Position}', display: 'Official Job Position' },
  { token: '{UniversityName}', display: 'University / Institution' },
  { token: '{IncidentDetails}', display: 'Incident Narrative Block' },
  { token: '{EffectivityDate}', display: 'Effectivity / Release Date' },
  { token: '{AuthorizedSignatory}', display: 'Authorized Signatory' },
  { token: '{SalaryRate}', display: 'Salary / Compensation Rate' },
  { token: '{DepartmentName}', display: 'Assigned Department' }
];

// US Legal Standard dimensions at 96 DPI
const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1248;
const PAPER_PADDING = 72;
const BOTTOM_MARGIN_BUFFER = 72;

const HEADER_HEIGHT = 110;

const CONTENT_HEIGHT_FIRST_PAGE = PAPER_HEIGHT - (PAPER_PADDING * 2) - HEADER_HEIGHT - BOTTOM_MARGIN_BUFFER;
const CONTENT_HEIGHT_SUBSEQUENT = PAPER_HEIGHT - (PAPER_PADDING * 2) - BOTTOM_MARGIN_BUFFER;

function paginateHtml(html: string, headerOnFirstOnly: boolean = true): string[] {
  const measurer = document.createElement('div');
  measurer.className = 'pagination-measurer compiled-preview-paper-scoping';
  measurer.style.position = 'absolute';
  measurer.style.left = '-9999px';
  measurer.style.top = '-9999px';
  measurer.style.visibility = 'hidden';
  measurer.style.width = `${PAPER_WIDTH - PAPER_PADDING * 2}px`;
  measurer.innerHTML = html;
  document.body.appendChild(measurer);

  const pages: string[] = [];
  let currentPageHtml = '';
  let currentMaxHeight = headerOnFirstOnly ? CONTENT_HEIGHT_FIRST_PAGE : CONTENT_HEIGHT_SUBSEQUENT;

  const children = Array.from(measurer.children) as HTMLElement[];

  if (children.length === 0) {
    document.body.removeChild(measurer);
    return [html];
  }

  const singleMeasurer = document.createElement('div');
  singleMeasurer.className = 'pagination-measurer compiled-preview-paper-scoping';
  singleMeasurer.style.position = 'absolute';
  singleMeasurer.style.left = '-9999px';
  singleMeasurer.style.top = '-9999px';
  singleMeasurer.style.visibility = 'hidden';
  singleMeasurer.style.width = `${PAPER_WIDTH - PAPER_PADDING * 2}px`;
  document.body.appendChild(singleMeasurer);

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.tagName === 'TABLE') {
      const rows = Array.from(child.querySelectorAll('tr')) as HTMLTableRowElement[];
      let tableAttributes = '';
      for (let attr of Array.from(child.attributes)) {
        tableAttributes += ` ${attr.name}="${attr.value}"`;
      }

      let currentTableRowsHtml = '';

      for (let j = 0; j < rows.length; j++) {
        const rowHtml = rows[j].outerHTML;
        const testTableHtml = `<table${tableAttributes}><tbody>${currentTableRowsHtml + rowHtml}</tbody></table>`;

        singleMeasurer.innerHTML = currentPageHtml + testTableHtml;
        const totalH = singleMeasurer.scrollHeight;

        if (totalH > currentMaxHeight) {
          if (currentTableRowsHtml === '' && currentPageHtml === '') {
            currentTableRowsHtml += rowHtml;
          } else {
            if (currentTableRowsHtml !== '') {
              currentPageHtml += `<table${tableAttributes}><tbody>${currentTableRowsHtml}</tbody></table>`;
            }
            pages.push(currentPageHtml);

            currentMaxHeight = CONTENT_HEIGHT_SUBSEQUENT;
            currentPageHtml = '';
            currentTableRowsHtml = rowHtml;
          }
        } else {
          currentTableRowsHtml += rowHtml;
        }
      }

      if (currentTableRowsHtml !== '') {
        currentPageHtml += `<table${tableAttributes}><tbody>${currentTableRowsHtml}</tbody></table>`;
      }
    } else {
      singleMeasurer.innerHTML = currentPageHtml + child.outerHTML;
      const totalH = singleMeasurer.scrollHeight;

      if (totalH > currentMaxHeight && currentPageHtml !== '') {
        pages.push(currentPageHtml);
        currentMaxHeight = CONTENT_HEIGHT_SUBSEQUENT;
        currentPageHtml = child.outerHTML;
      } else {
        currentPageHtml += child.outerHTML;
      }
    }
  }

  if (currentPageHtml) {
    pages.push(currentPageHtml);
  }

  document.body.removeChild(measurer);
  document.body.removeChild(singleMeasurer);

  return pages.length > 0 ? pages : [html];
}

export default function Templates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DOCX_TEMPLATES[0].id);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const [docxRawHtml, setDocxRawHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const [currentFont, setCurrentFont] = useState<string>("Source Serif Pro");
  const [currentSize, setCurrentSize] = useState<string>("12");

  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('stlaf_automated_vault');
    return saved ? JSON.parse(saved) : {};
  });

  const [paginatedPages, setPaginatedPages] = useState<string[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const highlightColorRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const currentTemplate = useMemo(() => {
    return DOCX_TEMPLATES.find(t => t.id === selectedTemplateId) || DOCX_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Load Template Layout
  useEffect(() => {
    async function loadDocxTemplate() {
      if (!currentTemplate) return;

      if (customDrafts[selectedTemplateId]) {
        setDocxRawHtml(customDrafts[selectedTemplateId]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/templates/${currentTemplate.fileName}`);
        if (!response.ok) throw new Error('Template not found');
        const arrayBuffer = await response.arrayBuffer();

        const options = {
          preserveEmptyParagraphs: true,
          includeDefaultStyleMap: true,
          convertUnderline: true,
          styleMap: [
            "p[style-name='Header'] => h2:fresh",
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "table => table.docx-rendered-table:fresh"
          ]
        };

        const result = await mammoth.convertToHtml(
          { arrayBuffer: arrayBuffer },
          options
        );
        let processedHtml = result.value;

        processedHtml = processedHtml.replace(/<ol>/g, '<ol class="list-decimal pl-6 my-1">');
        processedHtml = processedHtml.replace(/<ul>/g, '<ul class="list-disc pl-6 my-1">');

        processedHtml = processedHtml.replace(/\{([a-zA-Z0-9_]+)\}/g, (match) => {
          return `<span class="live-token" contenteditable="false">${match}</span>`;
        });

        setDocxRawHtml(processedHtml);
      } catch (error) {
        console.error("Error loading template:", error);
        setDocxRawHtml(`<p>No template file found at /templates/${currentTemplate.fileName}</p>`);
      } finally {
        setIsLoading(false);
      }
    }

    loadDocxTemplate();
  }, [selectedTemplateId, currentTemplate]);

  // Unified calculations trigger
  useEffect(() => {
    if (docxRawHtml) {
      const resultPages = paginateHtml(docxRawHtml, false);
      setPaginatedPages(resultPages);
    } else {
      setPaginatedPages([]);
    }
  }, [docxRawHtml]);

  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newHtml = target.innerHTML;
    setDocxRawHtml(newHtml);
    setCustomDrafts(prev => {
      const updated = { ...prev, [selectedTemplateId]: newHtml };
      localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
      return updated;
    });
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

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      return selection.getRangeAt(0);
    }
    return selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  };

  const convertImagesToBase64 = async (container: HTMLElement) => {
    const images = container.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img.src.startsWith('data:')) continue;
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.src = reader.result as string;
            resolve(true);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Could not inline local image resource safely:", img.src);
      }
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'pdf-export-container';
      document.body.appendChild(pdfContainer);

      for (let index = 0; index < paginatedPages.length; index++) {
        const pageHtml = paginatedPages[index];
        const sheet = document.createElement('div');
        sheet.className = 'paper-sheet paginated-sheet';

        // UPDATE: Kung MKST ang pinili, i-inject ang METROKST logo/header layout sa PDF download
        if (selectedTemplateId === 'Exit Interview - MKST') {
          sheet.innerHTML = `
            <div class="mkst-header-container" style="display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; width: 100%;">
              <img src="/MKST.png" alt="METROKST Logo" style="height: 75px; object-fit: contain;" />
            </div>
          `;
        } else {
          sheet.innerHTML = `
            <div class="stlaf-header-container">
              <div class="logo-section">
                <img src="/MAIN.png" alt="STLAF Logo" class="logo-image" />
              </div>
              <div class="contact-section">
                <p class="contact-item" style="font-family: 'Source Serif 4', Georgia, serif">7F, Victoria Sports Tower,<br/>EDSA, South Triangle, Quezon City</p>
                <p class="contact-item" style="font-family: 'Source Serif 4', Georgia, serif">legal@sadsadtamesislaw.com</p>
                <p class="contact-item" style="font-family: 'Source Serif 4', Georgia, serif">(02) 8463-4941 / 0948-961-2397</p>
              </div>
            </div>
          `;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'compiled-preview-paper text-justify';
        contentDiv.style.marginTop = selectedTemplateId === 'Exit Interview - MKST' ? '0px' : '16px';
        contentDiv.innerHTML = pageHtml;
        sheet.appendChild(contentDiv);

        pdfContainer.appendChild(sheet);
      }

      await convertImagesToBase64(pdfContainer);
      await new Promise(resolve => setTimeout(resolve, 600));

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [816, 1248]
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const sheets = pdfContainer.querySelectorAll('.paper-sheet') as NodeListOf<HTMLElement>;

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          width: PAPER_WIDTH,
          height: PAPER_HEIGHT,
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }

      pdf.save(`${currentTemplate.id.replace(/\s+/g, '_')}_STLAF_Form.pdf`);
      document.body.removeChild(pdfContainer);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Error exporting PDF layout.');
    } finally {
      setIsExporting(false);
    }
  };

  const injectToken = (token: string) => {
    restoreSelection();
    const tokenHtml = `<span class="live-token" contenteditable="false">${token}</span>`;
    document.execCommand('insertHTML', false, tokenHtml);
    if (editorRef.current) {
      setDocxRawHtml(editorRef.current.innerHTML);
    }
  };

  const applyStyle = (cmd: string, arg?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      setDocxRawHtml(editorRef.current.innerHTML);
    }
  };

  const applyCustomFontSize = (sizeInPt: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (range.toString().length === 0) return;
      document.execCommand('insertHTML', false, `<span style="font-size: ${sizeInPt}pt;">${range.toString()}</span>`);
      if (editorRef.current) setDocxRawHtml(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (cmd: string) => {
    restoreSelection();
    if (cmd === 'indent' && editorRef.current) {
      document.execCommand('indent');
      setDocxRawHtml(editorRef.current.innerHTML);
    }
  };

  const handleImageInsertion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        restoreSelection();
        const imgHtml = `<img src="${event.target?.result}" class="editor-inserted-image docx-signature-block" />`;
        document.execCommand('insertHTML', false, imgHtml);
        if (editorRef.current) setDocxRawHtml(editorRef.current.innerHTML);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTableInsertion = () => {
    restoreSelection();
    let tableHtml = `<table class="docx-rendered-table"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Data 1</td><td>Data 2</td><td>Data 3</td></tr></table>`;
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current) setDocxRawHtml(editorRef.current.innerHTML);
  };

  const filteredTemplates = useMemo(() => {
    return DOCX_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm]);

  const renderHeader = () => (
    <div className="stlaf-header-container">
      <div className="logo-section">
        <img src="/MAIN.png" alt="STLAF Logo" className="logo-image" />
      </div>
      <div className="contact-section">
        <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
          7F, Victoria Sports Tower,<br />EDSA, South Triangle, Quezon City
        </p>
        <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
          legal@sadsadtamesislaw.com
        </p>
        <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>
          (02) 8463-4941 / 0948-961-2397
        </p>
      </div>
    </div>
  );

  return (
    <div className="templates-container">
      {isExporting && (
        <div className="export-overlay">
          <div className="export-modal">
            <div className="export-spinner"></div>
            <p style={{ margin: 0, color: '#334155', fontWeight: 600 }}>Generating PDF Layout...</p>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageInsertion} />
      <input type="color" ref={fontColorRef} style={{ display: 'none' }} onChange={(e) => applyStyle('foreColor', e.target.value)} />
      <input type="color" ref={highlightColorRef} style={{ display: 'none' }} onChange={(e) => applyStyle('hiliteColor', e.target.value)} />

      <aside className={`workspace-sidebar no-print ${showSidebar ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header-custom">
          <div className="sidebar-brand-title"><span>Document Vault</span></div>
          <button className="sidebar-close-btn" onClick={() => setShowSidebar(false)}><X size={16} /></button>
        </div>

        <div className="sidebar-scrollable-content">
          <div className="sidebar-group">
            <label className="sidebar-group-title">Search Documents</label>
            <div className="search-box-container">
              <Search size={14} className="search-icon-inside" />
              <input
                type="text"
                className="search-sidebar-input"
                placeholder="Type document keywords..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="sidebar-group" style={{ flex: 1, minHeight: 0 }}>
            <label className="sidebar-group-title">Templates Registry ({filteredTemplates.length})</label>
            <div className="templates-list-scrollable" style={{ flex: 1, maxHeight: 'none' }}>
              {filteredTemplates.map(t => (
                <button
                  key={t.id}
                  className={`template-list-item ${selectedTemplateId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedTemplateId(t.id)}
                >
                  <FileText size={14} className="file-icon" />
                  <div className="item-txt-meta">
                    <span className="item-title">{t.name}</span>
                    <span className="item-sub">{t.fileName}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="workspace-main">
        <header className="sticky-action-controls no-print">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {!showSidebar && (
                <button className="icon-control-btn mr-3" onClick={() => setShowSidebar(true)}>
                  <Settings2 size={15} />
                </button>
              )}
              <h1 className="page-title text-xl font-bold text-slate-700">Edit Templates</h1>
              <span className="mr-3 text-xs text-slate-400 font-medium">
                {paginatedPages.length} {paginatedPages.length === 1 ? 'page' : 'pages'} verified </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                className={`icon-control-btn ${isPreview ? 'premium-purple-active' : ''}`}
                onClick={() => setIsPreview(!isPreview)}
                disabled={isLoading}
              >
                {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                <span>{isPreview ? 'Edit Mode' : 'Preview Mode'}</span>
              </button>
              <button
                className="action-pill-btn-gold"
                onClick={handleExportPdf}
                disabled={isLoading || isExporting}
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                <span>{isExporting ? 'Exporting...' : 'Export PDF Layout'}</span>
              </button>
            </div>
          </div>

          {!isPreview && (
            <div className="flex flex-wrap items-center gap-2 w-full mt-2 pt-1.5 border-t border-slate-100 formatting-toolbar">
              <div className="formatting-toolbar-group">
                <button type="button" title="Undo" className="toolbar-icon-btn" onClick={() => applyStyle('undo')}><Undo2 size={13} /></button>
              </div>

              <div className="formatting-toolbar-group px-2 text-xs">
                <Type size={13} className="mr-1 text-slate-500" />
                <select
                  className="bg-transparent outline-none cursor-pointer font-medium text-slate-700"
                  value={COMMON_FONTS.find(f => f.label === currentFont)?.value || ""}
                  onChange={(e) => {
                    const matched = COMMON_FONTS.find(f => f.value === e.target.value);
                    if (matched) {
                      setCurrentFont(matched.label);
                      applyStyle('fontName', matched.value);
                    }
                  }}
                >
                  {COMMON_FONTS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div className="formatting-toolbar-group px-1">
                <select
                  className="formatting-toolbar-select size-selector"
                  value={currentSize}
                  onChange={(e) => {
                    setCurrentSize(e.target.value);
                    applyCustomFontSize(e.target.value);
                  }}
                >
                  {FONT_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Bold" className="toolbar-icon-btn" onClick={() => applyStyle('bold')}><Bold size={13} /></button>
                <button type="button" title="Italic" className="toolbar-icon-btn" onClick={() => applyStyle('italic')}><Italic size={13} /></button>
                <button type="button" title="Underline" className="toolbar-icon-btn" onClick={() => applyStyle('underline')}><Underline size={13} /></button>
                <button type="button" title="Strikethrough" className="toolbar-icon-btn" onClick={() => applyStyle('strikeThrough')}><Strikethrough size={13} /></button>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Font Color" className="toolbar-icon-btn" onClick={() => fontColorRef.current?.click()}><Palette size={13} /></button>
                <button type="button" title="Text Highlight Color" className="toolbar-icon-btn" onClick={() => highlightColorRef.current?.click()}><Highlighter size={13} /></button>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Align Left" className="toolbar-icon-btn" onClick={() => applyStyle('justifyLeft')}><AlignLeft size={13} /></button>
                <button type="button" title="Align Center" className="toolbar-icon-btn" onClick={() => applyStyle('justifyCenter')}><AlignCenter size={13} /></button>
                <button type="button" title="Align Right" className="toolbar-icon-btn" onClick={() => applyStyle('justifyRight')}><AlignRight size={13} /></button>
                <button type="button" title="Justify" className="toolbar-icon-btn" onClick={() => applyStyle('justifyFull')}><AlignJustify size={13} /></button>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Unordered List" className="toolbar-icon-btn" onClick={() => applyStyle('insertUnorderedList')}><List size={13} /></button>
                <button type="button" title="Ordered List" className="toolbar-icon-btn" onClick={() => applyStyle('insertOrderedList')}><ListOrdered size={13} /></button>
                <button type="button" title="Increase Indent" className="toolbar-icon-btn" onClick={() => handleFormat('indent')}><Indent size={13} /></button>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Insert Picture" className="toolbar-icon-btn" onClick={() => fileInputRef.current?.click()}><Image size={13} /></button>
                <button type="button" title="Insert Table" className="toolbar-icon-btn" onClick={handleTableInsertion}><Table size={13} /></button>
              </div>

              <div className="relative ml-auto">
                <button
                  type="button"
                  className="toolbar-trigger-btn font-semibold"
                  onClick={() => setShowTagsMenu(!showTagsMenu)}
                >
                  <Tag size={12} className="mr-1 text-slate-500" /> Variable Injection <ChevronDown size={11} className="ml-1" />
                </button>
                {showTagsMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-slate-200 shadow-xl rounded-md z-50 py-1 text-left">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                      Editable Layout Variables
                    </div>
                    {VARIABLE_REGISTRY.map(v => (
                      <button
                        key={v.token}
                        type="button"
                        onClick={() => { injectToken(v.token); setShowTagsMenu(false); }}
                        className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs block text-slate-700 font-medium"
                      >
                        {v.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <div className="parchment-desk-stage">
          {isLoading ? (
            <div className="paper-sheet flex items-center justify-center">
              <div className="text-center text-sm text-slate-400 py-24">
                <Loader2 className="animate-spin mx-auto mb-3" size={32} />
                Converting document template...
              </div>
            </div>
          ) : (
            paginatedPages.map((pageHtml, index) => (
              <div className="paper-sheet paginated-sheet" key={index}>

                {/* UPDATE: Conditional layout injection ng METROKST Header vs STLAF Law Firm Letterhead */}
                {selectedTemplateId === 'Exit Interview - MKST' ? (
                  <div className="mkst-header-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                    <img src="/MKST.png" alt="METROKST Logo" style={{ height: '75px', objectFit: 'contain' }} />
                  </div>
                ) : (
                  renderHeader()
                )}

                {/* Dynamic spacing setup base sa kung anong structural system header ang naka-display */}
                <div
                  className="legal-document-editor-container text-justify"
                  style={{ marginTop: selectedTemplateId === 'Exit Interview - MKST' ? '0px' : '16px' }}
                >
                  {isPreview ? (
                    <div
                      className="compiled-preview-paper"
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  ) : (
                    <div
                      ref={editorRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleEditorInput}
                      onBlur={saveSelection}
                      onMouseUp={saveSelection}
                      onKeyUp={saveSelection}
                      className="document-drafting-editor"
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  )}
                </div>

                <div className="page-number-indicator no-print">
                  Page {index + 1} of {paginatedPages.length}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}