import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function GameCard({ game, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/game/${game.id}`} className="game-card">
        <motion.div
          className="card-content"
          whileHover={{ scale: 1.05, translateY: -8 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <h3 className="card-title">{game.name}</h3>
          <p className="card-description">{game.description}</p>
          <div className="card-footer">
            <span className="play-button">Play Now</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
