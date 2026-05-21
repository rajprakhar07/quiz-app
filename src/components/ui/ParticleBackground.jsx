// src/components/ui/ParticleBackground.jsx
import { useEffect, useRef } from 'react';

const SHAPES = ['◆', '●', '▲', '■', '★', '✦'];
const COLORS = ['#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function ParticleBackground({ count = 18 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const particles = Array.from({ length: count }, (_, i) => {
      const span = document.createElement('span');
      const color = COLORS[i % COLORS.length];
      const shape = SHAPES[i % SHAPES.length];
      const size  = 14 + Math.random() * 20;
      const left  = Math.random() * 100;
      const delay = Math.random() * 15;
      const dur   = 12 + Math.random() * 10;

      span.textContent = shape;
      span.style.cssText = `
        position: absolute;
        left: ${left}%;
        bottom: -50px;
        color: ${color};
        font-size: ${size}px;
        opacity: 0;
        pointer-events: none;
        animation: float-particle ${dur}s ${delay}s linear infinite;
        filter: blur(0.5px);
      `;
      el.appendChild(span);
      return span;
    });

    return () => particles.forEach(p => p.remove());
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden
    />
  );
}
