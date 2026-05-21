// src/pages/HomePage.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ui/ParticleBackground';
import { useStore } from '../store/useStore';

const FEATURES = [
  { icon: '⚡', title: 'Real-time',    desc: 'Live updates as players answer' },
  { icon: '🏆', title: 'Leaderboard',  desc: 'Live rankings after every question' },
  { icon: '🎨', title: 'Engaging UI',  desc: 'Kahoot-style colorful experience' },
  { icon: '📱', title: 'Mobile Ready', desc: 'Play on any device, anywhere' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const clearSession = useStore(s => s.clearSession);

  const handleJoin = () => { clearSession(); navigate('/join'); };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#0f0a1e]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full
                        bg-violet-700/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full
                        bg-pink-700/20 blur-[100px] animate-pulse"
             style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[400px] h-[400px] rounded-full bg-cyan-700/10 blur-[80px]" />
      </div>

      <ParticleBackground count={22} />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <span className="text-3xl">⚡</span>
          <span className="text-2xl font-black gradient-text">QuizBlitz</span>
        </motion.div>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/admin')}
          className="btn-secondary text-sm py-2 px-5"
        >
          Admin Login
        </motion.button>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center
                       min-h-[80vh] text-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-8
                       text-sm font-bold text-violet-300"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Quiz Platform for College Events
          </motion.div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black leading-none mb-6">
            <span className="text-white">Make Learning</span>
            <br />
            <span className="gradient-text">Epic.</span>
          </h1>

          <p className="text-xl text-white/60 font-semibold max-w-xl mx-auto mb-12 leading-relaxed">
            Host live quizzes, challenge 100+ players, and crown the ultimate champion — all in real time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoin}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600
                         animate-gradient text-white font-black text-xl rounded-2xl px-10 py-5
                         shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-shadow"
            >
              🎮 Join a Quiz
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin')}
              className="w-full sm:w-auto btn-secondary text-xl py-5 px-10"
            >
              ✏️ Create Quiz
            </motion.button>
          </div>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-24 w-full max-w-4xl"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass rounded-2xl p-5 text-center"
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-black text-white text-sm">{f.title}</h3>
              <p className="text-white/50 text-xs mt-1 font-semibold">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/20 text-sm font-semibold">
        QuizBlitz — Built for college events &amp; competitions
      </footer>
    </div>
  );
}
