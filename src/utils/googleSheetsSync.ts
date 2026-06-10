import { Applicant, Job } from '../types';

const SPREADSHEET_ID = '1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk';

export interface SyncConfig {
  method: 'local' | 'apps_script' | 'google_oauth';
  webAppUrl: string; // Google Apps Script Deployment URL
  accessToken: string; // REST API Google Access Token
}

// Default config
const DEFAULT_CONFIG: SyncConfig = {
  method: 'local',
  webAppUrl: '',
  accessToken: '',
};

// Retrieve configuration from localStorage
export function isValidAppsScriptUrl(url: string | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.includes('script.google.com') && trimmed.includes('/macros/');
}

export function getSyncConfig(): SyncConfig {
  const saved = localStorage.getItem('stlaf_sheets_sync_config');
  let config = { ...DEFAULT_CONFIG };
  if (saved) {
    try {
      config = { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse sync config', e);
    }
  }
  
  if (config.webAppUrl) {
    config.webAppUrl = config.webAppUrl.trim();
  }
  if (config.accessToken) {
    config.accessToken = config.accessToken.trim();
  }
  
  // Auto-upgrade method if webAppUrl or accessToken is defined but method is set to local
  if (config.webAppUrl && isValidAppsScriptUrl(config.webAppUrl)) {
    config.method = 'apps_script';
  } else if (config.accessToken) {
    config.method = 'google_oauth';
  } else {
    config.method = 'local';
  }
  
  return config;
}

// Save configuration to localStorage
export function saveSyncConfig(config: SyncConfig) {
  localStorage.setItem('stlaf_sheets_sync_config', JSON.stringify(config));
}

// Fetch Candidates (Applicants) from Google Sheets or Apps Script Web App
export async function fetchSpreadsheetCandidates(config: SyncConfig): Promise<Applicant[] | null> {
  const { method, webAppUrl, accessToken } = config;
  
  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(`${webAppUrl}?action=read`);
      if (!response.ok) throw new Error('Apps Script returned non-200 status');
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.candidates)) {
        return data.candidates.map((c: any) => parseApplicantFromSheet(c));
      }
    } catch (e) {
      console.error('Failed to fetch candidates from Apps Script:', e);
      throw e;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      // Use standard Google Sheets API: GET https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}
      const range = 'New Candidates!A1:N1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Google Sheets OAuth API returned non-200 status');
      const data = await response.json();
      if (data.values && data.values.length > 1) {
        const headers = data.values[0];
        const rows = data.values.slice(1);
        return rows.map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return parseApplicantFromSheet(obj);
        });
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch candidates from Google OAuth Sheets API:', e);
      throw e;
    }
  }
  return null;
}

// Fetch Job Openings from Google Sheets or Apps Script Web App
export async function fetchSpreadsheetJobs(config: SyncConfig): Promise<Job[] | null> {
  const { method, webAppUrl, accessToken } = config;

  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(`${webAppUrl}?action=read`);
      if (!response.ok) throw new Error('Apps Script returned non-200 status');
      const data = await response.json();
      if (data.status === 'success' && Array.isArray(data.jobs)) {
        return data.jobs.map((j: any) => parseJobFromSheet(j));
      }
    } catch (e) {
      console.error('Failed to fetch jobs from Apps Script:', e);
      throw e;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      const range = 'Job Openings!A1:Q1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Google Sheets OAuth API returned non-200 status');
      const data = await response.json();
      if (data.values && data.values.length > 1) {
        const headers = data.values[0];
        const rows = data.values.slice(1);
        return rows.map((row: any[]) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index];
          });
          return parseJobFromSheet(obj);
        });
      }
      return [];
    } catch (e) {
      console.error('Failed to fetch jobs from Google OAuth Sheets API:', e);
      throw e;
    }
  }
  return null;
}

// Write or Update Candidate row
export async function writeSpreadsheetCandidate(config: SyncConfig, candidate: Applicant): Promise<boolean> {
  const { method, webAppUrl, accessToken } = config;

  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'write_candidate', candidate })
      });
      return response.ok;
    } catch (e) {
      console.error('Failed to write candidate via Apps Script', e);
      return false;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      // Step 1: Read sheet to check if applicant exists and append or update
      const getRange = 'New Candidates!A1:N1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(getRange)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      let values: any[][] = [];
      let rowIndex = -1;
      let headers: string[] = ['id', 'name', 'email', 'phone', 'position', 'stage', 'experience', 'department', 'submissionDate', 'notes', 'education', 'avatarColor', 'initials'];
      
      if (response.ok) {
        const data = await response.json();
        if (data.values) {
          values = data.values;
          headers = values[0];
          const idIndex = headers.indexOf('id');
          if (idIndex !== -1) {
            rowIndex = values.findIndex((row, idx) => idx > 0 && row[idIndex] === candidate.id);
          }
        }
      }

      const rowValues = headers.map(h => {
        if (h === 'notes') return candidate.notes || '';
        return (candidate as any)[h] !== undefined ? String((candidate as any)[h]) : '';
      });

      if (rowIndex !== -1) {
        // Update existing row
        const updateRange = `New Candidates!A${rowIndex + 1}`;
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowValues] })
        });
      } else {
        // Append new row
        const appendRange = 'New Candidates!A1';
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowValues] })
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to write candidate via REST Auth API', e);
      return false;
    }
  }
  return false;
}

