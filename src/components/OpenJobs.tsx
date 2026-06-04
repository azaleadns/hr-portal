import React, { useState, useMemo, useEffect } from 'react';
import { Job, Applicant } from '../types';
import PostPositionModal from './PostPositionModal';
import { Search, Briefcase, Users, Calendar, X, Archive, Landmark } from 'lucide-react';
import './OpenJobs.css';

interface OpenJobsProps {
  jobs: Job[];
  onAddJob: (job: Job) => void;
  onCloseJob: (id: string, name: string) => void;
  onUpdateStatus: (id: string, status: Job['status']) => void;
  applicants: Applicant[];
}

export default function OpenJobs({ jobs = [], onAddJob, onCloseJob, onUpdateStatus, applicants }: OpenJobsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(
      job =>
        job.title?.toLowerCase().includes(term) ||
        job.department?.toLowerCase().includes(term)
    );
  }, [jobs, searchTerm]);

  const totalOpenings = jobs.reduce((sum, j) => sum + (j.openings || 0), 0);
  const totalApplicants = applicants.length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  const handleStatusChange = (jobId: string, newStatus: Job['status'], e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateStatus(jobId, newStatus);
    setActiveDropdownId(null);
  };

  return (
    <div className="oj-page page-layout">
      {/* Header */}
      <header className="page-header">
        <div>
          <h1 className="page-title">Job Openings</h1>
          <p className="page-subtitle">Track hiring capacity, adjust pipeline quotas, and announce open councils</p>
        </div>
        <button className="oj-btn-post" onClick={() => setShowModal(true)}>
          <PlusCircleIcon />
          <span>Post New Position</span>
        </button>
      </header>

      {/* Stats Section */}
      <section className="oj-stats">
        {/* Card 1: Open Positions */}
        <div className="oj-stat" style={{ '--stat-color': '#00a896' } as React.CSSProperties}>
          <div className="oj-stat-content">
            <div className="oj-stat-num">{jobs.filter(j => j.status === 'OPEN').length}</div>
            <span className="oj-stat-label">Active Job Posts</span>
          </div>
          <div className="oj-stat-icon-wrap" style={{ background: '#00a89615', color: '#00a896' }}>
            <Briefcase size={22} />
          </div>
        </div>

        {/* Card 2: Total Slots */}
        <div className="oj-stat" style={{ '--stat-color': '#f1a80a' } as React.CSSProperties}>
          <div className="oj-stat-content">
            <div className="oj-stat-num">{totalOpenings}</div>
            <span className="oj-stat-label">Candidate Capacities Requested</span>
          </div>
          <div className="oj-stat-icon-wrap" style={{ background: '#f1a80a15', color: '#f1a80a' }}>
            <Landmark size={22} />
          </div>
        </div>

        {/* Card 3: Total Applicants */}
        <div className="oj-stat" style={{ '--stat-color': '#1A2849' } as React.CSSProperties}>
          <div className="oj-stat-content">
            <div className="oj-stat-num">{totalApplicants}</div>
            <span className="oj-stat-label">Applicants Logged</span>
          </div>
          <div className="oj-stat-icon-wrap" style={{ background: '#1A284915', color: '#1A2849' }}>
            <Users size={22} />
          </div>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="oj-main-container">
        {/* Search Toolbar */}
        <div className="oj-toolbar">
          <div className="oj-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by title or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="oj-search-clear" onClick={() => setSearchTerm('')}>
                <X size={14} />
              </button>
            )}
          </div>
          <span className="oj-count">{filteredJobs.length} listed position{filteredJobs.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Card Grid Layout */}
        <section className="oj-grid-container">
          {filteredJobs.map(job => {
            const currentStatus = (job.status || 'OPEN').toUpperCase();
            const openingsCount = job.openings || 1;
            // Filter applicants relative to this position title
            const jobApplicants = applicants.filter(a => a.position.toLowerCase() === job.title.toLowerCase());
            const applicantsCount = jobApplicants.length;
            const progressPercentage = Math.round(Math.min((applicantsCount / openingsCount) * 100, 100));

            return (
              <div key={job.id} className="oj-job-card" onClick={() => setSelectedJob(job)}>
                {/* Card Top Row */}
                <div className="oj-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="oj-card-dept">{job.department}</span>
                    <span className={`oj-card-position-status ${job.positionStatus?.toLowerCase() === 'replacement' ? 'replacement' : 'additional'}`}>
                      {job.positionStatus || 'Additional'}
                    </span>
                  </div>

                  {/* Status Picker Selector Dropdown */}
                  <div className="oj-status-dropdown-container">
                    <button
                      className={`oj-status-badge ${currentStatus.toLowerCase()}`}
                      onClick={(e) => toggleDropdown(job.id, e)}
                      title={`Status: ${currentStatus}`}
                    >
                      <span className="status-dot"></span>
                      <span className="status-text">{currentStatus}</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {activeDropdownId === job.id && (
                      <div className="oj-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={(e) => handleStatusChange(job.id, 'OPEN', e)} className="dropdown-item open">
                          <span className="status-dot"></span> OPEN
                        </button>
                        <button onClick={(e) => handleStatusChange(job.id, 'CLOSED', e)} className="dropdown-item closed">
                          <span className="status-dot"></span> CLOSED
                        </button>
                        <button onClick={(e) => handleStatusChange(job.id, 'DRAFT', e)} className="dropdown-item draft">
                          <span className="status-dot"></span> DRAFT
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Title */}
                <h2 className="oj-card-title">{job.title}</h2>

                {/* Meta Information */}
                <div className="oj-card-meta-details">
                  <div className="oj-meta-line">
                    <Calendar size={14} />
                    <span>Requested: {formatDate(job.dateRequested || job.datePosted)}</span>
                  </div>
                </div>

                {/* Progress Metrics */}
                <div className="oj-card-footer-metrics">
                  <div className="oj-applicant-summary-row">
                    <span>{applicantsCount} Interested</span>
                    <span className="oj-slots-count">{applicantsCount}/{openingsCount} filled</span>
                  </div>

                  <div className="oj-progress-track">
                    <div
                      className="oj-progress-fill-bar"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="oj-progress-status-label">
                    <span>Progress quota</span>
                    <span>{progressPercentage}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredJobs.length === 0 && (
            <div className="oj-empty-card-state">
              <X size={48} />
              <p>No open positions match your search criteria.</p>
            </div>
          )}
        </section>
      </div>

      {/* Detail Modal */}
      {selectedJob && (
        <div className="oj-overlay" onClick={() => setSelectedJob(null)}>
          <div className="oj-modal" onClick={e => e.stopPropagation()}>
            <div className="oj-modal-top">
              <div>
                <h2 className="oj-modal-title">{selectedJob.title}</h2>
                <span className="oj-modal-dept">{selectedJob.department}</span>
              </div>
              <button className="oj-modal-close" onClick={() => setSelectedJob(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="oj-modal-body">
              <div className="oj-detail-grid">
                {selectedJob.positionStatus && (
                  <div className="oj-detail-item">
                    <span className="oj-detail-label">Headcount Status</span>
                    <span className={`oj-detail-value status-badge ${selectedJob.positionStatus.toLowerCase()}`}>
                      {selectedJob.positionStatus}
                    </span>
                  </div>
                )}
                <div className="oj-detail-item">
                  <span className="oj-detail-label">Slots required</span>
                  <span className="oj-detail-value">{selectedJob.openings || 1}</span>
                </div>
                <div className="oj-detail-item">
                  <span className="oj-detail-label">Date Requested</span>
                  <span className="oj-detail-value">{formatDate(selectedJob.dateRequested)}</span>
                </div>
                <div className="oj-detail-item">
                  <span className="oj-detail-label">Target Onboard Deadline</span>
                  <span className="oj-detail-value">{formatDate(selectedJob.dateRequired)}</span>
                </div>
              </div>
              <div className="oj-detail-desc">
                <span className="oj-detail-label">Description</span>
                <p>{selectedJob.description || 'No description provided.'}</p>
              </div>
              <div className="oj-detail-desc" style={{ marginTop: '16px' }}>
                <span className="oj-detail-label">Job Qualifications</span>
                <p>{selectedJob.qualification || 'No qualifications listed.'}</p>
              </div>
              <button
                className="oj-btn-close-action"
                onClick={() => {
                  onCloseJob(selectedJob.id, selectedJob.title);
                  setSelectedJob(null);
                }}
              >
                Archive and Remove Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Modal */}
      {showModal && (
        <PostPositionModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => {
            onAddJob(data);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function PlusCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}
