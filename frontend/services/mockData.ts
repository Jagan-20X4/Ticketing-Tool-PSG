
import { User, UserRole, AppType, TicketType, WorkflowRule, Ticket, TicketStatus, Priority, Department, IssueMaster, SLAMaster, Application } from '../types';

export const MOCK_APPLICATIONS: Application[] = [
  { id: AppType.P2P, name: 'P2P System', icon: 'DollarSign', color: 'bg-emerald-50 text-emerald-600 border-emerald-200', status: 'Active' },
  { id: AppType.ESHOPAID, name: 'Eshopaid', icon: 'ShoppingCart', color: 'bg-orange-50 text-orange-600 border-orange-200', status: 'Active' },
  { id: AppType.ORACLE_ERP, name: 'Oracle ERP', icon: 'Database', color: 'bg-red-50 text-red-600 border-red-200', status: 'Active' },
  { id: AppType.IT, name: 'IT Infrastructure', icon: 'Monitor', color: 'bg-blue-50 text-blue-600 border-blue-200', status: 'Active' },
  { id: AppType.WEBSITE, name: 'Website / CMS', icon: 'Globe', color: 'bg-indigo-50 text-indigo-600 border-indigo-200', status: 'Active' },
  { id: AppType.HIS, name: 'Hospital Info System', icon: 'Activity', color: 'bg-teal-50 text-teal-600 border-teal-200', status: 'Active' }
];

