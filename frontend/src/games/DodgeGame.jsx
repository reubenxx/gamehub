import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./DodgeGame.css";

export default function DodgeGame() {
  const canvasRef = useRef(null);
  const [gameActive, setGameActive] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("dodgeBestScore") || "0")
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

      // Clear canvas
      ctx.fillStyle = "rgba(10, 14, 39, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(10, 14, 39, 0)");
      gradient.addColorStop(1, "rgba(14, 165, 233, 0.1)");
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

      // Draw player
      ctx.fillStyle = "#0ea5e9";
      ctx.shadowColor = "rgba(14, 165, 233, 0.8)";
      ctx.shadowBlur = 20;
      ctx.fillRect(
        state.player.x,
        state.player.y,
        state.player.width,
        state.player.height
      );
      ctx.shadowColor = "transparent";

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

        // Draw obstacle
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
        ctx.shadowBlur = 15;
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

      // Increase difficulty over time
      if (state.score > 0 && state.score % 100 === 0) {
        state.spawnRate = Math.min(0.05, state.spawnRate + 0.001);
        state.obstacleSpeed = Math.min(8, state.obstacleSpeed + 0.05);
      }

      // Draw score
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`Score: ${state.score}`, 20, 40);

      if (!state.gameActive) {
        setGameOver(true);
        if (state.score > bestScore) {
          setBestScore(state.score);
          localStorage.setItem("dodgeBestScore", state.score.toString());
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
    <div className="dodge-container">
      <motion.div
        className="dodge-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="dodge-canvas"
        />

        <div className="dodge-controls">
          <div className="control-instruction">
            <span>Use ← → Arrow Keys or A/D to move</span>
          </div>
          <div className="dodge-stats">
            <div className="stat-box">
              <div className="stat-label">Current Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Best Score</div>
              <div className="stat-value">{bestScore}</div>
            </div>
          </div>

          {gameOver && (
            <motion.div
              className="game-over-modal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h2>Game Over!</h2>
              <div className="final-score">
                Final Score: <span>{score}</span>
              </div>
              <motion.button
                className="restart-btn"
                onClick={resetGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
