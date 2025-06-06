"use client"

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import Toast from "../../components/Toast"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("n.pelizari01@ufromail.cl")
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{
    visible: boolean
    message: string
    title?: string
    type: "success" | "error" | "info" | "warning"
  }>({
    visible: false,
    message: "",
    type: "success",
  })

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const buttonScale = new Animated.Value(1)

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }, [fadeAnim])

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
      </View>
    )
  }

  const showToast = (message: string, type: "success" | "error" | "info" | "warning", title?: string) => {
    setToast({ visible: true, message, type, title })
  }

  const handleResetPassword = async () => {
    try {
      setIsProcessing(true)
      console.log("Processing password reset for:", email)

      // Simulate checking if email exists
      const response = await fetch("http://localhost:3000/users")
      if (!response.ok) {
        throw new Error("Failed to check email")
      }

      const users = await response.json()
      const userExists = users.some((user: any) => user.email === email)

      if (userExists) {
        showToast("Se ha enviado un código de verificación a tu correo", "success", "Código enviado")

        // Delay navigation to show toast
        setTimeout(() => {
          router.push("/forgot-password-confirmation")
        }, 1500)
      } else {
        showToast("No se encontró una cuenta con ese correo electrónico", "error", "Email no encontrado")
      }
    } catch (error) {
      console.error("Error processing password reset:", error)
      showToast("Ocurrió un error al procesar la solicitud. Inténtalo de nuevo.", "error", "Error de conexión")
    } finally {
      setIsProcessing(false)
    }
  }

  // Button press animation
  const onPressIn = () => {
    if (!isProcessing) {
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }

  const onPressOut = () => {
    if (!isProcessing) {
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Toast
        visible={toast.visible}
        message={toast.message}
        title={toast.title}
        type={toast.type}
        onDismiss={() => setToast({ ...toast, visible: false })}
      />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperación de contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.description}>
              Ingresa tu correo electrónico y te enviaremos un código de verificación para restablecer tu contraseña.
            </Text>

            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isProcessing}
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.resetButton, isProcessing && styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.resetButtonText}>Recuperar Contraseña</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => router.back()} style={styles.goBackContainer} disabled={isProcessing}>
              <Text style={styles.goBackText}>Devolverse</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: "#5e616c",
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#5e616c",
    marginBottom: 8,
    fontFamily: "Poppins_500Medium",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },
  resetButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    minHeight: 56,
    justifyContent: "center",
  },
  resetButtonDisabled: {
    backgroundColor: "#b794e5",
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
  goBackContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  goBackText: {
    color: "#6c08dd",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
})
