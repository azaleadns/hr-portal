import React, { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Applicant } from '../types';
import { stageConfig } from '../data/mockData';
import ApplicantDetailModal from './ApplicantDetailModal';
import AddCandidateModal from './AddCandidateModal';
import {
  Plus,
  Calendar,
  Search,
  FileText,
  Handshake,
  GraduationCap,
  ShieldCheck,
  Mail,
  FolderOpen,
  CheckCircle2,
  XCircle,
  DoorOpen,
  Trash2
} from 'lucide-react';
import './ApplicantTracker.css';

const STAGE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  screening: Search,
  review: FileText,
  endorsement: Handshake,
  final_review: GraduationCap,
  bgcheck: ShieldCheck,
  job_offer: Mail,
  fo_requirements: FolderOpen,
  hired: CheckCircle2,
  rejected: XCircle,
  TERMINATED: DoorOpen
};

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
  onDeleteCandidate: (id: string) => void;
}

export default function ApplicantTracker({
  applicants,
  onUpdateStage,
  onAddCandidate,
  onDeleteCandidate
}: ApplicantTrackerProps) {
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
        <div className="header-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {applicants.length > 0 && (
            <button className="reset-demo-btn clear-all-btn" onClick={() => {
              applicants.forEach(app => onDeleteCandidate(app.id));
            }} title="Clear all candidates from board">
              <Trash2 size={14} />
              <span>Clear Board</span>
            </button>
          )}
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
            const IconComponent = STAGE_ICONS[stage];

            return (
              <div key={stage} className="kanban-column">
                <div className="column-header" style={{ '--col-color': config.color } as React.CSSProperties}>
                  <div className="column-header-left">
                    {IconComponent ? (
                      <IconComponent size={13} style={{ color: config.color }} />
                    ) : (
                      <span className="column-indicator" style={{ background: config.color }}></span>
                    )}
                    <h3 className="column-title" style={{ marginLeft: IconComponent ? '3px' : '0' }}>{config.label}</h3>
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
                          {IconComponent && (
                            <IconComponent size={18} style={{ color: config.color, opacity: 0.6 }} />
                          )}
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
          onDelete={(id) => {
            onDeleteCandidate(id);
            setSelectedApplicant(null);
          }}
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
