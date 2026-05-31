import React, { useEffect, useRef, useState } from 'react';
import './RhythmRunner.css';
import { createPhaserGame } from './rhythm/game';
import LEVELS from './rhythm/levels';

export default function RhythmRunner({ levelId }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(() => {
    const idx = LEVELS.findIndex((l) => l.id === levelId);
    return idx >= 0 ? idx : 0;
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    // Create Phaser and store reference
    gameRef.current = createPhaserGame(node, currentLevelIndex);

    const handleResize = () => {
      if (gameRef.current && gameRef.current.scale) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        try { gameRef.current.destroy(true); } catch (e) {}
      }
    };
  }, [currentLevelIndex]);

  // Save system: store unlocked and progress in localStorage
  useEffect(() => {
    const key = 'rhythm_runner_progress';
    if (!localStorage.getItem(key)) {
      const init = { unlocked: [LEVELS[0].id], best: {} };
      localStorage.setItem(key, JSON.stringify(init));
    }
  }, []);

  return (
    <div className="rhythm-root">
      <div ref={containerRef} className="rhythm-canvas" />
      <div className="rhythm-ui">
        <div className="left">
          <button className="rhythm-button" onClick={() => window.history.back()}>← Exit</button>
        </div>
        <div className="right">
          <button className="rhythm-button" onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}>Toggle Fullscreen</button>
        </div>
      </div>
    </div>
  );
}
