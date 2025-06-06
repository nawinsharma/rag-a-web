"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AILogo } from "@/components/ui/ai-logo";
import { User } from "lucide-react";
import type { Message } from "@/lib/store";

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex-shrink-0"
      >
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        ) : (
          <AILogo size="md" />
        )}
      </motion.div>

      {/* Message content */}
      <motion.div
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 relative",
          "shadow-lg backdrop-blur-sm",
          isUser
            ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white"
            : "bg-white/10 text-white border border-white/10",
          "group-hover:shadow-xl transition-shadow duration-300",
        )}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>

        {/* Timestamp */}
        <div className={cn("text-xs text-blue-300 mt-1")}>
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {/* Message tail */}
        <div
          className={cn(
            "absolute top-3 w-3 h-3 rotate-45",
            isUser
              ? "right-[-6px] bg-gradient-to-r from-indigo-600 to-indigo-700"
              : "left-[-6px] bg-white/10 border-l border-t border-white/10",
          )}
        />
      </motion.div>
    </motion.div>
  );
}
