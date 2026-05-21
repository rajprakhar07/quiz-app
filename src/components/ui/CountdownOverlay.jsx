// src/components/ui/CountdownOverlay.jsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '../../lib/sounds';
import { useStore } from '../../store/useStore';

export default function CountdownOverlay({ onComplete }) {
  const [count, setCount] = useState(3);
  const soundEnabled = useStore(s => s.soundEnabled);

  useEffect(() => {
    const tick = () => {
      setCount(c => {
        if (c <= 1) {
          if (soundEnabled) sounds.countdownFinal();
          setTimeout(onComplete, 600);
          return 'GO!';
        }
        if (soundEnabled) sounds.countdown();
        return c - 1;
      });
    };

    if (soundEnabled) sounds.countdown();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/70 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1,   opacity: 1 }}
          exit={{    scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`text-9xl font-black
            ${count === 'GO!' ? 'gradient-text' : 'text-white neon-text'}`}
        >
          {count}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
