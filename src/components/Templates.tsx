import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Copy, FileText, Check, FileSignature, HelpCircle } from 'lucide-react';
import './Templates.css';

interface TemplateDef {
  id: string;
  name: string;
  subject: string;
  defaultText: string;
}

const DEFAULT_TEMPLATES: TemplateDef[] = [
  {
    id: 'contract',
    name: 'Employment Contract',
    subject: 'CONTRACT OF EMPLOYMENT',
    defaultText: `This EMPLOYMENT CONTRACT is made and executed this {currentDate} in Pasig City, Metro Manila, Philippines, by and between:

ST. LAWRENCE LAW CORPORATION (STLAF), a law coporation duly registered under Philippine laws, with primary chambers at 777 Emerald Avenue, Ortigas, Pasig City, represented herein by its Managing Partner, hereafter referred to as "EMPLOYER";

- and -

{candidateName}, of legal age, Filipino citizen, residing at Pasig, Manila, hereinafter referred to as the "EMPLOYEE".

WITNESSETH: THAT —

1. POSITION AND TRIAL PERIOD:
The Employer hereby employs the Employee as {position} under the {department} Department starting {startDate}. The Employee's status shall be Probationary for a period of six (6) months, during which the Employee shall be assessed according to established regulations of STLAF.

2. COMPENSATION AND REMUNERATION:
The Employee shall receive a monthly gross salary of PHP {salary}, payable bi-monthly on the 15th and 30th of each calendar month, subject to standard legally mandated government deductions (SSS, PhilHealth, Pag-IBIG HDMF, and TIN withholding taxes).

3. RESPONSIBILITIES AND PROFESSIONAL STANDARDS:
The Employee covenants to fulfill all trial litigation briefs, contract creations, legal drafts, client consults, and other responsibilities related to the assigned counsel level with utmost precision and strict adherence to the Supreme Court's Code of Professional Responsibility and Accountability.

IN WITNESS WHEREOF, the parties have signed this covenant.`
  },
  {
    id: 'offer',
    name: 'Official Offer Letter',
    subject: 'LETTER OF OFFER',
    defaultText: `Date: {currentDate}

Dear {candidateName},

Following our extensive evaluations and recruitment reviews, ST. LAWRENCE LAW CORPORATION (STLAF) is delighted to extend this official offer for the position of {position} under our {department} Department.

Kindly take note of our primary offer specifications outlined below:

- DESIGNATION: {position}
- WORKSTATION: Pasig Chambers, Ortigas, Metro Manila
- COMPENSATION STATUS: Monthly base structural salary of PHP {salary}
- ADDITIONAL ALLOWANCES: Seniority allowances of PHP {allowance} monthly
- COMMENCEMENT OF DUTIES: {startDate}

To confirm your formal acceptance of this legal career announcement at STLAF, please return a signed duplicate copy of this document on or before {responseDeadline}.

We look forward to collaborating with you inside our counseling suite.

Warm regards,

MANAGING PARTNER
St. Lawrence Law Offices`
  },
  {
    id: 'coe',
    name: 'Certificate of Employment',
    subject: 'CERTIFICATE OF EMPLOYMENT',
    defaultText: `TO WHOM IT MAY CONCERN:

This is to certify that {candidateName} has been actively employed with ST. LAWRENCE LAW CORPORATION (STLAF) as {position} under our specialized {department} Department.

Employee service parameters are recorded within our database files as follows:

- STARTDATE OF COVENANT: {startDate}
- MONTHLY REMUNERATION STATUS: PHP {salary} Monthly Gross
- CURRENT STANDING: Active In Good Standing
- ADHERED CONDUIT: Excellent litigation reviews and compliance standards

This certificate of employment is issued for verification or other legal compliance queries on this {currentDate} at the Ortigas Chambers of Pasig City, Philippines.


SUITE MANAGEMENT
Human Resources, STLAF Corporation`
  }
];

