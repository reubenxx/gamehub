import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import "./BallBounceSurvival.css";

export default function BallBounceSurvival() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const gameStateRef = useRef({
    ball: { x: 200, y: 300, vx: 4, vy: 3, r: 15 },
    score: 0,
  });

  useEffect(() => {
    if (!gameActive || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const gameLoop = setInterval(() => {
      const state = gameStateRef.current;
      const ball = state.ball;

      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
        ball.vx *= -1;
        ball.x = Math.max(ball.r, Math.min(canvas.width - ball.r, ball.x));
      }
      if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
        ball.vy *= -1;
        ball.y = Math.max(ball.r, Math.min(canvas.height - ball.r, ball.y));
      }

      // Apply gravity
      ball.vy += 0.3;
      ball.vx *= 0.99;

      // Check lose condition (ball falls too slow)
      const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      if (speed < 1) {
        setGameOver(true);
        setGameActive(false);
        clearInterval(gameLoop);
      }

      // Draw
      ctx.fillStyle = "rgba(10, 14, 39, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, "rgba(10, 20, 50, 0)");
      gradient.addColorStop(1, "rgba(0, 200, 255, 0.15)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw ball
      ctx.fillStyle = `hsl(${Math.random() * 60 + 0}, 100%, 50%)`;
      ctx.shadowColor = "rgba(0, 200, 255, 0.8)";
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowColor = "transparent";

      // Draw walls
      ctx.strokeStyle = "rgba(0, 200, 255, 0.5)";
      ctx.lineWidth = 3;
      ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

      // Update score
      state.score++;
      setScore(Math.floor(state.score / 10));
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver]);

  const resetGame = () => {
    gameStateRef.current = {
      ball: { x: 200, y: 300, vx: 4, vy: 3, r: 15 },
      score: 0,
    };
    setScore(0);
    setGameOver(false);
    setGameActive(true);
  };

  return (
    <div className="ball-bounce-container">
      <div className="ball-header">
        <div className="ball-stat">
          <span>TIME ALIVE</span>
          <span className="value">{score}s</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={700}
        height={600}
        className="ball-canvas"
      />

      <div className="ball-instruction">
        <p>Keep the ball bouncing! It slows down if you don't...</p>
      </div>

      {gameOver && (
        <motion.div
          className="ball-gameover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="ball-modal"
          >
            <h2>BALL STOPPED!</h2>
            <p className="final-score">SURVIVED: {score}s</p>
            <button onClick={resetGame}>PLAY AGAIN</button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
