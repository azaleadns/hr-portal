import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Indent
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

export default function Templates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DOCX_TEMPLATES[0].id);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagsMenu, setShowTagsMenu] = useState(false);

  const [docxRawHtml, setDocxRawHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [currentFont, setCurrentFont] = useState<string>("Source Serif Pro");
  const [currentSize, setCurrentSize] = useState<string>("12");

  const [customDrafts, setCustomDrafts] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('stlaf_automated_vault');
    return saved ? JSON.parse(saved) : {};
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontColorRef = useRef<HTMLInputElement>(null);
  const highlightColorRef = useRef<HTMLInputElement>(null);
  const savedRangeRef = useRef<Range | null>(null);

  const isTypingRef = useRef<boolean>(false);

  const currentTemplate = useMemo(() => {
    return DOCX_TEMPLATES.find(t => t.id === selectedTemplateId) || DOCX_TEMPLATES[0];
  }, [selectedTemplateId]);

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
        const arrayBuffer = await response.arrayBuffer();

        const options = {
          preserveEmptyParagraphs: true,
          styleMap: [
            "p[style-name='Heading 1'] => h1:carousels",
            "p[style-name='Heading 2'] => h2",
            "p[style-name='Heading 3'] => h3",
            "table => table.docx-rendered-table:fresh",
            "tr => tr",
            "td => td",
            "p[style-name='List Bullet'] => ul > li:fresh",
            "p[style-name='List Number'] => ol > li:fresh",
            "p[style-name='List Number 2'] => ol[style='list-style-type: lower-roman;'] > li:fresh",
            "p[style-name='List Number 3'] => ol[style='list-style-type: upper-roman;'] > li:fresh"
          ],
          convertUnderline: true
        };

        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer }, options);
        let processedHtml = result.value;

        processedHtml = processedHtml.replace(/<ol>/g, '<ol class="list-decimal pl-8 my-2">');
        processedHtml = processedHtml.replace(/<ul>/g, '<ul class="list-disc pl-8 my-2">');

        processedHtml = processedHtml.replace(/\{([a-zA-Z0-9_]+)\}/g, (match) => {
          return `<span class="live-token" contenteditable="false">${match}</span>`;
        });

        setDocxRawHtml(processedHtml);
      } catch (error) {
        console.error("Critical error reading corporate template payload:", error);
        setDocxRawHtml("<p style='color:red; text-align:center; padding: 20px;'>Template element missing inside public binary matrix.</p>");
      } finally {
        setIsLoading(false);
      }
    }

    loadDocxTemplate();
  }, [selectedTemplateId, currentTemplate]);

  useEffect(() => {
    if (docxRawHtml && !isPreview) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = docxRawHtml;
      const paragraphs = tempDiv.querySelectorAll('p');
      paragraphs.forEach(p => {
        const style = p.getAttribute('style');
        if (style && style.includes('text-indent')) {
          const indentMatch = style.match(/text-indent:\s*([0-9]+)px/);
          if (indentMatch) {
            p.classList.add('first-line-indent');
            p.removeAttribute('style');
          }
        }
      });
      setDocxRawHtml(tempDiv.innerHTML);
    }
  }, [docxRawHtml, isPreview]);

  useEffect(() => {
    if (editorRef.current && !isPreview && !isLoading) {
      if (!isTypingRef.current && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = docxRawHtml;
      }
    }
  }, [docxRawHtml, isPreview, isLoading]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      isTypingRef.current = true;
      const newHtml = editorRef.current.innerHTML;

      setDocxRawHtml(newHtml);
      setCustomDrafts(prev => {
        const updated = { ...prev, [selectedTemplateId]: newHtml };
        localStorage.setItem('stlaf_automated_vault', JSON.stringify(updated));
        return updated;
      });

      setTimeout(() => {
        isTypingRef.current = false;
      }, 50);
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

  const restoreSelection = () => {
    if (editorRef.current) editorRef.current.focus();
    const selection = window.getSelection();
    if (savedRangeRef.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRangeRef.current);
      return selection.getRangeAt(0);
    }
    return selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  };

  const handleExportPdf = async () => {
    const stage = document.querySelector('.parchment-desk-stage') as HTMLElement;
    if (!stage) return;
    const paperSheets = stage.querySelectorAll('.paper-sheet') as NodeListOf<HTMLElement>;
    if (paperSheets.length === 0) return;
    setIsLoading(true);

    try {
      const pdf = new jsPDF('p', 'pt', 'letter');
      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < paperSheets.length; i++) {
        const sheet = paperSheets[i];
        const originalBg = sheet.style.backgroundImage;
        sheet.style.backgroundImage = 'none';

        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        sheet.style.backgroundImage = originalBg;

        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      }
      pdf.save(`${currentTemplate.id}_STLAF_Form.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const injectToken = (token: string) => {
    restoreSelection();
    const tokenHtml = `<span class="live-token" contenteditable="false">${token}</span>`;
    document.execCommand('insertHTML', false, tokenHtml);
    handleEditorInput();
  };

  const applyStyle = (cmd: string, arg?: string) => {
    restoreSelection();
    document.execCommand(cmd, false, arg);
    handleEditorInput();
  };

  const applyCustomFontSize = (sizeInPt: string) => {
    restoreSelection();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);

      if (range.toString().length === 0) {
        document.execCommand('fontSize', false, '3');
        handleEditorInput();
        return;
      }

      const span = document.createElement('span');
      const sizeInPx = Math.round(parseFloat(sizeInPt) * 1.333);
      span.style.fontSize = `${sizeInPx}px`;

      try {
        range.surroundContents(span);
      } catch (e) {
        document.execCommand('insertHTML', false, `<span style="font-size: ${sizeInPx}px;">${range.toString()}</span>`);
      }
      handleEditorInput();
    }
  };

  const handleFormat = (cmd: string) => {
    restoreSelection();
    if (cmd === 'indent') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const walker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (n) => {
              const el = n as HTMLElement;
              return el.tagName === 'P' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            },
          }
        );
        let node = walker.currentNode as HTMLElement;
        while (node) {
          const pRange = document.createRange();
          pRange.selectNodeContents(node);
          if (
            range.compareBoundaryPoints(Range.END_TO_START, pRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, pRange) > 0
          ) {
            node.classList.toggle('first-line-indent');
          }
          node = walker.nextNode() as HTMLElement;
        }
      }
      handleEditorInput();
      return;
    }
    if (cmd === 'outdent') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const walker = document.createTreeWalker(
          range.commonAncestorContainer,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: (n) => {
              const el = n as HTMLElement;
              return el.tagName === 'P' ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
            },
          }
        );
        let node = walker.currentNode as HTMLElement;
        while (node) {
          const pRange = document.createRange();
          pRange.selectNodeContents(node);
          if (
            range.compareBoundaryPoints(Range.END_TO_START, pRange) < 0 &&
            range.compareBoundaryPoints(Range.START_TO_END, pRange) > 0
          ) {
            node.classList.remove('first-line-indent');
          }
          node = walker.nextNode() as HTMLElement;
        }
      }
      handleEditorInput();
    }
  };

  const handleRomanNumberingInsertion = () => {
    restoreSelection();
    const romanListHtml = `<ol style="list-style-type: lower-roman;"><li>New roman segment item...</li></ol>`;
    document.execCommand('insertHTML', false, romanListHtml);
    handleEditorInput();
  };

  const handleImageInsertion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        restoreSelection();
        const imgHtml = `<img src="${event.target?.result}" class="editor-inserted-image docx-signature-block" />`;
        document.execCommand('insertHTML', false, imgHtml);
        handleEditorInput();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTableInsertion = () => {
    restoreSelection();
    let tableHtml = `<table class="editor-custom-table docx-rendered-table">`;
    for (let i = 0; i < 3; i++) {
      tableHtml += `<tr>`;
      for (let j = 0; j < 3; j++) {
        tableHtml += i === 0 ? `<th>Header ${j + 1}</th>` : `<td>Cell data...</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</table>`;
    document.execCommand('insertHTML', false, tableHtml);
    handleEditorInput();
  };

  const filteredTemplates = useMemo(() => {
    return DOCX_TEMPLATES.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm]);

  // NATIVE LAYOUT BREAK GENERATION matrix
  const paginatedHtmlPages = useMemo(() => {
    if (!docxRawHtml) return [];
    if (!isPreview) return [docxRawHtml];

    // Split safely inside parent context using direct paragraph/table parsing strategy
    const div = document.createElement('div');
    div.innerHTML = docxRawHtml;

    const elements = Array.from(div.children);
    const pages: string[] = [];
    let currentChunk = "";
    let estimatedLength = 0;

    elements.forEach((el) => {
      const elHtml = el.outerHTML;
      // Isang page ay kayang mag-hold ng bandang ~2100 characters kasama ang formatting wrapper
      if (estimatedLength + elHtml.length > 2100 && currentChunk !== "") {
        pages.push(currentChunk);
        currentChunk = elHtml;
        estimatedLength = elHtml.length;
      } else {
        currentChunk += elHtml;
        estimatedLength += elHtml.length;
      }
    });

    if (currentChunk) {
      pages.push(currentChunk);
    }

    return pages.length > 0 ? pages : [docxRawHtml];
  }, [docxRawHtml, isPreview]);

  return (
    <div className="templates-container">
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
              <input type="text" className="search-sidebar-input" placeholder="Type document keywords..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          <div className="sidebar-group">
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

      <section className="workspace-main">
        <header className="sticky-action-controls no-print flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {!showSidebar && (
                <button className="icon-control-btn mr-3" onClick={() => setShowSidebar(true)}>
                  <Settings2 size={15} />
                </button>
              )}
              <h1 className="page-title text-xl font-bold text-slate-700">Edit Templates</h1>
            </div>

            <div className="flex items-center gap-2">
              <button className={`icon-control-btn ${isPreview ? 'premium-purple-active' : ''}`} onClick={() => setIsPreview(!isPreview)} disabled={isLoading}>
                {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                <span>{isPreview ? 'Manual Design Mode' : 'Render Document'}</span>
              </button>
              <button className="action-pill-btn-gold" onClick={handleExportPdf} disabled={isLoading}>
                <Printer size={14} />
                <span>Export PDF Layout</span>
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
                    const selectedSize = e.target.value;
                    setCurrentSize(selectedSize);
                    applyCustomFontSize(selectedSize);
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
                <button type="button" title="Roman Numbering (i, ii, iii)" className="toolbar-icon-btn font-serif font-bold text-[11px]" onClick={handleRomanNumberingInsertion}>Ⅰ⫿</button>
                <button type="button" title="Increase Indent" className="toolbar-icon-btn" onClick={() => handleFormat('indent')}><Indent size={13} /></button>
                <button type="button" title="Decrease Indent" className="toolbar-icon-btn" onClick={() => handleFormat('outdent')}><Indent size={13} className="rotate-180" /></button>
              </div>

              <div className="formatting-toolbar-group">
                <button type="button" title="Insert Picture" className="toolbar-icon-btn" onClick={() => fileInputRef.current?.click()}><Image size={13} /></button>
                <button type="button" title="Insert Table" className="toolbar-icon-btn" onClick={handleTableInsertion}><Table size={13} /></button>
              </div>

              <div className="relative ml-auto">
                <button type="button" className="toolbar-trigger-btn font-semibold" onClick={() => setShowTagsMenu(!showTagsMenu)}>
                  <Tag size={12} className="mr-1 text-slate-500" /> Variable Injection <ChevronDown size={11} className="ml-1" />
                </button>
                {showTagsMenu && (
                  <div className="absolute top-full right-0 mt-1.5 w-56 bg-white border border-slate-200 shadow-xl rounded-md z-50 py-1 text-left">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">Editable Layout Variables</div>
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
              <div className="text-center text-sm text-slate-400 py-24">Converting docx structural layout maps securely...</div>
            </div>
          ) : isPreview ? (
            paginatedHtmlPages.map((pageHtml, index) => (
              <div className="paper-sheet preview-mode-sheet" key={index}>
                {index === 0 && (
                  <div className="stlaf-header-container">
                    <div className="logo-section"><img src="/MAIN.png" alt="STLAF Logo" className="logo-image" /></div>
                    <div className="contact-section">
                      <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>7F, Victoria Sports Tower,<br />EDSA, South Triangle, Quezon City</p>
                      <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>legal@sadsadtamesislaw.com</p>
                      <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>(02) 8463-4941 / 0948-961-2397</p>
                    </div>
                  </div>
                )}

                <div className="legal-document-editor-container mt-4 text-justify">
                  <div className="compiled-preview-paper text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: pageHtml }} />
                </div>

                <div className="page-number-indicator no-print">
                  Page {index + 1} of {paginatedHtmlPages.length}
                </div>
              </div>
            ))
          ) : (
            <div className="paper-sheet editing-mode-sheet">
              <div className="stlaf-header-container">
                <div className="logo-section"><img src="/MAIN.png" alt="STLAF Logo" className="logo-image" /></div>
                <div className="contact-section">
                  <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>7F, Victoria Sports Tower,<br />EDSA, South Triangle, Quezon City</p>
                  <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>legal@sadsadtamesislaw.com</p>
                  <p className="contact-item" style={{ fontFamily: '"Source Serif 4", Georgia, serif' }}>(02) 8463-4941 / 0948-961-2397</p>
                </div>
              </div>

              <div className="legal-document-editor-container mt-4 text-justify">
                <div id="document-editor" ref={editorRef} contentEditable={true} onInput={handleEditorInput} onBlur={saveSelection} onMouseUp={saveSelection} onKeyUp={saveSelection} className="document-drafting-editor text-sm min-h-[1056px] outline-none" />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}