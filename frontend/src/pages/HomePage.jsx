import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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

        <div className="rhythm-featured-preview">
          <motion.div
            style={{ 
              padding: 'clamp(16px, 3vw, 28px)', 
              display: 'flex', 
              flexDirection: window.innerWidth < 768 ? 'column' : 'row',
              alignItems: 'center', 
              justifyContent: window.innerWidth < 768 ? 'center' : 'space-between',
              gap: 'clamp(16px, 2vw, 28px)',
              boxSizing: 'border-box'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}>Geo Dashers</h2>
              <p style={{ marginTop: '6px', fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}>Featured — full-screen neon rhythm platformer built for fast restarts and polished flight.</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Link to="/game/geo-dashers" className="back-button">PLAY NOW</Link>
            </div>
          </motion.div>
        </div>

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
