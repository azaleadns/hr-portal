import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import mammoth from 'mammoth';
import {
  Printer, ChevronDown, Eye, Edit3, Settings2, FileText, X,
  Search, Bold, Italic, Underline, AlignLeft, AlignCenter,
  AlignRight, AlignJustify, Tag, Strikethrough, Type, List,
  ListOrdered, Image, Table, Undo2, Palette, Highlighter,
  Indent, Loader2
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
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Barlow', value: "'Barlow', sans-serif" },
  { label: 'Book Antiqua', value: "'Book Antiqua', Palatino, serif" },
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Courier New', value: "'Courier New', Courier, monospace" },
  { label: 'Source Serif Pro', value: "'Source Serif 4', 'Source Serif Pro', Georgia, serif" },
  { label: 'Times New Roman', value: "'Times New Roman', Times, serif" },
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
  { token: '{DepartmentName}', display: 'Assigned Department' },
];

const MAMMOTH_STYLE_MAP = [
  "p[style-name='Normal'] => p:fresh",
  "p[style-name='Body Text'] => p:fresh",
  "p[style-name='Body Text 2'] => p:fresh",
  "p[style-name='Body Text 3'] => p:fresh",
  "p[style-name='Header'] => p.docx-header-para:fresh",
  "p[style-name='Footer'] => p.docx-footer-para:fresh",
  "p[style-name='Heading 1'] => h1.docx-h1:fresh",
  "p[style-name='Heading 2'] => h2.docx-h2:fresh",
  "p[style-name='Heading 3'] => h3.docx-h3:fresh",
  "p[style-name='Heading 4'] => h4.docx-h4:fresh",
  "p[style-name='Heading 5'] => h5.docx-h5:fresh",
  "p[style-name='Heading 6'] => h6.docx-h6:fresh",
  "p[style-name='Title'] => p.docx-title:fresh",
  "p[style-name='Subtitle'] => p.docx-subtitle:fresh",
  "p[style-name='Caption'] => p.docx-caption:fresh",
  "p[style-name='List Paragraph'] => p.docx-list-paragraph:fresh",
  "p[style-name='List Number'] => p.docx-list-number:fresh",
  "p[style-name='List Bullet'] => p.docx-list-bullet:fresh",
  "p[style-name='List Bullet 2'] => p.docx-list-bullet-2:fresh",
  "p[style-name='List Number 2'] => p.docx-list-number-2:fresh",
  "p[style-name='Table Contents'] => p.docx-table-contents:fresh",
  "p[style-name='Table Heading'] => p.docx-table-heading:fresh",
  "p[style-name='No Spacing'] => p.docx-no-spacing:fresh",
  "p[style-name='Quote'] => blockquote.docx-quote:fresh",
  "p[style-name='Intense Quote'] => blockquote.docx-intense-quote:fresh",
  "r[style-name='Strong'] => strong:fresh",
  "r[style-name='Emphasis'] => em:fresh",
  "r[style-name='Intense Emphasis'] => em.docx-intense-em:fresh",
  "r[style-name='Intense Reference'] => span.docx-intense-ref:fresh",
  "r[style-name='Subtle Reference'] => span.docx-subtle-ref:fresh",
  "table => table.docx-rendered-table:fresh",
  "u => u",
  "strike => s",
];

const PAPER_WIDTH = 816;
const PAPER_HEIGHT = 1248;
const PAPER_PADDING = 72;
const BOTTOM_MARGIN_BUFFER = 72;
const HEADER_HEIGHT = 110;
const CONTENT_HEIGHT_FIRST_PAGE = PAPER_HEIGHT - (PAPER_PADDING * 2) - HEADER_HEIGHT - BOTTOM_MARGIN_BUFFER;
const CONTENT_HEIGHT_SUBSEQUENT = PAPER_HEIGHT - (PAPER_PADDING * 2) - BOTTOM_MARGIN_BUFFER;

