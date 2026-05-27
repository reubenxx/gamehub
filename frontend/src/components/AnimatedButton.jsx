import { motion } from "framer-motion";

export default function AnimatedButton({ children, onClick, variant = "primary", type = "button" }) {
  const className = `terms-action ${variant === "secondary" ? "button-secondary" : "button-primary"}`;

  return (
    <motion.button
      type={type}
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 360, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
