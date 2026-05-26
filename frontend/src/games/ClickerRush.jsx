import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./ClickerRush.css";

export default function ClickerRush() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  const handleClick = () => {
    if (!gameActive) return;
    const comboMultiplier = 1 + combo * 0.1;
    const points = Math.floor(10 * comboMultiplier);
    setScore((s) => s + points);
    setCombo((c) => c + 1);
  };

  const resetGame = () => {
    setScore(0);
    setCombo(0);
    setTimeLeft(30);
    setGameOver(false);
    setGameActive(true);
  };

  return (
    <div className="clicker-rush-container">
      <div className="game-header">
        <div className="time-display">
          <span className="label">TIME</span>
          <span className={`value ${timeLeft < 10 ? "danger" : ""}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="combo-display">
          <span className="label">COMBO</span>
          <span className="value combo">{combo}x</span>
        </div>
        <div className="score-display">
          <span className="label">SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      <div className="game-area">
        <motion.button
          className="click-button"
          onClick={handleClick}
          disabled={!gameActive}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={gameActive ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3, repeat: Infinity }}
        >
          <span className="click-text">CLICK!</span>
          <motion.span
            className="points-text"
            key={combo}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6 }}
          >
            +{Math.floor(10 * (1 + combo * 0.1))}
          </motion.span>
        </motion.button>
      </div>

      {gameOver && (
        <motion.div
          className="game-over-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="game-over-content"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>GAME OVER!</h2>
            <div className="final-stats">
              <div className="stat">
                <span className="label">FINAL SCORE</span>
                <span className="value">{score}</span>
              </div>
              <div className="stat">
                <span className="label">MAX COMBO</span>
                <span className="value">{combo}x</span>
              </div>
            </div>
            <motion.button
              className="restart-btn"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              PLAY AGAIN
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
