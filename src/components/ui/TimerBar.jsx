// src/components/ui/TimerBar.jsx
import { useEffect, useRef, useState } from 'react';

export default function TimerBar({ duration, startedAt, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);
  const expiredRef  = useRef(false);

  useEffect(() => {
    expiredRef.current = false;
    setTimeLeft(duration);

    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000;
      const left    = Math.max(0, duration - elapsed);
      setTimeLeft(Math.ceil(left));

      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        clearInterval(intervalRef.current);
        onExpire?.();
      }
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, [duration, startedAt]);

  const pct     = (timeLeft / duration) * 100;
  const isWarn  = timeLeft <= 5;
  const barColor = isWarn
    ? 'from-red-500 to-orange-400'
    : timeLeft <= duration * 0.5
      ? 'from-yellow-400 to-amber-400'
      : 'from-emerald-400 to-cyan-400';

  return (
    <div className="w-full flex items-center gap-4">
      {/* Countdown number */}
      <div
        className={`text-4xl font-black w-14 text-center flex-shrink-0
                    ${isWarn ? 'text-red-400 animate-pulse' : 'text-white'}`}
      >
        {timeLeft}
      </div>

      {/* Bar */}
      <div className="flex-1 h-5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} rounded-full
                      transition-all duration-200 ease-linear`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
