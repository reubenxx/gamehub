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
        initial={{ opacity: 0, y: -22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="home-tagline"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          Premium arcade experiences, built for modern players.
        </motion.div>

        <motion.h1
          className="title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          GeoGames
        </motion.h1>

        <motion.p
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.8 }}
        >
          Discover fast, glowing mini-games with neon polish and smooth transitions.
        </motion.p>

        <motion.div
          className="game-grid"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.9 }}
        >
          {games.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
