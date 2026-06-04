import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Applicant } from '../types';
import { stageConfig } from '../data/mockData';
import ApplicantDetailModal from './ApplicantDetailModal';
import AddCandidateModal from './AddCandidateModal';
import { Plus, Calendar } from 'lucide-react';
import './ApplicantTracker.css';

const DroppableComponent = Droppable as any;
const DraggableComponent = Draggable as any;

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

interface ApplicantTrackerProps {
  applicants: Applicant[];
  onUpdateStage: (id: string, stage: Applicant['stage']) => void;
  onAddCandidate: (applicant: Applicant) => void;
}

export default function ApplicantTracker({ applicants, onUpdateStage, onAddCandidate }: ApplicantTrackerProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showAddCandidate, setShowAddCandidate] = useState(false);

  const columns = useMemo(() => {
    const cols: Record<Applicant['stage'], Applicant[]> = {
      screening: [],
      review: [],
      endorsement: [],
      final_review: [],
      bgcheck: [],
      job_offer: [],
      fo_requirements: [],
      hired: [],
      rejected: [],
      TERMINATED: []
    };
    
    COLUMN_ORDER.forEach(stage => {
      cols[stage] = applicants.filter(a => a.stage === stage);
    });
    return cols;
  }, [applicants]);

  const totalCounts = useMemo(() => {
    return {
      hired: columns.hired.length,
      rejected: columns.rejected.length,
      total: applicants.length
    };
  }, [columns, applicants]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    onUpdateStage(draggableId, destination.droppableId as Applicant['stage']);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="tracker-page page-layout">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <h1 className="page-title">Applicant Tracker</h1>
          <p className="page-subtitle">Drag and drop cases to change position progression. Click card for credentials.</p>
        </div>
        <div className="header-right">
          <button className="add-candidate-btn" onClick={() => setShowAddCandidate(true)}>
            <Plus size={16} />
            <span>Add Candidate</span>
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {COLUMN_ORDER.map(stage => {
            const config = stageConfig[stage];
            const items = columns[stage] || [];

            return (
              <div key={stage} className="kanban-column">
                <div className="column-header" style={{ '--col-color': config.color } as React.CSSProperties}>
                  <div className="column-header-left">
                    <span className="column-indicator" style={{ background: config.color }}></span>
                    <h3 className="column-title">{config.label}</h3>
                  </div>
                  <span className="column-count" style={{
                    background: `${config.color}18`,
                    color: config.color
                  }}>
                    {items.length}
                  </span>
                </div>

                 <DroppableComponent droppableId={stage}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      style={{
                        '--drag-color': `${config.color}12`
                      } as React.CSSProperties}
                    >
                      {items.map((applicant, index) => (
                        <DraggableComponent
                          key={applicant.id}
                          draggableId={applicant.id}
                          index={index}
                        >
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                              style={{
                                ...provided.draggableProps.style,
                                '--card-color': config.color
                              } as React.CSSProperties}
                              onClick={() => setSelectedApplicant(applicant)}
                            >
                              <div className="card-left-border" style={{ background: config.color }}></div>
                              <div className="card-content">
                                <div className="card-top">
                                  <div
                                    className="card-avatar"
                                    style={{ background: applicant.avatarColor }}
                                  >
                                    {applicant.initials}
                                  </div>
                                </div>
                                <div className="card-info">
                                  <span className="card-name">{applicant.name}</span>
                                  <span className="card-position">{applicant.position}</span>
                                  <span className="card-date">
                                    <Calendar size={12} />
                                    <span>{formatDate(applicant.submissionDate)}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </DraggableComponent>
                      ))}
                      {provided.placeholder}

                      {items.length === 0 && (
                        <div className="column-empty">
                          <span className="empty-icon-small">{config.icon}</span>
                          <span>No applicants</span>
                        </div>
                      )}
                    </div>
                  )}
                </DroppableComponent>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Tracker Footer Counters */}
      <footer className="tracker-footer">
        <div className="tracker-counters">
          <div className="counter-badge">
            <span className="counter-dot" style={{ background: '#22c55e' }}></span>
            <span>{totalCounts.hired} Hired</span>
          </div>
          <div className="counter-badge">
            <span className="counter-dot" style={{ background: '#ef4444' }}></span>
            <span>{totalCounts.rejected} Rejected</span>
          </div>
          <div className="counter-badge total-counter">
            <span>{totalCounts.total} Active Leads</span>
          </div>
        </div>
      </footer>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <ApplicantDetailModal
          applicant={selectedApplicant}
          onClose={() => setSelectedApplicant(null)}
          onUpdateStage={onUpdateStage}
        />
      )}

      {/* Add Candidate Modal */}
      {showAddCandidate && (
        <AddCandidateModal
          onClose={() => setShowAddCandidate(false)}
          onAdd={onAddCandidate}
        />
      )}
    </div>
  );
}
