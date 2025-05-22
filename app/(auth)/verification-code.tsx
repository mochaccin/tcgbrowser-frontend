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

export default function VerificationCodeScreen() {
  const [code, setCode] = useState("")
  const [isCodeComplete, setIsCodeComplete] = useState(false)

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

  const handleVerifyCode = () => {
    // Implement code verification logic here
    console.log("Verifying code:", code)
    // Navigate to reset password screen
    router.push("/reset-password")
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
          <Text style={styles.headerTitle}>Verificación de código</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Ingresa el código de verificación</Text>
            <Text style={styles.description}>
              Hemos enviado un código de verificación a tu correo electrónico. Por favor, ingrésalo a continuación.
            </Text>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                placeholder="Código de 6 dígitos"
                placeholderTextColor="#999"
              />
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.verifyButton, !isCodeComplete && styles.verifyButtonDisabled]}
                onPress={handleVerifyCode}
                onPressIn={isCodeComplete ? onPressIn : undefined}
                onPressOut={isCodeComplete ? onPressOut : undefined}
                disabled={!isCodeComplete}
              >
                <Text style={styles.verifyButtonText}>Verificar código</Text>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity style={styles.resendContainer}>
              <Text style={styles.resendText}>¿No recibiste el código? </Text>
              <Text style={styles.resendLink}>Reenviar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/login")} style={styles.cancelContainer}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Footer */}
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
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat
          molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim.
        </Text>

        <Text style={styles.copyright}>© 2025 Lorem Ipsum Company. Todos los derechos reservados.</Text>

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
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
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
  footer: {
    backgroundColor: "#222323",
    padding: 20,
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
