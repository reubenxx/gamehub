import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./ColorMatch.css";

const colorPalette = [
  { name: "RED", hex: "#ff2d2d" },
  { name: "BLUE", hex: "#0ea5e9" },
  { name: "GREEN", hex: "#00ff88" },
  { name: "YELLOW", hex: "#ffff00" },
  { name: "PINK", hex: "#ff64c8" },
  { name: "CYAN", hex: "#00ffff" },
];

export default function ColorMatch() {
  const [targetColor, setTargetColor] = useState(colorPalette[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  const handleColorClick = (color) => {
    if (!gameActive) return;

    if (color.hex === targetColor.hex) {
      setScore((s) => s + 10 + streak * 2);
      setStreak((s) => s + 1);
      setFeedback("CORRECT!");
      const randomColor =
        colorPalette[Math.floor(Math.random() * colorPalette.length)];
      setTargetColor(randomColor);
    } else {
      setFeedback("WRONG!");
      setStreak(0);
      setScore((s) => Math.max(0, s - 5));
    }

    setTimeout(() => setFeedback(""), 300);
  };

  return (
    <div className="color-match-container">
      <div className="color-match-header">
        <div className="stat">
          <span className="label">TIME</span>
          <span className={`value ${timeLeft < 10 ? "danger" : ""}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="stat">
          <span className="label">STREAK</span>
          <span className="value">{streak}</span>
        </div>
        <div className="stat">
          <span className="label">SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      <div className="color-match-game">
        <motion.div
          className="target-display"
          style={{ backgroundColor: targetColor.hex }}
          key={targetColor.name}
          animate={{ scale: [0.9, 1.1, 1] }}
          transition={{ duration: 0.5 }}
        >
          <span className="target-text">MATCH THIS</span>
          <span className="target-name">{targetColor.name}</span>
        </motion.div>

        {feedback && (
          <motion.div
            className={`feedback ${feedback === "CORRECT!" ? "correct" : "wrong"}`}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            {feedback}
          </motion.div>
        )}

        <div className="color-buttons">
          {colorPalette.map((color) => (
            <motion.button
              key={color.name}
              className="color-btn"
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorClick(color)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!gameActive}
            />
          ))}
        </div>
      </div>

      {!gameActive && (
        <motion.div
          className="game-over-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="modal-content"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
          >
            <h2>GAME OVER!</h2>
            <div className="final-score">
              <p className="label">FINAL SCORE</p>
              <p className="score">{score}</p>
            </div>
            <button
              className="restart-button"
              onClick={() => {
                setScore(0);
                setTimeLeft(60);
                setStreak(0);
                setGameActive(true);
                setTargetColor(colorPalette[0]);
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
