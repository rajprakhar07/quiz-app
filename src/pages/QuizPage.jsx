// src/pages/QuizPage.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToRoom, submitAnswer } from '../lib/db';
import { useStore } from '../store/useStore';
import { calculatePoints } from '../lib/utils';
import { sounds } from '../lib/sounds';
import TimerBar from '../components/ui/TimerBar';
import AnswerOption from '../components/quiz/AnswerOption';
import AnswerFeedback from '../components/quiz/AnswerFeedback';
import CountdownOverlay from '../components/ui/CountdownOverlay';

export default function QuizPage() {
  const { code }    = useParams();
  const navigate    = useNavigate();
  const { participant, soundEnabled } = useStore();

  const [room, setRoom]           = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback]   = useState(null);   // { isCorrect, points, streak }
  const [answered, setAnswered]   = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [tabWarnings, setTabWarnings] = useState(0);

  const answerLocked    = useRef(false);
  const answeredRef = useRef(false);
  const currentQRef     = useRef(-1);
  const feedbackTimeout = useRef(null);

  // ── Anti-cheat: tab-switch detection ────────────────────────────
  useEffect(() => {
    const onBlur = () => {
      if (answered || answerLocked.current) return;
      setTabWarnings(w => {
        const next = w + 1;
        if (next >= 3) {
          // Treat as wrong answer after 3 violations
        }
        return next;
      });
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [answered]);

  // ── Room subscription ─────────────────────────────────────────────
  useEffect(() => {
    if (!participant) { navigate('/join'); return; }

    const unsub = subscribeToRoom(code, (roomData) => {
      setRoom(roomData);

      const qIdx = roomData.currentQuestionIndex;

      // New question started → reset state
      if (qIdx !== currentQRef.current && qIdx >= 0) {
        currentQRef.current = qIdx;
        setSelectedIdx(null);
        setFeedback(null);
        setAnswered(false);
        answerLocked.current = false;
        answeredRef.current = false;
        clearTimeout(feedbackTimeout.current);
      }

      if (roomData.status === 'countdown')   setShowCountdown(true);
      if (roomData.status === 'leaderboard') navigate(`/leaderboard/${code}`);
      if (roomData.status === 'finished')    navigate(`/results/${code}`);
    });

    return () => { unsub(); clearTimeout(feedbackTimeout.current); };
  }, [code, participant]);

  const handleAnswer = useCallback(async (optionIndex) => {
    if (answered || answerLocked.current || !room) return;
    answerLocked.current = true;
    answeredRef.current = true;
    setSelectedIdx(optionIndex);
    setAnswered(true);

    const question   = room.questions[room.currentQuestionIndex];
    const elapsed    = (Date.now() - room.questionStartedAt) / 1000;
    const isCorrect  = optionIndex === question.correctIndex;
    const points     = isCorrect ? calculatePoints(question.timeLimit, elapsed) : 0;

    // Sound feedback
    if (soundEnabled) isCorrect ? sounds.correct() : sounds.wrong();

    // Current streak from participant data
    const currentStreak = room.participants?.[participant.id]?.streak ?? 0;
    const newStreak     = isCorrect ? currentStreak + 1 : 0;

    // Submit to Firestore (one write per question)
    try {
      await submitAnswer(code, room.currentQuestionIndex, participant.id, {
        optionIndex,
        isCorrect,
        points,
        elapsed,
        streak: newStreak,
      });
    } catch (err) {
      console.error('Submit failed:', err);
    }

    setFeedback({ isCorrect, points, streak: newStreak });

    // Hide feedback after 2s
    feedbackTimeout.current = setTimeout(() => setFeedback(null), 2500);
  }, [answered, room, code, participant, soundEnabled]);

const handleTimerExpire = useCallback(() => {
    if (!answeredRef.current) {
      answerLocked.current = true;
      answeredRef.current = true;
      setAnswered(true);
      if (soundEnabled) sounds.wrong();
      setFeedback({ isCorrect: false, points: 0, streak: 0, timedOut: true });
      feedbackTimeout.current = setTimeout(() => setFeedback(null), 2500);
    }
  }, [soundEnabled]);

  if (!room || room.currentQuestionIndex < 0) return <WaitingScreen />;

  const question = room.questions?.[room.currentQuestionIndex];
  if (!question) return <WaitingScreen />;

  const qNum   = room.currentQuestionIndex + 1;
  const total  = room.totalQuestions;

  return (
    <div className="min-h-screen bg-[#0f0a1e] flex flex-col relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-violet-900/30 via-[#0f0a1e] to-[#0f0a1e]" />

      {showCountdown && (
        <CountdownOverlay onComplete={() => setShowCountdown(false)} />
      )}

      {/* Answer feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <AnswerFeedback
            isCorrect={feedback.isCorrect}
            points={feedback.points}
            streak={feedback.streak}
            timedOut={feedback.timedOut}
          />
        )}
      </AnimatePresence>

      {/* Tab-switch warning */}
      <AnimatePresence>
        {tabWarnings > 0 && !answered && (
          <motion.div
            initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
            className="fixed top-0 left-0 right-0 z-30 bg-orange-500 text-white
                       font-black text-center py-3 text-sm"
          >
            ⚠️ Warning {tabWarnings}/3: Don't switch tabs during the quiz!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 px-4 pt-6 pb-2 max-w-3xl w-full mx-auto">
        {/* Progress */}
        <div className="flex items-center justify-between mb-3">
          <span className="glass rounded-full px-4 py-1 text-sm font-black text-white/80">
            {qNum} / {total}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: total }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < qNum ? 'bg-violet-400' : 'bg-white/10'
                }`}
                style={{ width: `${Math.max(16, 200 / total)}px` }}
              />
            ))}
          </div>
          <span className="glass rounded-full px-4 py-1 text-sm font-black text-violet-300">
            Q{qNum}
          </span>
        </div>

        {/* Timer */}
        <TimerBar
          duration={question.timeLimit}
          startedAt={room.questionStartedAt}
          onExpire={handleTimerExpire}
        />
      </div>

      {/* Question */}
      <motion.div
        key={room.currentQuestionIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex-1 flex flex-col px-4 max-w-3xl w-full mx-auto"
      >
        <div className="glass rounded-3xl p-6 md:p-8 my-4 flex-shrink-0">
          <p className="text-2xl md:text-3xl font-black text-white text-center leading-snug">
            {question.text}
          </p>
        </div>

        {/* Answer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-6">
          {question.options.map((opt, i) => (
            <AnswerOption
              key={i}
              index={i}
              text={opt}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              revealed={answered}
              isCorrect={i === question.correctIndex}
            />
          ))}
        </div>
      </motion.div>

      {/* Player name footer */}
      <div className="relative z-10 text-center pb-4 text-white/30 text-xs font-semibold">
        Playing as <span className="text-white/60">{participant?.name}</span>
      </div>
    </div>
  );
}

function WaitingScreen() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="text-5xl"
      >⚡</motion.div>
      <p className="text-white/50 font-bold">Waiting for the host to start… 🚀</p>
    </div>
  );
}
