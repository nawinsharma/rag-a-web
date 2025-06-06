import { create } from "zustand"
import { persist } from "zustand/middleware"

export type PDFMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export type PDFCollection = {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  uploadedAt: number
  chatHistory: PDFMessage[]
  collectionName: string
}

interface PDFStore {
  // Current session
  currentCollection: PDFCollection | null
  isUploading: boolean
  isAiTyping: boolean

  // Collections history
  collections: PDFCollection[]

  // Actions
  setCurrentCollection: (collection: PDFCollection) => void
  setIsUploading: (uploading: boolean) => void
  setIsAiTyping: (typing: boolean) => void
  addMessage: (collectionId: string, message: Omit<PDFMessage, "id" | "timestamp">) => void
  clearChat: (collectionId: string) => void
  addCollection: (collection: Omit<PDFCollection, "id" | "uploadedAt" | "chatHistory">) => PDFCollection
  removeCollection: (id: string) => void
  getCollection: (id: string) => PDFCollection | undefined
  updateCollection: (id: string, updates: Partial<PDFCollection>) => void
  // Add method to ensure collection exists
  ensureCollection: (id: string) => PDFCollection | null
}

export const usePDFStore = create<PDFStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentCollection: null,
      isUploading: false,
      isAiTyping: false,
      collections: [],

      // Actions
      setCurrentCollection: (collection) => set({ currentCollection: collection }),
      setIsUploading: (uploading) => set({ isUploading: uploading }),
      setIsAiTyping: (typing) => set({ isAiTyping: typing }),

      addMessage: (collectionId, message) =>
        set((state) => {
          const newMessage: PDFMessage = {
            ...message,
            id: Date.now().toString(),
            timestamp: Date.now(),
          }

          const updatedCollections = state.collections.map((collection) =>
            collection.id === collectionId
              ? {
                  ...collection,
                  chatHistory: [...collection.chatHistory, newMessage],
                }
              : collection,
          )

          const updatedCurrentCollection =
            state.currentCollection?.id === collectionId
              ? {
                  ...state.currentCollection,
                  chatHistory: [...state.currentCollection.chatHistory, newMessage],
                }
              : state.currentCollection

          return {
            collections: updatedCollections,
            currentCollection: updatedCurrentCollection,
          }
        }),

      clearChat: (collectionId) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === collectionId ? { ...collection, chatHistory: [] } : collection,
          ),
          currentCollection:
            state.currentCollection?.id === collectionId
              ? { ...state.currentCollection, chatHistory: [] }
              : state.currentCollection,
        })),

      addCollection: (collection) => {
        const newCollection: PDFCollection = {
          ...collection,
          id: `${collection.fileName.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uploadedAt: Date.now(),
          chatHistory: [],
        }

        set((state) => ({
          collections: [newCollection, ...state.collections],
          currentCollection: newCollection, // Set as current collection immediately
        }))

        return newCollection
      },

      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
          currentCollection: state.currentCollection?.id === id ? null : state.currentCollection,
        })),

      getCollection: (id) => {
        const state = get()
        return state.collections.find((c) => c.id === id)
      },

      ensureCollection: (id) => {
        const state = get()
        const collection = state.collections.find((c) => c.id === id)
        if (collection && state.currentCollection?.id !== id) {
          set({ currentCollection: collection })
        }
        return collection || null
      },

      updateCollection: (id, updates) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.id === id ? { ...collection, ...updates } : collection,
          ),
          currentCollection:
            state.currentCollection?.id === id ? { ...state.currentCollection, ...updates } : state.currentCollection,
        })),
    }),
    {
      name: "pdf-ai-store",
      partialize: (state) => ({
        collections: state.collections,
      }),
    },
  ),
)
