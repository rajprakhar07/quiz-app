// src/pages/LobbyPage.jsx
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { subscribeToRoom } from '../lib/db';
import { useStore } from '../store/useStore';
import Avatar from '../components/ui/Avatar';
import ParticleBackground from '../components/ui/ParticleBackground';
import CountdownOverlay from '../components/ui/CountdownOverlay';
import { useState } from 'react';
import { sounds } from '../lib/sounds';

export default function LobbyPage() {
  const { code } = useParams();
  const navigate  = useNavigate();
  const { participant, soundEnabled } = useStore();
  const [room, setRoom] = useState(null);
  const [showCountdown, setShowCountdown] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    if (!participant) { navigate('/join'); return; }

    const unsub = subscribeToRoom(code, (roomData) => {
      setRoom(roomData);

      // New participant joined sound
      const count = Object.keys(roomData.participants || {}).length;
      if (count > prevCountRef.current && prevCountRef.current > 0 && soundEnabled) {
        sounds.join();
      }
      prevCountRef.current = count;

      if (roomData.status === 'countdown') setShowCountdown(true);
      if (roomData.status === 'active')    navigate(`/quiz/${code}`);
      if (roomData.status === 'finished')  navigate(`/results/${code}`);
    });

    return unsub;
  }, [code, participant]);

  if (!room) return <LoadingScreen />;

  const participants = Object.values(room.participants || {});

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 bg-[#0f0a1e]">
        <div className="absolute top-0 left-0 w-full h-full
                        bg-gradient-to-br from-violet-900/20 via-transparent to-pink-900/20" />
      </div>
      <ParticleBackground count={14} />

      {showCountdown && (
        <CountdownOverlay onComplete={() => navigate(`/quiz/${code}`)} />
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Room code display */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-white/50 font-bold uppercase tracking-widest text-sm mb-2">
            Room Code
          </p>
          <div className="glass rounded-2xl px-8 py-4 inline-block">
            <h1 className="text-5xl md:text-7xl font-black tracking-[0.2em] gradient-text">
              {code}
            </h1>
          </div>
          <p className="text-white/40 font-semibold mt-3 text-sm">
            Share this code with players
          </p>
        </motion.div>

        {/* Quiz title */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black text-white mb-8"
        >
          {room.quizTitle || 'Getting ready…'}
        </motion.h2>

        {/* Your avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="flex flex-col items-center gap-3 mb-10"
        >
          <Avatar name={participant?.name} size="xl" className="pulse-ring" />
          <p className="text-white font-black text-xl">{participant?.name}</p>
          <p className="text-white/40 text-sm font-semibold">You're in! Waiting for quiz to start…</p>
        </motion.div>

        {/* Players grid */}
        <div className="w-full max-w-2xl">
          <p className="text-center text-white/50 font-bold mb-4 text-sm uppercase tracking-wider">
            {participants.length} {participants.length === 1 ? 'Player' : 'Players'} in the room
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {participants.map(p => (
              <motion.div
                key={p.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="glass-dark rounded-2xl p-3 flex flex-col items-center gap-2"
              >
                <Avatar name={p.name} size="sm" />
                <p className="text-white text-xs font-bold truncate w-full text-center">{p.name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-white/40 font-semibold mt-10 text-sm"
        >
          Waiting for the host to start…
        </motion.p>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-white/50 font-semibold">Joining room…</p>
      </div>
    </div>
  );
}
