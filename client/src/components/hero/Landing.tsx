"use client"

import { motion } from "framer-motion"
import { Pacifico } from "next/font/google"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PageBackground } from "@/components/layout/page-background"
import { Sparkles } from "lucide-react"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
})

export default function Landing({
  badge = "Website AI",
  title1 = "Interact With",
  title2 = "Any Website",
}: {
  badge?: string
  title1?: string
  title2?: string
}) {
  const router = useRouter()

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  }

  return (
    <PageBackground variant="hero">
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-8 md:mb-12 backdrop-blur-sm"
            >
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                className="w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 flex items-center justify-center"
              >
                <Sparkles size={12} className="text-white" />
              </motion.div>
              <span className="text-sm text-white/60 tracking-wide font-medium">{badge}</span>
            </motion.div>

            {/* Title */}
            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="text-5xl sm:text-7xl md:text-9xl font-bold mb-6 md:mb-8 tracking-tight leading-none">
                <motion.span
                  className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 block"
                  whileHover={{
                    backgroundImage: "linear-gradient(to bottom, #ffffff, #e0e7ff)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {title1}
                </motion.span>
                <motion.span
                  className={cn(
                    "bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 block",
                    pacifico.className,
                  )}
                  whileHover={{
                    backgroundImage: "linear-gradient(to right, #a5b4fc, #ffffff, #fda4af)",
                    transition: { duration: 0.3 },
                  }}
                >
                  {title2}
                </motion.span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div custom={2} variants={fadeUpVariants} initial="hidden" animate="visible">
              <p className="text-lg sm:text-xl md:text-2xl text-white/50 mb-10 leading-relaxed font-light tracking-wide max-w-2xl mx-auto">
                Transform any website into an interactive AI assistant. Simply enter a URL and start asking questions
                about the content.
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div custom={3} variants={fadeUpVariants} initial="hidden" animate="visible">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="inline-block">
                <Button
                  onClick={() => {
                    router.push("/dashboard");
                  }}
                  size="lg"
                  className="px-10 py-6 text-lg bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white rounded-full border-none shadow-2xl shadow-indigo-500/25 font-semibold tracking-wide"
                >
                  <Sparkles className="mr-2" size={20} />
                  Start Chatting
                </Button>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </PageBackground>
  )
}