export const MOCK_DEPARTMENTS: Department[] = [
  { code: 'IT', name: 'IT Infrastructure', status: 'Active' },
  { code: 'FIN', name: 'Finance', status: 'Active' },
  { code: 'HR', name: 'Human Resources', status: 'Active' },
  { code: 'OPS', name: 'Operations', status: 'Active' },
  { code: 'HIS', name: 'Hospital Info Systems', status: 'Active' }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@helix.com', phone: '555-0101', role: UserRole.ADMIN, department: 'IT Infrastructure', location: 'HQ - Tower A', password: 'password123' },
  { id: 'u2', name: 'Bob Engineer', email: 'bob@helix.com', phone: '555-0102', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', managerId: 'u4', location: 'IT Lab 1', password: 'password123' },
  { id: 'u3', name: 'Charlie Requester', email: 'charlie@helix.com', phone: '555-0103', role: UserRole.REQUESTER, department: 'Finance', location: 'Finance Floor 3', password: 'password123' },
  { id: 'u4', name: 'Dave Manager', email: 'dave@helix.com', phone: '555-0104', role: UserRole.MANAGER, department: 'IT Infrastructure', location: 'HQ - Executive Wing', password: 'password123' },
  { id: 'u6', name: 'Abhishek srivastava', email: 'abhishek.srivastava@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Lucknow', password: 'password123', phone: '' },
  { id: 'u7', name: 'Siddique Sheikh', email: 'siddique.sheikh@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u8', name: 'Sunil bahadur', email: 'sunil.bahadur@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Delhi', password: 'password123', phone: '' },
  { id: 'u11', name: 'Pradeep Mishra', email: 'itsupportmumbai@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Mumbai', password: 'password123', phone: '' },
  { id: 'u12', name: 'Nitin singh negi', email: 'nitin.singh@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u13', name: 'Pankaj Sharma', email: 'pankaj.sharma@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Mumbai', password: 'password123', phone: '' },
  { id: 'u14', name: 'Gourav Salvi', email: 'gourav.salvi@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u15', name: 'Abhishek Singh', email: 'adtest@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Mumbai', password: 'password123', phone: '' },
  { id: 'u16', name: 'Mukesh Audichya', email: 'mukesh.audichya@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u17', name: 'Sameer khan', email: 'sameer.khan1@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u18', name: 'Anirudh Palande', email: 'anirudh.palande@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Mumbai', password: 'password123', phone: '' },
  { id: 'u20', name: 'Rakesh Mehta', email: 'rakesh.mehta@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u23', name: 'Kavita Rao', email: 'kavita.rao@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u25', name: 'Ishita Sisodiya', email: 'ishita.sisodiya@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u28', name: 'Vivek Sharma', email: 'vivek.sharma@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Udaipur', password: 'password123', phone: '' },
  { id: 'u29', name: 'Shubham Tiwari', email: 'shubham.tiwari@indiraivf.in', role: UserRole.ASSIGNEE, department: 'IT Infrastructure', location: 'Mumbai', password: 'password123', phone: '' },
];

export const MOCK_ISSUES: IssueMaster[] = [
  { code: 'IT-ACC-001', name: 'Access & Right', app: AppType.IT, category: TicketType.SERVICE_REQUEST, priority: Priority.HIGH, assigneeIds: ['u7', 'u6', 'u16'], slaHours: 24, status: 'Active' },
  { code: 'IT-CTV-001', name: 'CCTV / Smart PSS issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u14', 'u12'], slaHours: 8, status: 'Active' },
  { code: 'IT-NET-001', name: 'Network Issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u28', 'u17'], slaHours: 4, status: 'Active' },
  { code: 'IT-MDM-001', name: 'Scalefusion MDM Issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.CRITICAL, assigneeIds: ['u18', 'u7', 'u17'], slaHours: 4, status: 'Active' },
  { code: 'IT-PRN-001', name: 'Printer / Scanner Issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u8', 'u6'], slaHours: 8, status: 'Active' },
  { code: 'IT-WEB-001', name: 'Web Application Issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u17', 'u18'], slaHours: 8, status: 'Active' },
  { code: 'IT-HRD-002', name: 'New Hardware', app: AppType.IT, category: TicketType.SERVICE_REQUEST, priority: Priority.HIGH, assigneeIds: ['u11', 'u25'], slaHours: 48, status: 'Active' },
  { code: 'IT-SFT-002', name: 'Software Issue', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u20', 'u23'], slaHours: 8, status: 'Active' },
  { code: 'IT-EML-001', name: 'Email', app: AppType.IT, category: TicketType.SERVICE_REQUEST, priority: Priority.HIGH, assigneeIds: ['u7', 'u18'], slaHours: 24, status: 'Active' },
  { code: 'P2P-APP-001', name: 'P2P Application Issues', app: AppType.P2P, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u6', 'u20'], slaHours: 8, status: 'Active' },
  { code: 'IT-FLU-001', name: 'Internet Fluctuation', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.CRITICAL, assigneeIds: ['u29', 'u28'], slaHours: 4, status: 'Active' },
  { code: 'IT-CYB-001', name: 'CyberARK (IDAM/PAM)', app: AppType.IT, category: TicketType.SERVICE_REQUEST, priority: Priority.HIGH, assigneeIds: ['u18', 'u15'], slaHours: 12, status: 'Active' },
  { code: 'IT-BOT-001', name: 'BOT Workflow mismatch', app: AppType.IT, category: TicketType.INCIDENT, priority: Priority.HIGH, assigneeIds: ['u2', 'u20'], slaHours: 24, status: 'Active' }
];

export const MOCK_SLA: SLAMaster[] = [
  { id: 'sla1', priority: Priority.CRITICAL, ticketType: TicketType.INCIDENT, resolutionTimeHours: 4, autoEscalate: true },
  { id: 'sla2', priority: Priority.HIGH, ticketType: TicketType.INCIDENT, resolutionTimeHours: 8, autoEscalate: true },
  { id: 'sla3', priority: Priority.MEDIUM, ticketType: TicketType.INCIDENT, resolutionTimeHours: 24, autoEscalate: false },
  { id: 'sla4', priority: Priority.LOW, ticketType: TicketType.SERVICE_REQUEST, resolutionTimeHours: 48, autoEscalate: false },
];

export const MOCK_WORKFLOW: WorkflowRule[] = [
  { app: AppType.ORACLE_ERP, issueType: TicketType.INCIDENT, defaultAssigneeId: 'u2' },
  { app: AppType.P2P, issueType: TicketType.SERVICE_REQUEST, defaultAssigneeId: 'u6' },
  { app: AppType.IT, issueType: TicketType.OTHER, defaultAssigneeId: 'u6' },
];

export const MOCK_TICKETS: Ticket[] = [];
