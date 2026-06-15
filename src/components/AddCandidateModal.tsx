import React, { useState } from 'react';
import { Applicant } from '../types';
import './AddCandidateModal.css';

interface AddCandidateModalProps {
  onClose: () => void;
  onAdd: (applicant: Applicant) => void;
}

export default function AddCandidateModal({ onClose, onAdd }: AddCandidateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'Senior Associate Attorney',
    stage: 'screening' as Applicant['stage'],
    experience: '',
    comments: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.experience.trim()) newErrors.experience = 'Experience description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    
    // Simulating response
    setTimeout(() => {
      const colors = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const initials = formData.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const candidate: Applicant = {
        id: `app-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        stage: formData.stage,
        experience: formData.experience,
        avatarColor: randomColor,
        initials,
        department: formData.position.toLowerCase().includes('engineer') ? 'IT' : 'Litigation',
        submissionDate: new Date().toISOString().split('T')[0],
        notes: formData.comments,
        education: 'N/A'
      };
      
      onAdd(candidate);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="ac-overlay" onClick={onClose}>
      <div className="ac-modal" onClick={e => e.stopPropagation()}>
        <div className="ac-header">
          <div className="ac-header__title-container">
            <div className="ac-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h2 className="ac-title">Register New Candidate</h2>
              <p className="ac-subtitle">Enter candidate details into talent acquisition loop</p>
            </div>
          </div>
          <button className="ac-close-btn" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ac-body">
          {/* Candidate Full Name */}
          <div className={`ac-field ${errors.name ? 'ac-field--error' : ''}`}>
            <label className="ac-label">
              Candidate Full Name <span className="ac-required">*</span>
            </label>
            <input
              type="text"
              className="ac-input"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="ac-error-msg">{errors.name}</span>}
          </div>

          {/* Email & Phone splits */}
          <div className="ac-row-2col">
            <div className={`ac-field ${errors.email ? 'ac-field--error' : ''}`}>
              <label className="ac-label">
                Email Address <span className="ac-required">*</span>
              </label>
              <input
                type="email"
                className="ac-input"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
              {errors.email && <span className="ac-error-msg">{errors.email}</span>}
            </div>

            <div className={`ac-field ${errors.phone ? 'ac-field--error' : ''}`}>
              <label className="ac-label">
                Phone Number <span className="ac-required">*</span>
              </label>
              <input
                type="text"
                className="ac-input"
                placeholder="+63 912 345 6789"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
              {errors.phone && <span className="ac-error-msg">{errors.phone}</span>}
            </div>
          </div>

          {/* Applied for Position & Starting pipeline */}
          <div className="ac-row-2col">
            <div className="ac-field">
              <label className="ac-label">
                Apply for Position <span className="ac-required">*</span>
              </label>
              <select
                className="ac-input"
                value={formData.position}
                onChange={e => handleChange('position', e.target.value)}
              >
                <option value="Senior Associate Attorney">Senior Associate Attorney</option>
                <option value="Full Stack Engineer">Full Stack Engineer</option>
                <option value="Corporate Accountant">Corporate Accountant</option>
              </select>
            </div>

            <div className="ac-field">
              <label className="ac-label">Starting Pipeline Stage</label>
              <select
                className="ac-input ac-input--gold-border"
                value={formData.stage}
                onChange={e => handleChange('stage', e.target.value as Applicant['stage'])}
              >
                <option value="screening">Screening</option>
                <option value="review">Initial Review</option>
                <option value="endorsement">Endorsement</option>
                <option value="final_review">Final Review</option>
                <option value="bgcheck">Background Check</option>
                <option value="job_offer">Job Offer</option>
                <option value="fo_requirements">For Requirements</option>
                <option value="hired">Hired</option>
              </select>
            </div>
          </div>

          {/* Row 4: Experience */}
          <div className={`ac-field ${errors.experience ? 'ac-field--error' : ''}`}>
            <label className="ac-label">
              Experience Credentials <span className="ac-required">*</span>
            </label>
            <input
              type="text"
              className="ac-input"
              placeholder="e.g. 5 Years in Corporate Litigation representing local firms"
              value={formData.experience}
              onChange={e => handleChange('experience', e.target.value)}
            />
            {errors.experience && <span className="ac-error-msg">{errors.experience}</span>}
          </div>

          {/* Row 5: Interview comments */}
          <div className="ac-field">
            <label className="ac-label">Initial Screening comments</label>
            <textarea
              className="ac-textarea"
              placeholder="Add summary notes regarding applicant fit..."
              value={formData.comments}
              onChange={e => handleChange('comments', e.target.value)}
            />
          </div>

          {/* Footer buttons */}
          <div className="ac-footer">
            <button type="button" className="ac-btn ac-btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ac-btn ac-btn--submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
