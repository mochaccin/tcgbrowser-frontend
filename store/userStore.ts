"use client"

// Store completo para manejar el usuario y collections con todas las funcionalidades

// Interfaces que coinciden con tu schema real
export interface CollectionItem {
  product_id: string
  date_added: string
}

export interface Collection {
  _id?: string
  name: string
  img_url?: string
  card_count?: number
  is_favorite?: boolean
  cards: CollectionItem[]
  createdBy: string
  createdAt?: string
}

// Estado del store
interface UserState {
  currentUser: {
    _id: string
    username: string
    name: string
    email: string
  }
  collections: Collection[]
  loading: boolean
  error: string | null
}

// Estado inicial con tu usuario real
const initialState: UserState = {
  currentUser: {
    _id: "6841145ce0bf7aed1bbed7a1", // Tu ID real
    username: "chaol",
    name: "asdasd",
    email: "asdasd@gmail.com",
  },
  collections: [],
  loading: false,
  error: null,
}

// URLs de imágenes predefinidas para las collections
export const PREDEFINED_COLLECTION_IMAGES = [
  {
    id: "1",
    uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdDXn-0lG1ym-zHe1EDJ5LF4pecZO3-wcoug&s",
  },
  {
    id: "2",
    uri: "https://external-preview.redd.it/try-not-to-get-scared-scariest-story-v0-YWR1anRyNjRjOThlMf4z2bnUq8P2iC1lfjLTEFdB7_ANdLqBbvP29enC4VT8.png?format=pjpg&auto=webp&s=dcef1c37221e4dd3b676ebded0f4647b90132975",
  },
  {
    id: "3",
    uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx-0Ms3nL3NKtHMc9eEJ6ILG1krpG32zIgAc_ivammtmdsmvnaBttxqCrdUW6icBLRvr0&usqp=CAU",
  },
  {
    id: "4",
    uri: "https://media3.giphy.com/media/xT1z8Fz2YP7Tcc5Nwa/giphy_s.gif?cid=6c09b952fd0cb3c7wjwkim49spwex1zlke17gmgj7ukrjb5j&ep=v1_gifs_search&rid=giphy_s.gif&ct=g",
  },
  {
    id: "5",
    uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdDXn-0lG1ym-zHe1EDJ5LF4pecZO3-wcoug&s",
  },
  {
    id: "6",
    uri: "https://external-preview.redd.it/try-not-to-get-scared-scariest-story-v0-YWR1anRyNjRjOThlMf4z2bnUq8P2iC1lfjLTEFdB7_ANdLqBbvP29enC4VT8.png?format=pjpg&auto=webp&s=dcef1c37221e4dd3b676ebded0f4647b90132975",
  },
  {
    id: "7",
    uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx-0Ms3nL3NKtHMc9eEJ6ILG1krpG32zIgAc_ivammtmdsmvnaBttxqCrdUW6icBLRvr0&usqp=CAU",
  },
  {
    id: "8",
    uri: "https://media3.giphy.com/media/xT1z8Fz2YP7Tcc5Nwa/giphy_s.gif?cid=6c09b952fd0cb3c7wjwkim49spwex1zlke17gmgj7ukrjb5j&ep=v1_gifs_search&rid=giphy_s.gif&ct=g",
  },
]

// Store centralizado
class UserStore {
  private state: UserState = { ...initialState }
  private listeners: Array<() => void> = []

  // Obtener el estado completo
  getState(): UserState {
    return { ...this.state }
  }

  // Obtener el usuario actual
  getCurrentUser() {
    return { ...this.state.currentUser }
  }

  // Obtener el ID del usuario actual
  getCurrentUserId(): string {
    return this.state.currentUser._id
  }

  // Obtener todas las collections
  getCollections(): Collection[] {
    return [...this.state.collections]
  }

  // Obtener una collection por ID
  getCollectionById(collectionId: string): Collection | undefined {
    return this.state.collections.find((c) => c._id === collectionId)
  }

