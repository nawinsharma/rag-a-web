"use client";

import type React from "react";

import { ElegantShape } from "@/components/ui/elegant-shape";

interface PageBackgroundProps {
  variant?: "hero" | "dashboard";
  children: React.ReactNode;
}

export function PageBackground({
  variant = "hero",
  children,
}: PageBackgroundProps) {
  const shapes = {
    hero: [
      {
        delay: 0.3,
        width: 600,
        height: 140,
        rotate: 12,
        gradient: "from-indigo-500/[0.15]",
        className: "left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]",
        intensity: "high" as const,
      },
      {
        delay: 0.5,
        width: 500,
        height: 120,
        rotate: -15,
        gradient: "from-rose-500/[0.15]",
        className: "right-[-5%] md:right-[0%] top-[70%] md:top-[75%]",
        intensity: "high" as const,
      },
      {
        delay: 0.4,
        width: 300,
        height: 80,
        rotate: -8,
        gradient: "from-violet-500/[0.15]",
        className: "left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]",
        intensity: "medium" as const,
      },
      {
        delay: 0.6,
        width: 200,
        height: 60,
        rotate: 20,
        gradient: "from-amber-500/[0.15]",
        className: "right-[15%] md:right-[20%] top-[10%] md:top-[15%]",
        intensity: "medium" as const,
      },
      {
        delay: 0.7,
        width: 150,
        height: 40,
        rotate: -25,
        gradient: "from-cyan-500/[0.15]",
        className: "left-[20%] md:left-[25%] top-[5%] md:top-[10%]",
        intensity: "low" as const,
      },
    ],
    dashboard: [
      {
        delay: 0.2,
        width: 400,
        height: 100,
        rotate: 12,
        gradient: "from-indigo-500/[0.15]",
        className: "left-[-5%] top-[10%]",
        intensity: "medium" as const,
      },
      {
        delay: 0.3,
        width: 300,
        height: 80,
        rotate: -15,
        gradient: "from-rose-500/[0.15]",
        className: "right-[-2%] top-[60%]",
        intensity: "medium" as const,
      },
      {
        delay: 0.4,
        width: 200,
        height: 60,
        rotate: 8,
        gradient: "from-violet-500/[0.15]",
        className: "left-[2%] bottom-[20%]",
        intensity: "low" as const,
      },
    ],
  };

  return (
    <div className="relative min-h-screen w-full bg-[#030303] text-white overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-rose-500/[0.05] blur-3xl" />

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {shapes[variant].map((shape, index) => (
          <ElegantShape key={index} {...shape} />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-[#030303]/80 pointer-events-none" />
    </div>
  );
}
