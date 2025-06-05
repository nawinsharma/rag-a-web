import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export type WebsiteCollection = {
  id: string
  url: string
  name: string
  createdAt: number
  chatHistory: Message[]
}

interface WebsiteStore {
  // Current session
  collectionName: string | null
  currentUrl: string | null
  isProcessing: boolean
  isAiTyping: boolean

  // Collections history with their own chat histories
  collections: WebsiteCollection[]

  // Actions
  setCollectionName: (name: string) => void
  setCurrentUrl: (url: string) => void
  setIsProcessing: (processing: boolean) => void
  setIsAiTyping: (typing: boolean) => void
  addMessage: (message: Omit<Message, "id" | "timestamp">, collectionName: string) => void
  clearChat: (collectionName: string) => void
  addCollection: (collection: Omit<WebsiteCollection, "id" | "createdAt" | "chatHistory">) => void
  removeCollection: (id: string) => void
  resetSession: () => void
  getChatHistory: (collectionName: string) => Message[]
}

export const useWebsiteStore = create<WebsiteStore>()(
  persist(
    (set, get) => ({
      // Initial state
      collectionName: null,
      currentUrl: null,
      isProcessing: false,
      isAiTyping: false,
      collections: [],

      // Actions
      setCollectionName: (name) => set({ collectionName: name }),
      setCurrentUrl: (url) => set({ currentUrl: url }),
      setIsProcessing: (processing) => set({ isProcessing: processing }),
      setIsAiTyping: (typing) => set({ isAiTyping: typing }),

      addMessage: (message, collectionName) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.name === collectionName
              ? {
                  ...collection,
                  chatHistory: [
                    ...collection.chatHistory,
                    {
                      ...message,
                      id: Date.now().toString(),
                      timestamp: Date.now(),
                    },
                  ],
                }
              : collection
          ),
        })),

      clearChat: (collectionName) =>
        set((state) => ({
          collections: state.collections.map((collection) =>
            collection.name === collectionName
              ? { ...collection, chatHistory: [] }
              : collection
          ),
        })),

      addCollection: (collection) =>
        set((state) => ({
          collections: [
            {
              ...collection,
              id: Date.now().toString(),
              createdAt: Date.now(),
              chatHistory: [],
            },
            ...state.collections,
          ],
        })),

      removeCollection: (id) =>
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        })),

      resetSession: () =>
        set({
          collectionName: null,
          currentUrl: null,
          isProcessing: false,
          isAiTyping: false,
        }),

      getChatHistory: (collectionName) => {
        const collection = get().collections.find((c) => c.name === collectionName)
        return collection?.chatHistory || []
      },
    }),
    {
      name: "website-ai-store",
      partialize: (state) => ({
        collections: state.collections,
      }),
    },
  ),
)
