// src/components/quiz/AnswerFeedback.jsx
import { motion } from 'framer-motion';
import { formatScore } from '../../lib/utils';

export default function AnswerFeedback({ isCorrect, points, streak, timedOut = false }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0, y: 40 }}
      animate={{ scale: 1,   opacity: 1, y: 0 }}
      className={`fixed inset-0 z-40 flex flex-col items-center justify-center backdrop-blur-sm
                  ${isCorrect ? 'bg-emerald-600/90' : timedOut ? 'bg-orange-600/90' : 'bg-red-600/90'}`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.3, 1] }}
        transition={{ duration: 0.5 }}
        className="text-8xl mb-6"
      >
        {isCorrect ? '🎉' : timedOut ? '⏰' : '😕'}
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-black text-white mb-4"
      >
        {isCorrect ? 'Correct!' : timedOut ? 'Time Out!' : 'Wrong!'}
      </motion.h2>

      {isCorrect && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-3xl font-bold text-white/90">
            +{formatScore(points)} pts
          </span>
          {streak > 1 && (
            <span className="glass rounded-full px-4 py-1 text-lg font-bold text-yellow-300">
              🔥 {streak}x streak!
            </span>
          )}
        </motion.div>
      )}

      {timedOut && (
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 font-bold text-xl"
        >
          You ran out of time!
        </motion.p>
      )}
    </motion.div>
  );
}