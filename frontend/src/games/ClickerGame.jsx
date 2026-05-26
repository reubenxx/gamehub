import { useState } from "react";
import { motion } from "framer-motion";
import "./ClickerGame.css";

export default function ClickerGame() {
  const [score, setScore] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [upgrades, setUpgrades] = useState({
    doubleTap: false,
    autoClick: false,
  });

  const handleClick = () => {
    setScore((prev) => prev + clickPower);
  };

  const buyDoubleTap = () => {
    if (score >= 50) {
      setScore((prev) => prev - 50);
      setClickPower((prev) => prev + 1);
      setUpgrades((prev) => ({ ...prev, doubleTap: true }));
    }
  };

  const buyAutoClick = () => {
    if (score >= 200) {
      setScore((prev) => prev - 200);
      setUpgrades((prev) => ({ ...prev, autoClick: true }));
    }
  };

  // Auto-click effect
  if (upgrades.autoClick) {
    const timer = setTimeout(() => {
      setScore((prev) => prev + 1);
    }, 500);
    return () => clearTimeout(timer);
  }

  return (
    <div className="clicker-container">
      <div className="clicker-content">
        <h1 className="game-title">Clicker Game</h1>

        <motion.div
          className="score-display"
          key={score}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
        >
          <div className="score-label">Score</div>
          <div className="score-value">{score}</div>
        </motion.div>

        <motion.button
          className="click-button"
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="click-text">CLICK ME!</span>
          <span className="click-value">+{clickPower}</span>
        </motion.button>

        <div className="upgrades-section">
          <h2 className="upgrades-title">Upgrades</h2>

          <motion.button
            className={`upgrade-btn ${upgrades.doubleTap ? "purchased" : ""}`}
            onClick={buyDoubleTap}
            disabled={score < 50 || upgrades.doubleTap}
            whileHover={{ scale: 1.02 }}
          >
            <div className="upgrade-name">
              {upgrades.doubleTap ? "✓ " : ""}Double Tap
            </div>
            <div className="upgrade-cost">
              {upgrades.doubleTap ? "Owned" : "Cost: 50"}
            </div>
            <div className="upgrade-effect">+1 per click</div>
          </motion.button>

          <motion.button
            className={`upgrade-btn ${upgrades.autoClick ? "purchased" : ""}`}
            onClick={buyAutoClick}
            disabled={score < 200 || upgrades.autoClick}
            whileHover={{ scale: 1.02 }}
          >
            <div className="upgrade-name">
              {upgrades.autoClick ? "✓ " : ""}Auto Clicker
            </div>
            <div className="upgrade-cost">
              {upgrades.autoClick ? "Owned" : "Cost: 200"}
            </div>
            <div className="upgrade-effect">+1 auto per 0.5s</div>
          </motion.button>
        </div>

        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Click Power:</span>
            <span className="stat-value">{clickPower}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Active Upgrades:</span>
            <span className="stat-value">
              {Object.values(upgrades).filter(Boolean).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
