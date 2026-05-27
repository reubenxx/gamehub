import { AnimatePresence, motion } from "framer-motion";
import AnimatedButton from "./AnimatedButton";

const termsItems = [
  {
    title: "Copyright Protection",
    description:
      "All GeoGames content, code, and assets are protected intellectual property. Do not redistribute or claim ownership.",
  },
  {
    title: "No Redistribution",
    description:
      "You agree not to copy, distribute, or share games, screenshots, or assets outside this platform without permission.",
  },
  {
    title: "Fair Usage",
    description:
      "This site is built for personal entertainment. Do not attempt to harm, exploit, or degrade services.",
  },
  {
    title: "User Responsibility",
    description:
      "All gameplay is at your own risk. Maintain good behavior and follow local gaming guidelines.",
  },
  {
    title: "Limitation of Liability",
    description:
      "GeoGames is not liable for losses, damages, or interruptions caused by use of the platform or linked game experiences.",
  },
  {
    title: "No Malicious Use",
    description:
      "Do not use GeoGames for malware, cheating, hacking, or any unauthorized activity.",
  },
  {
    title: "Intellectual Property Notice",
    description:
      "All brands, names, and designs on this platform remain the property of their respective owners.",
  },
  {
    title: "Data & Privacy Disclaimer",
    description:
      "We respect your privacy. Minimal local data is stored for access control; no personal tracking occurs.",
  },
  {
    title: "Service Changes Disclaimer",
    description:
      "GeoGames may update, remove, or modify content, features, and services without prior notice.",
  },
  {
    title: "Account Responsibility",
    description:
      "If account-based features are added in the future, you will be responsible for keeping access credentials secure.",
  },
];

export default function TermsOverlay({ onAccept, onDecline, isTransitioning, isSoundReady }) {
  return (
    <AnimatePresence mode="wait">
      <motion.section
        className="terms-shell"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="terms-background" />
        <AnimatePresence mode="wait">
          {!isTransitioning ? (
            <motion.div
              key="terms-panel"
              className="terms-panel"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
            >
              <div className="terms-header">
                <span className="terms-badge">GeoGames Secure Access</span>
                <h1>Terms & Conditions</h1>
                <p>Read these conditions before entering the premium GeoGames arena.</p>
              </div>

              <div className="terms-copy">
                <p>
                  By accepting, you acknowledge the rules, protections, and responsibilities for GeoGames.
                  This agreement must be accepted before using the platform.
                </p>
              </div>

              <div className="terms-content">
                <ul className="terms-list">
                  {termsItems.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <span>{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="terms-button-row">
                <AnimatedButton variant="secondary" onClick={onDecline}>
                  Decline
                </AnimatedButton>
                <AnimatedButton onClick={onAccept}>Accept</AnimatedButton>
              </div>

              <div className="terms-footer">
                <span>{isSoundReady ? "Audio system ready." : "Initializing audio readiness..."}</span>
                <span>GeoGames is optimized for modern desktop and mobile play.</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome-panel"
              className="terms-panel cinematic-panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.p
                className="welcome-caption"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Access granted
              </motion.p>
              <motion.h1
                className="welcome-title"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.8 }}
              >
                Welcome to GeoGames
              </motion.h1>
              <motion.p
                className="welcome-copy"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.65 }}
              >
                The arcade experience is loading. Enjoy the premium gaming universe.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </AnimatePresence>
  );
}
