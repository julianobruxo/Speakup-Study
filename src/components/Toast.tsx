import { AnimatePresence, motion } from "framer-motion";

export default function Toast({ message }: { message: string }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="app-toast"
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          role="status"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
