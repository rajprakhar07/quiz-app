// src/pages/AdminRoom.jsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import {
  subscribeToRoom, nextQuestion, showLeaderboard,
  endGame, deleteRoom, getQuestionAnswers,
} from '../lib/db';
import { rankParticipants, exportToCSV } from '../lib/utils';
import ParticipantList from '../components/admin/ParticipantList';
import LeaderboardRow from '../components/leaderboard/LeaderboardRow';
import TimerBar from '../components/ui/TimerBar';
import toast from 'react-hot-toast';


export default function AdminRoom() {
  const { code }  = useParams();
  const navigate  = useNavigate();
 const [room, setRoom] = useState(null);
const [answerStats, setAnswerStats] = useState(null);
const [timerKey, setTimerKey] = useState(0);
const [authChecked, setAuthChecked] = useState(false);
const autoAdvanceRef = useRef(null);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    setAuthChecked(true);
    if (!user) navigate('/admin');
  });
  return unsub;
}, []);

if (!authChecked || !room) return <Loading />;

  // Room subscription
  useEffect(() => {
    const unsub = subscribeToRoom(code, (roomData) => {
      setRoom(prev => {
        // New question started
        if (prev && roomData.currentQuestionIndex !== prev.currentQuestionIndex) {
          setTimerKey(k => k + 1);
          setAnswerStats(null);
          clearTimeout(autoAdvanceRef.current);
        }
        return roomData;
      });
    });
    return () => { unsub(); clearTimeout(autoAdvanceRef.current); };
  }, [code]);

  const handleTimerExpire = async () => {
    if (!room) return;
    // Fetch answer stats then show leaderboard
    try {
      const answers = await getQuestionAnswers(code, room.currentQuestionIndex);
      const q = room.questions[room.currentQuestionIndex];
      const stats = {
        total: Object.keys(room.participants).length,
        answered: answers.length,
        correct: answers.filter(a => a.isCorrect).length,
        byOption: [0, 1, 2, 3].map(i => answers.filter(a => a.optionIndex === i).length),
      };
      setAnswerStats(stats);
    } catch {}

    // Auto-advance to leaderboard after 3s
    autoAdvanceRef.current = setTimeout(() => handleNext(), 3000);
  };

  const handleNext = async () => {
    clearTimeout(autoAdvanceRef.current);
    if (!room) return;
    const nextIdx = room.currentQuestionIndex + 1;

    if (nextIdx >= room.totalQuestions) {
      await endGame(code);
      toast.success('Quiz ended! 🏆');
    } else {
      await showLeaderboard(code);
      // Small delay then advance question
      setTimeout(async () => {
        await nextQuestion(code, nextIdx);
      }, 5000);
    }
  };

  const handleStart = async () => {
    await nextQuestion(code, 0);
  };

  const handleEnd = async () => {
    if (!confirm('End the quiz now?')) return;
    await endGame(code);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this room permanently?')) return;
    await deleteRoom(code);
    navigate('/admin/dashboard');
  };

  

  const ranked = rankParticipants(room.participants);
  const isLobby = room.status === 'lobby' || room.status === 'countdown';
  const isActive = room.status === 'active';
  const isLeaderboard = room.status === 'leaderboard';
  const isFinished = room.status === 'finished';
  const q = room.questions?.[room.currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-900/20 to-[#0f0a1e]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <button onClick={() => navigate('/admin/dashboard')}
            className="text-white/40 hover:text-white text-sm font-semibold">
            ← Dashboard
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">{room.quizTitle || 'Live Quiz'}</h1>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="glass rounded-full px-3 py-0.5 text-xs font-black tracking-widest text-violet-300">
                {code}
              </span>
              <StatusBadge status={room.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => exportToCSV(room.participants, room.quizTitle)}
              className="btn-secondary text-xs py-2 px-3">📥 Export</button>
            <button onClick={handleDelete}
              className="glass rounded-xl py-2 px-3 text-red-400 hover:bg-red-500/10 text-xs font-bold">
              🗑 Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Lobby state */}
            {isLobby && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-6">
                <div className="text-center mb-6">
                  <p className="text-white/50 font-bold uppercase tracking-wider text-sm mb-2">Room Code</p>
                  <h2 className="text-6xl font-black gradient-text tracking-widest">{code}</h2>
                  <p className="text-white/40 text-sm mt-2 font-semibold">
                    Players join at <span className="text-white/70">quizblitz.app/join</span>
                  </p>
                </div>
                <ParticipantList participants={room.participants} />
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleStart}
                  disabled={Object.keys(room.participants).length === 0}
                  className="w-full btn-primary py-5 text-xl mt-6 disabled:opacity-40"
                >
                  🚀 Start Quiz ({Object.keys(room.participants).length} players)
                </motion.button>
              </motion.div>
            )}

            {/* Active question */}
            {(isActive || isLeaderboard) && q && (
              <div className="glass rounded-3xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/50 font-bold text-sm">
                    Question {room.currentQuestionIndex + 1} / {room.totalQuestions}
                  </span>
                  <StatusBadge status={room.status} />
                </div>

                <div className="glass-dark rounded-2xl p-4">
                  <p className="text-xl font-black text-white">{q.text}</p>
                </div>

                {isActive && (
                  <TimerBar
                    key={timerKey}
                    duration={q.timeLimit}
                    startedAt={room.questionStartedAt}
                    onExpire={handleTimerExpire}
                  />
                )}

                {/* Answer option labels */}
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, i) => (
                    <div key={i}
                      className={`rounded-xl p-3 text-sm font-bold
                                  ${i === q.correctIndex ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500' : 'glass-dark text-white/70'}`}>
                      <span className="opacity-60 mr-1">{['▲', '◆', '●', '■'][i]}</span>
                      {opt}
                      {i === q.correctIndex && <span className="ml-1">✓</span>}
                    </div>
                  ))}
                </div>

                {/* Answer stats */}
                {answerStats && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-dark rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm font-bold text-white/60">
                      <span>{answerStats.answered}/{answerStats.total} answered</span>
                      <span className="text-emerald-400">{answerStats.correct} correct</span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {answerStats.byOption.map((count, i) => {
                        const pct = answerStats.total > 0 ? (count / answerStats.total) * 100 : 0;
                        const colors = ['bg-rose-500', 'bg-blue-500', 'bg-amber-400', 'bg-emerald-500'];
                        return (
                          <div key={i} className="flex-1 bg-white/10 rounded-lg overflow-hidden flex items-end">
                            <div className={`w-full ${colors[i]} rounded-lg transition-all duration-700`}
                              style={{ height: `${pct}%` }} />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Next button */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className="w-full btn-primary py-4 text-lg"
                >
                  {room.currentQuestionIndex + 1 >= room.totalQuestions
                    ? '🏁 End Quiz'
                    : '⏭ Next Question →'}
                </motion.button>
              </div>
            )}

            {/* Finished */}
            {isFinished && (
              <div className="glass rounded-3xl p-8 text-center space-y-4">
                <div className="text-6xl">🏆</div>
                <h2 className="text-3xl font-black gradient-text">Quiz Complete!</h2>
                <p className="text-white/50 font-semibold">
                  {Object.keys(room.participants).length} players participated
                </p>
                <div className="flex gap-3">
                  <button onClick={() => exportToCSV(room.participants, room.quizTitle)}
                    className="flex-1 btn-secondary py-3">📥 Export CSV</button>
                  <button onClick={() => navigate('/admin/dashboard')}
                    className="flex-1 btn-primary py-3">← Dashboard</button>
                </div>
              </div>
            )}
          </div>

          {/* Right panel — live leaderboard */}
          <div className="space-y-3">
            <h2 className="text-white/50 font-bold uppercase tracking-wider text-xs">
              Live Standings ({ranked.length})
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {ranked.slice(0, 20).map((p, i) => (
                <LeaderboardRow key={p.id} participant={p} index={i} />
              ))}
              {ranked.length === 0 && (
                <p className="text-white/20 text-sm font-semibold text-center py-8">
                  No players yet
                </p>
              )}
            </div>

            {!isFinished && !isLobby && (
              <button onClick={handleEnd}
                className="w-full glass rounded-xl py-3 text-red-400 hover:bg-red-500/10
                           text-sm font-bold transition-all">
                🛑 End Quiz Early
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    lobby:       { color: 'bg-blue-500/20 text-blue-300',    label: 'Lobby' },
    countdown:   { color: 'bg-amber-500/20 text-amber-300',  label: 'Countdown' },
    active:      { color: 'bg-emerald-500/20 text-emerald-300', label: '● Live' },
    leaderboard: { color: 'bg-violet-500/20 text-violet-300', label: 'Leaderboard' },
    finished:    { color: 'bg-white/10 text-white/40',        label: 'Finished' },
  };
  const s = map[status] || map.lobby;
  return (
    <span className={`rounded-full px-3 py-0.5 text-xs font-black ${s.color}`}>
      {s.label}
    </span>
  );
}

function Loading() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
    </div>
  );
}
