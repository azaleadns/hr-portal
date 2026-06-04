import React, { useState, useEffect, useMemo } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Applicant, Employee } from '../types';
import { Users, FileUser, ExternalLink, RefreshCw, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  applicants: Applicant[];
  employees: Employee[];
}

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

// Flexible helper to parse complex month year formats like "Aug 14, 2025", "2026-03-01", etc.
function parseSheetDate(dateStr: string): { month: number; year: number } | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  
  // Try format "Month DD, YYYY" (e.g., "Aug 14, 2025")
  const matchReadable = dateStr.match(/([a-zA-Z]+)\s+(\d+)\s*,\s*(\d{4})/);
  if (matchReadable) {
    const monthName = matchReadable[1].toLowerCase();
    const year = parseInt(matchReadable[3], 10);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const month = months.findIndex(name => monthName.startsWith(name));
    if (month !== -1) {
      return { month, year };
    }
  }
  
  // Try ISO format "YYYY-MM-DD" (e.g., "2026-03-01")
  const matchISO = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchISO) {
    const year = parseInt(matchISO[1], 10);
    const month = parseInt(matchISO[2], 10) - 1; // 0-indexed month
    if (month >= 0 && month <= 11) {
      return { month, year };
    }
  }

  // Fallback to JS standard Date parsing
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return { month: d.getMonth(), year: d.getFullYear() };
  }
  
  return null;
}

