export interface Job {
  id: string;
  title: string;
  position: string;
  department: string;
  positionStatus: string; // 'Replacement' | 'Additional'
  noRequired: number;
  openings: number;
  dateRequested: string;
  datePosted: string;
  dateRequired: string;
  deadline: string;
  applicants: number;
  maxApplicants: number;
  description: string;
  qualification: string;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: 'screening' | 'review' | 'endorsement' | 'final_review' | 'bgcheck' | 'job_offer' | 'fo_requirements' | 'hired' | 'rejected' | 'TERMINATED';
  experience: string;
  avatarColor: string;
  initials: string;
  department: string;
  submissionDate: string;
  notes?: string;
  education?: string;
  terminationReason?: string;
}

export interface Employee {
  id: string;
  name: string;
  dateHired: string;
  dateOfRegularization: string;
  company: string;
  department: string;
  position: string;
  jobStatus: string; // 'Regular' | 'Probationary' | 'Project Based' | 'Intern'
  employeeLevel: string;
  localEmail: string;
  stlafEmail: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  dateOfBirth: string;
  civilStatus: string;
  personalEmail: string;
  cellPhone: string;
  address: string;
  contactName: string;
  relationship: string;
  contactNo: string;
  active: 'Yes' | 'No';
  terminationDate?: string;
  reason?: string;
  remarks?: string;
  sss?: string;
  philhealth?: string;
  hdmf?: string;
  tin?: string;
  duration?: string;
  
  // Custom tracking fields
  onboardingStatus?: 'pending' | 'in_progress' | 'completed';
  onboardingProgress?: number; // 0 to 100
  offboardingStatus?: 'not_started' | 'initiated' | 'completed';
  offboardingProgress?: number;
}

export interface Activity {
  id: string;
  applicantName: string;
  action: string;
  timestamp: string;
  stage: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  taskName: string;
  category: 'Documentary' | 'IT & Security' | 'Training' | 'Integration';
  completed: boolean;
  dueDate: string;
}

export interface OffboardingTask {
  id: string;
  employeeId: string;
  taskName: string;
  category: 'Asset Return' | 'System Revocation' | 'Exit Interview' | 'Financial & Legal';
  completed: boolean;
  dueDate: string;
}
