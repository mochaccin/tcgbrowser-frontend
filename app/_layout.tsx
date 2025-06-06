"use client"
import { Stack, usePathname, useRouter } from "expo-router"
import { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"
import BottomNavigation from "../components/bottom-navigation"
import { useUserStore } from "../store/userStore"

export default function UserLayout() {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useUserStore()
  const [isMounted, setIsMounted] = useState(false)

  // Mark component as mounted after first render
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check authentication on mount and redirect if needed
  useEffect(() => {
    // Only run navigation after component is mounted
    if (!isMounted) return

    const authRoutes = [
      "/login",
      "/register",
      "/reset-password",
      "/verification-code",
      "/forgot-password",
      "/forgot-password-confirmation",
    ]
    const isAuthRoute = authRoutes.some((route) => pathname.includes(route))

    // If not authenticated and not on an auth route, redirect to login
    if (!isAuthenticated && !isAuthRoute) {
      console.log("🔒 Not authenticated, redirecting to login")
      router.replace("/login")
    }

    // If authenticated and on an auth route, redirect to home
    if (isAuthenticated && isAuthRoute) {
      console.log("🔓 Already authenticated, redirecting to home")
      router.replace("/")
    }
  }, [isAuthenticated, pathname, isMounted, router])

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (pathname.includes("/profile")) return "profile"
    if (pathname.includes("/inventory")) return "inventory"
    if (pathname.includes("/search-results") || pathname.includes("/product-browser")) return "search"
    return "home"
  }

  const handleTabPress = (tab: "home" | "profile" | "search" | "inventory") => {
    switch (tab) {
      case "home":
        router.push("/")
        break
      case "profile":
        router.push("/profile") // Navigate to inventory for profile
        break
      case "search":
        router.push("/product-browser") // Navigate to product browser
        break
      case "inventory":
        router.push("/inventory")
        break
    }
  }

  // Routes that should hide the bottom navigation
  const hideBottomNavRoutes = [
    "/login",
    "/register",
    "/reset-password",
    "/verification-code",
    "/forgot-password",
    "/forgot-password-confirmation",
  ]

  const shouldHideBottomNav = hideBottomNavRoutes.some((route) => pathname.includes(route))

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="inventory" options={{ headerShown: false }} />
        <Stack.Screen name="my-collections" options={{ headerShown: false }} />
        <Stack.Screen name="product-browser" options={{ headerShown: false }} />
        <Stack.Screen name="search-results" options={{ headerShown: false }} />
        <Stack.Screen name="add-card" options={{ headerShown: false }} />
        <Stack.Screen name="collection-detail" options={{ headerShown: false }} />
        <Stack.Screen name="product-detail" options={{ headerShown: false }} />
        <Stack.Screen name="add-collection" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="reset-password" options={{ headerShown: false }} />
        <Stack.Screen name="verification-code" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password-confirmation" options={{ headerShown: false }} />
      </Stack>

      {!shouldHideBottomNav && isAuthenticated && (
        <BottomNavigation activeTab={getActiveTab()} onTabPress={handleTabPress} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
})
