"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Button } from "./button"
import { AILogo } from "./ai-logo"

interface PDFUploadProps {
  onUpload: (file: File) => void
  isUploading: boolean
}

export function PDFUpload({ onUpload, isUploading }: PDFUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        if (file.type === "application/pdf") {
          onUpload(file)
        }
      }
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
  })

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full"
    >
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-red-500 bg-red-500/10"
            : "border-white/20 hover:border-white/40 bg-white/[0.02]"
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <AILogo isThinking size="lg" />
            <p className="text-white/80">Processing PDF...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/80">Drop your PDF here</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-white/80">
              Drag and drop your PDF here , or click to select
            </p>
            <p className="text-blue-700">max size 10 mb</p>
            <Button
              variant="outline"
              className="bg-black hover:bg-gray-900 text-white hover:text-gray-200 cursor-pointer"
            >
              Select PDF
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  )
} 