"use client"

import { motion } from "framer-motion"
import { AILogo } from "@/components/ui/ai-logo"

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex gap-3"
    >
      <AILogo isThinking size="md" />

      <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <span className="text-white/60 text-sm">AI is thinking</span>
          <div className="flex gap-1 ml-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-white/40 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 1, 0.4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