  // Cargar las collections del usuario
  async loadUserCollections(): Promise<void> {
    try {
      this.setLoading(true)
      this.setError(null)

      const userId = this.getCurrentUserId()
      console.log(`🔍 STORE: Cargando collections para usuario: ${userId}`)

      // Llamada a tu endpoint real
      const url = `http://localhost:3000/collections/user/${userId}`
      console.log(`🌐 STORE: URL: ${url}`)

      const response = await fetch(url)

      console.log(`📡 STORE: Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const collections: Collection[] = await response.json()

      console.log(`📊 STORE: Collections recibidas:`, {
        total: collections.length,
        collections: collections.map((c, index) => ({
          index,
          _id: c._id,
          name: c.name,
          createdBy: c.createdBy,
          card_count: c.card_count,
          is_favorite: c.is_favorite,
        })),
      })

      // Actualizar el estado
      this.state.collections = collections
      console.log(`✅ STORE: Estado actualizado con ${collections.length} collections`)

      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar collections"
      this.setError(errorMsg)
      console.error("❌ STORE: Error cargando collections:", err)
    } finally {
      this.setLoading(false)
    }
  }

  // Crear una nueva collection
  async createCollection(name: string, img_url: string): Promise<Collection> {
    try {
      this.setLoading(true)
      this.setError(null)

      // Crear el DTO según tu backend
      const collectionData = {
        name: name.trim(),
        img_url,
        card_count: 0,
        is_favorite: false,
        createdBy: this.getCurrentUserId(),
        cards: [],
      }

      console.log("🚀 STORE: Creando collection:", collectionData)

      // Llamada real a tu API
      const response = await fetch("http://localhost:3000/collections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(collectionData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const newCollection: Collection = await response.json()
      console.log("✅ STORE: Collection creada:", newCollection)

      // Actualizar el estado con la nueva collection
      this.state.collections = [...this.state.collections, newCollection]
      this.notifyListeners()

      return newCollection
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al crear collection"
      this.setError(errorMsg)
      console.error("❌ STORE: Error creando collection:", err)
      throw new Error(errorMsg)
    } finally {
      this.setLoading(false)
    }
  }

  // Marcar/desmarcar collection como favorita
  async toggleFavorite(collectionId: string): Promise<void> {
    try {
      console.log(`🌟 STORE: Toggling favorite para collection: ${collectionId}`)

      // Llamada a tu endpoint para toggle favorite
      const response = await fetch(`http://localhost:3000/collections/${collectionId}/toggle-favorite`, {
        method: "PATCH",
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const updatedCollection: Collection = await response.json()
      console.log(`✅ STORE: Favorito toggled para collection ${collectionId}:`, updatedCollection.is_favorite)

      // Actualizar el estado
      this.state.collections = this.state.collections.map((c) => (c._id === collectionId ? updatedCollection : c))

      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al actualizar favorito"
      this.setError(errorMsg)
      console.error("❌ STORE: Error toggling favorito:", err)
      throw new Error(errorMsg)
    }
  }

  // Eliminar collection
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      console.log(`🗑️ STORE: Eliminando collection: ${collectionId}`)

      // Llamada a tu endpoint para eliminar collection
      const response = await fetch(`http://localhost:3000/collections/${collectionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      console.log(`✅ STORE: Collection ${collectionId} eliminada`)

      // Actualizar el estado
      this.state.collections = this.state.collections.filter((c) => c._id !== collectionId)
      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al eliminar collection"
      this.setError(errorMsg)
      console.error("❌ STORE: Error eliminando collection:", err)
      throw new Error(errorMsg)
    }
  }

  // Agregar carta a collection
  async addCardToCollection(collectionId: string, cardId: string): Promise<void> {
    try {
      console.log(`➕ STORE: Agregando carta ${cardId} a collection ${collectionId}`)

      // Llamada a tu endpoint para agregar carta
      const response = await fetch(`http://localhost:3000/collections/${collectionId}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const updatedCollection: Collection = await response.json()
      console.log(`✅ STORE: Carta ${cardId} agregada. Nuevo card_count: ${updatedCollection.card_count}`)

      // Actualizar el estado
      this.state.collections = this.state.collections.map((c) => (c._id === collectionId ? updatedCollection : c))

      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al agregar carta"
      this.setError(errorMsg)
      console.error("❌ STORE: Error agregando carta:", err)
      throw new Error(errorMsg)
    }
  }

