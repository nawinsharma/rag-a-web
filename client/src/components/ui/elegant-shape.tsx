"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ElegantShapeProps {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
  intensity?: "low" | "medium" | "high";
}

export function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
  intensity = "medium",
}: ElegantShapeProps) {
  const intensityMap = {
    low: "border-white/[0.08] shadow-[0_4px_16px_0_rgba(255,255,255,0.05)]",
    medium: "border-white/[0.15] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
    high: "border-white/[0.25] shadow-[0_12px_48px_0_rgba(255,255,255,0.15)]",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
        scale: 1,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2",
            intensityMap[intensity],
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]",
            "hover:scale-105 transition-transform duration-500",
          )}
        />
      </motion.div>
    </motion.div>
  );
}
