// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { getAdminQuizzes, saveQuiz, updateQuiz, deleteQuiz, createRoom, startGame, updateRoom } from '../lib/db';
import { useStore } from '../store/useStore';
import { SAMPLE_QUIZ } from '../lib/sampleData';
import QuestionEditor from '../components/admin/QuestionEditor';
import toast from 'react-hot-toast';

const EMPTY_QUIZ = () => ({
  title: '',
  description: '',
  questions: [],
  shuffleQuestions: true,
  shuffleOptions: true,
});

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminId, setAdminId } = useStore();

  const [quizzes, setQuizzes] = useState([]);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [launching, setLaunching] = useState(null);
  const [view, setView] = useState('list');

  const loadQuizzes = async (uid) => {
    setLoading(true);
    try {
      
      const qs = await getAdminQuizzes(uid);
     
      setQuizzes(qs);
    } catch (e) {
      console.error('Quiz load error:', e);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (user) {
        setAdminId(user.uid);
        loadQuizzes(user.uid);
      } else {
        navigate('/admin');
      }
    });
    return unsub;
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-white/40 font-semibold text-sm">Restoring session…</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editingQuiz.title.trim()) return toast.error('Give your quiz a title');
    if (editingQuiz.questions.length === 0) return toast.error('Add at least one question');

    const invalid = editingQuiz.questions.find(q =>
      !q.text.trim() || q.options.some(o => !o.trim())
    );
    if (invalid) return toast.error('Fill in all question text and options');

    try {
      if (editingQuiz.id) {
        await updateQuiz(editingQuiz.id, editingQuiz);
        setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? editingQuiz : q));
        toast.success('Quiz updated!');
      } else {
        const saved = await saveQuiz(adminId, editingQuiz);
        setQuizzes(prev => [saved, ...prev]);
        toast.success('Quiz saved! ');
      }
      setView('list');
      setEditingQuiz(null);
    } catch (e) {
      toast.error('Failed to save quiz');
    }
  };

  const handleDelete = async (quiz) => {
    if (!confirm(`Delete "${quiz.title}"? This cannot be undone.`)) return;
    try {
      await deleteQuiz(quiz.id);
      setQuizzes(prev => prev.filter(q => q.id !== quiz.id));
      toast.success('Quiz deleted');
    } catch {
      toast.error('Failed to delete quiz');
    }
  };

  const handleLaunch = async (quiz) => {
    setLaunching(quiz.id);
    try {
      const room = await createRoom(adminId, auth.currentUser?.email || 'Admin');
      await startGame(room.code, quiz.questions, quiz.shuffleQuestions, quiz.shuffleOptions);
      await updateRoom(room.code, { quizTitle: quiz.title });
      toast.success(`Room ${room.code} created! 🚀`);
      navigate(`/admin/room/${room.code}`);
    } catch (e) {
      toast.error('Failed to launch quiz: ' + e.message);
    } finally {
      setLaunching(null);
    }
  };

  const handleNew = () => {
    setEditingQuiz(EMPTY_QUIZ());
    setView('edit');
  };

  const handleLoadSample = async () => {
    try {
      const saved = await saveQuiz(adminId, { ...EMPTY_QUIZ(), ...SAMPLE_QUIZ });
      setQuizzes(prev => [saved, ...prev]);
      toast.success('Sample quiz saved! 🎉');
    } catch (e) {
      toast.error('Failed to save sample quiz');
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative">
      <div className="fixed inset-0 bg-gradient-to-b from-violet-900/20 to-[#0f0a1e]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Admin Dashboard</h1>
            <p className="text-white/40 font-semibold text-sm mt-0.5">
              {auth.currentUser?.email}
            </p>
          </div>
          <button onClick={handleLogout} className="btn-secondary text-sm py-2 px-4">
            Sign Out
          </button>
        </div>

        {view === 'list' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex gap-3 mb-6 flex-wrap">
              <button onClick={handleNew} className="btn-primary py-3 px-6 text-base">
                + New Quiz
              </button>
              <button onClick={handleLoadSample} className="btn-secondary py-3 px-6 text-base">
                📋 Load Sample
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h2 className="text-xl font-black text-white mb-2">No quizzes yet</h2>
                <p className="text-white/40 font-semibold mb-6">Create your first quiz or load the sample</p>
                <button onClick={handleNew} className="btn-primary py-3 px-8">
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {quizzes.map((quiz, i) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-2xl p-5 flex items-center gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-lg truncate">{quiz.title}</h3>
                      <p className="text-white/40 text-sm font-semibold">
                        {quiz.questions?.length || 0} questions
                        {quiz.description && ` · ${quiz.description}`}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => { setEditingQuiz(quiz); setView('edit'); }}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quiz)}
                        className="glass rounded-xl py-2 px-3 text-red-400 hover:text-red-300
                                   hover:bg-red-500/10 transition-all text-sm font-bold"
                      >
                        🗑
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleLaunch(quiz)}
                        disabled={!!launching}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                                   font-black rounded-xl py-2 px-4 text-sm
                                   hover:brightness-110 transition disabled:opacity-50"
                      >
                        {launching === quiz.id ? '⏳' : '🚀 Launch'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {view === 'edit' && editingQuiz && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => { setView('list'); setEditingQuiz(null); }}
              className="text-white/40 hover:text-white font-semibold text-sm mb-6 flex items-center gap-1"
            >
              ← Back to quizzes
            </button>

            <div className="glass rounded-3xl p-6 mb-4">
              <input
                value={editingQuiz.title}
                onChange={e => setEditingQuiz(q => ({ ...q, title: e.target.value }))}
                placeholder="Quiz title…"
                className="input-field text-2xl font-black mb-3"
              />
              <input
                value={editingQuiz.description}
                onChange={e => setEditingQuiz(q => ({ ...q, description: e.target.value }))}
                placeholder="Short description (optional)"
                className="input-field text-base"
              />

              <div className="flex gap-6 mt-4">
                {[
                  { key: 'shuffleQuestions', label: 'Shuffle questions' },
                  { key: 'shuffleOptions',   label: 'Shuffle options' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setEditingQuiz(q => ({ ...q, [key]: !q[key] }))}
                      className={`w-10 h-6 rounded-full transition-colors duration-200 relative
                                  ${editingQuiz[key] ? 'bg-violet-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
                                       transition-transform duration-200
                                       ${editingQuiz[key] ? 'translate-x-4' : ''}`} />
                    </div>
                    <span className="text-white/70 font-semibold text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <QuestionEditor
              questions={editingQuiz.questions}
              onChange={qs => setEditingQuiz(q => ({ ...q, questions: qs }))}
            />

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              className="w-full btn-primary py-4 text-lg mt-4"
            >
              💾 Save Quiz ({editingQuiz.questions.length} questions)
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}