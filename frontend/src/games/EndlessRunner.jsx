import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./EndlessRunner.css";

export default function EndlessRunner() {
  const [playerPos, setPlayerPos] = useState(1); // 0, 1, or 2
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(5);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft" && playerPos > 0) setPlayerPos(playerPos - 1);
      if (e.key === "ArrowRight" && playerPos < 2) setPlayerPos(playerPos + 1);
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerPos]);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      setObstacles((obs) => {
        const newObs = obs
          .map((o) => ({ ...o, y: o.y + speed }))
          .filter((o) => {
            if (
              o.y > 550 &&
              o.y < 650 &&
              o.lane === playerPos
            ) {
              setGameOver(true);
              setGameActive(false);
              return false;
            }
            return o.y < 700;
          });

        if (newObs.length < obs.length - 1) {
          setScore((s) => s + 10);
        }

        return newObs;
      });

      if (Math.random() < 0.05) {
        setObstacles((obs) => [
          ...obs,
          {
            id: Math.random(),
            y: -50,
            lane: Math.floor(Math.random() * 3),
          },
        ]);
      }

      setSpeed((s) => s + 0.001);
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver, speed]);

  return (
    <div className="runner-container">
      <div className="runner-header">
        <div className="runner-stat">
          <span>SCORE</span>
          <span className="value">{score}</span>
        </div>
        <div className="runner-stat">
          <span>SPEED</span>
          <span className="value">{speed.toFixed(1)}</span>
        </div>
      </div>

      <div className="runner-game">
        <div className="runner-lanes">
          {[0, 1, 2].map((lane) => (
            <div
              key={lane}
              className={`runner-lane ${
                playerPos === lane ? "active" : ""
              }`}
            >
              {playerPos === lane && (
                <motion.div
                  className="runner-player"
                  layoutId="player"
                  transition={{ type: "spring", stiffness: 500 }}
                >
                  ▲
                </motion.div>
              )}

              {obstacles.map((obs) =>
                obs.lane === lane ? (
                  <motion.div
                    key={obs.id}
                    className="runner-obstacle"
                    style={{ top: obs.y }}
                  >
                    ◆
                  </motion.div>
                ) : null
              )}
            </div>
          ))}
        </div>

        <div className="runner-controls">
          <button onClick={() => playerPos > 0 && setPlayerPos(playerPos - 1)}>
            ← LEFT
          </button>
          <button onClick={() => playerPos < 2 && setPlayerPos(playerPos + 1)}>
            RIGHT →
          </button>
        </div>
      </div>

      {gameOver && (
        <motion.div className="runner-gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h2>GAME OVER!</h2>
          <p>SCORE: {score}</p>
          <button
            onClick={() => {
              setScore(0);
              setSpeed(5);
              setObstacles([]);
              setGameOver(false);
              setGameActive(true);
              setPlayerPos(1);
            }}
          >
            RESTART
          </button>
        </motion.div>
      )}
    </div>
  );
}