// Delete Candidate row
export async function deleteSpreadsheetCandidate(config: SyncConfig, candidateId: string): Promise<boolean> {
  const { method, webAppUrl, accessToken } = config;

  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete_candidate', id: candidateId })
      });
      return response.ok;
    } catch (e) {
      console.error('Failed to delete candidate via Apps Script', e);
      return false;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      // Direct REST API deletion is more complex as Sheets API doesn't support "delete row" easily via VALUES endpoint,
      // but we can clear the values of that row.
      const getRange = 'New Candidates!A1:N1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(getRange)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.values) {
          const headers = data.values[0];
          const idIndex = headers.indexOf('id');
          const rowIdx = data.values.findIndex((row: any[], idx: number) => idx > 0 && row[idIndex] === candidateId);
          if (rowIdx !== -1) {
            const clearRange = `New Candidates!A${rowIdx + 1}:N${rowIdx + 1}`;
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(clearRange)}:clear`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Failed to delete candidate via REST API', e);
    }
  }
  return false;
}

// Write or Update Job row
export async function writeSpreadsheetJob(config: SyncConfig, job: Job): Promise<boolean> {
  const { method, webAppUrl, accessToken } = config;

  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'write_job', job })
      });
      return response.ok;
    } catch (e) {
      console.error('Failed to write job via Apps Script', e);
      return false;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      const getRange = 'Job Openings!A1:Q1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(getRange)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      let values: any[][] = [];
      let rowIndex = -1;
      let headers: string[] = ['id', 'title', 'position', 'department', 'positionStatus', 'noRequired', 'openings', 'dateRequested', 'datePosted', 'dateRequired', 'deadline', 'applicants', 'maxApplicants', 'description', 'qualification', 'status'];

      if (response.ok) {
        const data = await response.json();
        if (data.values) {
          values = data.values;
          headers = values[0];
          const idIndex = headers.indexOf('id');
          if (idIndex !== -1) {
            rowIndex = values.findIndex((row, idx) => idx > 0 && row[idIndex] === job.id);
          }
        }
      }

      const rowValues = headers.map(h => (job as any)[h] !== undefined ? String((job as any)[h]) : '');

      if (rowIndex !== -1) {
        const updateRange = `Job Openings!A${rowIndex + 1}`;
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowValues] })
        });
      } else {
        const appendRange = 'Job Openings!A1';
        await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [rowValues] })
        });
      }
      return true;
    } catch (e) {
      console.error('Failed to write job via REST API', e);
      return false;
    }
  }
  return false;
}

// Delete Job row
export async function deleteSpreadsheetJob(config: SyncConfig, jobId: string): Promise<boolean> {
  const { method, webAppUrl, accessToken } = config;

  if (method === 'apps_script' && webAppUrl) {
    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'delete_job', id: jobId })
      });
      return response.ok;
    } catch (e) {
      console.error('Failed to delete job via Apps Script', e);
      return false;
    }
  } else if (method === 'google_oauth' && accessToken) {
    try {
      const getRange = 'Job Openings!A1:Q1000';
      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(getRange)}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.values) {
          const headers = data.values[0];
          const idIndex = headers.indexOf('id');
          const rowIdx = data.values.findIndex((row: any[], idx: number) => idx > 0 && row[idIndex] === jobId);
          if (rowIdx !== -1) {
            const clearRange = `Job Openings!A${rowIdx + 1}:Q${rowIdx + 1}`;
            await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(clearRange)}:clear`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            return true;
          }
        }
      }
    } catch (e) {
      console.error('Failed to delete job via REST API', e);
    }
  }
  return false;
}

// Converters to robustly handle type casting from sheet cells to model types
function parseApplicantFromSheet(row: any): Applicant {
  return {
    id: row.id || `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: row.name || 'Anonymous',
    email: row.email || '',
    phone: row.phone || '',
    position: row.position || 'Paralegal',
    stage: (row.stage || 'screening') as Applicant['stage'],
    experience: row.experience || '',
    avatarColor: row.avatarColor || '#6366f1',
    initials: row.initials || 'A',
    department: row.department || 'Litigation',
    submissionDate: row.submissionDate || new Date().toISOString().split('T')[0],
    notes: row.notes || '',
    education: row.education || ''
  };
}

function parseJobFromSheet(row: any): Job {
  return {
    id: row.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: row.title || row.position || 'Officer Position',
    position: row.position || row.title || 'Officer Position',
    department: row.department || 'Litigation Department',
    positionStatus: row.positionStatus || 'Additional',
    noRequired: parseInt(row.noRequired, 10) || 1,
    openings: parseInt(row.openings, 10) || 1,
    dateRequested: row.dateRequested || new Date().toISOString().split('T')[0],
    datePosted: row.datePosted || new Date().toISOString().split('T')[0],
    dateRequired: row.dateRequired || new Date().toISOString().split('T')[0],
    deadline: row.deadline || '',
    applicants: parseInt(row.applicants, 10) || 0,
    maxApplicants: parseInt(row.maxApplicants, 10) || 10,
    description: row.description || '',
    qualification: row.qualification || '',
    status: (row.status || 'OPEN') as Job['status']
  };
}
