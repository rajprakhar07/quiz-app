// src/components/admin/ParticipantList.jsx
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../ui/Avatar';

export default function ParticipantList({ participants = {}, showCount = true }) {
  const list = Object.values(participants);

  return (
    <div>
      {showCount && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-black text-emerald-400 text-lg">{list.length}</span>
          <span className="text-white/60 font-semibold">
            {list.length === 1 ? 'player' : 'players'} joined
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
        <AnimatePresence>
          {list.map(p => (
            <motion.div
              key={p.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="glass-dark rounded-2xl p-3 flex flex-col items-center gap-2"
            >
              <Avatar name={p.name} size="md" />
              <p className="text-white font-bold text-sm text-center truncate w-full">
                {p.name}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {list.length === 0 && (
        <p className="text-white/30 text-center font-semibold py-8">
          Waiting for players to join…
        </p>
      )}
    </div>
  );
}
