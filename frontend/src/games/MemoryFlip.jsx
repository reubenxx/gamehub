import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./MemoryFlip.css";

const colors = ["#ff0080", "#0ea5e9", "#00ff88", "#ffff00"];
const colorNames = ["PINK", "BLUE", "GREEN", "YELLOW"];

export default function MemoryFlip() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setLevel((l) => l + 1);
      setScore((s) => s + 100);
      setTimeout(() => initializeGame(level + 1), 500);
    }
  }, [matched, cards, level]);

  const initializeGame = (lvl = level) => {
    const pairsCount = 3 + lvl;
    const newCards = [];
    for (let i = 0; i < pairsCount; i++) {
      newCards.push(i, i);
    }
    setCards(newCards.sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  };

  const handleCardClick = (idx) => {
    if (flipped.includes(idx) || matched.includes(idx) || flipped.length === 2)
      return;

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setScore((s) => s + 50);
        setFlipped([]);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setScore((s) => Math.max(0, s - 10));
        }, 600);
      }
    }
  };

  return (
    <div className="memory-flip-container">
      <div className="memory-header">
        <div className="header-stat">
          <span className="label">LEVEL</span>
          <span className="value">{level}</span>
        </div>
        <div className="header-stat">
          <span className="label">SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      <div className="memory-grid">
        {cards.map((color, idx) => (
          <motion.button
            key={idx}
            className={`memory-card ${
              flipped.includes(idx) || matched.includes(idx)
                ? "flipped"
                : "hidden"
            }`}
            onClick={() => handleCardClick(idx)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background:
                flipped.includes(idx) || matched.includes(idx)
                  ? colors[color]
                  : "rgba(255,255,255,0.1)",
            }}
          >
            {(flipped.includes(idx) || matched.includes(idx)) && (
              <span className="card-text">{colorNames[color]}</span>
            )}
          </motion.button>
        ))}
      </div>

      <div className="memory-instruction">
        <p>Match pairs in order!</p>
      </div>
    </div>
  );
}
