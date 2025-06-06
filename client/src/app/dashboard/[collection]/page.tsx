"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Globe } from "lucide-react";
import { useWebsiteStore } from "@/lib/store";
import { PageBackground } from "@/components/layout/page-background";
import { AILogo } from "@/components/ui/ai-logo";
import { MessageBubble } from "@/components/ui/message-bubble";
import { TypingIndicator } from "@/components/ui/typing-indicator";
import axios from "axios";

export default function CollectionChatPage() {
  const router = useRouter();
  const params = useParams();
  const collectionName = Array.isArray(params.collection)
    ? params.collection[0]
    : params.collection;

  // Redirect to dashboard if no collection name is provided
  useEffect(() => {
    if (!collectionName) {
      router.push("/dashboard");
    }
  }, [collectionName, router]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const { isAiTyping, collections, addMessage, setIsAiTyping, getChatHistory } =
    useWebsiteStore();

  const [userInput, setUserInput] = useState("");
  const chatHistory = collectionName ? getChatHistory(collectionName) : [];

  // Find the collection details
  const currentCollection = collections.find((c) => c.name === collectionName);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [isAiTyping]);

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

  // Handle chat message submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Handling chat submit with userInput:",
      userInput,
      "and collectionName:",
      collectionName,
    );

    if (!userInput.trim() || !collectionName) return;

    const userMessage = {
      role: "user" as const,
      content: userInput,
    };

    addMessage(userMessage, collectionName);
    setUserInput("");
    setIsAiTyping(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        {
          query: userInput,
          collection_name: collectionName,
        },
      );

      console.log("Response received from server", response);

      const data = response.data;

      if (!response || response.status !== 200) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const aiMessage = {
        role: "assistant" as const,
        content:
          data.response || "Sorry, I couldn't find an answer to your question.",
      };

      addMessage(aiMessage, collectionName);
    } catch (error) {
      toast.error("Failed to get response", {
        description: "Please try again",
      });
      console.error(error);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
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
              onClick={handleBackToDashboard}
              className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3">
              <AILogo size="md" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold truncate">
                  Chat with {collectionName}
                </h1>
                {currentCollection && (
                  <p className="text-xs sm:text-sm text-white/60 flex items-center gap-1 truncate">
                    <Globe size={12} className="flex-shrink-0" />
                    <span className="truncate">{currentCollection.url}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content - Chat Interface */}
        <main className="flex-1 container mx-auto p-4 sm:p-6 flex flex-col max-w-4xl">
          <motion.div
            className="flex-1 overflow-y-auto pr-2 sm:pr-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {chatHistory.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 px-4"
                >
                  <AILogo size="lg" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                      Ready to Chat!
                    </h3>
                    <p className="text-sm sm:text-base text-white/60">
                      Ask me anything about {currentCollection?.url}
                    </p>
                  </div>
                </motion.div>
              ) : (
                chatHistory.map((message) => (
                  <motion.div variants={fadeInUp} key={message.id}>
                    <MessageBubble message={message} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            {isAiTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </motion.div>

          {/* Chat Input */}
          <motion.form
            onSubmit={handleChatSubmit}
            className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Ask a question about this website..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!userInput.trim() || !collectionName || isAiTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Send size={18} className="sm:w-5 sm:h-5" />
              </Button>
            </div>
          </motion.form>
        </main>
      </div>
    </PageBackground>
  );
}
