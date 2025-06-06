"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, ArrowLeft, FileText, Plus, Trash2 } from "lucide-react"
import { usePDFStore } from "@/lib/pdf-store"
import { PageBackground } from "@/components/layout/page-background"
import { AILogo } from "@/components/ui/ai-logo"
import { MessageBubble } from "@/components/ui/message-bubble"
import { TypingIndicator } from "@/components/ui/typing-indicator"
import axios from "axios"

export default function PDFChatPage() {
  const router = useRouter()
  const params = useParams()
  const collectionId = params.collection as string
  const chatEndRef = useRef<HTMLDivElement>(null)

  const {
    currentCollection,
    isAiTyping,
    setCurrentCollection,
    setIsAiTyping,
    addMessage,
    clearChat,
    ensureCollection,
  } = usePDFStore()

  const [userInput, setUserInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Load collection on mount
  useEffect(() => {
    const loadCollection = () => {
      console.log("Loading collection with ID:", collectionId)

      // Try to ensure collection exists and is set as current
      const collection = ensureCollection(collectionId)

      if (collection) {
        console.log("Collection found:", collection)
        setCurrentCollection(collection)
        setIsLoading(false)
      } else {
        console.log("Collection not found, redirecting...")
        toast.error("PDF not found", {
          description: "The PDF you're looking for doesn't exist or has been removed.",
        })
        setTimeout(() => {
          router.push("/pdf")
        }, 1500)
      }
    }

    if (collectionId) {
      // Small delay to ensure store is hydrated
      setTimeout(loadCollection, 100)
    }
  }, [collectionId, ensureCollection, setCurrentCollection, router])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentCollection?.chatHistory, isAiTyping])

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
  }

  // Handle chat message submission
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userInput.trim() || !currentCollection) return

    const userMessage = {
      role: "user" as const,
      content: userInput,
    }

    addMessage(currentCollection.id, userMessage)
    setUserInput("")
    setIsAiTyping(true)

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/query`,
        {
          query: userInput,
          collection_name: currentCollection.collectionName,
        }
      )

      if (!response.data) {
        throw new Error('No response from server')
      }

      const aiMessage = {
        role: "assistant" as const,
        content: response.data.response,
      }

      addMessage(currentCollection.id, aiMessage)
    } catch (error) {
      toast.error("Failed to get response", {
        description: "Please try again",
      })
      console.error(error)
    } finally {
      setIsAiTyping(false)
    }
  }

  const handleClearChat = () => {
    if (currentCollection) {
      clearChat(currentCollection.id)
      toast.success("Chat cleared")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Loading state
  if (isLoading) {
    return (
      <PageBackground variant="dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <AILogo isThinking size="lg" />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Loading PDF...</h3>
              <p className="text-white/60">Please wait while we prepare your document</p>
            </div>
          </div>
        </div>
      </PageBackground>
    )
  }

  // Collection not found state
  if (!currentCollection) {
    return (
      <PageBackground variant="dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <FileText size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">PDF Not Found</h3>
              <p className="text-white/60 mb-4">The PDF you are looking for doesn&apost exist or has been removed.</p>
              <Button
                onClick={() => router.push("/pdf")}
                className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
              >
                Back to PDF Upload
              </Button>
            </div>
          </div>
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground variant="dashboard">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 backdrop-blur-sm gap-4 sm:gap-0"
        >
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/pdf")}
              className="text-white/70 hover:text-white cursor-pointer hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold truncate">{currentCollection.fileName}</h1>
                <p className="text-xs sm:text-sm text-white/60 flex items-center gap-2 truncate">
                  <span>{formatFileSize(currentCollection.fileSize)}</span>
                  <span>•</span>
                  <span>{currentCollection.chatHistory.length} messages</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {currentCollection.chatHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="group border-white/20 text-white/80 hover:text-white bg-red-500/10 hover:bg-red-500/20 cursor-pointer flex-1 sm:flex-none transition-all duration-300 hover:scale-105"
              >
                <Trash2 size={14} className="mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Clear Chat
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/pdf")}
              className="group border-white/20 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 cursor-pointer flex-1 sm:flex-none transition-all duration-300 hover:scale-105"
            >
              <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New PDF
            </Button>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 container mx-auto p-6 flex flex-col max-w-4xl">
          <motion.div className="flex-1 flex flex-col h-full" initial="hidden" animate="visible" variants={fadeInUp}>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto mb-6 space-y-6 pr-2 min-h-0">
              <AnimatePresence mode="popLayout">
                {currentCollection.chatHistory.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                      <FileText size={24} className="text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Ready to Analyze!</h3>
                      <p className="text-white/60">Ask me anything about &quot;{currentCollection.fileName}&ldquo;</p>
                    </div>
                  </motion.div>
                ) : (
                  currentCollection.chatHistory.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isLatest={index === currentCollection.chatHistory.length - 1}
                    />
                  ))
                )}

                {isAiTyping && <TypingIndicator />}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <motion.form onSubmit={handleChatSubmit} className="relative" whileFocus={{ scale: 1.01 }}>
              <Input
                type="text"
                placeholder="Ask a question about the PDF..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isAiTyping}
                className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 pr-14 h-14 px-6 text-lg focus-visible:ring-red-500 focus-visible:border-red-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isAiTyping || !userInput.trim()}
                className="absolute right-2 top-2 h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg"
              >
                <Send size={18} />
              </Button>
            </motion.form>
          </motion.div>
        </main>
      </div>
    </PageBackground>
  )
}
