"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Globe, Trash2 } from "lucide-react";
import { useWebsiteStore } from "@/lib/store";
import { PageBackground } from "@/components/layout/page-background";
import { AILogo } from "@/components/ui/ai-logo";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const { collections, addCollection, removeCollection } = useWebsiteStore();

  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Handle URL submission
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) return;

    // Check if this URL already exists in collections
    const existingCollection = collections.find((c) => c.url === url);
    if (existingCollection) {
      // If collection exists, redirect to its chat page
      router.push(`/dashboard/${existingCollection.name}`);
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ingestion`,
        {
          url,
        },
      );
      if (!response) {
        throw new Error(`Server responded with : ${response}`);
      }
      const data = await response.data;
      const websiteName = new URL(url).hostname;

      addCollection({ url, name: data.collection_name });

      toast.success("Website successfully indexed!", {
        description: `Ready to chat with ${websiteName}`,
      });

      // Add navigation to the new collection page
      router.push(`/dashboard/${data.collection_name}`);
    } catch (error) {
      toast.error("Failed to process website", {
        description: "Please check the URL and try again",
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageBackground variant="dashboard">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 sm:p-6 border-b border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <AILogo size="md" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold">
                  Website AI Dashboard
                </h1>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 container mx-auto p-4 sm:p-6 flex flex-col max-w-4xl">
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* URL Input Section */}
            <motion.div
              variants={fadeInUp}
              className="w-full max-w-lg space-y-4 sm:space-y-6"
            >
              <div className="text-center space-y-3 sm:space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center"
                >
                  <Globe size={24} className="text-white sm:w-8 sm:h-8" />
                </motion.div>
                <h2 className="text-2xl sm:text-3xl text-white mt-[-10] font-bold bg-clip-text text-transparent">
                  Enter Website URL
                </h2>
                <p className="text-sm sm:text-base text-white/60 px-4">
                  Paste any website URL to start chatting with its content
                </p>
              </div>

              <form
                onSubmit={handleUrlSubmit}
                className="space-y-3 sm:space-y-4"
              >
                <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isProcessing}
                    className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isProcessing || !url.trim()}
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-indigo-500 to-pink-300 hover:from-indigo-600 hover:to-pink-400 text-white text-base sm:text-lg font-semibold cursor-pointer rounded-xl shadow-lg shadow-indigo-500/25"
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2 sm:gap-3">
                        <AILogo isThinking size="sm" />
                        <span>Processing Website...</span>
                      </div>
                    ) : (
                      <span>Analyze Website</span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Recent Collections */}
            {collections.length > 0 && (
              <motion.div
                variants={fadeInUp}
                className="w-full max-w-lg mt-8 sm:mt-12"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white/80">
                  Recent Websites
                </h3>
                <div className="space-y-2">
                  {collections.map((collection) => (
                    <motion.div
                      key={collection.id}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                      }}
                      className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/[0.02] border border-white/10 cursor-pointer"
                      onClick={() =>
                        router.push(`/dashboard/${collection.name}`)
                      }
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Globe
                          size={14}
                          className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {collection.name}
                          </p>
                          <p className="text-white/40 text-xs truncate">
                            {collection.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCollection(collection.id);
                        }}
                        className="text-white/40 cursor-pointer hover:text-red-400 hover:bg-red-500/10 flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </PageBackground>
  );
}