export default function Dashboard({ applicants, employees }: DashboardProps) {
  const [sheetEmployees, setSheetEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Year selector filter (starts with current year automatically)
  const [selectedYear, setSelectedYear] = useState<string>(() => String(new Date().getFullYear()));

  // Trigger spreadsheet live sync on mount or manual click
  const syncSpreadsheetData = async (isManual = false) => {
    if (isManual) {
      setSyncing(true);
    } else {
      setLoading(true);
    }
    setErrorMsg(null);

    const spreadsheetId = '1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk';
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0`;

    try {
      const response = await window.fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Google Sheets responded with an invalid server status');
      }
      
      const text = await response.text();
      const lines = text.split('\n');
      const loadedEmployees: any[] = [];

      // Spreadsheet employee data rows start from Line 8 (array index 7)
      for (let i = 7; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = parseCSVLine(line);
        if (cols.length < 5) continue;

        const name = cols[2];
        // Ensure name is filled and is not heading row itself
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
          active: cols[21] || 'Yes', // Assume Active "Yes" if empty
          terminationDate: cols[22],
          reason: cols[23],
          remarks: cols[24],
          sss: cols[25],
          philhealth: cols[26],
          hdmf: cols[27],
          tin: cols[28],
          duration: cols[29]
        });
      }

      setSheetEmployees(loadedEmployees);
      setLastSyncTime(new Date());
    } catch (err: any) {
      console.error('Spreadsheet sync error:', err);
      setErrorMsg(err.message || 'Connecting to Google Sheets failed. Graceful online fallback active.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    syncSpreadsheetData();
  }, []);

  // Use parsed Google Sheet database if available, otherwise fallback seamlessly to initial employees mockData prop
  const finalEmployees = useMemo(() => {
    return sheetEmployees.length > 0 ? sheetEmployees : employees;
  }, [sheetEmployees, employees]);

  // Dynamically compile available years starting from 2022 up to future/next years automatically
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1; // Future year automatic adding
    
    // Add all years in sequence from 2022 up to nextYear
    for (let y = startYear; y <= nextYear; y++) {
      yearsSet.add(y);
    }
    
    finalEmployees.forEach(e => {
      const hireInfo = parseSheetDate(e.dateHired);
      if (hireInfo && hireInfo.year >= startYear) {
        yearsSet.add(hireInfo.year);
      }
      if (e.terminationDate) {
        const termInfo = parseSheetDate(e.terminationDate);
        if (termInfo && termInfo.year >= startYear) {
          yearsSet.add(termInfo.year);
        }
      }
    });

    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [finalEmployees]);

  // Filter final employees based on the global overview selectedYear
  const filteredEmployees = useMemo(() => {
    if (selectedYear === 'All') return finalEmployees;
    const yearNum = parseInt(selectedYear, 10);
    return finalEmployees.filter(e => {
      const hireInfo = parseSheetDate(e.dateHired);
      if (hireInfo && hireInfo.year > yearNum) {
        return false;
      }
      if (e.active === 'No' && e.terminationDate) {
        const termInfo = parseSheetDate(e.terminationDate);
        if (termInfo && termInfo.year < yearNum) {
          return false;
        }
      }
      return true;
    });
  }, [finalEmployees, selectedYear]);

  // Derived KPIs
  const totalEmployees = useMemo(() => {
    return filteredEmployees.filter(e => {
      if (selectedYear === 'All') return e.active === 'Yes';
      if (e.active === 'Yes') return true;
      if (e.terminationDate) {
        const termInfo = parseSheetDate(e.terminationDate);
        if (termInfo && termInfo.year > parseInt(selectedYear, 10)) {
          return true;
        }
      }
      return false;
    }).length;
  }, [filteredEmployees, selectedYear]);

  const totalRecruitment = useMemo(() => {
    return applicants.length;
  }, [applicants]);

  // Gender Breakdown Doughnut Chart (Only for active staff as specified by "Staff Split")
  const genderData = useMemo(() => {
    let maleCount = 0;
    let femaleCount = 0;

    filteredEmployees.forEach(e => {
      let isActiveInYear = e.active === 'Yes';
      if (e.active === 'No' && e.terminationDate && selectedYear !== 'All') {
        const termInfo = parseSheetDate(e.terminationDate);
        if (termInfo && termInfo.year > parseInt(selectedYear, 10)) {
          isActiveInYear = true;
        }
      }

      if (isActiveInYear) {
        const gender = (e.gender || '').toLowerCase().trim();
        if (gender.startsWith('m')) {
          maleCount++;
        } else if (gender.startsWith('f')) {
          femaleCount++;
        }
      }
    });

    return {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [maleCount, femaleCount],
          backgroundColor: ['#1a2849', '#c9a961'],
          borderWidth: 1,
          borderColor: '#ffffff',
        },
      ],
    };
  }, [filteredEmployees, selectedYear]);

  // Job Status Breakdown Vertical Bar Chart
  const jobStatusData = useMemo(() => {
    let regular = 0;
    let probationary = 0;
    let project = 0;
    let intern = 0;

    filteredEmployees.forEach(e => {
      let isActiveInYear = e.active === 'Yes';
      if (e.active === 'No' && e.terminationDate && selectedYear !== 'All') {
        const termInfo = parseSheetDate(e.terminationDate);
        if (termInfo && termInfo.year > parseInt(selectedYear, 10)) {
          isActiveInYear = true;
        }
      }

      if (isActiveInYear) {
        const status = (e.jobStatus || '').toLowerCase().trim();
        if (status.includes('reg')) {
          regular++;
        } else if (status.includes('prob') || status.includes('trial')) {
          probationary++;
        } else if (status.includes('proj')) {
          project++;
        } else if (status.includes('int')) {
          intern++;
        } else {
          regular++; // assume regular as standard category
        }
      }
    });

    return {
      labels: ['Regular', 'Probationary', 'Project-based', 'Intern'],
      datasets: [
        {
          label: 'Active Employees',
          data: [regular, probationary, project, intern],
          backgroundColor: '#1a2849',
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    };
  }, [filteredEmployees, selectedYear]);

  // Terminations Breakdown Dynamic Chart (Computed dynamically from spreadsheet "Reason" details on inactive rows)
  const terminationsData = useMemo(() => {
    // Pre-initialize only the 6 user-specified categories + 'Personal Reason'
    const reasonsMap: Record<string, number> = {
      'Better Opp.': 0,
      'Relocation': 0,
      'Career Chg.': 0,
      'Salary Dissat.': 0,
      'Mgmt. Dissat.': 0,
      'WLB Issues': 0,
      'Personal Reason': 0
    };

    filteredEmployees.forEach(e => {
      if (e.active === 'No') {
        if (selectedYear !== 'All' && e.terminationDate) {
          const termInfo = parseSheetDate(e.terminationDate);
          if (!termInfo || termInfo.year !== parseInt(selectedYear, 10)) {
            return;
          }
        }

        const rawReason = (e.reason || '').toLowerCase().trim();

        // Map database expressions with case-insensitive contains logic
        if (rawReason.includes('better') || rawReason.includes('opportunity') || rawReason.includes('opporthunity') || rawReason.includes('opp')) {
          reasonsMap['Better Opp.']++;
        } else if (rawReason.includes('relocat')) {
          reasonsMap['Relocation']++;
        } else if (rawReason.includes('career') || rawReason.includes('change') || rawReason.includes('chg')) {
          reasonsMap['Career Chg.']++;
        } else if (rawReason.includes('salary') || rawReason.includes('pay') || rawReason.includes('compensation') || rawReason.includes('wage') || rawReason.includes('dissatisfaction with salary')) {
          reasonsMap['Salary Dissat.']++;
        } else if (rawReason.includes('management') || rawReason.includes('manager') || rawReason.includes('mgmt') || rawReason.includes('boss') || rawReason.includes('leadership') || rawReason.includes('dissatisfaction with management')) {
          reasonsMap['Mgmt. Dissat.']++;
        } else if (rawReason.includes('balance') || rawReason.includes('life') || rawReason.includes('wlb') || rawReason.includes('burnout') || rawReason.includes('stress') || rawReason.includes('hours') || rawReason.includes('work-life')) {
          reasonsMap['WLB Issues']++;
        } else {
          // If the reason is 'Resigned', 'AWOL', empty, or any other personal reason
          reasonsMap['Personal Reason']++;
        }
      }
    });

    const labels = Object.keys(reasonsMap);
    const dataValues = Object.values(reasonsMap);

    return {
      labels: labels,
      datasets: [
        {
          label: 'Attrition Count',
          data: dataValues,
          backgroundColor: '#ef4444',
          borderRadius: 4,
          borderWidth: 0,
        },
      ],
    };
  }, [filteredEmployees, selectedYear]);

  // Hires vs. Total Leaves (Monthly Trend) Line Graph - dynamically parsed based on dateHired / terminationDate col entries
  const monthlyTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hiresTrend = Array(12).fill(0);
    const leavesTrend = Array(12).fill(0);

    finalEmployees.forEach(e => {
      // 1. Calculate matching Hires
      const hireInfo = parseSheetDate(e.dateHired);
      if (hireInfo) {
        if (selectedYear === 'All' || String(hireInfo.year) === selectedYear) {
          hiresTrend[hireInfo.month]++;
        }
      }

      // 2. Calculate matching Leaves
      if (e.active === 'No' && e.terminationDate) {
        const leaveInfo = parseSheetDate(e.terminationDate);
        if (leaveInfo) {
          if (selectedYear === 'All' || String(leaveInfo.year) === selectedYear) {
            leavesTrend[leaveInfo.month]++;
          }
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Hires',
          data: hiresTrend,
          borderColor: '#c9a961',
          backgroundColor: 'rgba(201, 169, 97, 0.1)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
        },
        {
          label: 'Leaves',
          data: leavesTrend,
          borderColor: '#1a2849',
          backgroundColor: 'rgba(26, 40, 73, 0.05)',
          borderWidth: 3,
          tension: 0.35,
          fill: true,
        }
      ]
    };
  }, [finalEmployees, selectedYear]);

  return (
    <div className="db-container page-layout">
      {/* Page Header */}
      <header className="page-header" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Inspect dynamic firm statistics, hiring channels, and employee structures from Google Sheets</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <a
            href="https://docs.google.com/spreadsheets/d/1MCXPxNuU67Bn_MNB0ye3fh3Mlx5HwMIJdh52V9rgSBk/edit?gid=0#gid=0"
            target="_blank"
            rel="noopener noreferrer"
            className="add-candidate-btn"
            style={{ background: '#1D8A48', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ExternalLink size={14} />
            <span>Open Spreadsheet</span>
          </a>

          {/* Calendar Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Select Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1a2849',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none',
                cursor: 'pointer',
                borderColor: '#c9a961'
              }}
            >
              {availableYears.map(year => (
                <option key={year} value={String(year)}>{year} Year</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Sync Failure Warning Banner if offline or network failure */}
      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#fef3c7', border: '1.5px solid #f59e0b', borderRadius: '12px', color: '#78350f', fontSize: '12.5px' }}>
          <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0 }} />
          <span>Notice: Failed to fetch live rows directly. Displaying local diagnostic pipeline dashboard instead. Make sure sheet is shared publicly.</span>
        </div>
      )}

      {/* Main KPI cards (Row 1) */}
      <div className="db-kpi-grid">
        {/* KPI Left: Total Employee */}
        <div className="db-kpi-card" style={{ '--kpi-color': '#1a2849' } as React.CSSProperties}>
          <div className="db-kpi-info">
            {loading ? (
              <span className="shimmer" style={{ width: '60px', height: '36px', display: 'block', background: '#eaeef4', borderRadius: '4px' }}></span>
            ) : (
              <span className="db-kpi-value">{totalEmployees}</span>
            )}
            <span className="db-kpi-label">Active Employees</span>
            <span className="db-kpi-sub">Total active lawyers & supporting legal staff</span>
          </div>
          <div className="db-kpi-icon">
            <FileUser size={26} />
          </div>
        </div>

        {/* KPI Right: Total Recruitment */}
        <div className="db-kpi-card" style={{ '--kpi-color': '#c9a961' } as React.CSSProperties}>
          <div className="db-kpi-info">
            <span className="db-kpi-value">{totalRecruitment}</span>
            <span className="db-kpi-label">Active Recruitment Pipeline</span>
            <span className="db-kpi-sub">Current application tracker candidate volume</span>
          </div>
          <div className="db-kpi-icon">
            <Users size={26} />
          </div>
        </div>
      </div>

      {/* Row 2: Three Breakdown Charts */}
      <div className="db-charts-row2">
        {/* Chart 1: Gender Breakdown (Doughnut) */}
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Gender Breakdown</h3>
          </div>
          <div className="db-chart-wrapper">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-slate-400" />
            ) : (
              <Doughnut 
                data={genderData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 12,
                        font: { size: 11, family: 'Inter' }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Chart 2: Job Status Breakdown (Vertical Bar) */}
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Job Status Distribution</h3>
          </div>
          <div className="db-chart-wrapper">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-slate-400" />
            ) : (
              <Bar 
                data={jobStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { stepSize: 5, font: { family: 'Inter' } }
                    },
                    x: { ticks: { font: { family: 'Inter' } } }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Chart 3: Terminations Breakdown (Horizontal Bar) */}
        <div className="db-card">
          <div className="db-card-header">
            <h3 className="db-card-title">Termination Reasons</h3>
          </div>
          <div className="db-chart-wrapper">
            {loading ? (
              <Loader2 size={24} className="animate-spin text-slate-400" />
            ) : (
              <Bar 
                data={terminationsData} 
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: { stepSize: 2, font: { family: 'Inter' } }
                    },
                    y: { ticks: { font: { family: 'Inter' } } }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Hires vs. Total Leaves (Monthly Trend) */}
      <div className="db-charts-row3 db-card">
        <div className="db-card-header" style={{ paddingBottom: '16px' }}>
          <h3 className="db-card-title">Hires vs. Departures (Monthly Trend)</h3>
        </div>
        
        <div className="db-line-chart-wrapper">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Loader2 size={32} className="animate-spin text-[#c9a961]" />
            </div>
          ) : (
            <Line 
              data={monthlyTrendData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { font: { family: 'Inter' } }
                  },
                  x: { ticks: { font: { family: 'Inter' } } }
                },
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      boxWidth: 14,
                      font: { size: 12, family: 'Inter', weight: 'bold' }
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

