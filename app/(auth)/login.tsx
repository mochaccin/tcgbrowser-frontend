"use client"

import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts,
} from "@expo-google-fonts/poppins"
import { Feather } from "@expo/vector-icons"
import { Link, router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Animated,
    Easing,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"
import { useAuth } from "../context/AuthContext"

export default function LoginScreen() {
  const [email, setEmail] = useState("n.pelizari01@ufromail.cl")
  const [password, setPassword] = useState("panconqueso12345678")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const { login } = useAuth()

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

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true)
      console.log("Attempting login with:", email, password)

      // Call the login function from AuthContext
      await login(email, password)

      console.log("Login successful, should redirect now")
    } catch (error) {
      console.error("Login failed:", error)
      Alert.alert("Error", "No se pudo iniciar sesión. Por favor, intenta de nuevo.")
    } finally {
      setIsLoggingIn(false)
    }
  }

  // Button press animation
  const onPressIn = () => {
    if (!isLoggingIn) {
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }

  const onPressOut = () => {
    if (!isLoggingIn) {
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

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBorder}>
              <Text style={styles.logoTextPurple}>TCG</Text>
              <Text style={styles.logoTextBlack}>BROWSER</Text>
            </View>
          </View>

          {/* Login Form */}
          <Text style={styles.title}>Iniciar sesión en TCG Browser</Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoggingIn}
            />

            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isLoggingIn}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? "eye" : "eye-off"} size={20} color="#5e616c" />
              </Pressable>
            </View>

            <TouchableOpacity onPress={() => router.push("/forgot-password")} disabled={isLoggingIn}>
              <Text style={styles.forgotPassword}>¿Has olvidado tu contraseña?</Text>
            </TouchableOpacity>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.loginButton, isLoggingIn && styles.loginButtonDisabled]}
                onPress={handleLogin}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.infoText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </Text>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>¿No tienes una cuenta?</Text>
              <Link href="/register" asChild>
                <TouchableOpacity disabled={isLoggingIn}>
                  <Text style={styles.signupLink}>Crea una aquí</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  logoBorder: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#6c08dd",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  logoTextPurple: {
    color: "#6c08dd",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
  },
  logoTextBlack: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    fontFamily: "Poppins_700Bold",
  },
  formContainer: {
    width: "100%",
    marginBottom: 40,
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
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  passwordContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
  },
  eyeIcon: {
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  forgotPassword: {
    color: "#6c08dd",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Poppins_500Medium",
  },
  loginButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
    minHeight: 56,
    justifyContent: "center",
  },
  loginButtonDisabled: {
    backgroundColor: "#b794e5",
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
  infoText: {
    color: "#5e616c",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },
  signupContainer: {
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  signupLink: {
    color: "#6c08dd",
    fontSize: 16,
    textDecorationLine: "underline",
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
    flexWrap: "wrap",
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
