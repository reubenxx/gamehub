import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { games } from "../games/games";
import ClickerRush from "../games/ClickerRush";
import DodgeNeon from "../games/DodgeNeon";
import ReactionTimer from "../games/ReactionTimer";
import MemoryFlip from "../games/MemoryFlip";
import EndlessRunner from "../games/EndlessRunner";
import ColorMatch from "../games/ColorMatch";
import AimTrainer from "../games/AimTrainer";
import TapRhythm from "../games/TapRhythm";
import GravitySwitch from "../games/GravitySwitch";
import BallBounceSurvival from "../games/BallBounceSurvival";

const gameComponents = {
  ClickerRush,
  DodgeNeon,
  ReactionTimer,
  MemoryFlip,
  EndlessRunner,
  ColorMatch,
  AimTrainer,
  TapRhythm,
  GravitySwitch,
  BallBounceSurvival,
};

export default function GamePage() {
  const { id } = useParams();
  const game = games.find((g) => g.id === id);

  if (!game) {
    return (
      <div className="page">
        <div className="game-not-found">
          <h1>Game Not Found</h1>
          <Link to="/" className="back-button">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const GameComponent = gameComponents[game.component];

  if (!GameComponent) {
    return (
      <div className="page">
        <div className="game-not-found">
          <h1>Game Component Not Found</h1>
          <Link to="/" className="back-button">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="game-page-header">
        <Link to="/" className="back-button-header">
          ← Back to Games
        </Link>
        <h2 className="game-page-title">{game.name}</h2>
      </div>
      <GameComponent />
    </motion.div>
  );
}
