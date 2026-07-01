/**
 * file name: PostPositionModal.tsx
 * author: Iya
 * date: July 1, 2026
 * purpose: Provides a structured multi-field form modal for submitting new job positions. It includes real-time field validation (required fields, character counters, and logical date checks) before passing the formatted data payload upstream.
 */

import React, { useState } from 'react';
import { Job } from '../types';
import { Briefcase, Building, Layers, Calendar, Plus, X } from 'lucide-react';
import './PostPositionModal.css';

interface PostPositionModalProps {
  onClose: () => void;
  onSubmit: (job: Job) => void;
}

export default function PostPositionModal({ onClose, onSubmit }: PostPositionModalProps) {
  const [formData, setFormData] = useState({
    position: '',
    department: 'Litigation',
    status: 'Replacement' as 'Replacement' | 'Additional',
    noRequired: 1,
    dateRequested: new Date().toISOString().split('T')[0],
    dateRequired: '',
    description: '',
    qualification: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'HR',
    'IT',
    'Corporate',
    'Accounting',
    'Litigation',
    'Marketing',
    'Admin'
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.noRequired || formData.noRequired < 1) {
      newErrors.noRequired = 'At least 1 required position';
    }

    if (!formData.dateRequired) {
      newErrors.dateRequired = 'Target onboarding date is required';
    } else if (formData.dateRequested && new Date(formData.dateRequired) < new Date(formData.dateRequested)) {
      newErrors.dateRequired = 'Date required cannot be before requested date';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
    }

    if (!formData.qualification.trim()) {
      newErrors.qualification = 'Qualifications are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const newJob: Job = {
        id: `job-${Date.now()}`,
        title: formData.position.trim(),
        position: formData.position.trim(),
        department: formData.department,
        positionStatus: formData.status,
        noRequired: Number(formData.noRequired),
        openings: Number(formData.noRequired),
        dateRequested: formData.dateRequested,
        datePosted: formData.dateRequested,
        dateRequired: formData.dateRequired,
        deadline: formData.dateRequired,
        applicants: 0,
        maxApplicants: 30,
        description: formData.description.trim(),
        qualification: formData.qualification.trim(),
        status: 'OPEN'
      };

      onSubmit(newJob);
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="post-overlay" onClick={onClose}>
      <div className="post-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="post-modal__header">
          <div className="post-modal__title-container">
            <div className="post-badge">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="post-modal__title">Post New Position</h2>
              <p className="post-modal__subtitle">Fill in details to announce an active organizational requirement</p>
            </div>
          </div>
          <button className="post-modal__close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="post-modal__body">
          {/* Position */}
          <div className={`post-field ${errors.position ? 'post-field--error' : ''}`}>
            <label className="post-field__label">
              Position Title <span className="post-field__required">*</span>
            </label>
            <div className="post-field__input-wrap">
              <Briefcase size={16} />
              <input
                type="text"
                placeholder="e.g. Associate Attorney"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
              />
            </div>
            {errors.position && <span className="post-field__error">{errors.position}</span>}
          </div>

          {/* Department */}
          <div className="post-field">
            <label className="post-field__label">
              Department <span className="post-field__required">*</span>
            </label>
            <div className="post-field__input-wrap">
              <Building size={16} />
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status (Replacement and Additional) */}
          <div className="post-field">
            <label className="post-field__label">
              Budget Category <span className="post-field__required">*</span>
            </label>
            <div className="post-status-options">
              <label className={`post-status-card ${formData.status === 'Replacement' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Replacement"
                  checked={formData.status === 'Replacement'}
                  onChange={() => handleChange('status', 'Replacement')}
                  style={{ display: 'none' }}
                />
                <div className="post-status-card__content">
                  <span className="post-status-card__title">Replacement</span>
                  <span className="post-status-card__desc">Replacing existing counsel</span>
                </div>
              </label>
              <label className={`post-status-card ${formData.status === 'Additional' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="status"
                  value="Additional"
                  checked={formData.status === 'Additional'}
                  onChange={() => handleChange('status', 'Additional')}
                  style={{ display: 'none' }}
                />
                <div className="post-status-card__content">
                  <span className="post-status-card__title">Additional</span>
                  <span className="post-status-card__desc">Addition to company headcount plan</span>
                </div>
              </label>
            </div>
          </div>

          {/* No. Required */}
          <div className={`post-field ${errors.noRequired ? 'post-field--error' : ''}`}>
            <label className="post-field__label">
              Onboard Target Openings <span className="post-field__required">*</span>
            </label>
            <div className="post-field__input-wrap">
              <Layers size={16} />
              <input
                type="number"
                min="1"
                placeholder="e.g. 1"
                value={formData.noRequired}
                onChange={(e) => handleChange('noRequired', parseInt(e.target.value) || 1)}
              />
            </div>
            {errors.noRequired && <span className="post-field__error">{errors.noRequired}</span>}
          </div>

          {/* Date Requested and Date Required */}
          <div className="post-field__row">
            {/* Date Requested */}
            <div className="post-field">
              <label className="post-field__label">
                Date Requested
              </label>
              <div className="post-field__input-wrap">
                <Calendar size={16} />
                <input
                  type="date"
                  value={formData.dateRequested}
                  onChange={(e) => handleChange('dateRequested', e.target.value)}
                />
              </div>
            </div>

            {/* Date Required */}
            <div className={`post-field ${errors.dateRequired ? 'post-field--error' : ''}`}>
              <label className="post-field__label">
                Required Onboarding Date <span className="post-field__required">*</span>
              </label>
              <div className="post-field__input-wrap">
                <Calendar size={16} />
                <input
                  type="date"
                  value={formData.dateRequired}
                  onChange={(e) => handleChange('dateRequired', e.target.value)}
                />
              </div>
              {errors.dateRequired && <span className="post-field__error">{errors.dateRequired}</span>}
            </div>
          </div>

          {/* Job Description */}
          <div className={`post-field ${errors.description ? 'post-field--error' : ''}`}>
            <label className="post-field__label">
              Job Description <span className="post-field__required">*</span>
            </label>
            <textarea
              className="post-field__textarea"
              maxLength={500}
              placeholder="Provide a detailed summary of the key roles and responsibilities..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <div className="post-field__textarea-footer">
              {errors.description && <span className="post-field__error">{errors.description}</span>}
              <span className="post-field__char-count">{formData.description.length}/500</span>
            </div>
          </div>

          {/* Qualifications */}
          <div className={`post-field ${errors.qualification ? 'post-field--error' : ''}`}>
            <label className="post-field__label">
              Qualifications & Competencies <span className="post-field__required">*</span>
            </label>
            <textarea
              className="post-field__textarea"
              maxLength={500}
              placeholder="e.g. member of Philippine Bar association, litigation drafting skills, strong communication..."
              value={formData.qualification}
              onChange={(e) => handleChange('qualification', e.target.value)}
            />
            <div className="post-field__textarea-footer">
              {errors.qualification && <span className="post-field__error">{errors.qualification}</span>}
              <span className="post-field__char-count">{formData.qualification.length}/500</span>
            </div>
          </div>

          {/* Footer */}
          <div className="post-modal__footer">
            <button type="button" className="post-btn post-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="post-btn post-btn--submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
