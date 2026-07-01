/*
   File Name: ApplicantDetailModal.tsx
   Author: Iya
   Date: July 1, 2026
   Purpose: Pop-up modal view na nagpapakita ng personal credentials, education, at nagbibigay-daan sa thủ-manong (manual) paglilipat ng stage o permanenteng pagbura sa profile ng aplikante.
*/

import React from 'react';
import { Applicant } from '../types';
import { stageConfig } from '../data/mockData';
import { Briefcase, Calendar, Mail, Phone, Clock, GraduationCap, X, Trash2 } from 'lucide-react';
import './ApplicantDetailModal.css';

const COLUMN_ORDER: Array<Applicant['stage']> = [
  'screening',
  'review',
  'endorsement',
  'final_review',
  'bgcheck',
  'job_offer',
  'fo_requirements',
  'hired',
  'rejected'
];

interface ApplicantDetailModalProps {
  applicant: Applicant;
  onClose: () => void;
  onUpdateStage: (id: string, stage: Applicant['stage']) => void;
  onDelete: (id: string) => void;
}

export default function ApplicantDetailModal({ applicant, onClose, onUpdateStage, onDelete }: ApplicantDetailModalProps) {
  const config = stageConfig[applicant.stage || 'screening'];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleStageChange = (newStage: Applicant['stage']) => {
    onUpdateStage(applicant.id, newStage);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content detail-modal" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="detail-modal-header" style={{ '--accent': config.color } as React.CSSProperties}>
          <button className="modal-close white-close" onClick={onClose}>
            <X size={18} />
          </button>

          <div className="detail-hero">
            <div className="detail-avatar" style={{ background: applicant.avatarColor }}>
              {applicant.initials}
            </div>
            <h2 className="detail-name">{applicant.name}</h2>
            <p className="detail-position">{applicant.position}</p>
            <span
              className="detail-stage-badge"
              style={{
                background: `${config.color}25`,
                color: config.color,
                borderColor: `${config.color}40`
              }}
            >
              {config.label}
            </span>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '18px' }}>
          {/* Info Grid */}
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon"><Briefcase size={16} /></div>
              <div>
                <span className="info-label">Department</span>
                <span className="info-value">{applicant.department || 'General'}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Calendar size={16} /></div>
              <div>
                <span className="info-label">Submission Date</span>
                <span className="info-value">{formatDate(applicant.submissionDate)}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Mail size={16} /></div>
              <div>
                <span className="info-label">Email</span>
                <span className="info-value">{applicant.email}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Phone size={16} /></div>
              <div>
                <span className="info-label">Phone</span>
                <span className="info-value">{applicant.phone}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><Clock size={16} /></div>
              <div>
                <span className="info-label">Experience</span>
                <span className="info-value">{applicant.experience}</span>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon"><GraduationCap size={16} /></div>
              <div>
                <span className="info-label">Education</span>
                <span className="info-value">{applicant.education || 'Member of Philippine Bar'}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {applicant.notes && (
            <div className="notes-section">
              <span className="info-label">Candidate Assessment Comments</span>
              <p className="notes-text">{applicant.notes}</p>
            </div>
          )}

          {/* Stage Actions */}
          <div className="stage-actions">
            <span className="info-label">Move to Stage</span>
            <div className="stage-buttons">
              {COLUMN_ORDER.filter(s => s !== applicant.stage).map(stage => (
                <button
                  key={stage}
                  className="stage-action-btn"
                  style={{
                    '--btn-color': stageConfig[stage].color,
                    background: `${stageConfig[stage].color}10`,
                    color: stageConfig[stage].color,
                    borderColor: `${stageConfig[stage].color}30`
                  } as React.CSSProperties}
                  onClick={() => handleStageChange(stage)}
                >
                  {stageConfig[stage].label}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Candidate Action */}
          <div className="detail-modal-delete-action">
            <button
              className="delete-profile-btn"
              onClick={() => onDelete(applicant.id)}
            >
              <Trash2 size={13} />
              <span>Remove Candidate Permanent Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
