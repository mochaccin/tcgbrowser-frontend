"use client"

import { router } from "expo-router"
import { useEffect } from "react"
import { ActivityIndicator, StyleSheet, Text, View } from "react-native"
import { useAuth } from "./context/AuthContext"

export default function IndexScreen() {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // User is authenticated, stay on home
        // This is the home screen
      } else {
        // User is not authenticated, navigate to login
        router.replace("/(auth)/login")
      }
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6c08dd" />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6c08dd" />
      </View>
    )
  }

  // This is your main app home screen
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TCG Browser!</Text>
      <Text style={styles.subtitle}>You are logged in as {user.name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#5e616c",
  },
})
