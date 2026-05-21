// src/components/admin/QuestionEditor.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_QUESTION = () => ({
  id: `q_${Date.now()}`,
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  timeLimit: 20,
  points: 1000,
});

const OPTION_COLORS = [
  'border-rose-500 focus:ring-rose-500',
  'border-blue-500 focus:ring-blue-500',
  'border-amber-400 focus:ring-amber-400',
  'border-emerald-500 focus:ring-emerald-500',
];
const OPTION_LABELS = ['A', 'B', 'C', 'D'];
const OPTION_ICONS  = ['▲', '◆', '●', '■'];

export default function QuestionEditor({ questions = [], onChange }) {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const add = () => {
    const updated = [...questions, EMPTY_QUESTION()];
    onChange(updated);
    setExpandedIdx(updated.length - 1);
  };

  const remove = (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    onChange(updated);
    if (expandedIdx >= updated.length) setExpandedIdx(updated.length - 1);
  };

  const update = (idx, field, value) => {
    const updated = questions.map((q, i) => i === idx ? { ...q, [field]: value } : q);
    onChange(updated);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const updated = questions.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[optIdx] = value;
      return { ...q, options };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-2xl overflow-hidden"
          >
            {/* Question header */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/5 transition"
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
            >
              <span className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center
                               text-sm font-black flex-shrink-0">
                {idx + 1}
              </span>
              <p className="flex-1 font-bold text-white truncate text-sm">
                {q.text || <span className="text-white/30 italic">Untitled question</span>}
              </p>
              <span className="text-white/40 text-xs font-semibold">{q.timeLimit}s</span>
              <button
                onClick={e => { e.stopPropagation(); remove(idx); }}
                className="text-red-400 hover:text-red-300 transition text-lg leading-none px-1"
              >✕</button>
              <span className={`transition-transform duration-200 ${expandedIdx === idx ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </div>

            {/* Expanded editor */}
            {expandedIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 pb-5 space-y-4 border-t border-white/10"
              >
                {/* Question text */}
                <div className="pt-4">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">
                    Question Text
                  </label>
                  <textarea
                    value={q.text}
                    onChange={e => update(idx, 'text', e.target.value)}
                    placeholder="Enter your question..."
                    rows={2}
                    className="input-field resize-none text-base"
                  />
                </div>

                {/* Options */}
                <div>
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
                    Answer Options (click radio to mark correct)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          onClick={() => update(idx, 'correctIndex', oi)}
                          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center
                                      flex-shrink-0 transition-all duration-150 font-bold text-xs
                                      ${q.correctIndex === oi
                                        ? 'bg-emerald-500 border-emerald-400 text-white scale-110'
                                        : 'border-white/30 text-white/40 hover:border-white/60'}`}
                        >
                          {OPTION_ICONS[oi]}
                        </button>
                        <input
                          value={opt}
                          onChange={e => updateOption(idx, oi, e.target.value)}
                          placeholder={`Option ${OPTION_LABELS[oi]}`}
                          className={`flex-1 glass rounded-xl px-3 py-2 text-white text-sm
                                      font-semibold outline-none border
                                      focus:ring-2 transition-all ${OPTION_COLORS[oi]}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time limit */}
                <div className="flex items-center gap-6">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1 block">
                      Time Limit
                    </label>
                    <select
                      value={q.timeLimit}
                      onChange={e => update(idx, 'timeLimit', Number(e.target.value))}
                      className="glass rounded-xl px-3 py-2 text-white font-bold text-sm
                                 outline-none cursor-pointer bg-transparent"
                    >
                      {[5, 10, 15, 20, 30, 45, 60].map(t => (
                        <option key={t} value={t} className="bg-[#1a1035]">{t} seconds</option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add question button */}
      <button
        onClick={add}
        className="w-full glass rounded-2xl py-4 text-white/60 hover:text-white
                   hover:bg-white/10 transition-all duration-200 font-bold text-base
                   border-2 border-dashed border-white/20 hover:border-violet-400"
      >
        + Add Question
      </button>
    </div>
  );
}
