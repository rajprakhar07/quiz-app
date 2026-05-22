// src/lib/utils.js

/** Generate a random 6-character room code */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Calculate points based on speed */
export function calculatePoints(timeLimitSeconds, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 1000;
  if (elapsedSeconds >= timeLimitSeconds) return 100;
  const ratio = elapsedSeconds / timeLimitSeconds;
  return Math.round(100 + 900 * (1 - ratio));
}

/** Sort participants by score descending */
export function rankParticipants(participants) {
  return Object.values(participants || {})
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

/** Get initials from name */
export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
}

/** Avatar color from name (deterministic) */
export function getAvatarColor(name = '') {
  const colors = [
    'from-pink-500 to-rose-500',
    'from-violet-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-fuchsia-500 to-pink-500',
    'from-indigo-500 to-blue-500',
    'from-lime-500 to-green-500',
  ];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return colors[hash % colors.length];
}

/** Format a number with commas */
export function formatScore(n) {
  return n?.toLocaleString() ?? '0';
}

/** Export leaderboard to CSV */
export function exportToCSV(participants, quizTitle = 'Quiz') {
  const ranked = rankParticipants(participants);
  const rows = [
    ['Rank', 'Name', 'Score'],
    ...ranked.map(p => [p.rank, p.name, p.score]),
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${quizTitle.replace(/\s+/g, '_')}_results.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Deep clone object */
export const clone = obj => JSON.parse(JSON.stringify(obj));
