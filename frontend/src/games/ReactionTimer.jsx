import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./ReactionTimer.css";

export default function ReactionTimer() {
  const [gameState, setGameState] = useState("waiting"); // waiting, ready, go
  const [reaction, setReaction] = useState(null);
  const [bestTime, setBestTime] = useState(
    parseInt(localStorage.getItem("reactionBest") || "999")
  );
  const [round, setRound] = useState(0);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (gameState === "waiting") {
      const delay = Math.random() * 3000 + 1000;
      const timer = setTimeout(() => {
        setGameState("go");
        startTimeRef.current = Date.now();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const handleClick = () => {
    if (gameState === "ready") {
      setGameState("false");
      return;
    }

    if (gameState === "go" && startTimeRef.current) {
      const reactionTime = Date.now() - startTimeRef.current;
      setReaction(reactionTime);
      setRound((r) => r + 1);

      if (reactionTime < bestTime) {
        setBestTime(reactionTime);
        localStorage.setItem("reactionBest", reactionTime.toString());
      }

      setTimeout(() => {
        setReaction(null);
        setGameState("waiting");
      }, 1000);
    }
  };

  return (
    <div
      className="reaction-timer-container"
      onClick={handleClick}
      style={{
        background:
          gameState === "go"
            ? "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)"
            : gameState === "false"
              ? "linear-gradient(135deg, #ff2d2d 0%, #cc0000 100%)"
              : "linear-gradient(135deg, #0a0e27 0%, #1a1a3a 100%)",
      }}
    >
      <div className="reaction-header">
        <div className="stat-box">
          <span className="label">BEST TIME</span>
          <span className="value">{bestTime}ms</span>
        </div>
        <div className="stat-box">
          <span className="label">ROUNDS</span>
          <span className="value">{round}</span>
        </div>
      </div>

      <div className="reaction-content">
        {gameState === "waiting" && (
          <div className="message">
            <p>Wait for GREEN...</p>
          </div>
        )}

        {gameState === "go" && (
          <motion.div
            className="go-message"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span>GO!</span>
          </motion.div>
        )}

        {reaction && (
          <motion.div
            className="reaction-result"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <span className="time">{reaction}ms</span>
            {reaction < 200 && <span className="amazing">AMAZING!</span>}
            {reaction >= 200 && reaction < 300 && (
              <span className="good">GOOD!</span>
            )}
            {reaction >= 300 && <span className="slow">TOO SLOW</span>}
          </motion.div>
        )}

        {gameState === "false" && (
          <div className="too-early">
            <p>TOO EARLY!</p>
            <p style={{ fontSize: "1rem", opacity: 0.8, marginTop: "10px" }}>
              Click when it turns green
            </p>
          </div>
        )}
      </div>

      <div className="reaction-instruction">
        <p>Click anywhere when the screen turns GREEN</p>
      </div>
    </div>
  );
}
