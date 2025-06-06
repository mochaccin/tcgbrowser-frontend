"use client"

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { Link, router } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
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
import { useUserStore } from "../../store/userStore"

export default function RegisterScreen() {
  const [username, setUsername] = useState("Jota")
  const [name, setName] = useState("Joaquin Escanilla Arauco")
  const [email, setEmail] = useState("joaquin@example.com")
  const [password, setPassword] = useState("password123")
  const [nationality, setNationality] = useState("Chileno")
  const [location, setLocation] = useState("Licán Ray")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)
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

  const { register } = useUserStore()

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

  const handleRegister = async () => {
    try {
      setIsRegistering(true)
      console.log("Attempting registration:", username, name, email)

      // Validate required fields
      if (!username.trim() || !name.trim() || !email.trim() || !password.trim()) {
        showToast("Por favor, completa todos los campos requeridos.", "error", "Campos incompletos")
        return
      }

      // Call the register function from user store
      await register({
        username: username.trim(),
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        nationality: nationality.trim() || undefined,
        location: location.trim() || undefined,
        img_url: profileImage || undefined,
      })

      showToast("Cuenta creada exitosamente. ¡Bienvenido a TCG Browser!", "success", "¡Registro exitoso!")

      // Delay navigation to show toast
      setTimeout(() => {
        router.replace("/")
      }, 1500)
    } catch (error) {
      console.error("Registration failed:", error)
      showToast(
        error instanceof Error ? error.message : "No se pudo crear la cuenta. Verifica que el email no esté en uso.",
        "error",
        "Error de registro",
      )
    } finally {
      setIsRegistering(false)
    }
  }

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri)
    }
  }

  // Button press animation
  const onPressIn = () => {
    if (!isRegistering) {
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start()
    }
  }

  const onPressOut = () => {
    if (!isRegistering) {
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
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBorder}>
              <Text style={styles.logoTextPurple}>TCG</Text>
              <Text style={styles.logoTextBlack}>BROWSER</Text>
            </View>
          </View>

          {/* Registration Form */}
          <Text style={styles.title}>Registrarse en TCG Browser</Text>

          {/* Profile Image */}
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick} disabled={isRegistering}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <View style={styles.avatarCircle} />
                <View style={styles.avatarBase} />
                <View style={styles.addIconCircle}>
                  <Feather name="plus" size={24} color="white" />
                </View>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre de usuario *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              editable={!isRegistering}
            />

            <Text style={styles.label}>Nombre *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} editable={!isRegistering} />

            <Text style={styles.label}>Correo Electrónico *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isRegistering}
            />

            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              editable={!isRegistering}
            />

            <Text style={styles.label}>Nacionalidad</Text>
            <TextInput
              style={styles.input}
              value={nationality}
              onChangeText={setNationality}
              editable={!isRegistering}
            />

            <Text style={styles.label}>Localidad</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} editable={!isRegistering} />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.registerButton, isRegistering && styles.registerButtonDisabled]}
                onPress={handleRegister}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                disabled={isRegistering}
              >
                {isRegistering ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrarse</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity disabled={isRegistering}>
                  <Text style={styles.loginLink}>Iniciar sesión aquí</Text>
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
    marginBottom: 30,
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
  profileImageContainer: {
    alignSelf: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 75,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#5e616c",
    position: "absolute",
    top: 30,
  },
  avatarBase: {
    width: 120,
    height: 60,
    borderRadius: 60,
    backgroundColor: "#5e616c",
    position: "absolute",
    bottom: 30,
  },
  addIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#5e616c",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
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
  registerButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    minHeight: 56,
    justifyContent: "center",
  },
  registerButtonDisabled: {
    backgroundColor: "#b794e5",
  },
  registerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
  loginContainer: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Poppins_400Regular",
  },
  loginLink: {
    color: "#6c08dd",
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: "Poppins_500Medium",
  },
})
