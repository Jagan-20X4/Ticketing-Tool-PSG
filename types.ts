
export enum AppType {
  P2P = 'P2P',
  ESHOPAID = 'Eshopaid',
  ORACLE_ERP = 'Oracle ERP',
  IT = 'IT',
  WEBSITE = 'Website',
  HIS = 'HIS'
}

export enum TicketType {
  INCIDENT = 'Incident',
  SERVICE_REQUEST = 'Service Request',
  CHANGE = 'Change',
  OTHER = 'Other'
}

export enum TicketStatus {
  NEW = 'Yet to Start',
  ASSIGNED = 'Assigned',
  IN_PROGRESS = 'Work in Progress',
  PENDING_USER = 'Pending User',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum UserRole {
  REQUESTER = 'Requester',
  ASSIGNEE = 'Assignee', // Engineer/Analyst/Staff
  MANAGER = 'Manager', // Reporting Manager
  ADMIN = 'Admin'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Application {
  id: string; // Unique code e.g., 'IT', 'P2P'
  name: string; // Display Name
  icon: string; // Lucide Icon Name string
  color: string; // Tailwind color classes
  status: 'Active' | 'Inactive';
}

export interface Department {
  code: string;
  name: string;
  status: 'Active' | 'Inactive';
}

export interface IssueMaster {
  code: string;
  name: string; // Specific issue name e.g., "VPN Connection Failed"
  app: string; // Changed from AppType to string to support dynamic apps
  category: TicketType; // Broad category
  priority: Priority; // Linked to SLA Master
  assigneeIds: string[]; // Support for multiple assignees (round-robin/load balancing)
  slaHours: number;
  status: 'Active' | 'Inactive';
}

export interface SLAMaster {
  id: string;
  priority: Priority;
  ticketType: TicketType;
  resolutionTimeHours: number; // Time allowed before escalation
  autoEscalate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string; // Links to Department name or code
  location?: string;
  password?: string; // For mock auth
  managerId?: string; // For escalation
  avatarUrl?: string;
}

export interface Patient {
  id: string; // MRN (Medical Record Number)
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  roomNumber?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  isInternal: boolean;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  app: string; // Changed from AppType to string
  type: TicketType; // Maintained for categorization
  issueCode: string; // Specific issue from Master
  issueName: string; // Snapshot of issue name
  summary: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assigneeId?: string;
  createdAt: string;
  assignedAt?: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  
  // Workflow & SLA fields
  slaLevel: number; // 1 to 5
  isEscalated?: boolean; 
  workStartedAt?: string; // When assignee clicked "Start Working"
  actualResolutionHours?: number; // Final time taken (ResolvedAt - CreatedAt)
  slaBreachDurationHours?: number; // Positive number means delay
  
  comments: Comment[];
  attachments: Attachment[];
}

export interface WorkflowRule {
  app: string; // Changed from AppType to string
  issueType: TicketType;
  defaultAssigneeId: string;
}

export interface DashboardStats {
  open: number;
  resolved: number;
  slaBreached: number;
  avgResponseTime: string;
}
