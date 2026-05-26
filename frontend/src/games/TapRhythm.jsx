import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./TapRhythm.css";

const beatSequence = [
  { time: 1000, note: "A", color: "#ff0080" },
  { time: 2000, note: "B", color: "#0ea5e9" },
  { time: 3000, note: "A", color: "#ff0080" },
  { time: 4000, note: "C", color: "#00ff88" },
  { time: 5000, note: "B", color: "#0ea5e9" },
  { time: 6000, note: "A", color: "#ff0080" },
  { time: 7000, note: "C", color: "#00ff88" },
  { time: 8000, note: "B", color: "#0ea5e9" },
];

export default function TapRhythm() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [nextBeat, setNextBeat] = useState(beatSequence[0]);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const beatTimer = setInterval(() => {
      setCurrentBeat((b) => {
        const next = b + 1;
        if (next >= beatSequence.length) {
          setGameOver(true);
          setGameActive(false);
          return b;
        }
        setNextBeat(beatSequence[next]);
        return next;
      });
    }, 1000);

    return () => clearInterval(beatTimer);
  }, [gameActive, gameOver]);

  const handleTap = (note, color) => {
    if (!gameActive) return;

    if (note === nextBeat.note) {
      setScore((s) => s + 100 + combo * 10);
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
      setScore((s) => Math.max(0, s - 20));
    }
  };

  return (
    <div className="tap-rhythm-container">
      <div className="rhythm-header">
        <div className="rhythm-stat">
          <span>COMBO</span>
          <span className="value">{combo}x</span>
        </div>
        <div className="rhythm-stat">
          <span>SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      <div className="rhythm-display">
        <div className="beat-indicator">
          <motion.div
            className="beat-pulse"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ♪
          </motion.div>
        </div>
        <p className="next-beat-text">Next: {nextBeat.note}</p>
      </div>

      <div className="rhythm-buttons">
        {[
          { note: "A", color: "#ff0080" },
          { note: "B", color: "#0ea5e9" },
          { note: "C", color: "#00ff88" },
        ].map((btn) => (
          <motion.button
            key={btn.note}
            className="rhythm-btn"
            style={{ backgroundColor: btn.color }}
            onClick={() => handleTap(btn.note, btn.color)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            disabled={!gameActive}
          >
            {btn.note}
          </motion.button>
        ))}
      </div>

      {gameOver && (
        <motion.div
          className="rhythm-gameover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="rhythm-modal"
          >
            <h2>SONG COMPLETE!</h2>
            <p className="final-score">SCORE: {score}</p>
            <button
              onClick={() => {
                setScore(0);
                setCombo(0);
                setCurrentBeat(0);
                setGameActive(true);
                setGameOver(false);
                setNextBeat(beatSequence[0]);
              }}
            >
              PLAY AGAIN
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
