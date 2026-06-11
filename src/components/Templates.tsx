import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  CheckCircle2,
  Edit3,
  Eye,
  FileDown,
  Italic,
  List,
  ListOrdered,
  Search,
  Type,
  Underline,
  Undo2,
  Redo2,
  X
} from 'lucide-react';

interface TemplateDef {
  id: string;
  title: string;
  description: string;
  updatedAt: string;
  content: string;
}

interface StoredTemplateState {
  content: string;
  updatedAt: string;
}

const STORAGE_KEY = 'hrPortal.templates.v2';

const DEFAULT_TEMPLATES: TemplateDef[] = [
  {
    id: 'employment-contract',
    title: 'Employment Contract',
    description: 'Formal employment agreement with terms, compensation, and compliance clauses.',
    updatedAt: '2026-06-10T08:00:00.000Z',
    content: `<h1>CONTRACT OF EMPLOYMENT</h1>
<p>This Employment Contract is entered into on <strong>June 11, 2026</strong> between <strong>ST. LAWRENCE LAW CORPORATION (STLAF)</strong> and <strong>Employee Name</strong>.</p>
<h2>1. Role and Department</h2>
<p>The Employee is appointed as <strong>Position Title</strong> under the <strong>Department</strong>.</p>
<h2>2. Compensation</h2>
<p>The agreed monthly compensation is <strong>PHP 45,000.00</strong>, subject to mandatory deductions and payroll policies.</p>
<h2>3. Key Clauses</h2>
<ul>
  <li>Confidentiality obligations remain in force after separation.</li>
  <li>Performance review applies during probationary period.</li>
  <li>Company handbook and code of conduct are enforceable.</li>
</ul>
<p>Signed by both parties to confirm acceptance of terms.</p>`
  },
  {
    id: 'offer-letter',
    title: 'Official Offer Letter',
    description: 'Candidate-facing offer letter with role details, start date, and acceptance timeline.',
    updatedAt: '2026-06-08T14:30:00.000Z',
    content: `<h1>LETTER OF OFFER</h1>
<p>Date: <strong>June 11, 2026</strong></p>
<p>Dear <strong>Candidate Name</strong>,</p>
<p>We are pleased to offer you the role of <strong>Position Title</strong> with STLAF.</p>
<h2>Offer Summary</h2>
<ol>
  <li>Work setup: On-site, Pasig City</li>
  <li>Monthly salary: PHP 45,000.00</li>
  <li>Allowance: PHP 5,000.00</li>
  <li>Start date: June 15, 2026</li>
</ol>
<p>Please sign and return this letter on or before <strong>June 18, 2026</strong>.</p>
<p>Warm regards,<br /><strong>HR Department</strong></p>`
  },
  {
    id: 'certificate-employment',
    title: 'Certificate of Employment',
    description: 'Verification document for active employees and current employment standing.',
    updatedAt: '2026-06-01T09:00:00.000Z',
    content: `<h1>CERTIFICATE OF EMPLOYMENT</h1>
<p>To Whom It May Concern:</p>
<p>This is to certify that <strong>Employee Name</strong> is employed as <strong>Position Title</strong> at ST. LAWRENCE LAW CORPORATION (STLAF).</p>
<h2>Employment Details</h2>
<ul>
  <li>Department: Litigation</li>
  <li>Status: Active</li>
  <li>Date hired: June 15, 2026</li>
</ul>
<p>This certificate is issued upon request for legal and administrative purposes.</p>
<p>Issued this <strong>June 11, 2026</strong> in Pasig City, Philippines.</p>`
  }
];

const FONT_SIZE_OPTIONS = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '4' },
  { label: 'XL', value: '5' }
];

function sanitizeTemplateHtml(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  doc.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach((node) => node.remove());

  doc.querySelectorAll('*').forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.toLowerCase();
      if (name.startsWith('on') || value.includes('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return doc.body.innerHTML;
}

function readStoredTemplates(): Record<string, StoredTemplateState> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StoredTemplateState>) : {};
  } catch {
    return {};
  }
}

