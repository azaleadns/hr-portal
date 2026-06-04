import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import OpenJobs from './components/OpenJobs';
import ApplicantTracker from './components/ApplicantTracker';
import SpreadsheetEmbed from './components/SpreadsheetEmbed';
import Templates from './components/Templates';
import AddCandidateModal from './components/AddCandidateModal';
import PostPositionModal from './components/PostPositionModal';
import { Job, Applicant, Employee, Activity } from './types';
import { applicants as initialApplicants, jobs as initialJobs, employees as initialEmployees } from './data/mockData';
import './App.css';

// Robust CSV Line parser that respects quotes with embedded commas
function parseCSVLine(text: string): string[] {
  let inQuotes = false;
  const cols = [];
  let currentField = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cols.push(currentField.trim().replace(/^"|"$/g, ''));
      currentField = "";
    } else {
      currentField += char;
    }
  }
  cols.push(currentField.trim().replace(/^"|"$/g, ''));
  return cols;
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.split(',').map(p => p.trim());
  if (parts.length > 1) {
    const first = parts[1] || '';
    const last = parts[0] || '';
    return ((first[0] || '') + (last[0] || '')).toUpperCase();
  }
  const words = name.split(' ');
  if (words.length > 1) {
    return ((words[0][0] || '') + (words[1][0] || '')).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  const colors = ['#4f46e5', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#6366f1', '#14b8a6'];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

function parseApplicantsCSV(text: string): Applicant[] {
  const lines = text.split('\n');
  if (lines.length === 0) return [];

  const headerCols = parseCSVLine(lines[0]);
  let idIdx = -1;
  let nameIdx = -1;
  let emailIdx = -1;
  let phoneIdx = -1;
  let positionIdx = -1;
  let stageIdx = -1;
  let expIdx = -1;
  let deptIdx = -1;
  let dateIdx = -1;
  let notesIdx = -1;
  let eduIdx = -1;

  headerCols.forEach((col, idx) => {
    const c = col.toLowerCase().trim();
    if (c.includes('id')) idIdx = idx;
    else if (c.includes('name') || c.includes('candidate')) nameIdx = idx;
    else if (c.includes('email') || c.includes('e-mail')) emailIdx = idx;
    else if (c.includes('phone') || c.includes('cell') || c.includes('contact') || c.includes('mobile')) phoneIdx = idx;
    else if (c.includes('position') || c.includes('apply') || c.includes('role') || c.includes('job')) positionIdx = idx;
    else if (c.includes('stage') || c.includes('status') || c.includes('phase') || c.includes('step')) stageIdx = idx;
    else if (c.includes('experience') || c.includes('years') || c.includes('exp')) expIdx = idx;
    else if (c.includes('department') || c.includes('dept')) deptIdx = idx;
    else if (c.includes('date') || c.includes('submission') || c.includes('applied') || c.includes('sub')) dateIdx = idx;
    else if (c.includes('note') || c.includes('comments') || c.includes('remark') || c.includes('remarks')) notesIdx = idx;
    else if (c.includes('edu') || c.includes('education') || c.includes('degree') || c.includes('school')) eduIdx = idx;
  });

  // Fallbacks standard order if no headers matched
  if (idIdx === -1) idIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  if (emailIdx === -1) emailIdx = 2;
  if (phoneIdx === -1) phoneIdx = 3;
  if (positionIdx === -1) positionIdx = 4;
  if (stageIdx === -1) stageIdx = 5;
  if (expIdx === -1) expIdx = 6;
  if (deptIdx === -1) deptIdx = 7;
  if (dateIdx === -1) dateIdx = 8;
  if (notesIdx === -1) notesIdx = 9;
  if (eduIdx === -1) eduIdx = 10;

  const list: Applicant[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    const name = cols[nameIdx];
    if (!name || name === "Name" || name.toLowerCase().includes('candidate name')) continue;

    const rawStage = (cols[stageIdx] || 'screening').toLowerCase().trim();
    let stage: Applicant['stage'] = 'screening';
    if (rawStage.includes('screen')) stage = 'screening';
    else if (rawStage.includes('review') || rawStage.includes('initial')) stage = 'review';
    else if (rawStage.includes('endorse')) stage = 'endorsement';
    else if (rawStage.includes('final')) stage = 'final_review';
    else if (rawStage.includes('check') || rawStage.includes('bg')) stage = 'bgcheck';
    else if (rawStage.includes('offer')) stage = 'job_offer';
    else if (rawStage.includes('require')) stage = 'fo_requirements';
    else if (rawStage.includes('hired')) stage = 'hired';
    else if (rawStage.includes('reject')) stage = 'rejected';
    else if (rawStage.includes('terminate')) stage = 'TERMINATED';

    list.push({
      id: cols[idIdx] || `APP-SHEET-${i}`,
      name: name,
      email: cols[emailIdx] || '',
      phone: cols[phoneIdx] || '',
      position: cols[positionIdx] || 'Unassigned',
      stage: stage,
      experience: cols[expIdx] || 'N/A',
      avatarColor: getAvatarColor(name),
      initials: getInitials(name),
      department: cols[deptIdx] || 'Litigation',
      submissionDate: cols[dateIdx] || new Date().toISOString().split('T')[0],
      notes: cols[notesIdx] || '',
      education: cols[eduIdx] || ''
    });
  }
  return list;
}

function parseJobsCSV(text: string): Job[] {
  const lines = text.split('\n');
  if (lines.length === 0) return [];

  const headerCols = parseCSVLine(lines[0]);
  let idIdx = -1;
  let titleIdx = -1;
  let deptIdx = -1;
  let typeIdx = -1;
  let reqIdx = -1;
  let openingsIdx = -1;
  let dateReqIdx = -1;
  let datePostIdx = -1;
  let dateRequiredIdx = -1;
  let deadlineIdx = -1;
  let maxIdx = -1;
  let descIdx = -1;
  let qualIdx = -1;
  let statusIdx = -1;

  headerCols.forEach((col, idx) => {
    const c = col.toLowerCase().trim();
    if (c.includes('id')) idIdx = idx;
    else if (c.includes('title') || c.includes('position name')) titleIdx = idx;
    else if (c.includes('department') || c.includes('dept')) deptIdx = idx;
    else if (c.includes('type') || c.includes('position status') || c.includes('additional') || c.includes('replacement')) typeIdx = idx;
    else if (c.includes('no required') || c.includes('required count') || c.includes('number')) reqIdx = idx;
    else if (c.includes('openings') || c.includes('slots')) openingsIdx = idx;
    else if (c.includes('date requested') || c.includes('requested')) dateReqIdx = idx;
    else if (c.includes('date posted') || c.includes('posted')) datePostIdx = idx;
    else if (c.includes('date required') || c.includes('required date')) dateRequiredIdx = idx;
    else if (c.includes('deadline')) deadlineIdx = idx;
    else if (c.includes('max') || c.includes('limit')) maxIdx = idx;
    else if (c.includes('description') || c.includes('desc')) descIdx = idx;
    else if (c.includes('qualification') || c.includes('quals') || c.includes('requirement')) qualIdx = idx;
    else if (c.includes('status')) statusIdx = idx;
  });

  if (idIdx === -1) idIdx = 0;
  if (titleIdx === -1) titleIdx = 1;
  if (deptIdx === -1) deptIdx = 2;
  if (typeIdx === -1) typeIdx = 3;
  if (reqIdx === -1) reqIdx = 4;
  if (openingsIdx === -1) openingsIdx = 5;
  if (dateReqIdx === -1) dateReqIdx = 6;
  if (datePostIdx === -1) datePostIdx = 7;
  if (dateRequiredIdx === -1) dateRequiredIdx = 8;
  if (deadlineIdx === -1) deadlineIdx = 9;
  if (maxIdx === -1) maxIdx = 10;
  if (descIdx === -1) descIdx = 11;
  if (qualIdx === -1) qualIdx = 12;
  if (statusIdx === -1) statusIdx = 13;

  const list: Job[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 2) continue;

    const title = cols[titleIdx];
    if (!title || title.toLowerCase().includes('position title') || title === "Title") continue;

    const rawStatus = (cols[statusIdx] || 'OPEN').toUpperCase().trim();
    let status: Job['status'] = 'OPEN';
    if (rawStatus.includes('CLOSE')) status = 'CLOSED';
    else if (rawStatus.includes('DRAFT')) status = 'DRAFT';

    const reqCount = parseInt(cols[reqIdx], 10) || 1;
    const openingsCount = parseInt(cols[openingsIdx], 10) || reqCount;

    list.push({
      id: cols[idIdx] || `JOB-SHEET-${i}`,
      title: title,
      position: title,
      department: cols[deptIdx] || 'Litigation',
      positionStatus: cols[typeIdx] || 'Replacement',
      noRequired: reqCount,
      openings: openingsCount,
      dateRequested: cols[dateReqIdx] || new Date().toISOString().split('T')[0],
      datePosted: cols[datePostIdx] || new Date().toISOString().split('T')[0],
      dateRequired: cols[dateRequiredIdx] || new Date().toISOString().split('T')[0],
      deadline: cols[deadlineIdx] || new Date().toISOString().split('T')[0],
      applicants: 0,
      maxApplicants: parseInt(cols[maxIdx], 10) || 15,
      description: cols[descIdx] || 'No description provided.',
      qualification: cols[qualIdx] || 'No qualifications listed.',
      status: status
    });
  }
  return list;
}

function parseEmployeesCSV(text: string): Employee[] {
  const lines = text.split('\n');
  const loadedEmployees: Employee[] = [];

  for (let i = 7; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = parseCSVLine(line);
    if (cols.length < 5) continue;

    const name = cols[2];
    if (!name || name === "Name (LN, FN, MI.)") continue;

    loadedEmployees.push({
      id: cols[1] || `EMP-SHEET-${i}`,
      name: name,
      dateHired: cols[3],
      dateOfRegularization: cols[4],
      company: cols[5],
      department: cols[6],
      position: cols[7],
      jobStatus: cols[8],
      employeeLevel: cols[9],
      localEmail: cols[10],
      stlafEmail: cols[11],
      gender: cols[12],
      dateOfBirth: cols[13],
      civilStatus: cols[14],
      personalEmail: cols[15],
      cellPhone: cols[16],
      address: cols[17],
      contactName: cols[18],
      relationship: cols[19],
      contactNo: cols[20],
      active: (cols[21] || 'Yes') as 'Yes' | 'No',
      terminationDate: cols[22],
      reason: cols[23],
      remarks: cols[24],
      sss: cols[25],
      philhealth: cols[26],
      hdmf: cols[27],
      tin: cols[28],
      duration: cols[29],
      onboardingStatus: 'completed',
      onboardingProgress: 100,
      offboardingStatus: 'not_started',
      offboardingProgress: 0
    });
  }
  return loadedEmployees;
}

export default function App() {
  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Synchronized Employees list state for KPIs on Overview page
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('stlaf_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved employees', e);
      }
    }
    return initialEmployees;
  });

  const syncAllData = async () => {
    setIsSyncing(true);
    const spreadsheetId = '1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk';
    
    // 1. Fetch Applicants from "Applicants" sheet
    try {
      const appUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Applicants`;
      const res = await window.fetch(appUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseApplicantsCSV(text);
        setApplicants(parsed);
      }
    } catch (e) {
      console.error("Applicants sheet sync failed, showing local clean state:", e);
    }

    // 2. Fetch Jobs from "Jobs" sheet
    try {
      const jobsUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Jobs`;
      const res = await window.fetch(jobsUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseJobsCSV(text);
        setJobs(parsed);
      }
    } catch (e) {
      console.error("Jobs sheet sync failed, showing local clean state:", e);
    }

    // 3. Fetch Employees from sheet 0
    try {
      const empUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;
      const res = await window.fetch(empUrl);
      if (res.ok) {
        const text = await res.text();
        const parsed = parseEmployeesCSV(text);
        if (parsed.length > 0) {
          setEmployees(parsed);
        }
      }
    } catch (e) {
      console.error("Employees sync in App failed:", e);
    }

    setIsSyncing(false);
  };

  useEffect(() => {
    syncAllData();
  }, []);

  // Modals visibility states
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showPostPosition, setShowPostPosition] = useState(false);

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('stlaf_activities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved activities', e);
      }
    }
    return [
      {
        id: 'act-1',
        applicantName: 'Juan Dela Cruz',
        action: 'moved cases inside Screening stage',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        stage: 'screening'
      },
      {
        id: 'act-2',
        applicantName: 'Maria Santos',
        action: 'submitted resume credentials',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        stage: 'review'
      },
      {
        id: 'act-3',
        applicantName: 'Carlos Reyes',
        action: 'approved for technical endorsement',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        stage: 'endorsement'
      },
      {
        id: 'act-4',
        applicantName: 'Rafael Mendoza',
        action: 'contract signed and active!',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        stage: 'hired'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('stlaf_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('stlaf_employees', JSON.stringify(employees));
  }, [employees]);

  const updateApplicantStage = (applicantId: string, newStage: Applicant['stage']) => {
    const applicant = applicants.find(app => app.id === applicantId);
    if (applicant) {
      let actionText = '';
      if (newStage === 'hired') {
        actionText = 'formally completed welcome onboarding!';

        // Create actual Employee entry when Hired
        const exists = employees.some(e => e.name.toLowerCase() === applicant.name.toLowerCase());
        if (!exists) {
          const empId = `EMP-2026-${String(employees.length + 1).padStart(3, '0')}`;
          const newEmp: Employee = {
            id: empId,
            name: applicant.name,
            dateHired: new Date().toISOString().split('T')[0],
            dateOfRegularization: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
            company: 'STLAF Law Corp',
            department: applicant.department || 'Litigation',
            position: applicant.position,
            jobStatus: 'Probationary',
            employeeLevel: 'Mid level',
            localEmail: `${applicant.name.toLowerCase().replace(/ /g, '.')}@stlaf-law.com`,
            stlafEmail: `${applicant.name.toLowerCase().replace(/ /g, '.')}@stlaf.org.ph`,
            gender: 'Female', // default for gender breakdown
            dateOfBirth: '1995-01-01',
            civilStatus: 'Single',
            personalEmail: applicant.email,
            cellPhone: applicant.phone,
            address: 'Mainland Pasig, Manila',
            contactName: 'N/A',
            relationship: 'N/A',
            contactNo: 'N/A',
            active: 'Yes',
            sss: '00-0000000-0',
            philhealth: '00-000000000-0',
            hdmf: '0000-0000-0000',
            tin: '000-000-000-000',
            duration: 'Newly Hired (Active)',
            onboardingStatus: 'in_progress',
            onboardingProgress: 0,
            offboardingStatus: 'not_started',
            offboardingProgress: 0
          };
          setEmployees(prev => [newEmp, ...prev]);
        }
      } else if (newStage === 'rejected') {
        actionText = 'moved to non-selected storage';
      } else if (newStage === 'screening') {
        actionText = 'scheduled for initial screening interview';
      } else {
        actionText = `progressed to ${newStage} evaluation`;
      }

      const newActivity = {
        id: `act-${Date.now()}`,
        applicantName: applicant.name,
        action: actionText,
        timestamp: new Date().toISOString(),
        stage: newStage
      };
      setActivities(prev => [newActivity, ...prev]);
    }

    setApplicants(prev =>
      prev.map(app =>
        app.id === applicantId ? { ...app, stage: newStage } : app
      )
    );
  };

  const addJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    
    // Add activity logging
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      applicantName: `Job Opening`,
      action: `announced new position: ${newJob.title}`,
      timestamp: new Date().toISOString(),
      stage: 'review'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const closeJob = (jobId: string, jobTitle: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    
    // Add activity logging
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      applicantName: `Job Opening`,
      action: `closed / archived position: ${jobTitle}`,
      timestamp: new Date().toISOString(),
      stage: 'rejected'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  const updateJobStatus = (jobId: string, newStatus: Job['status']) => {
    setJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: newStatus } : job))
    );
  };

  const addCandidate = (candidate: Applicant) => {
    setApplicants(prev => [candidate, ...prev]);
    
    // Add activity logging
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      applicantName: candidate.name,
      action: `officially registered into pipeline stage: ${candidate.stage}`,
      timestamp: new Date().toISOString(),
      stage: candidate.stage
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  return (
    <Router>
      <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onAddCandidateClick={() => setShowAddCandidate(true)}
          onPostPositionClick={() => setShowPostPosition(true)}
          onNavClick={() => setSidebarCollapsed(true)}
        />
        
        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard applicants={applicants} employees={employees} />}
            />
            <Route
              path="/dashboard"
              element={<Dashboard applicants={applicants} employees={employees} />}
            />
            <Route
              path="/open-jobs"
              element={
                <OpenJobs
                  jobs={jobs}
                  onAddJob={addJob}
                  onCloseJob={closeJob}
                  onUpdateStatus={updateJobStatus}
                  applicants={applicants}
                  isSyncing={isSyncing}
                  onSync={syncAllData}
                />
              }
            />
            <Route
              path="/applicant-tracker"
              element={
                <ApplicantTracker
                  applicants={applicants}
                  onUpdateStage={updateApplicantStage}
                  onAddCandidate={addCandidate}
                  isSyncing={isSyncing}
                  onSync={syncAllData}
                />
              }
            />
            <Route
              path="/spreadsheet"
              element={<SpreadsheetEmbed />}
            />
            <Route
              path="/templates"
              element={<Templates />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>

      {/* Global Add Candidate Modal */}
      {showAddCandidate && (
        <AddCandidateModal
          onClose={() => setShowAddCandidate(false)}
          onAdd={addCandidate}
        />
      )}

      {/* Global Post Position Modal */}
      {showPostPosition && (
        <PostPositionModal
          onClose={() => setShowPostPosition(false)}
          onSubmit={addJob}
        />
      )}
    </Router>
  );
}
