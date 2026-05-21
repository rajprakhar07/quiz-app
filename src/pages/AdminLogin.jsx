// src/pages/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import ParticleBackground from '../components/ui/ParticleBackground';

export default function AdminLogin() {
  const navigate     = useNavigate();
  const { setAdminId } = useStore();
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode]       = useState('login'); // 'login' | 'register'

  const handle = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      let cred;
      if (mode === 'login') {
        cred = await signInWithEmailAndPassword(auth, email, password);
      } else {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      }
      setAdminId(cred.user.uid);
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉');
      navigate('/admin/dashboard');
    } catch (err) {
      const msgs = {
        'auth/user-not-found':   'No account found with this email',
        'auth/wrong-password':   'Incorrect password',
        'auth/email-already-in-use': 'Email already in use',
        'auth/weak-password':    'Password must be at least 6 characters',
        'auth/invalid-email':    'Invalid email address',
      };
      toast.error(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-[#0f0a1e]">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-violet-700/20 blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 rounded-full bg-pink-700/20 blur-[80px]" />
      </div>
      <ParticleBackground count={10} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎛️</div>
          <h1 className="text-4xl font-black text-white">Admin Panel</h1>
          <p className="text-white/50 font-semibold mt-1">Create and manage your quizzes</p>
        </div>

        <div className="glass rounded-3xl p-8">
          {/* Mode toggle */}
          <div className="flex glass-dark rounded-2xl p-1 mb-6">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-xl py-2 font-black text-sm transition-all duration-200
                            ${mode === m ? 'bg-violet-600 text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@college.edu"
                className="input-field"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary py-4 disabled:opacity-50"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                : mode === 'login' ? '🔐 Sign In' : '✨ Create Account'
              }
            </motion.button>
          </form>
        </div>

        <button onClick={() => navigate('/')}
          className="w-full text-center text-white/40 hover:text-white/70 font-semibold transition-colors mt-5 text-sm">
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