export default function Templates() {
  const [selectedTemplateId, setSelectedTemplateId] = useState('contract');
  const [copied, setCopied] = useState(false);

  // Form editable state variables
  const [candidateName, setCandidateName] = useState('Elena Santos');
  const [position, setPosition] = useState('Junior Associate Counsel');
  const [department, setDepartment] = useState('Litigation');
  const [startDate, setStartDate] = useState('2026-06-15');
  const [salary, setSalary] = useState('45,000.00');
  const [allowance, setAllowance] = useState('5,000.00');
  const [responseDeadline, setResponseDeadline] = useState('2026-06-10');

  // Custom text for user edits - loaded when selected template changes
  const [editableTemplateText, setEditableTemplateText] = useState('');

  const currentTemplate = useMemo(() => {
    return DEFAULT_TEMPLATES.find(t => t.id === selectedTemplateId) || DEFAULT_TEMPLATES[0];
  }, [selectedTemplateId]);

  // Load default template structure on mount / switch
  useEffect(() => {
    setEditableTemplateText(currentTemplate.defaultText);
  }, [selectedTemplateId, currentTemplate]);

  // Dynamically replace variables inside our text template
  const compiledText = useMemo(() => {
    const today = new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let res = editableTemplateText;
    res = res.replace(/{candidateName}/g, candidateName);
    res = res.replace(/{position}/g, position);
    res = res.replace(/{department}/g, department);
    res = res.replace(/{startDate}/g, startDate);
    res = res.replace(/{salary}/g, salary);
    res = res.replace(/{allowance}/g, allowance);
    res = res.replace(/{responseDeadline}/g, responseDeadline);
    res = res.replace(/{currentDate}/g, today);
    return res;
  }, [editableTemplateText, candidateName, position, department, startDate, salary, allowance, responseDeadline]);

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(compiledText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the current template to defaults?')) {
      setEditableTemplateText(currentTemplate.defaultText);
    }
  };

  return (
    <div className="templates-container page-layout">
      {/* Dynamic left options & fields panel */}
      <div className="templates-sidebar no-print">
        <h2 className="templates-title">Document Desk</h2>
        
        <div className="select-wrapper">
          <label className="select-label">Select Paper Template</label>
          <select 
            className="template-dropdown"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
          >
            {DEFAULT_TEMPLATES.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Input variables */}
        <div style={{ marginTop: '8px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#1a2849', borderBottom: '1px solid #e1e8f0', paddingBottom: '4px', marginBottom: '12px' }}>
            Placeholder Variables
          </h3>
          
          <div className="variables-section">
            <div className="var-input-group">
              <label className="var-label">Counsel/Employee Name</label>
              <input 
                type="text" 
                className="var-input" 
                value={candidateName} 
                onChange={(e) => setCandidateName(e.target.value)} 
              />
            </div>

            <div className="var-input-group">
              <label className="var-label">Target Position</label>
              <input 
                type="text" 
                className="var-input" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
              />
            </div>

            <div className="var-input-group">
              <label className="var-label">Department / Chamber</label>
              <input 
                type="text" 
                className="var-input" 
                value={department} 
                onChange={(e) => setDepartment(e.target.value)} 
              />
            </div>

            <div className="var-input-group">
              <label className="var-label">Commencement Date</label>
              <input 
                type="date" 
                className="var-input" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
              />
            </div>

            <div className="var-input-group">
              <label className="var-label">Base Monthly Salary (₱)</label>
              <input 
                type="text" 
                className="var-input" 
                value={salary} 
                onChange={(e) => setSalary(e.target.value)} 
              />
            </div>

            {selectedTemplateId === 'offer' && (
              <>
                <div className="var-input-group">
                  <label className="var-label">Allowance Monthly (₱)</label>
                  <input 
                    type="text" 
                    className="var-input" 
                    value={allowance} 
                    onChange={(e) => setAllowance(e.target.value)} 
                  />
                </div>

                <div className="var-input-group">
                  <label className="var-label">Response Deadline</label>
                  <input 
                    type="date" 
                    className="var-input" 
                    value={responseDeadline} 
                    onChange={(e) => setResponseDeadline(e.target.value)} 
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tip block */}
        <div style={{ marginTop: 'auto', background: '#eff6ff', padding: '12px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <p style={{ fontSize: '11px', color: '#1e3a8a', lineHeight: '1.4', display: 'flex', gap: '6px' }}>
            <HelpCircle size={15} style={{ flexShrink: 0 }} />
            <span>Use the fields above to automatically compile dynamic legal drafts. You can also edit the document body directly.</span>
          </p>
        </div>
      </div>

      {/* Main visual workspace */}
      <div className="templates-workspace">
        <div className="workspace-actions no-print">
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSignature size={18} color="#c9a961" />
              <span>Drafting Mode: {currentTemplate.name}</span>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="action-btn-styled action-btn-secondary" onClick={handleReset}>
              Reset Template
            </button>
            <button className="action-btn-styled action-btn-secondary" onClick={handleCopyClipboard}>
              {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
            <button className="action-btn-styled action-btn-primary" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Parchment preview stage */}
        <div className="document-outer">
          <div className="document-page">
            <div className="letterhead">
              <h1 className="letterhead-title" style={{ fontFamily: 'Playfair Display' }}>ST. LAWRENCE LAW OFFICES</h1>
              <span className="letterhead-sub">Chambers of Trial Advocacy & Legal Counseling</span>
              <p className="letterhead-info">777 Emerald Avenue, Ortigas, Pasig City, Metro Manila · +632-888-7777 · administration@stlaf-law.com</p>
            </div>

            <h2 className="document-title" style={{ fontFamily: 'Playfair Display' }}>{currentTemplate.subject}</h2>

            <textarea
              className="document-text-editor"
              style={{ fontFamily: 'Playfair Display' }}
              value={compiledText}
              onChange={(e) => setEditableTemplateText(e.target.value)}
              placeholder="Edit your document here..."
            />

            {/* Signature Area */}
            <div className="sign-area">
              <div className="sign-flex">
                <div className="sign-col">
                  <div className="sign-line"></div>
                  <span className="sign-label">STLAF REPRESENTATIVE</span>
                </div>
                <div className="sign-col">
                  <div className="sign-line"></div>
                  <span className="sign-label">{candidateName.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="document-footer">
              <span>ST. LAWRENCE LAW OFFICES © 2026</span>
              <span>CONFIDENTIAL DESTRUCT CODE 09-AF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