  // Remover carta de collection
  async removeCardFromCollection(collectionId: string, cardId: string): Promise<void> {
    try {
      console.log(`➖ STORE: Removiendo carta ${cardId} de collection ${collectionId}`)

      // Llamada a tu endpoint para remover carta
      const response = await fetch(`http://localhost:3000/collections/${collectionId}/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const updatedCollection: Collection = await response.json()
      console.log(`✅ STORE: Carta ${cardId} removida. Nuevo card_count: ${updatedCollection.card_count}`)

      // Actualizar el estado
      this.state.collections = this.state.collections.map((c) => (c._id === collectionId ? updatedCollection : c))

      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al remover carta"
      this.setError(errorMsg)
      console.error("❌ STORE: Error removiendo carta:", err)
      throw new Error(errorMsg)
    }
  }

  // Verificar si una carta está en una collection
  async isCardInCollection(collectionId: string, cardId: string): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:3000/collections/${collectionId}/contains/${cardId}`)

      if (!response.ok) {
        console.error("❌ STORE: Error checking card in collection")
        return false
      }

      const result = await response.json()
      return result.contains || false
    } catch (err) {
      console.error("❌ STORE: Error checking card in collection:", err)
      return false
    }
  }

  // Actualizar estado de loading
  setLoading(loading: boolean): void {
    this.state.loading = loading
    this.notifyListeners()
  }

  // Actualizar mensaje de error
  setError(error: string | null): void {
    this.state.error = error
    this.notifyListeners()
  }

  // Suscribirse a cambios del store
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // Notificar a los listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener())
  }

  // Debug: mostrar estado actual
  debug(): void {
    console.log("🔍 UserStore State:", {
      currentUser: this.state.currentUser,
      collectionsCount: this.state.collections.length,
      collections: this.state.collections.map((c) => ({
        _id: c._id,
        name: c.name,
        cardCount: c.card_count,
        createdBy: c.createdBy,
        is_favorite: c.is_favorite,
        cards_length: c.cards?.length || 0,
      })),
      loading: this.state.loading,
      error: this.state.error,
    })
  }
}

// Instancia singleton del store
export const userStore = new UserStore()

// Hook para usar el store en React
import { useState, useEffect } from "react"

export const useUserStore = () => {
  const [state, setState] = useState(userStore.getState())

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setState(userStore.getState())
    })

    return unsubscribe
  }, [])

  return {
    currentUser: state.currentUser,
    collections: state.collections,
    loading: state.loading,
    error: state.error,
    loadUserCollections: () => userStore.loadUserCollections(),
    createCollection: (name: string, img_url: string) => userStore.createCollection(name, img_url),
    toggleFavorite: (collectionId: string) => userStore.toggleFavorite(collectionId),
    deleteCollection: (collectionId: string) => userStore.deleteCollection(collectionId),
    addCardToCollection: (collectionId: string, cardId: string) => userStore.addCardToCollection(collectionId, cardId),
    removeCardFromCollection: (collectionId: string, cardId: string) =>
      userStore.removeCardFromCollection(collectionId, cardId),
    isCardInCollection: (collectionId: string, cardId: string) => userStore.isCardInCollection(collectionId, cardId),
    getCollectionById: (collectionId: string) => userStore.getCollectionById(collectionId),
    debug: () => userStore.debug(),
  }
}