/* ── Helpers ── */
function postProcessDocxHtml(html: string): string {
  html = html.replace(/<p><\/p>/g, '<p class="docx-empty-p">&nbsp;</p>');
  html = html.replace(/<p>\s*<\/p>/g, '<p class="docx-empty-p">&nbsp;</p>');
  html = html.replace(/<ol>/g, '<ol class="docx-ol">');
  html = html.replace(/<ul>/g, '<ul class="docx-ul">');
  html = html.replace(/<li>/g, '<li class="docx-li">');
  html = html.replace(/<table\s+class="docx-rendered-table"\s+class="[^"]*"/g, '<table class="docx-rendered-table"');
  html = html.replace(/<span[^>]*>\s*<\/span>/g, '');
  html = html.replace(/<br>/gi, '<br/>');
  html = html.replace(/<a\s+href="([^"]+)"/g, '<a href="$1" class="docx-hyperlink" target="_blank" rel="noopener noreferrer"');
  html = html.replace(/\{([a-zA-Z0-9_]+)\}/g, (match) => {
    return `<span class="live-token" contenteditable="false">${match}</span>`;
  });
  return html;
}

function paginateHtml(html: string): string[] {
  const measurer = document.createElement('div');
  measurer.className = 'pagination-measurer compiled-preview-paper docx-content-root';
  Object.assign(measurer.style, {
    position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden',
    width: `${PAPER_WIDTH - PAPER_PADDING * 2}px`,
  });
  measurer.innerHTML = html;
  document.body.appendChild(measurer);

  const children = Array.from(measurer.children) as HTMLElement[];
  if (children.length === 0) {
    document.body.removeChild(measurer);
    return [html];
  }

  const singleMeasurer = document.createElement('div');
  singleMeasurer.className = 'pagination-measurer compiled-preview-paper docx-content-root';
  Object.assign(singleMeasurer.style, {
    position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden',
    width: `${PAPER_WIDTH - PAPER_PADDING * 2}px`,
  });
  document.body.appendChild(singleMeasurer);

  const pages: string[] = [];
  let currentPageHtml = '';
  let currentMaxHeight = CONTENT_HEIGHT_FIRST_PAGE;

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.tagName === 'TABLE') {
      const rows = Array.from(child.querySelectorAll('tr')) as HTMLTableRowElement[];
      let tableAttributes = '';
      for (const attr of Array.from(child.attributes)) {
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
  if (currentPageHtml) pages.push(currentPageHtml);

  document.body.removeChild(measurer);
  document.body.removeChild(singleMeasurer);
  return pages.length > 0 ? pages : [html];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function Templates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(DOCX_TEMPLATES[0].id);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [docxRawHtml, setDocxRawHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentFont, setCurrentFont] = useState('Source Serif Pro');
  const [currentSize, setCurrentSize] = useState('12');
  const [paginatedPages, setPaginatedPages] = useState<string[]>([]);

  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('stlaf_automated_vault');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const highlightColorRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isTemplateChange = useRef(true);

  const currentTemplate = useMemo(
    () => DOCX_TEMPLATES.find(t => t.id === selectedTemplateId) || DOCX_TEMPLATES[0],
    [selectedTemplateId]
  );

  /* ── load template ── */
  useEffect(() => {
    async function load() {
      if (!currentTemplate) return;
      if (customDrafts[selectedTemplateId]) {
        setDocxRawHtml(customDrafts[selectedTemplateId]);
        isTemplateChange.current = true;
        return;
      }
      setIsLoading(true);
      isTemplateChange.current = true;
      try {
        const res = await fetch(`/templates/${currentTemplate.fileName}`);
        if (!res.ok) throw new Error('not found');
        const buffer = await res.arrayBuffer();

        const result = await mammoth.convertToHtml(
          { arrayBuffer: buffer },
          {
            styleMap: MAMMOTH_STYLE_MAP,
            includeDefaultStyleMap: true,
            convertImage: mammoth.images.imgElement(async (image) => {
              const buf = await image.read();
              const bytes = new Uint8Array(buf as unknown as ArrayBufferLike);
              let binary = '';
              for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
              }
              const b64 = btoa(binary);
              return { src: `data:${image.contentType};base64,${b64}` };
            }),
          }
        );
        setDocxRawHtml(postProcessDocxHtml(result.value));
      } catch (err) {
        console.error('Template load error:', err);
        setDocxRawHtml(`<p>No template found at /templates/${currentTemplate.fileName}</p>`);
      } finally {
        setIsLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId]);

  useEffect(() => {
    if (isTemplateChange.current && editorRef.current && docxRawHtml) {
      editorRef.current.innerHTML = docxRawHtml;
      isTemplateChange.current = false;
    }
  }, [docxRawHtml]);

  useEffect(() => {
    if (docxRawHtml) setPaginatedPages(paginateHtml(docxRawHtml));
    else setPaginatedPages([]);
  }, [docxRawHtml]);

  /* ── editor input ── */
  const handleEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newHtml = e.currentTarget.innerHTML;
    setCustomDrafts(prev => {
      const updated = { ...prev, [selectedTemplateId]: newHtml };
      localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
      return updated;
    });
    setPaginatedPages(paginateHtml(newHtml));
  };

  /* ── selection helpers ── */
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const r = sel.getRangeAt(0);
      if (editorRef.current?.contains(r.commonAncestorContainer)) {
        savedRangeRef.current = r.cloneRange();
      }
    }
  };
  const restoreSelection = () => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
  };

  /* ── images to base64 ── */
  const convertImagesToBase64 = async (container: HTMLElement) => {
    const imgs = container.querySelectorAll('img');
    for (const img of Array.from(imgs)) {
      if (img.src.startsWith('data:')) continue;
      try {
        const blob = await (await fetch(img.src)).blob();
        await new Promise<void>((res, rej) => {
          const reader = new FileReader();
          reader.onloadend = () => { img.src = reader.result as string; res(); };
          reader.onerror = rej;
          reader.readAsDataURL(blob);
        });
      } catch { /* skip */ }
    }
  };

  /* ── PDF export ── */
  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const currentHtml = editorRef.current?.innerHTML || docxRawHtml;
      const exportPages = paginateHtml(currentHtml);
      const pdfContainer = document.createElement('div');
      pdfContainer.className = 'pdf-export-container';
      document.body.appendChild(pdfContainer);

      for (let idx = 0; idx < exportPages.length; idx++) {
        const sheet = document.createElement('div');
        sheet.className = 'paper-sheet paginated-sheet';

        if (selectedTemplateId === 'Exit Interview - MKST') {
          sheet.innerHTML = idx === 0
            ? `<div class="mkst-header-container" style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;width:100%">
                <img src="/MKST.png" style="height:75px;object-fit:contain;margin-bottom:8px"/>
                <p style="font-family:'Times New Roman',serif;font-size:14pt;font-weight:bold;margin:4px 0 2px;text-align:center">METROKST Enterprises Corp.</p>
                <p style="font-family:'Times New Roman',serif;font-size:12pt;font-weight:bold;margin:2px 0 0;text-align:center">EXIT INTERVIEW QUESTIONNAIRE</p>
               </div>`
            : `<div class="mkst-header-container" style="display:flex;flex-direction:column;align-items:center;margin-bottom:20px;width:100%">
                <img src="/MKST.png" style="height:55px;object-fit:contain;opacity:0.25"/>
               </div>`;
        } else {
          sheet.innerHTML = `
            <div class="stlaf-header-container">
              <div class="logo-section"><img src="/MAIN.png" class="logo-image" alt="STLAF Logo"/></div>
              <div class="contact-section">
                <p class="contact-item">7F, Victoria Sports Tower,<br/>EDSA, South Triangle, Quezon City</p>
                <p class="contact-item">legal@sadsadtamesislaw.com</p>
                <p class="contact-item">(02) 8463-4941 / 0948-961-2397</p>
              </div>
            </div>`;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'legal-document-editor-container';
        contentDiv.style.marginTop = selectedTemplateId === 'Exit Interview - MKST' ? '0px' : '16px';
        const inner = document.createElement('div');
        inner.className = 'compiled-preview-paper docx-content-root';
        inner.innerHTML = exportPages[idx];
        contentDiv.appendChild(inner);
        sheet.appendChild(contentDiv);
        pdfContainer.appendChild(sheet);
      }

      await convertImagesToBase64(pdfContainer);
      await new Promise(r => setTimeout(r, 600));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [816, 1248] });
      const sheets = pdfContainer.querySelectorAll<HTMLElement>('.paper-sheet');
      for (let i = 0; i < sheets.length; i++) {
        const canvas = await html2canvas(sheets[i], {
          scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff',
          width: PAPER_WIDTH, height: PAPER_HEIGHT,
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
      }

      pdf.save(`${currentTemplate.id.replace(/\s+/g, '_')}_STLAF_Form.pdf`);
      document.body.removeChild(pdfContainer);
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('Error exporting PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  /* ── editor commands ── */
  const persistEditor = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setCustomDrafts(prev => {
      const updated = { ...prev, [selectedTemplateId]: newHtml };
      localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
      return updated;
    });
  };
  const applyStyle = (cmd: string, arg?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, arg);
    persistEditor();
  };
  const applyCustomFontSize = (sizeInPt: string) => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.toString().length === 0) return;
    document.execCommand('insertHTML', false, `<span style="font-size:${sizeInPt}pt">${range.toString()}</span>`);
    persistEditor();
  };
  const injectToken = (token: string) => {
    restoreSelection();
    document.execCommand('insertHTML', false, `<span class="live-token" contenteditable="false">${token}</span>`);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCustomDrafts(prev => {
        const updated = { ...prev, [selectedTemplateId]: html };
        localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
        return updated;
      });
      setPaginatedPages(paginateHtml(html));
    }
  };
  const handleImageInsertion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      restoreSelection();
      document.execCommand('insertHTML', false, `<img src="${ev.target?.result}" class="editor-inserted-image docx-signature-block"/>`);
      if (editorRef.current) {
        const html = editorRef.current.innerHTML;
        setCustomDrafts(prev => {
          const updated = { ...prev, [selectedTemplateId]: html };
          localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
          return updated;
        });
        setPaginatedPages(paginateHtml(html));
      }
    };
    reader.readAsDataURL(file);
  };
  const handleTableInsertion = () => {
    restoreSelection();
    const tableHtml = `<table class="docx-rendered-table"><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Data 1</td><td>Data 2</td><td>Data 3</td></tr></table>`;
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setCustomDrafts(prev => {
        const updated = { ...prev, [selectedTemplateId]: html };
        localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
        return updated;
      });
      setPaginatedPages(paginateHtml(html));
    }
  };

  const filteredTemplates = useMemo(
    () => DOCX_TEMPLATES.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)),
    [searchTerm]
  );

  const renderHeader = () => (
    <div className="stlaf-header-container">
      <div className="logo-section"><img src="/MAIN.png" alt="STLAF Logo" className="logo-image" /></div>
      <div className="contact-section">
        <p className="contact-item">7F, Victoria Sports Tower,<br />EDSA, South Triangle, Quezon City</p>
        <p className="contact-item">legal@sadsadtamesislaw.com</p>
        <p className="contact-item">(02) 8463-4941 / 0948-961-2397</p>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="templates-container">
      {isExporting && (
        <div className="export-overlay">
          <div className="export-modal">
            <div className="export-spinner" />
            <p style={{ margin: 0, color: '#334155', fontWeight: 600 }}>Generating PDF Layout...</p>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageInsertion} />
      <input type="color" ref={fontColorRef} style={{ display: 'none' }} onChange={e => applyStyle('foreColor', e.target.value)} />
      <input type="color" ref={highlightColorRef} style={{ display: 'none' }} onChange={e => applyStyle('hiliteColor', e.target.value)} />

      {/* ── SIDEBAR ── */}
      <aside className={`workspace-sidebar no-print ${showSidebar ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header-custom">
          <div className="sidebar-brand-title">Document Vault</div>
          <button className="sidebar-close-btn" onClick={() => setShowSidebar(false)}><X size={16} /></button>
        </div>
        <div className="sidebar-scrollable-content">
          <div className="sidebar-group">
            <label className="sidebar-group-title">Search Documents</label>
            <div className="search-box-container">
              <Search size={14} className="search-icon-inside" />
              <input type="text" className="search-sidebar-input" placeholder="Type document keywords..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div className="sidebar-group" style={{ flex: 1, minHeight: 0 }}>
            <label className="sidebar-group-title">Templates Registry ({filteredTemplates.length})</label>
            <div className="templates-list-scrollable">
              {filteredTemplates.map(t => (
                <button key={t.id} className={`template-list-item ${selectedTemplateId === t.id ? 'active' : ''}`} onClick={() => setSelectedTemplateId(t.id)}>
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

      {/* ── MAIN ── */}
      <section className="workspace-main">
        <header className="sticky-action-controls no-print">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {!showSidebar && <button className="icon-control-btn" onClick={() => setShowSidebar(true)}><Settings2 size={15} /></button>}
              <h1 className="page-title text-xl font-bold text-slate-700">Edit Templates</h1>
              <span className="text-xs text-slate-400 font-medium">{paginatedPages.length} {paginatedPages.length === 1 ? 'page' : 'pages'} verified</span>
            </div>
            <div className="flex items-center gap-2">
              <button className={`icon-control-btn ${isPreview ? 'premium-purple-active' : ''}`} onClick={() => setIsPreview(p => !p)} disabled={isLoading}>
                {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                <span>{isPreview ? 'Edit Mode' : 'Preview Mode'}</span>
              </button>
              <button className="action-pill-btn-gold" onClick={handleExportPdf} disabled={isLoading || isExporting}>
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
                <select className="bg-transparent outline-none cursor-pointer font-medium text-slate-700" value={COMMON_FONTS.find(f => f.label === currentFont)?.value || ''} onChange={e => { const matched = COMMON_FONTS.find(f => f.value === e.target.value); if (matched) { setCurrentFont(matched.label); applyStyle('fontName', matched.value); } }}>
                  {COMMON_FONTS.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="formatting-toolbar-group px-1">
                <select className="formatting-toolbar-select size-selector" value={currentSize} onChange={e => { setCurrentSize(e.target.value); applyCustomFontSize(e.target.value); }}>
                  {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
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
                <button type="button" title="Highlight" className="toolbar-icon-btn" onClick={() => highlightColorRef.current?.click()}><Highlighter size={13} /></button>
              </div>
              <div className="formatting-toolbar-group">
                <button type="button" title="Align Left" className="toolbar-icon-btn" onClick={() => applyStyle('justifyLeft')}><AlignLeft size={13} /></button>
                <button type="button" title="Align Center" className="toolbar-icon-btn" onClick={() => applyStyle('justifyCenter')}><AlignCenter size={13} /></button>
                <button type="button" title="Align Right" className="toolbar-icon-btn" onClick={() => applyStyle('justifyRight')}><AlignRight size={13} /></button>
                <button type="button" title="Justify" className="toolbar-icon-btn" onClick={() => applyStyle('justifyFull')}><AlignJustify size={13} /></button>
              </div>
              <div className="formatting-toolbar-group">
                <button type="button" title="Bullet List" className="toolbar-icon-btn" onClick={() => applyStyle('insertUnorderedList')}><List size={13} /></button>
                <button type="button" title="Ordered List" className="toolbar-icon-btn" onClick={() => applyStyle('insertOrderedList')}><ListOrdered size={13} /></button>
                <button type="button" title="Indent" className="toolbar-icon-btn" onClick={() => { restoreSelection(); document.execCommand('indent'); persistEditor(); }}><Indent size={13} /></button>
              </div>
              <div className="formatting-toolbar-group">
                <button type="button" title="Insert Image" className="toolbar-icon-btn" onClick={() => fileInputRef.current?.click()}><Image size={13} /></button>
                <button type="button" title="Insert Table" className="toolbar-icon-btn" onClick={handleTableInsertion}><Table size={13} /></button>
              </div>
              <div className="relative ml-auto">
                <button type="button" className="toolbar-trigger-btn font-semibold" onClick={() => setShowTagsMenu(p => !p)}>
                  <Tag size={12} className="mr-1 text-slate-500" /> Variable Injection <ChevronDown size={11} className="ml-1" />
                </button>
                {showTagsMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-slate-200 shadow-xl rounded-md z-50 py-1 text-left">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">Editable Layout Variables</div>
                    {VARIABLE_REGISTRY.map(v => (
                      <button key={v.token} type="button" onClick={() => { injectToken(v.token); setShowTagsMenu(false); }} className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-xs block text-slate-700 font-medium">{v.display}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ── CANVAS ── */}
        <div className="parchment-desk-stage">
          {isLoading ? (
            <div className="paper-sheet flex items-center justify-center">
              <div className="text-center text-sm text-slate-400 py-24">
                <Loader2 className="animate-spin mx-auto mb-3" size={32} />
                Converting document template...
              </div>
            </div>
          ) : isPreview ? (
            paginatedPages.map((pageHtml, index) => (
              <div className="paper-sheet paginated-sheet" key={index}>
                {selectedTemplateId === 'Exit Interview - MKST' ? (
                  index === 0 ? (
                    <div className="mkst-header-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                      <img src="/MKST.png" alt="METROKST Logo" style={{ height: '75px', objectFit: 'contain', marginBottom: '8px' }} />
                      <p style={{ fontFamily: '"Times New Roman",serif', fontSize: '14pt', fontWeight: 'bold', margin: '4px 0 2px', textAlign: 'center' }}>METROKST Enterprises Corp.</p>
                      <p style={{ fontFamily: '"Times New Roman",serif', fontSize: '12pt', fontWeight: 'bold', margin: '2px 0 0', textAlign: 'center' }}>EXIT INTERVIEW QUESTIONNAIRE</p>
                    </div>
                  ) : (
                    <div className="mkst-header-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                      <img src="/MKST.png" alt="METROKST Logo" style={{ height: '55px', objectFit: 'contain', opacity: 0.25 }} />
                    </div>
                  )
                ) : renderHeader()}
                <div className="legal-document-editor-container" style={{ marginTop: selectedTemplateId === 'Exit Interview - MKST' ? '0' : '16px' }}>
                  <div className="compiled-preview-paper docx-content-root" dangerouslySetInnerHTML={{ __html: pageHtml }} />
                </div>
                <div className="page-number-indicator no-print">Page {index + 1} of {paginatedPages.length}</div>
              </div>
            ))
          ) : (
            <div className="paper-sheet edit-mode-sheet">
              {selectedTemplateId === 'Exit Interview - MKST' ? (
                <div className="mkst-header-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px', width: '100%' }}>
                  <img src="/MKST.png" alt="METROKST Logo" style={{ height: '75px', objectFit: 'contain', marginBottom: '8px' }} />
                  <p style={{ fontFamily: '"Times New Roman",serif', fontSize: '14pt', fontWeight: 'bold', margin: '4px 0 2px', textAlign: 'center' }}>METROKST Enterprises Corp.</p>
                  <p style={{ fontFamily: '"Times New Roman",serif', fontSize: '12pt', fontWeight: 'bold', margin: '2px 0 0', textAlign: 'center' }}>EXIT INTERVIEW QUESTIONNAIRE</p>
                </div>
              ) : renderHeader()}
              <div className="legal-document-editor-container" style={{ marginTop: selectedTemplateId === 'Exit Interview - MKST' ? '0' : '16px' }}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onBlur={saveSelection}
                  onMouseUp={saveSelection}
                  onKeyUp={saveSelection}
                  className="document-drafting-editor docx-content-root"
                />
              </div>
              <div className="page-number-indicator no-print">Editing • {paginatedPages.length} {paginatedPages.length === 1 ? 'page' : 'pages'} when exported</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}