function formatDateLabel(dateText: string): string {
  return new Date(dateText).toLocaleDateString('en-PH', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

function exportHtmlToPdfLikePrint(title: string, html: string) {
  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) {
    return false;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; margin: 24px; color: #1a2536; }
          h1, h2, h3 { font-family: 'Playfair Display', Georgia, serif; color: #1a2849; }
          h1 { font-size: 28px; border-bottom: 2px solid #c9a961; padding-bottom: 8px; }
          h2 { font-size: 20px; margin-top: 20px; }
          p, li { font-size: 14px; line-height: 1.7; }
          ul, ol { padding-left: 22px; }
        </style>
      </head>
      <body>${sanitizeTemplateHtml(html)}</body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  return true;
}

export default function Templates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [templateStates, setTemplateStates] = useState<Record<string, StoredTemplateState>>({});
  const [activeTemplateId, setActiveTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorHtml, setEditorHtml] = useState('');
  const [fontSize, setFontSize] = useState('3');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTemplateStates(readStoredTemplates());
  }, []);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timer = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const getTemplateContent = useCallback(
    (template: TemplateDef) => templateStates[template.id]?.content || template.content,
    [templateStates]
  );

  const getTemplateUpdatedAt = useCallback(
    (template: TemplateDef) => templateStates[template.id]?.updatedAt || template.updatedAt,
    [templateStates]
  );

  const filteredTemplates = useMemo(() => {
    const normalizedQuery = searchTerm.trim().toLowerCase();

    if (!normalizedQuery) {
      return DEFAULT_TEMPLATES;
    }

    return DEFAULT_TEMPLATES.filter((template) => {
      const haystack = `${template.title} ${template.description}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [searchTerm]);

  const activeTemplate = useMemo(
    () => DEFAULT_TEMPLATES.find((template) => template.id === activeTemplateId) || DEFAULT_TEMPLATES[0],
    [activeTemplateId]
  );

  const previewTemplate = useMemo(
    () => DEFAULT_TEMPLATES.find((template) => template.id === previewTemplateId) || null,
    [previewTemplateId]
  );
  const sanitizedEditorHtml = useMemo(() => sanitizeTemplateHtml(editorHtml), [editorHtml]);
  const sanitizedPreviewHtml = useMemo(
    () => (previewTemplate ? sanitizeTemplateHtml(getTemplateContent(previewTemplate)) : ''),
    [previewTemplate, getTemplateContent]
  );

  const persistTemplate = useCallback(
    (templateId: string, content: string, showToast = false) => {
      const now = new Date().toISOString();
      setTemplateStates((current) => {
        const next = {
          ...current,
          [templateId]: {
            content: sanitizeTemplateHtml(content),
            updatedAt: now
          }
        };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      if (showToast) {
        setToastMessage('Template saved successfully.');
      }
      setLastAutoSavedAt(now);
    },
    []
  );

  const openEditor = useCallback(
    (templateId: string) => {
      const template = DEFAULT_TEMPLATES.find((item) => item.id === templateId);
      if (!template) {
        return;
      }

      setActiveTemplateId(templateId);
      setEditorHtml(getTemplateContent(template));
      setIsEditorOpen(true);
      setPreviewTemplateId(null);
    },
    [getTemplateContent]
  );

  useEffect(() => {
    if (!isEditorOpen || !activeTemplateId) {
      return;
    }

    const debounce = window.setTimeout(() => {
      persistTemplate(activeTemplateId, editorHtml);
    }, 700);

    return () => window.clearTimeout(debounce);
  }, [editorHtml, isEditorOpen, activeTemplateId, persistTemplate]);

  useEffect(() => {
    if (!editorRef.current || !isEditorOpen) {
      return;
    }

    editorRef.current.innerHTML = sanitizeTemplateHtml(editorHtml);
  }, [isEditorOpen, activeTemplateId]);

  const runEditorCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const latestHtml = editorRef.current?.innerHTML || '';
    setEditorHtml(latestHtml);
  };

  const handleFontSizeChange = (value: string) => {
    setFontSize(value);
    runEditorCommand('fontSize', value);
  };

  const handleExport = (template: TemplateDef) => {
    const html = getTemplateContent(template);
    const didStart = exportHtmlToPdfLikePrint(template.title, html);
    setToastMessage(didStart ? 'Export started. Use browser dialog to save as PDF.' : 'Please allow pop-ups to export PDF.');
  };

  const handleManualSave = () => {
    persistTemplate(activeTemplate.id, editorHtml, true);
  };

  return (
    <div className="page-layout text-slate-800 dark:text-slate-100">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-700 dark:bg-[#1A2536]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#1a2849] dark:text-[#f3e3bd]">Templates Workspace</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">Professional HR document templates with editor, preview, and export controls.</p>
          </div>

          <label className="relative block w-full md:w-[340px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search templates..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#c9a961] focus:ring-2 focus:ring-[#d9a74a]/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTemplates.map((template) => (
            <article
              key={template.id}
              className="group rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[#d9a74a] hover:shadow-md dark:border-slate-700 dark:from-slate-800 dark:to-slate-900"
            >
              <h2 className="mb-1 font-serif text-lg font-semibold text-[#1a2849] dark:text-[#f3e3bd]">{template.title}</h2>
              <p className="mb-3 min-h-12 text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Last updated: {formatDateLabel(getTemplateUpdatedAt(template))}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewTemplateId(template.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Eye size={14} /> Preview
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(template.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2849] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#243358]"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleExport(template)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#c9a961] px-3 py-2 text-xs font-semibold text-[#1a2536] transition hover:bg-[#d9a74a]"
                >
                  <FileDown size={14} /> PDF
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
            No templates found for “{searchTerm}”.
          </div>
        )}
      </section>

      {previewTemplate && (
        <div className="fixed inset-0 z-40 bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-6xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111c36]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
              <h3 className="font-serif text-xl font-semibold text-[#1a2849] dark:text-[#f3e3bd]">{previewTemplate.title}</h3>
              <button
                type="button"
                onClick={() => setPreviewTemplateId(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close preview"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <article
                className="mx-auto h-full max-w-4xl rounded-xl border border-slate-200 bg-slate-50 p-8 text-sm leading-7 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                dangerouslySetInnerHTML={{ __html: sanitizedPreviewHtml }}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleExport(previewTemplate)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileDown size={14} /> Export PDF
              </button>
              <button
                type="button"
                onClick={() => openEditor(previewTemplate.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a2849] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#243358]"
              >
                <Edit3 size={14} /> Edit Template
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 p-2 sm:p-4">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#111c36]">
            <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-[#111c36]/95">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-2 font-serif text-sm font-semibold text-[#1a2849] dark:text-[#f3e3bd]">Editing: {activeTemplate.title}</span>

                <button type="button" onClick={() => runEditorCommand('bold')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Bold"><Bold size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('italic')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Italic"><Italic size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('underline')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Underline"><Underline size={15} /></button>

                <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-slate-600 dark:bg-slate-900">
                  <Type size={14} className="text-slate-500 dark:text-slate-300" />
                  <select
                    value={fontSize}
                    onChange={(event) => handleFontSizeChange(event.target.value)}
                    className="bg-transparent text-xs outline-none"
                    aria-label="Font size"
                  >
                    {FONT_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <button type="button" onClick={() => runEditorCommand('justifyLeft')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Align left"><AlignLeft size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('justifyCenter')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Align center"><AlignCenter size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('justifyRight')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Align right"><AlignRight size={15} /></button>

                <button type="button" onClick={() => runEditorCommand('insertUnorderedList')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Unordered list"><List size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('insertOrderedList')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Ordered list"><ListOrdered size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('undo')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Undo"><Undo2 size={15} /></button>
                <button type="button" onClick={() => runEditorCommand('redo')} className="rounded-md border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" aria-label="Redo"><Redo2 size={15} /></button>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  {lastAutoSavedAt && (
                    <span className="text-xs text-slate-500 dark:text-slate-300">Auto-saved {formatDateLabel(lastAutoSavedAt)}</span>
                  )}
                  <button type="button" onClick={handleManualSave} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">Save</button>
                  <button type="button" onClick={() => handleExport(activeTemplate)} className="rounded-lg bg-[#c9a961] px-3 py-2 text-xs font-semibold text-[#1a2536] transition hover:bg-[#d9a74a]">Export PDF</button>
                  <button type="button" onClick={() => setIsEditorOpen(false)} className="rounded-lg bg-[#1a2849] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#243358]">Close</button>
                </div>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-2">
              <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300">Editor</div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(event) => setEditorHtml((event.currentTarget as HTMLDivElement).innerHTML)}
                  className="h-full min-h-[340px] overflow-y-auto p-5 text-sm leading-7 text-slate-700 outline-none dark:text-slate-100"
                />
              </section>

              <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300">Live Preview</div>
                <article
                  className="h-full min-h-[340px] overflow-y-auto p-5 text-sm leading-7 text-slate-700 dark:text-slate-100"
                  dangerouslySetInnerHTML={{ __html: sanitizedEditorHtml }}
                />
              </section>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed right-4 top-4 z-[60] flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 shadow-lg dark:border-emerald-900/60 dark:bg-emerald-950/80 dark:text-emerald-200">
          <CheckCircle2 size={16} />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
