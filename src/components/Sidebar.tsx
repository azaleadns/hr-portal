import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronDown, ChevronRight, Users, UserPlus, Briefcase, FileSpreadsheet, FileSignature, Menu } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onAddCandidateClick: () => void;
  onPostPositionClick: () => void;
}

export default function Sidebar({ collapsed, onToggle, onAddCandidateClick, onPostPositionClick }: SidebarProps) {
  const location = useLocation();
  const [showRecruitment, setShowRecruitment] = useState(true);

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <Link to="/" className="logo-wrapper">
              <div className="logo-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#c9a961" opacity="0.3"></path>
                  <path d="M2 17l10 5 10-5" stroke="#c9a961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M2 12l10 5 10-5" stroke="#c9a961" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>

              {!collapsed && (
                <div className="logo-text">
                  <h1 className="logo-name">HR Portal</h1>
                  <div className="logo-underline"></div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <div className="nav-section-label">{!collapsed && 'CORE WORKSPACE'}</div>

            {/* Overview / Analytics */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-item ${isActive || location.pathname === '/' ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><LayoutDashboard size={20} /></span>
              {!collapsed && <span className="nav-label">Overview</span>}
            </NavLink>

            {/* Recruitment Expandable Header */}
            <div 
              className={`nav-item ${showRecruitment ? 'dropdown-active' : ''}`}
              onClick={() => setShowRecruitment(!showRecruitment)}
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon"><Users size={20} /></span>
              {!collapsed && (
                <>
                  <span className="nav-label" style={{ flex: 1 }}>Recruitment</span>
                  <span className="nav-arrow">
                    {showRecruitment ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </span>
                </>
              )}
            </div>

            {/* Dropdown Items */}
            {showRecruitment && (
              <div className={`dropdown-content ${collapsed ? 'collapsed-dropdown' : ''}`}>
                <NavLink
                  to="/applicant-tracker"
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {!collapsed ? (
                    <span className="nav-label">• Applicant Tracker</span>
                  ) : (
                    <span className="nav-icon-sub"><Users size={16} title="Applicant Tracker" /></span>
                  )}
                </NavLink>

                <NavLink
                  to="/spreadsheet"
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {!collapsed ? (
                    <span className="nav-label">• Google Spreadsheet</span>
                  ) : (
                    <span className="nav-icon-sub"><FileSpreadsheet size={16} title="Google Spreadsheet" /></span>
                  )}
                </NavLink>

                <NavLink
                  to="/open-jobs"
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {!collapsed ? (
                    <span className="nav-label">• Open Positions</span>
                  ) : (
                    <span className="nav-icon-sub"><Briefcase size={16} title="Open Positions" /></span>
                  )}
                </NavLink>
              </div>
            )}

            {/* Templates Section */}
            <NavLink
              to="/templates"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginTop: '4px' }}
            >
              <span className="nav-icon"><FileSignature size={20} /></span>
              {!collapsed && <span className="nav-label">Templates</span>}
            </NavLink>
          </nav>

          {/* Bottom Actions for posting things */}
          <div className="sidebar-bottom-actions">
            <button className="bottom-btn add-candidate" onClick={onAddCandidateClick}>
              <UserPlus size={16} />
              {!collapsed && <span>Add Candidate</span>}
            </button>

            <button className="bottom-btn create-job" onClick={onPostPositionClick}>
              <Briefcase size={16} />
              {!collapsed && <span>Post Position</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar to toggle menu */}
      <button className="mobile-toggle" onClick={onToggle}>
        <Menu size={24} />
      </button>
    </>
  );
}
