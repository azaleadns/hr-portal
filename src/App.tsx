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
import { getSyncConfig, fetchSpreadsheetCandidates, fetchSpreadsheetJobs, writeSpreadsheetCandidate, deleteSpreadsheetCandidate, writeSpreadsheetJob, deleteSpreadsheetJob } from './utils/googleSheetsSync';
import Login from './components/Login';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('stlaf_authenticated') === 'true';
  });

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('stlaf_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('stlaf_authenticated');
  };

  const [applicants, setApplicants] = useState<Applicant[]>(() => {
    const saved = localStorage.getItem('stlaf_applicants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved applicants', e);
      }
    }
    // Return empty array [] by default to clear/remove candidates from the Kanban board on load
    return [];
  });
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('stlaf_jobs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved jobs', e);
      }
    }
    // Return empty array [] by default to clear/remove job positions on load
    return [];
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  useEffect(() => {
    localStorage.setItem('stlaf_applicants', JSON.stringify(applicants));
  }, [applicants]);

  useEffect(() => {
    localStorage.setItem('stlaf_jobs', JSON.stringify(jobs));
  }, [jobs]);

  const [isSyncingSheets, setIsSyncingSheets] = useState(false);

  const loadSheetsDatabase = async () => {
    const syncConfig = getSyncConfig();
    if (syncConfig.method !== 'local') {
      setIsSyncingSheets(true);
      try {
        const fetchedCandidates = await fetchSpreadsheetCandidates(syncConfig);
        if (fetchedCandidates) {
          setApplicants(fetchedCandidates);
        }
        const fetchedJobs = await fetchSpreadsheetJobs(syncConfig);
        if (fetchedJobs) {
          setJobs(fetchedJobs);
        }
      } catch (err) {
        console.error('Error auto-syncing with Google Sheets:', err);
      } finally {
        setIsSyncingSheets(false);
      }
    }
  };

  useEffect(() => {
    loadSheetsDatabase();

    const handleSyncConfigUpdate = () => {
      loadSheetsDatabase();
    };

    window.addEventListener('sheets_sync_config_updated', handleSyncConfigUpdate);
    return () => {
      window.removeEventListener('sheets_sync_config_updated', handleSyncConfigUpdate);
    };
  }, []);

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

    setApplicants(prev => {
      const updated = prev.map(app =>
        app.id === applicantId ? { ...app, stage: newStage } : app
      );
      const target = updated.find(app => app.id === applicantId);
      if (target) {
        const syncConfig = getSyncConfig();
        if (syncConfig.method !== 'local') {
          writeSpreadsheetCandidate(syncConfig, target);
        }
      }
      return updated;
    });
  };

  const addJob = (newJob: Job) => {
    setJobs(prev => [newJob, ...prev]);
    
    // Writeback to Google Sheets
    const syncConfig = getSyncConfig();
    if (syncConfig.method !== 'local') {
      writeSpreadsheetJob(syncConfig, newJob);
    }
    
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
    
    // Writeback to Google Sheets
    const syncConfig = getSyncConfig();
    if (syncConfig.method !== 'local') {
      deleteSpreadsheetJob(syncConfig, jobId);
    }
    
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
    
    // Writeback to Google Sheets
    const syncConfig = getSyncConfig();
    if (syncConfig.method !== 'local') {
      writeSpreadsheetCandidate(syncConfig, candidate);
    }
    
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

  const deleteCandidate = (candidateId: string) => {
    const candidate = applicants.find(app => app.id === candidateId);
    setApplicants(prev => prev.filter(app => app.id !== candidateId));
    
    // Writeback to Google Sheets
    const syncConfig = getSyncConfig();
    if (syncConfig.method !== 'local') {
      deleteSpreadsheetCandidate(syncConfig, candidateId);
    }
    
    // Add activity logging
    if (candidate) {
      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        applicantName: candidate.name,
        action: `removed candidate from pipeline tracking`,
        timestamp: new Date().toISOString(),
        stage: 'rejected'
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
            <Sidebar
              collapsed={sidebarCollapsed}
              onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
              onAddCandidateClick={() => setShowAddCandidate(true)}
              onPostPositionClick={() => setShowPostPosition(true)}
              onNavClick={() => setSidebarCollapsed(true)}
              onLogout={handleLogout}
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
                      onDeleteCandidate={deleteCandidate}
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
        </>
      )}
    </Router>
  );
}
