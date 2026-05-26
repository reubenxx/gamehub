import { motion } from "framer-motion";
import GameCard from "../components/GameCard";
import { games } from "../games/games";

function Background() {
  return <div className="bg" />;
}

export default function HomePage() {
  return (
    <div className="page">
      <Background />

      <motion.div
        className="home-content"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Game Corner
        </motion.h1>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Fast. Clean. Play instantly.
        </motion.p>

        <motion.div
          className="game-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
