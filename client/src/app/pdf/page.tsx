"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Trash2 } from "lucide-react"
import { usePDFStore } from "@/lib/pdf-store"
import { PageBackground } from "@/components/layout/page-background"
import { AILogo } from "@/components/ui/ai-logo"
import { PDFUpload } from "@/components/ui/pdf-upload"
import axios from "axios"

export default function ChatWithPDF() {
  const router = useRouter()
  const { isUploading, collections, setIsUploading, addCollection, removeCollection } = usePDFStore()

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // Handle PDF upload
  const handlePDFUpload = async (file: File) => {
    // Check file size (10MB = 10 * 1024 * 1024 bytes)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error("File too large", {
        description: "Please upload a PDF file smaller than 10MB",
      });
      return;
    }

    setIsUploading(true)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Make API call to upload PDF
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/ingestfile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      if (!response.data) {
        throw new Error('No response from server')
      }

      const data = response.data
      console.log("uploaded succesfully..................................................", data);
      
      // Create new collection
      const newCollection = addCollection({
        fileName: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        originalName: file.name,
        fileSize: file.size,
        collectionName: data.collection_name, // Use the collection_name from backend response
      })
      console.log("=========================================response from backend", newCollection);
      

      // Show success message
      toast.success("PDF uploaded successfully!", {
        description: `Ready to chat with ${file.name}`,
      })

      // Small delay to ensure state is updated
      setTimeout(() => {
        // Redirect to chat page
        router.push(`/pdf/${newCollection.id}`)
      }, 500)
    } catch (error) {
      toast.error("Failed to upload PDF", {
        description: "Please try again with a valid PDF file",
      })
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleCollectionClick = (collectionId: string) => {
    router.push(`/pdf/${collectionId}`)
  }

  const handleRemoveCollection = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation()
    removeCollection(collectionId)
    toast.success("PDF removed successfully")
  }

  return (
    <PageBackground variant="dashboard">
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b border-white/10 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="text-white/70 hover:text-white cursor-pointer hover:bg-white/10"
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center gap-3">
              <AILogo size="md" />
              <div>
                <h1 className="text-xl font-bold">Chat with PDF</h1>
                <p className="text-sm text-white/60">Upload and analyze PDF documents</p>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main content */}
        <main className="flex-1 container mx-auto p-6 flex flex-col max-w-4xl">
          <motion.div
            className="flex-1 flex flex-col items-center justify-center"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Upload Section */}
            <motion.div variants={fadeInUp} className="w-full max-w-lg space-y-6">
              <div className="text-center space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mb-6"
                >
                  <FileText size={32} className="text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-300 via-white/90 to-orange-300">
                  Upload PDF Document
                </h2>
                <p className="text-white/60">Upload any PDF document to start an intelligent conversation</p>
                <p className="text-sm text-red-300">limit size (max 10 mb)</p>
              </div>

              <PDFUpload onUpload={handlePDFUpload} isUploading={isUploading} />
            </motion.div>

            {/* Recent PDFs */}
            {collections.length > 0 && (
              <motion.div variants={fadeInUp} className="w-full max-w-lg mt-12">
                <h3 className="text-lg font-semibold mb-4 text-white/80">Recent PDF Documents</h3>
                <div className="space-y-2">
                  {collections.slice(0, 5).map((collection) => (
                    <motion.div
                      key={collection.id}
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/10 cursor-pointer"
                      onClick={() => handleCollectionClick(collection.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                          <FileText size={16} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{collection.fileName}</p>
                          <div className="flex items-center gap-2 text-white/40 text-xs">
                            <span>{formatFileSize(collection.fileSize)}</span>
                            <span>•</span>
                            <span>{collection.chatHistory.length} messages</span>
                            <span>•</span>
                            <span>{new Date(collection.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleRemoveCollection(e, collection.id)}
                        className="text-white/40 hover:text-red-400 hover:bg-red-500/10"
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
  )
}
