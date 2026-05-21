// src/components/leaderboard/LeaderboardRow.jsx
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import { formatScore } from '../../lib/utils';

const RANK_COLORS = {
  1: 'from-yellow-400 to-amber-500',
  2: 'from-slate-300 to-slate-400',
  3: 'from-amber-600 to-orange-600',
};

const RANK_ICONS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardRow({ participant, index, isCurrentUser }) {
  const rank = index + 1;
  const isTop3 = rank <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1,  x: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 28 }}
      className={`
        flex items-center gap-4 p-4 rounded-2xl
        ${isCurrentUser ? 'glass ring-2 ring-violet-400' : 'glass-dark'}
        ${isTop3 ? 'py-5' : ''}
      `}
    >
      {/* Rank badge */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
        font-black text-lg
        ${isTop3
          ? `bg-gradient-to-br ${RANK_COLORS[rank]} text-white shadow-lg`
          : 'bg-white/10 text-white/60'}
      `}>
        {isTop3 ? RANK_ICONS[rank] : rank}
      </div>

      {/* Avatar */}
      <Avatar name={participant.name} size={isTop3 ? 'md' : 'sm'} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`font-black truncate ${isTop3 ? 'text-xl' : 'text-base'} 
                       ${isCurrentUser ? 'text-violet-300' : 'text-white'}`}>
          {participant.name}
          {isCurrentUser && <span className="ml-2 text-xs font-bold text-violet-400">(You)</span>}
        </p>
        {participant.streak > 1 && (
          <p className="text-xs text-orange-400 font-bold">🔥 {participant.streak}x streak</p>
        )}
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p className={`font-black ${isTop3 ? 'text-2xl' : 'text-lg'} text-white`}>
          {formatScore(participant.score)}
        </p>
        <p className="text-xs text-white/40 font-semibold">pts</p>
      </div>
    </motion.div>
  );
}
