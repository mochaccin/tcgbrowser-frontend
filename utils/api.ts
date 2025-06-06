// API utility functions for consistent error handling and configuration

const API_BASE_URL = "http://localhost:3000" // Replace with your actual backend URL

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new ApiError(response.status, errorData.message || `HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(0, "Network error or server unavailable")
  }
}

export const api = {
  // Products
  getProducts: () => apiRequest("/products"),
  createProduct: (data: any) => apiRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  searchProducts: (term: string) => apiRequest(`/products/search/${encodeURIComponent(term)}`),

  // Users
  getUser: (id: string) => apiRequest(`/users/${id}`),
  getUserInventory: (id: string) => apiRequest(`/users/${id}/inventory`),
  addProductToInventory: (userId: string, productId: string) =>
    apiRequest(`/users/${userId}/inventory/${productId}`, { method: "PATCH" }),
  removeProductFromInventory: (userId: string, productId: string) =>
    apiRequest(`/users/${userId}/inventory/${productId}`, { method: "DELETE" }),
}
