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
import { useEffect, useRef } from "react"
import {
    ActivityIndicator,
    Animated,
    Easing,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native"
import { ScrollView } from "react-native-gesture-handler"

export default function ForgotPasswordConfirmationScreen() {
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

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View style={styles.input}>
              <Text style={styles.emailText}>n.pelizari01@ufromail.cl</Text>
            </View>

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.resetButton}
                onPress={() => router.push("/verification-code")}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                <Text style={styles.resetButtonText}>Tengo mi codigo</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.infoText}>
              Si esa cuenta existe, hemos enviado un correo electrónico con un enlace para restablecer la contraseña. Si
              no lo recibes en unos minutos, por favor revisa tu carpeta de spam.
            </Text>

            <Text style={styles.infoText}>
              Si todavía tienes problemas para acceder a tu cuenta, por favor contacta al soporte al cliente y te
              ayudaremos.
            </Text>

            <TouchableOpacity onPress={() => router.push("/login")} style={styles.loginContainer}>
              <Text style={styles.loginLink}>Volver al inicio de sesión</Text>
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

        <Text style={styles.footerText}>
          Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus,
          metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.
        </Text>

        <Text style={styles.footerText}>
          Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque cursus,
          metus vitae pharetra auctor, sem massa mattis sem, at interdum magna augue eget diam.
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
    marginBottom: 24,
    justifyContent: "center",
  },
  emailText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginBottom: 24,
  },
  resetButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
  infoText: {
    color: "#5e616c",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  loginContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  loginLink: {
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
