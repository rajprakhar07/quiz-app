// src/components/quiz/AnswerOption.jsx
import { motion } from 'framer-motion';
import { OPTION_STYLES } from '../../lib/sampleData';

export default function AnswerOption({ index, text, onClick, disabled, revealed, isCorrect }) {
  const style = OPTION_STYLES[index];

  let extraClass = '';
  if (revealed) {
    extraClass = isCorrect
      ? 'ring-4 ring-white scale-105'
      : 'opacity-40 scale-95';
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`
        relative w-full bg-gradient-to-br ${style.bg}
        rounded-2xl p-4 md:p-6 text-white font-black text-lg md:text-xl
        shadow-lg transition-all duration-300 cursor-pointer
        flex items-center gap-4 text-left
        ${disabled ? 'cursor-not-allowed' : 'hover:shadow-xl hover:brightness-110'}
        ${extraClass}
      `}
    >
      {/* Shape icon */}
      <span className="text-2xl md:text-3xl flex-shrink-0 w-8 text-center opacity-90">
        {style.icon}
      </span>

      {/* Answer text */}
      <span className="flex-1 leading-snug">{text}</span>

      {/* Correct indicator */}
      {revealed && isCorrect && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-2xl flex-shrink-0"
        >
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}
