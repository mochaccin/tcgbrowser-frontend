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
import { useAuth } from "../context/AuthContext"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("n.pelizari01@ufromail.cl")
  const { resetPassword } = useAuth()

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

  const handleResetPassword = async () => {
    try {
      await resetPassword(email)
      // Navigate to the confirmation screen
      router.push("/forgot-password-confirmation")
    } catch (error) {
      console.error("Error resetting password:", error)
      // Handle error (show alert, etc.)
    }
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
          <Text style={styles.headerTitle}>Recuperación de contraseña</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                <Text style={styles.resetButtonText}>Recuperar Contraseña</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity onPress={() => router.back()} style={styles.goBackContainer}>
              <Text style={styles.goBackText}>Devolverse</Text>
            </TouchableOpacity>
          </View>

          {/* Footer - only shows when scrolled to bottom */}
          <View style={styles.footer}>
            <View style={styles.socialIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="facebook" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="instagram" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="twitter" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="help-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed
              erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
            </Text>

            <Text style={styles.copyright}>© 2025 Lorem Ipsum Company. Todos los derechos reservados.</Text>

            <Text style={styles.footerText}>
              Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque
              cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.
            </Text>

            <Text style={styles.footerText}>
              Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque
              cursus, metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.
            </Text>

            <View style={styles.footerLinks}>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Política de Privacidad</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkSeparator}>|</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Términos de Servicio</Text>
              </TouchableOpacity>
              <Text style={styles.footerLinkSeparator}>|</Text>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Accesibilidad</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity>
              <Text style={styles.footerText}>No vender ni compartir mi información personal</Text>
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
