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
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.995 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -18, scale: 0.994 },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="terms-shell"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={overlayVariants}
        transition={{ duration: 0.45 }}
        aria-hidden={false}
      >
        <div className="terms-backdrop" aria-hidden="true" />

        {!isTransitioning ? (
          <motion.article
            className="terms-panel"
            role="dialog"
            aria-modal="true"
            aria-label="GeoGames Terms and Conditions"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            transition={{ duration: 0.65, ease: "circOut" }}
          >
            <header className="terms-header">
              <div className="terms-badge">GeoGames · Secure Access</div>
              <h1>Terms &amp; Conditions</h1>
              <p className="terms-lead">Please read these terms to continue to GeoGames. Acceptance is required to access the site.</p>
            </header>

            <div className="terms-copy">
              <p>
                By accepting, you acknowledge and agree to the following terms. The content is presented clearly
                and is scrollable — take a moment to review the protections and responsibilities.
              </p>
            </div>

            <div className="terms-scroll" tabIndex={0}>
              {termsItems.map((item) => (
                <section className="terms-section" key={item.title}>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </section>
              ))}

              <section className="terms-section">
                <h2>General Protections</h2>
                <p>
                  GeoGames reserves the right to change, remove, or limit access to content and features. Use of the
                  platform must be lawful, non-malicious, and respectful of intellectual property.
                </p>
              </section>
            </div>

            <footer className="terms-footer-row">
              <AnimatedButton variant="secondary" onClick={onDecline}>
                Decline
              </AnimatedButton>
              <AnimatedButton onClick={onAccept}>Accept</AnimatedButton>
            </footer>

            <div className="terms-small-meta">
              <small>{isSoundReady ? "Audio system ready." : "Audio: initializing..."}</small>
            </div>
          </motion.article>
        ) : (
          <motion.div
            className="terms-panel cinematic-panel"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              className="welcome-title"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              Welcome to GeoGames
            </motion.h1>
            <motion.p
              className="welcome-copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Loading the premium arcade. Enjoy a cinematic gaming experience.
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
