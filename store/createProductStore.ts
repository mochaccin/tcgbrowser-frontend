import { create } from "zustand"

interface ProductImage {
  small?: string
  large?: string
  symbol?: string
  logo?: string
}

interface Product {
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

interface ProductStore {
  products: Product[]
  isLoading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  createProduct: (productData: Omit<Product, "_id">) => Promise<Product>
  searchProducts: (term: string) => Promise<Product[]>
  addProductToUserInventory: (userId: string, productId: string) => Promise<void>
}

// Replace with your actual backend URL
const API_BASE_URL = "http://localhost:3000"

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/products`)
      if (!response.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await response.json()
      set({ products: data, isLoading: false })
    } catch (error) {
      console.error("Error fetching products:", error)
      set({ error: error.message, isLoading: false })
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create product")
      }

      const newProduct = await response.json()

      // Add the new product to the store
      set((state) => ({
        products: [newProduct, ...state.products],
        isLoading: false,
      }))

      return newProduct
    } catch (error) {
      console.error("Error creating product:", error)
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  searchProducts: async (term: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search/${encodeURIComponent(term)}`)
      if (!response.ok) {
        throw new Error("Failed to search products")
      }
      return await response.json()
    } catch (error) {
      console.error("Error searching products:", error)
      return []
    }
  },

  addProductToUserInventory: async (userId: string, productId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/inventory/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add product to inventory")
      }

      return await response.json()
    } catch (error) {
      console.error("Error adding product to inventory:", error)
      throw error
    }
  },
}))
