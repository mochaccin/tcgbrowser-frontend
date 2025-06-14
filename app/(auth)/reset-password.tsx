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

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

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
    // Check if passwords match when both fields have values and meet minimum length
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword && password.length >= 8)
    } else {
      setPasswordsMatch(false)
    }
  }, [password, confirmPassword])

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
      </View>
    )
  }

  // 1. Modify the isFormValid check to properly update when passwords match
  const isFormValid = passwordsMatch && password && confirmPassword

  // 2. Update the handleResetPassword function to redirect to login
  const handleResetPassword = () => {
    // Implement password reset logic here
    console.log("Resetting password to:", password)
    // Navigate to login after successful reset
    router.replace("/(auth)/login")
  }

  // Button press animation
  const onPressIn = () => {
    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Restauración de contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Contraseña nueva</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#5e616c" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Repetir contraseña nueva</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name={showConfirmPassword ? "eye" : "eye-off"} size={20} color="#5e616c" />
              </TouchableOpacity>
            </View>

            {!passwordsMatch && password && confirmPassword && password === confirmPassword && (
              <Text style={styles.errorText}>La contraseña debe tener al menos 8 caracteres</Text>
            )}
            {!passwordsMatch && password && confirmPassword && password !== confirmPassword && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.resetButton, passwordsMatch ? styles.resetButtonActive : styles.resetButtonDisabled]}
                onPress={handleResetPassword}
                onPressIn={passwordsMatch ? onPressIn : undefined}
                onPressOut={passwordsMatch ? onPressOut : undefined}
                disabled={!passwordsMatch}
              >
                <Text style={styles.resetButtonText}>Restaurar Contraseña</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => router.push("/login")} style={styles.cancelContainer}>
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
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: "#5e616c",
    marginBottom: 8,
    fontFamily: "Poppins_500Medium",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  eyeIcon: {
    padding: 12,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -16,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  resetButton: {
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  resetButtonActive: {
    backgroundColor: "#6c08dd",
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
  cancelContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  cancelText: {
    color: "#6c08dd",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
  footer: {
    backgroundColor: "#222323",
    padding: 20,
    marginTop: 40,
    marginHorizontal: -20,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconButton: {
    marginHorizontal: 16,
  },
  footerText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  copyright: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  footerLink: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
  },
  footerLinkSeparator: {
    color: "white",
    marginHorizontal: 8,
  },
})
