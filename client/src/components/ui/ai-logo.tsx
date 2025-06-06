"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AILogoProps {
  isThinking?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AILogo({
  isThinking = false,
  size = "md",
  className,
}: AILogoProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const dotSizeMap = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <motion.div
      animate={
        isThinking
          ? {
              rotate: 360,
              scale: [1, 1.1, 1],
            }
          : {
              rotate: 0,
              scale: 1,
            }
      }
      transition={
        isThinking
          ? {
              rotate: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: {
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              },
            }
          : {
              duration: 0.3,
            }
      }
      className={cn(
        sizeMap[size],
        "rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center shadow-lg",
        "relative overflow-hidden",
        className,
      )}
    >
      <motion.div
        className={cn(dotSizeMap[size], "rounded-full bg-white")}
        animate={
          isThinking
            ? {
                opacity: [1, 0.5, 1],
              }
            : {
                opacity: 1,
              }
        }
        transition={
          isThinking
            ? {
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
            : {}
        }
      />

      {/* Thinking particles */}
      {isThinking && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              animate={{
                x: [0, 10, -10, 0],
                y: [0, -10, 10, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
