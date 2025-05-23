"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { router } from "expo-router"
import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

interface User {
  id: string
  email: string
  username: string
  name: string
  nationality?: string
  location?: string
  profileImage?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: Partial<User>) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Storage key for user data
const USER_STORAGE_KEY = "tcg_browser_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in from AsyncStorage
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      console.log("Checking auth state...")
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY)
      if (userJson) {
        const userData = JSON.parse(userJson)
        console.log("Found existing user:", userData)
        setUser(userData)
      } else {
        console.log("No existing user found")
      }
    } catch (error) {
      console.error("Error checking auth state:", error)
    } finally {
      setIsLoading(false)
      console.log("Auth state check complete")
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      console.log("Starting login process...")

      // Here you would make an API call to your backend
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: "1",
        email,
        username: "user123",
        name: "Usuario TCG",
      }

      console.log("Saving user to AsyncStorage...")
      // Save user to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser))

      console.log("Setting user in state...")
      setUser(mockUser)

      console.log("Login successful, navigating to home...")
      // Navigate to home page
      router.replace("/")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: Partial<User>) => {
    try {
      setIsLoading(true)
      // Here you would make an API call to your backend
      // For now, we'll simulate a successful registration
      const mockUser: User = {
        id: "1",
        email: userData.email || "",
        username: userData.username || "",
        name: userData.name || "",
        nationality: userData.nationality,
        location: userData.location,
        profileImage: userData.profileImage,
      }

      // Save user to AsyncStorage
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser))
      setUser(mockUser)
      router.replace("/")
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      console.log("Logging out...")
      await AsyncStorage.removeItem(USER_STORAGE_KEY)
      setUser(null)
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true)
      // Here you would make an API call to your backend
      console.log("Password reset requested for:", email)
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthProvider
