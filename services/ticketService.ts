
import { Ticket, TicketStatus, User, IssueMaster } from '../types';

export const getSmartAssignee = (
  issue: IssueMaster, 
  allTickets: Ticket[], 
  allUsers: User[]
): { user: User | null; reason: string } => {
  if (!issue || !issue.assigneeIds || issue.assigneeIds.length === 0) {
    return { user: null, reason: 'No engineers defined for this issue type.' };
  }

  // Calculate active workload for each candidate
  const candidates = issue.assigneeIds.map(id => {
    const activeTickets = allTickets.filter(t => 
      t.assigneeId === id && 
      t.status !== TicketStatus.RESOLVED && 
      t.status !== TicketStatus.CLOSED
    );
    return { id, count: activeTickets.length };
  });

  // Find candidate with minimum active tickets (Load Balancing)
  const winner = [...candidates].sort((a, b) => a.count - b.count)[0];
  const user = allUsers.find(u => u.id === winner.id) || null;
  
  const primaryId = issue.assigneeIds[0];
  const primaryActive = candidates.find(c => c.id === primaryId)?.count || 0;
  
  let reason = '';
  if (winner.id !== primaryId && primaryActive > 0) {
    reason = `Primary engineer (${allUsers.find(u => u.id === primaryId)?.name}) is currently busy with ${primaryActive} active tasks. Re-routed for faster resolution.`;
  } else {
    reason = `Assigned to ${user?.name} based on current availability.`;
  }

  return { user, reason };
};
