/**
 * file name: Sidebar.tsx
 * author: Iya
 * date: July 1, 2026
 * purpose: Displays the primary navigation links for the HR Portal. It handles the collapse/expand state of the menu, features the STLAF logo, and provides routing access to the dashboard, tracker, spreadsheet, and templates.
 */

import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronDown, ChevronRight, Users, UserPlus, Briefcase, FileSpreadsheet, FileText, Menu, LogIn } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onAddCandidateClick: () => void;
  onPostPositionClick: () => void;
  onNavClick?: () => void;
  onLogout?: () => void;
}

export default function Sidebar({ collapsed, onToggle, onAddCandidateClick, onPostPositionClick, onNavClick, onLogout }: SidebarProps) {
  const location = useLocation();
  const [showRecruitment, setShowRecruitment] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Active expansion: either permanently persistent (not collapsed) or actively hovered
  const isExpanded = !collapsed || isHovered;

  const handleNavClick = () => {
    setIsHovered(false);
    if (onNavClick) {
      onNavClick();
    }
  };

  return (
    <>
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-inner">
          {/* Logo */}
          <div className="sidebar-logo">
            <Link to="/" className="logo-wrapper" onClick={handleNavClick}>
              <div
                className="logo-icon"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',          // Maaari mong i-adjust ang width at height
                  height: '42px',         // depende sa aktwal na sukat ng iyong sidebar
                  overflow: 'hidden'
                }}
              >
                <img
                  src="slogo.png"
                  alt="STLAF Logo"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain' // Pinapanatili nitong tama ang aspect ratio ng imahe
                  }}
                />
              </div>

              {isExpanded && (
                <div className="logo-text">
                  <h1 className="logo-name">HR Portal</h1>
                  <div className="logo-underline"></div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            <div className="nav-section-label">{isExpanded && 'CORE WORKSPACE'}</div>

            {/* Overview / Analytics */}
            <NavLink
              to="/dashboard"
              onClick={handleNavClick}
              className={({ isActive }) =>
                `nav-item ${isActive || location.pathname === '/' ? 'active' : ''}`
              }
            >
              <span className="nav-icon"><LayoutDashboard size={20} /></span>
              {isExpanded && <span className="nav-label">Overview</span>}
            </NavLink>

            {/* Recruitment Expandable Header */}
            <div
              className={`nav-item ${showRecruitment ? 'dropdown-active' : ''}`}
              onClick={() => setShowRecruitment(!showRecruitment)}
              style={{ cursor: 'pointer' }}
            >
              <span className="nav-icon"><Users size={20} /></span>
              {isExpanded && (
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
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {isExpanded ? (
                    <span className="nav-label">• Applicant Tracker</span>
                  ) : (
                    <span className="nav-icon-sub"><Users size={16} title="Applicant Tracker" /></span>
                  )}
                </NavLink>

                <NavLink
                  to="/spreadsheet"
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {isExpanded ? (
                    <span className="nav-label">• Google Spreadsheet</span>
                  ) : (
                    <span className="nav-icon-sub"><FileSpreadsheet size={16} title="Google Spreadsheet" /></span>
                  )}
                </NavLink>

                <NavLink
                  to="/open-jobs"
                  onClick={handleNavClick}
                  className={({ isActive }) => `nav-sub-item ${isActive ? 'active' : ''}`}
                >
                  {isExpanded ? (
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
              onClick={handleNavClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={{ marginTop: '4px' }}
            >
              <span className="nav-icon"><FileText size={20} /></span>
              {isExpanded && <span className="nav-label">Google Docs</span>}
            </NavLink>
          </nav>

          {/* Bottom Actions for posting things */}
          <div className="sidebar-bottom-actions">
            <button className="bottom-btn add-candidate" onClick={onAddCandidateClick}>
              <UserPlus size={16} />
              {isExpanded && <span>Add Candidate</span>}
            </button>

            <button className="bottom-btn create-job" onClick={onPostPositionClick}>
              <Briefcase size={16} />
              {isExpanded && <span>Post Position</span>}
            </button>

            {onLogout && (
              <button
                id="sidebar-logout-btn"
                className="bottom-btn logout-btn"
                onClick={onLogout}
                style={{
                  marginTop: '4px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#fdbaf8',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <LogIn size={16} style={{ transform: 'rotate(180deg)', stroke: '#ef4444' }} />
                {isExpanded && <span style={{ color: '#ef4444' }}>Sign Out</span>}
              </button>
            )}
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