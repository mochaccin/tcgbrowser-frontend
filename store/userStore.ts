"use client"

// Store completo para manejar el usuario, collections e inventory con todas las funcionalidades

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

// Interfaces para inventory
export interface ProductImage {
  small?: string
  large?: string
  symbol?: string
  logo?: string
}

export interface Product {
  _id: string
  name: string
  product_type: string
  description?: string
  tcg_id?: string
  supertype?: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  rarity?: string
  set?: {
    id: string
    name: string
    series?: string
    printedTotal?: number
    total?: number
    releaseDate?: string
    images?: ProductImage
  }
  number?: string
  artist?: string
  images?: ProductImage
  stock_quantity: number
  price: number
  cost_price?: number
  is_available?: boolean
  condition?: string
  language?: string
  tags?: string[]
  notes?: string
  abilities?: {
    name: string
    text: string
    type: string
  }[]
  attacks?: {
    name: string
    cost?: string[]
    convertedEnergyCost?: number
    damage?: string
    text?: string
  }[]
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
  inventory: Product[]
  loading: boolean
  error: string | null
  inventoryLoading: boolean
  inventoryError: string | null
  isAuthenticated: boolean
}

// Estado inicial con usuario vacío
const initialState: UserState = {
  currentUser: {
    _id: "",
    username: "",
    name: "",
    email: "",
  },
  collections: [],
  inventory: [],
  loading: false,
  error: null,
  inventoryLoading: false,
  inventoryError: null,
  isAuthenticated: false,
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

  constructor() {
    // Check for existing session on initialization
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("auth_token")
      const userId = sessionStorage.getItem("user_id")

      if (token && userId) {
        this.checkExistingSession(userId)
      }
    }
  }

  // Check if there's an existing session and restore user data
  private async checkExistingSession(userId: string) {
    try {
      const response = await fetch(`http://localhost:3000/users/${userId}`)
      if (response.ok) {
        const userData = await response.json()
        this.state.currentUser = {
          _id: userData._id,
          username: userData.username,
          name: userData.name,
          email: userData.email,
        }
        this.state.isAuthenticated = true
        this.notifyListeners()
      } else {
        // Invalid session, clear storage
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth_token")
          sessionStorage.removeItem("user_id")
        }
      }
    } catch (error) {
      console.error("Failed to restore session:", error)
      // Clear invalid session data
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_token")
        sessionStorage.removeItem("user_id")
      }
    }
  }

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

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.state.isAuthenticated
  }

  // Obtener todas las collections
  getCollections(): Collection[] {
    return [...this.state.collections]
  }

  // Obtener una collection por ID
  getCollectionById(collectionId: string): Collection | undefined {
    return this.state.collections.find((c) => c._id === collectionId)
  }

  // Obtener inventory
  getInventory(): Product[] {
    return [...this.state.inventory]
  }

  // Obtener un producto del inventory por ID
  getInventoryProductById(productId: string): Product | undefined {
    return this.state.inventory.find((p) => p._id === productId)
  }

  // Authentication methods
  async login(email: string, password: string): Promise<void> {
    try {
      console.log("🔐 STORE: Attempting login with:", email)

      // Get all users and find matching credentials
      const response = await fetch("http://localhost:3000/users")
      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const users = await response.json()
      const user = users.find((u: any) => u.email === email && u.password === password)

      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Update current user in store
      this.state.currentUser = {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      }

      // Set authenticated state
      this.state.isAuthenticated = true

      // Generate JWT-like token
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      const payload = btoa(
        JSON.stringify({
          sub: user._id,
          email: user.email,
          username: user.username,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        }),
      )
      const signature = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36))
      const token = `${header}.${payload}.${signature}`

      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_token", token)
        sessionStorage.setItem("user_id", user._id)
      }

      console.log("✅ STORE: Login successful for user:", user.username)
      this.notifyListeners()
    } catch (error) {
      console.error("❌ STORE: Login failed:", error)
      throw error
    }
  }

  async register(userData: {
    username: string
    name: string
    email: string
    password: string
    nationality?: string
    location?: string
    img_url?: string
  }): Promise<void> {
    try {
      console.log("📝 STORE: Attempting registration:", userData.username)

      const response = await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Registration failed")
      }

      const newUser = await response.json()

      // Update current user in store
      this.state.currentUser = {
        _id: newUser._id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
      }

      // Set authenticated state
      this.state.isAuthenticated = true

      // Generate JWT-like token
      const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
      const payload = btoa(
        JSON.stringify({
          sub: newUser._id,
          email: newUser.email,
          username: newUser.username,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
        }),
      )
      const signature = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36))
      const token = `${header}.${payload}.${signature}`

      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_token", token)
        sessionStorage.setItem("user_id", newUser._id)
      }

      console.log("✅ STORE: Registration successful for user:", newUser.username)
      this.notifyListeners()
    } catch (error) {
      console.error("❌ STORE: Registration failed:", error)
      throw error
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      console.log("🔑 STORE: Updating password for user:", userId)

      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Password update failed")
      }

      console.log("✅ STORE: Password updated successfully")
    } catch (error) {
      console.error("❌ STORE: Password update failed:", error)
      throw error
    }
  }

  async updateUser(userData: {
    username?: string
    name?: string
    email?: string
    nationality?: string
    location?: string
    img_url?: string
  }): Promise<void> {
    try {
      console.log("📝 STORE: Updating user data:", userData)

      const userId = this.getCurrentUserId()
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "User update failed")
      }

      const updatedUser = await response.json()

      // Update current user in store
      this.state.currentUser = {
        _id: updatedUser._id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
      }

      console.log("✅ STORE: User updated successfully")
      this.notifyListeners()
    } catch (error) {
      console.error("❌ STORE: User update failed:", error)
      throw error
    }
  }

  logout(): void {
    this.state.currentUser = {
      _id: "",
      username: "",
      name: "",
      email: "",
    }
    this.state.isAuthenticated = false
    this.state.collections = []
    this.state.inventory = []

    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auth_token")
      sessionStorage.removeItem("user_id")
    }

    console.log("🚪 STORE: User logged out")
    this.notifyListeners()
  }

  // ==================== COLLECTIONS METHODS ====================

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

  // ==================== INVENTORY METHODS ====================

  // Cargar el inventory del usuario
  async loadUserInventory(): Promise<void> {
    try {
      this.setInventoryLoading(true)
      this.setInventoryError(null)

      const userId = this.getCurrentUserId()
      console.log(`🎒 STORE: Cargando inventory para usuario: ${userId}`)

      const url = `http://localhost:3000/users/${userId}/inventory`
      console.log(`🌐 STORE: Inventory URL: ${url}`)

      const response = await fetch(url)

      console.log(`📡 STORE: Inventory response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const inventoryData = await response.json()
      const inventory: Product[] = inventoryData.inventory || []

      console.log(`📦 STORE: Inventory recibido:`, {
        total: inventory.length,
        products: inventory.map((p, index) => ({
          index,
          _id: p._id,
          name: p.name,
          product_type: p.product_type,
          price: p.price,
          condition: p.condition,
        })),
      })

      // Actualizar el estado
      this.state.inventory = inventory
      console.log(`✅ STORE: Inventory actualizado con ${inventory.length} productos`)

      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar inventory"
      this.setInventoryError(errorMsg)
      console.error("❌ STORE: Error cargando inventory:", err)
    } finally {
      this.setInventoryLoading(false)
    }
  }

  // Agregar producto al inventory
  async addProductToInventory(productId: string): Promise<void> {
    try {
      console.log(`➕ STORE: Agregando producto ${productId} al inventory`)

      const userId = this.getCurrentUserId()
      const response = await fetch(`http://localhost:3000/users/${userId}/inventory/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      console.log(`✅ STORE: Producto ${productId} agregado al inventory`)

      // Recargar el inventory para obtener los datos actualizados
      await this.loadUserInventory()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al agregar producto al inventory"
      this.setInventoryError(errorMsg)
      console.error("❌ STORE: Error agregando producto al inventory:", err)
      throw new Error(errorMsg)
    }
  }

  // Remover producto del inventory
  async removeProductFromInventory(productId: string): Promise<void> {
    try {
      console.log(`➖ STORE: Removiendo producto ${productId} del inventory`)

      const userId = this.getCurrentUserId()
      const url = `http://localhost:3000/users/${userId}/inventory/${productId}`

      console.log(`🌐 STORE: DELETE URL: ${url}`)

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`📡 STORE: DELETE response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.text()
        console.error("❌ STORE: Error response:", errorData)
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      console.log(`✅ STORE: Producto ${productId} removido del inventory`)

      // Update the state locally by removing the product
      this.state.inventory = this.state.inventory.filter((p) => p._id !== productId)
      this.notifyListeners()
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al remover producto del inventory"
      this.setInventoryError(errorMsg)
      console.error("❌ STORE: Error removiendo producto del inventory:", err)
      throw new Error(errorMsg)
    }
  }

  // Verificar si un producto está en el inventory
  isProductInInventory(productId: string): boolean {
    return this.state.inventory.some((p) => p._id === productId)
  }

  // Obtener productos del inventory por tipo
  getInventoryByType(productType: string): Product[] {
    return this.state.inventory.filter((p) => p.product_type === productType)
  }

  // Obtener productos del inventory disponibles para venta
  getInventoryForSale(): Product[] {
    return this.state.inventory.filter((p) => p.is_available === true)
  }

  // Obtener estadísticas del inventory
  getInventoryStats() {
    const inventory = this.state.inventory
    const totalProducts = inventory.length
    const forSale = inventory.filter((p) => p.is_available).length
    const totalValue = inventory.reduce((sum, p) => sum + p.price, 0)

    const byType = inventory.reduce(
      (acc, p) => {
        acc[p.product_type] = (acc[p.product_type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byCondition = inventory.reduce(
      (acc, p) => {
        const condition = p.condition || "Unknown"
        acc[condition] = (acc[condition] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalProducts,
      forSale,
      totalValue,
      byType,
      byCondition,
    }
  }

  // ==================== STATE MANAGEMENT ====================

  // Actualizar estado de loading para collections
  setLoading(loading: boolean): void {
    this.state.loading = loading
    this.notifyListeners()
  }

  // Actualizar mensaje de error para collections
  setError(error: string | null): void {
    this.state.error = error
    this.notifyListeners()
  }

  // Actualizar estado de loading para inventory
  setInventoryLoading(loading: boolean): void {
    this.state.inventoryLoading = loading
    this.notifyListeners()
  }

  // Actualizar mensaje de error para inventory
  setInventoryError(error: string | null): void {
    this.state.inventoryError = error
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
      isAuthenticated: this.state.isAuthenticated,
      collectionsCount: this.state.collections.length,
      collections: this.state.collections.map((c) => ({
        _id: c._id,
        name: c.name,
        cardCount: c.card_count,
        createdBy: c.createdBy,
        is_favorite: c.is_favorite,
        cards_length: c.cards?.length || 0,
      })),
      inventoryCount: this.state.inventory.length,
      inventory: this.state.inventory.map((p) => ({
        _id: p._id,
        name: p.name,
        product_type: p.product_type,
        price: p.price,
        condition: p.condition,
        is_available: p.is_available,
      })),
      loading: this.state.loading,
      error: this.state.error,
      inventoryLoading: this.state.inventoryLoading,
      inventoryError: this.state.inventoryError,
    })
  }
}

// Instancia singleton del store
export const userStore = new UserStore()

// Hook para usar el store en React
import { useEffect, useState } from "react"

export const useUserStore = () => {
  const [state, setState] = useState(userStore.getState())

  useEffect(() => {
    const unsubscribe = userStore.subscribe(() => {
      setState(userStore.getState())
    })

    return unsubscribe
  }, [])

  return {
    // User data
    currentUser: state.currentUser,
    isAuthenticated: state.isAuthenticated,
    getCurrentUserId: () => userStore.getCurrentUserId(),

    // Collections
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

    // Inventory
    inventory: state.inventory,
    inventoryLoading: state.inventoryLoading,
    inventoryError: state.inventoryError,
    loadUserInventory: () => userStore.loadUserInventory(),
    addProductToInventory: (productId: string) => userStore.addProductToInventory(productId),
    removeProductFromInventory: (productId: string) => userStore.removeProductFromInventory(productId),
    isProductInInventory: (productId: string) => userStore.isProductInInventory(productId),
    getInventoryProductById: (productId: string) => userStore.getInventoryProductById(productId),
    getInventoryByType: (productType: string) => userStore.getInventoryByType(productType),
    getInventoryForSale: () => userStore.getInventoryForSale(),
    getInventoryStats: () => userStore.getInventoryStats(),

    // Authentication
    login: (email: string, password: string) => userStore.login(email, password),
    register: (userData: any) => userStore.register(userData),
    updateUser: (userData: any) => userStore.updateUser(userData),
    updatePassword: (userId: string, newPassword: string) => userStore.updatePassword(userId, newPassword),
    logout: () => userStore.logout(),

    // Debug
    debug: () => userStore.debug(),
  }
}
