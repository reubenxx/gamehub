import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./DodgeNeon.css";

export default function DodgeNeon() {
  const canvasRef = useRef(null);
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("dodgeNeonBest") || "0")
  );

  const gameStateRef = useRef({
    player: { x: 175, y: 550, width: 50, height: 50, speed: 7 },
    obstacles: [],
    score: 0,
    gameActive: true,
    keys: {},
    spawnRate: 0.02,
    obstacleSpeed: 4,
  });

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const state = gameStateRef.current;

    const handleKeyDown = (e) => {
      state.keys[e.key] = true;
    };

    const handleKeyUp = (e) => {
      state.keys[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const gameLoop = setInterval(() => {
      if (!state.gameActive) return;

      // Clear canvas with neon effect
      ctx.fillStyle = "rgba(10, 14, 39, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(10, 14, 39, 0)");
      gradient.addColorStop(0.5, "rgba(14, 165, 233, 0.05)");
      gradient.addColorStop(1, "rgba(255, 0, 128, 0.1)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update player position
      if (state.keys["ArrowLeft"] || state.keys["a"]) {
        state.player.x = Math.max(0, state.player.x - state.player.speed);
      }
      if (state.keys["ArrowRight"] || state.keys["d"]) {
        state.player.x = Math.min(
          canvas.width - state.player.width,
          state.player.x + state.player.speed
        );
      }

      // Draw player with neon glow
      ctx.fillStyle = "#0ea5e9";
      ctx.shadowColor = "#0ea5e9";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillRect(
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
      );
      ctx.shadowColor = "transparent";

      // Draw border
      ctx.strokeStyle = "#00ffff";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
      );

      // Spawn obstacles
      if (Math.random() < state.spawnRate) {
        const width = 40 + Math.random() * 40;
        state.obstacles.push({
          x: Math.random() * (canvas.width - width),
          y: -50,
          width: width,
          height: 20,
        });
      }

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obs) => {
        obs.y += state.obstacleSpeed;

        // Draw obstacle with neon effect
        ctx.fillStyle = `hsl(${280 + Math.sin(Date.now() / 100) * 40}, 100%, 50%)`;
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 20;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.shadowColor = "transparent";

        // Check collision
        if (
          state.player.x < obs.x + obs.width &&
          state.player.x + state.player.width > obs.x &&
          state.player.y < obs.y + obs.height &&
          state.player.y + state.player.height > obs.y
        ) {
          state.gameActive = false;
          return false;
        }

        // Remove if off screen and increase score
        if (obs.y > canvas.height) {
          state.score += 10;
          setScore(state.score);
          return false;
        }

        return true;
      });

      // Increase difficulty
      if (state.score > 0 && state.score % 100 === 0) {
        state.spawnRate = Math.min(0.05, state.spawnRate + 0.001);
        state.obstacleSpeed = Math.min(8, state.obstacleSpeed + 0.05);
      }

      // Draw score with neon
      ctx.fillStyle = "#00ff88";
      ctx.shadowColor = "#00ff88";
      ctx.shadowBlur = 15;
      ctx.font = "bold 24px Arial";
      ctx.fillText(`SCORE: ${state.score}`, 20, 40);
      ctx.shadowColor = "transparent";

      if (!state.gameActive) {
        setGameOver(true);
        if (state.score > bestScore) {
          setBestScore(state.score);
          localStorage.setItem("dodgeNeonBest", state.score.toString());
        }
        clearInterval(gameLoop);
      }
    }, 1000 / 60);

    return () => {
      clearInterval(gameLoop);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameActive, gameOver, bestScore]);

  const resetGame = () => {
    gameStateRef.current = {
      player: { x: 175, y: 550, width: 50, height: 50, speed: 7 },
      obstacles: [],
      score: 0,
      gameActive: true,
      keys: {},
      spawnRate: 0.02,
      obstacleSpeed: 4,
    };
    setGameOver(false);
    setScore(0);
    setGameActive(true);
  };

  return (
    <div className="dodge-neon-container">
      <motion.div
        className="dodge-neon-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="neon-header">
          <div className="neon-stat">
            <span>BEST</span>
            <span className="value">{bestScore}</span>
          </div>
          <div className="neon-stat">
            <span>CURRENT</span>
            <span className="value">{score}</span>
          </div>
        </div>

        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="dodge-neon-canvas"
        />

        <div className="neon-controls">
          <span>← → Arrow Keys to Move</span>
        </div>

        {gameOver && (
          <motion.div
            className="neon-gameover-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2>GAME OVER</h2>
            <div className="neon-final-score">
              SCORE: <span>{score}</span>
            </div>
            {score > bestScore && (
              <div className="neon-new-record">NEW BEST!</div>
            )}
            <motion.button
              className="neon-restart-btn"
              onClick={resetGame}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              RETRY
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
