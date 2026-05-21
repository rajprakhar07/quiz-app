// src/lib/sounds.js
// Sound effects using Web Audio API — no external files required

let ctx = null;
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
};

function playTone(freq, type, duration, gain = 0.3, delay = 0) {
  try {
    const c   = getCtx();
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.connect(env);
    env.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + delay);
    env.gain.setValueAtTime(0, c.currentTime + delay);
    env.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
    osc.start(c.currentTime + delay);
    osc.stop(c.currentTime + delay + duration + 0.05);
  } catch {}
}

export const sounds = {
  join() {
    playTone(523, 'sine', 0.15, 0.2);
    playTone(659, 'sine', 0.15, 0.2, 0.12);
    playTone(784, 'sine', 0.2,  0.2, 0.24);
  },
  correct() {
    playTone(523, 'square', 0.1, 0.15);
    playTone(659, 'square', 0.1, 0.15, 0.1);
    playTone(784, 'square', 0.15, 0.15, 0.2);
    playTone(1047,'square', 0.2,  0.15, 0.3);
  },
  wrong() {
    playTone(200, 'sawtooth', 0.3, 0.2);
    playTone(150, 'sawtooth', 0.3, 0.2, 0.15);
  },
  countdown() {
    playTone(440, 'sine', 0.2, 0.3);
  },
  countdownFinal() {
    playTone(880, 'sine', 0.3, 0.4);
  },
  tick() {
    playTone(800, 'square', 0.05, 0.1);
  },
  timeWarning() {
    playTone(600, 'square', 0.1, 0.25);
    playTone(600, 'square', 0.1, 0.25, 0.2);
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => playTone(f, 'sine', 0.25, 0.3, i * 0.1));
  },
  click() {
    playTone(1000, 'sine', 0.05, 0.1);
  },
};
