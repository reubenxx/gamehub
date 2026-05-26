import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./GravitySwitch.css";

export default function GravitySwitch() {
  const [playerY, setPlayerY] = useState(300);
  const [playerX, setPlayerX] = useState(200);
  const [gravityDown, setGravityDown] = useState(true);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const velocityRef = useRef(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        setGravityDown((g) => !g);
      }
      if (e.key === "ArrowLeft" && playerX > 0) setPlayerX((x) => x - 20);
      if (e.key === "ArrowRight" && playerX < 350) setPlayerX((x) => x + 20);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerX]);

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      // Physics
      velocityRef.current += gravityDown ? 0.5 : -0.5;
      setPlayerY((y) => {
        const newY = y + velocityRef.current;
        if (newY < 0 || newY > 550) {
          setGameOver(true);
          setGameActive(false);
          return y;
        }
        return newY;
      });

      // Spawn obstacles
      if (Math.random() < 0.03) {
        setObstacles((obs) => [
          ...obs,
          {
            id: Math.random(),
            x: Math.random() * 350,
            y: gravityDown ? -30 : 600,
          },
        ]);
      }

      setObstacles((obs) => {
        const newObs = obs
          .map((o) => ({
            ...o,
            y: o.y + (gravityDown ? 4 : -4),
          }))
          .filter((o) => {
            if (
              o.x < playerX + 30 &&
              o.x + 30 > playerX &&
              o.y < playerY + 30 &&
              o.y + 30 > playerY
            ) {
              setGameOver(true);
              setGameActive(false);
              return false;
            }
            if (o.y > 600 || o.y < -50) {
              setScore((s) => s + 5);
              return false;
            }
            return true;
          });
        return newObs;
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver, gravityDown]);

  return (
    <div className="gravity-switch-container">
      <div className="gravity-header">
        <div className="gravity-stat">
          <span>GRAVITY</span>
          <span className={`value ${gravityDown ? "down" : "up"}`}>
            {gravityDown ? "↓" : "↑"}
          </span>
        </div>
        <div className="gravity-stat">
          <span>SCORE</span>
          <span className="value">{score}</span>
        </div>
      </div>

      <div className="gravity-game-area">
        <motion.div
          className="gravity-player"
          style={{ left: playerX, top: playerY }}
          animate={{ rotate: gravityDown ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          ◆
        </motion.div>

        {obstacles.map((obs) => (
          <motion.div
            key={obs.id}
            className="gravity-obstacle"
            style={{
              left: obs.x,
              top: obs.y,
              backgroundColor: gravityDown ? "#ff0080" : "#0ea5e9",
            }}
          />
        ))}

        <div className="gravity-ui">
          <p className="gravity-instruction">
            SPACE to toggle gravity | ← → to move
          </p>
        </div>
      </div>

      {gameOver && (
        <motion.div
          className="gravity-gameover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="gravity-modal"
          >
            <h2>CRASHED!</h2>
            <p className="final-score">SCORE: {score}</p>
            <button
              onClick={() => {
                setPlayerY(300);
                setPlayerX(200);
                setScore(0);
                setObstacles([]);
                setGameActive(true);
                setGameOver(false);
                velocityRef.current = 0;
              }}
            >
              RETRY
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
