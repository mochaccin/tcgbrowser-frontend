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

export default function VerificationCodeScreen() {
  const [code, setCode] = useState("")
  const [isCodeComplete, setIsCodeComplete] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
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

  useEffect(() => {
    // Check if code is complete (6 digits)
    setIsCodeComplete(code.length === 6)
  }, [code])

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

  const handleVerifyCode = async () => {
    try {
      setIsVerifying(true)
      console.log("Verifying code:", code)

      // Simulate code verification (in real app, this would verify against backend)
      if (code === "123456") {
        showToast("Código verificado correctamente", "success", "¡Código válido!")

        // Delay navigation to show toast
        setTimeout(() => {
          router.push({
            pathname: "/reset-password",
            params: { userId: "6841145ce0bf7aed1bbed7a1" }, // Your user ID
          })
        }, 1500)
      } else {
        showToast("Código de verificación incorrecto. Inténtalo de nuevo.", "error", "Código inválido")
      }
    } catch (error) {
      console.error("Error verifying code:", error)
      showToast("Ocurrió un error al verificar el código. Inténtalo de nuevo.", "error", "Error de verificación")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = () => {
    showToast("Se ha enviado un nuevo código a tu correo electrónico", "info", "Código reenviado")
    setCode("")
  }

  // Button press animation
  const onPressIn = () => {
    if (!isVerifying && isCodeComplete) {
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }

  const onPressOut = () => {
    if (!isVerifying && isCodeComplete) {
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
          <Text style={styles.headerTitle}>Verificación de código</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Ingresa el código de verificación</Text>
            <Text style={styles.description}>
              Hemos enviado un código de verificación a tu correo electrónico. Por favor, ingrésalo a continuación.
            </Text>
            <Text style={styles.hint}>(Para esta demo, usa el código: 123456)</Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Código de 6 dígitos"
                placeholderTextColor="#999"
                editable={!isVerifying}
              />
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.verifyButton, (!isCodeComplete || isVerifying) && styles.verifyButtonDisabled]}
                onPress={handleVerifyCode}
                onPressIn={isCodeComplete ? onPressIn : undefined}
                onPressOut={isCodeComplete ? onPressOut : undefined}
                disabled={!isCodeComplete || isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verificar código</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.resendContainer} onPress={handleResendCode} disabled={isVerifying}>
              <Text style={styles.resendText}>¿No recibiste el código? </Text>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.cancelContainer}
              disabled={isVerifying}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#5e616c",
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  hint: {
    fontSize: 14,
    color: "#6c08dd",
    marginBottom: 24,
    fontFamily: "Poppins_500Medium",
    textAlign: "center",
    fontStyle: "italic",
  },
  codeInputContainer: {
    marginBottom: 24,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    letterSpacing: 8,
  },
  verifyButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    minHeight: 56,
    justifyContent: "center",
  },
  verifyButtonDisabled: {
    backgroundColor: "#b794e5",
  },
  verifyButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  resendText: {
    fontSize: 14,
    color: "#5e616c",
    fontFamily: "Poppins_400Regular",
  },
  resendLink: {
    fontSize: 14,
    color: "#6c08dd",
    fontFamily: "Poppins_500Medium",
  },
  cancelContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    color: "#6c08dd",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
})
