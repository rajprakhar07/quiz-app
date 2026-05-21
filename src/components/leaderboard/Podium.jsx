// src/components/leaderboard/Podium.jsx
import { motion } from 'framer-motion';
import Avatar from '../ui/Avatar';
import { formatScore } from '../../lib/utils';

const ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

const PODIUM_CONFIG = [
  { height: 'h-28', delay: 0.3, label: '🥈', color: 'from-slate-300 to-slate-500',    textSize: 'text-lg' },
  { height: 'h-40', delay: 0.1, label: '🥇', color: 'from-yellow-300 to-amber-500',   textSize: 'text-2xl' },
  { height: 'h-20', delay: 0.5, label: '🥉', color: 'from-amber-600 to-orange-700',   textSize: 'text-base' },
];

export default function Podium({ top3 = [] }) {
  return (
    <div className="flex items-end justify-center gap-3 px-4 pt-16">
      {ORDER.map((playerIdx, displayIdx) => {
        const player = top3[playerIdx];
        const cfg    = PODIUM_CONFIG[displayIdx];
        if (!player) return <div key={displayIdx} className="w-24 md:w-32" />;

        return (
          <motion.div
            key={player.id}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            transition={{ delay: cfg.delay, type: 'spring', stiffness: 200, damping: 20 }}
            className="flex flex-col items-center gap-2 w-24 md:w-32"
          >
            {/* Crown / Medal */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, delay: cfg.delay }}
              className="text-3xl"
            >
              {cfg.label}
            </motion.div>

            {/* Avatar */}
            <Avatar name={player.name} size="lg" />

            {/* Name */}
            <p className="text-white font-black text-center text-sm truncate w-full text-center px-1">
              {player.name}
            </p>

            {/* Score */}
            <p className={`font-black ${cfg.textSize} text-white`}>
              {formatScore(player.score)}
            </p>

            {/* Podium block */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: cfg.delay + 0.2, duration: 0.5 }}
              style={{ transformOrigin: 'bottom' }}
              className={`w-full ${cfg.height} bg-gradient-to-b ${cfg.color}
                          rounded-t-2xl flex items-center justify-center
                          text-white/60 font-black text-4xl shadow-xl`}
            >
              {playerIdx + 1}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
