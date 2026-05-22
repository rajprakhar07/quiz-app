// src/pages/ResultsPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { getRoom } from '../lib/db';
import { useStore } from '../store/useStore';
import { rankParticipants, exportToCSV, formatScore } from '../lib/utils';
import Podium from '../components/leaderboard/Podium';
import LeaderboardRow from '../components/leaderboard/LeaderboardRow';
import { sounds } from '../lib/sounds';

export default function ResultsPage() {
  const { code }    = useParams();
  const navigate    = useNavigate();
  const { participant, soundEnabled, clearSession } = useStore();
  const [room, setRoom] = useState(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const onResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    getRoom(code).then(setRoom);
    if (soundEnabled) setTimeout(() => sounds.win(), 500);
    const t = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(t);
  }, [code]);

  if (!room) return null;

  const ranked = rankParticipants(room.participants);
  const top3   = ranked.slice(0, 3);
  const rest   = ranked.slice(3);
  const me     = ranked.find(p => p.id === participant?.id);
  const winner = ranked[0];

 const handleLeave = () => {
    clearSession();
    localStorage.removeItem('quizblitz_session');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden pb-12">
      {/* Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/40 via-[#0f0a1e] to-[#0f0a1e]" />
      </div>

      {showConfetti && (
        <Confetti
          width={windowSize.w}
          height={windowSize.h}
          colors={['#a855f7', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#ef4444']}
          numberOfPieces={200}
          recycle={false}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 50, pointerEvents: 'none' }}
        />
      )}

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-2"
        >
          <p className="text-white/50 font-bold uppercase tracking-widest text-sm">Quiz Complete!</p>
          <h1 className="text-5xl font-black gradient-text mt-1">Final Results</h1>
          <p className="text-white/40 font-semibold text-sm mt-1">{room.quizTitle}</p>
        </motion.div>

        {/* Winner shoutout */}
        {winner && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="glass rounded-3xl p-5 my-6 text-center"
          >
            <p className="text-3xl mb-1">🏆</p>
            <p className="text-white/60 font-bold text-sm uppercase tracking-wider">Champion</p>
            <p className="text-3xl font-black text-white mt-1">{winner.name}</p>
            <p className="text-violet-300 font-black text-2xl mt-1">{formatScore(winner.score)} pts</p>
          </motion.div>
        )}

        {/* My result */}
        {me && me.rank > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-4 mb-6 flex items-center gap-4"
          >
            <span className="text-3xl font-black text-white/40">#{me.rank}</span>
            <div>
              <p className="font-black text-white">{me.name} <span className="text-violet-400 text-sm">(You)</span></p>
              <p className="text-white/50 text-sm font-semibold">{formatScore(me.score)} points</p>
            </div>
          </motion.div>
        )}

        {/* Podium */}
        <Podium top3={top3} />

        {/* Full leaderboard */}
        {rest.length > 0 && (
          <div className="mt-8 space-y-2">
            <h2 className="text-white/50 font-bold uppercase tracking-widest text-xs mb-3">
              Full Rankings
            </h2>
            {rest.map((p, i) => (
              <LeaderboardRow
                key={p.id}
                participant={p}
                index={i + 3}
                isCurrentUser={p.id === participant?.id}
              />
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-10">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => exportToCSV(room.participants, room.quizTitle)}
            className="flex-1 btn-secondary py-4 text-base"
          >
            📥 Download Results
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={handleLeave}
            className="flex-1 btn-primary py-4 text-base"
          >
            🏠 Back to Home
          </motion.button>
        </div>
      </div>
    </div>
  );
}
