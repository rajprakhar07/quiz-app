// src/pages/JoinPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { joinRoom } from '../lib/db';
import { useStore } from '../store/useStore';
import { sounds } from '../lib/sounds';
import ParticleBackground from '../components/ui/ParticleBackground';

export default function JoinPage() {
  const navigate = useNavigate();
  const { setParticipant, setCurrentRoomCode, soundEnabled } = useStore();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
  e.preventDefault();
  const trimName = name.trim();
  const trimCode = code.trim().toUpperCase();

  if (!trimName) return toast.error('Please enter your name');
  if (trimName.length < 2) return toast.error('Name must be at least 2 characters');
  if (!trimCode || trimCode.length !== 6) return toast.error('Enter a valid 6-character room code');

  // Check if this device already joined a room
  const existingSession = localStorage.getItem('quizblitz_session');
  if (existingSession) {
    const session = JSON.parse(existingSession);
    if (session.roomCode === trimCode) {
      // Restore existing session instead of creating new one
      setParticipant(session.participant);
      setCurrentRoomCode(trimCode);
      toast.success(`Welcome back, ${session.participant.name}! 🎉`);
      navigate(`/lobby/${trimCode}`);
      return;
    }
  }

  setLoading(true);
  try {
    const participant = { id: uuidv4(), name: trimName };
    await joinRoom(trimCode, participant);
    setParticipant(participant);
    setCurrentRoomCode(trimCode);
    // Save session to localStorage
    localStorage.setItem('quizblitz_session', JSON.stringify({ roomCode: trimCode, participant }));
    if (soundEnabled) sounds.join();
    toast.success(`Welcome, ${trimName}! 🎉`);
    navigate(`/lobby/${trimCode}`);
  } catch (err) {
    toast.error(err.message || 'Failed to join room');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-[#0f0a1e]">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-violet-700/25 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-pink-700/20 blur-[80px]" />
      </div>
      <ParticleBackground count={12} />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0,  scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-6xl mb-3"
          >⚡</motion.div>
          <h1 className="text-4xl font-black gradient-text">QuizBlitz</h1>
          <p className="text-white/50 font-semibold mt-1">Join a live quiz session</p>
        </div>

        {/* Form card */}
        <div className="glass rounded-3xl p-8">
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-white/60 uppercase tracking-wider mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name…"
                maxLength={20}
                autoFocus
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white/60 uppercase tracking-wider mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().slice(0, 6))}
                placeholder="e.g. ABC123"
                maxLength={6}
                className="input-field tracking-[0.3em] text-center text-2xl font-black"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary text-xl py-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining…
                </span>
              ) : '🚀 Join Quiz'}
            </motion.button>
          </form>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full text-center text-white/40 hover:text-white/70 font-semibold
                     transition-colors mt-5 text-sm"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
