import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./AimTrainer.css";

export default function AimTrainer() {
  const [targets, setTargets] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setGameOver(true);
          setGameActive(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  useEffect(() => {
    if (!gameActive) return;

    const spawnTarget = () => {
      if (targets.length < 3) {
        const newTarget = {
          id: Math.random(),
          x: Math.random() * (window.innerWidth - 60),
          y: Math.random() * (window.innerHeight - 60),
        };
        setTargets((t) => [...t, newTarget]);
      }
    };

    const interval = setInterval(spawnTarget, 800);
    return () => clearInterval(interval);
  }, [gameActive, targets.length]);

  const handleTargetClick = (id) => {
    setTargets((t) => t.filter((target) => target.id !== id));
    setScore((s) => s + 100);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameActive(true);
    setGameOver(false);
    setTargets([]);
  };

  return (
    <div className="aim-trainer-container">
      <div className="aim-header">
        <div className="aim-stat">
          <span>TIME</span>
          <span className={`value ${timeLeft < 10 ? "danger" : ""}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="aim-stat">
          <span>SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      {targets.map((target) => (
        <motion.button
          key={target.id}
          className="aim-target"
          style={{ left: target.x, top: target.y }}
          onClick={() => handleTargetClick(target.id)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
        />
      ))}

      {gameOver && (
        <motion.div
          className="aim-gameover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="aim-modal"
          >
            <h2>TIME'S UP!</h2>
            <p className="final-score">SCORE: {score}</p>
            <button onClick={resetGame}>PLAY AGAIN</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
