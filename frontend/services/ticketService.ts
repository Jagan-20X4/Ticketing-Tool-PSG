import { Ticket, TicketStatus, User, IssueMaster } from '../types';

/**
 * Picks the issue that best matches the user's description and AI summary.
 */
export const getBestMatchingIssue = (
  appIssues: IssueMaster[],
  userDescription: string,
  aiSummary: string
): IssueMaster | null => {
  if (!appIssues || appIssues.length === 0) return null;
  const text = `${(userDescription || '').toLowerCase()} ${(aiSummary || '').toLowerCase()}`;
  const words = text.split(/\s+/).filter(Boolean);

  let best: { issue: IssueMaster; score: number } = { issue: appIssues[0], score: -1 };

  for (const issue of appIssues) {
    const name = (issue.name || '').toLowerCase();
    const code = (issue.code || '').toLowerCase();
    let score = 0;
    for (const w of words) {
      if (w.length < 2) continue;
      if (name.includes(w) || code.includes(w)) score += 2;
      if (name.split(/\s+/).some((nw) => nw.startsWith(w) || w.startsWith(nw))) score += 1;
    }
    if (score > best.score) best = { issue, score };
  }

  return best.issue;
};

export const getSmartAssignee = (
  issue: IssueMaster, 
  allTickets: Ticket[], 
  allUsers: User[]
): { user: User | null; reason: string } => {
  if (!issue || !issue.assigneeIds || issue.assigneeIds.length === 0) {
    return { user: null, reason: 'No engineers defined for this issue type.' };
  }

  const candidates = issue.assigneeIds.map(id => {
    const activeTickets = allTickets.filter(t => 
      t.assigneeId === id && 
      t.status !== TicketStatus.RESOLVED && 
      t.status !== TicketStatus.CLOSED
    );
    return { id, count: activeTickets.length };
  });

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
