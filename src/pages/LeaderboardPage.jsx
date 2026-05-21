// src/pages/LeaderboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subscribeToRoom } from '../lib/db';
import { useStore } from '../store/useStore';
import { rankParticipants, formatScore } from '../lib/utils';
import LeaderboardRow from '../components/leaderboard/LeaderboardRow';
import Avatar from '../components/ui/Avatar';

export default function LeaderboardPage() {
  const { code }    = useParams();
  const navigate    = useNavigate();
  const { participant } = useStore();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const unsub = subscribeToRoom(code, (roomData) => {
      setRoom(roomData);
      if (roomData.status === 'active')   navigate(`/quiz/${code}`);
      if (roomData.status === 'finished') navigate(`/results/${code}`);
    });
    return unsub;
  }, [code]);

  if (!room) return null;

  const ranked = rankParticipants(room.participants);
  const me     = ranked.find(p => p.id === participant?.id);

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-900/30 to-[#0f0a1e]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl font-black gradient-text mb-1">Leaderboard</h1>
          <p className="text-white/40 font-semibold text-sm">
            After Q{room.currentQuestionIndex + 1} of {room.totalQuestions}
          </p>
        </motion.div>

        {/* My score card */}
        {me && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-4 mb-6 flex items-center gap-4"
          >
            <Avatar name={me.name} size="md" />
            <div className="flex-1">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Your rank</p>
              <p className="text-2xl font-black text-white">#{me.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider">Score</p>
              <p className="text-2xl font-black text-violet-300">{formatScore(me.score)}</p>
            </div>
          </motion.div>
        )}

        {/* Top players */}
        <div className="space-y-2">
          {ranked.slice(0, 10).map((p, i) => (
            <LeaderboardRow
              key={p.id}
              participant={p}
              index={i}
              isCurrentUser={p.id === participant?.id}
            />
          ))}
        </div>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-center text-white/30 font-semibold mt-8 text-sm"
        >
          Next question coming up…
        </motion.p>
      </div>
    </div>
  );
}
