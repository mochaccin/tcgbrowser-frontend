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

export default function RegisterScreen() {
  const [username, setUsername] = useState("Jota")
  const [name, setName] = useState("Joaquin Escanilla Arauco")
  const [nationality, setNationality] = useState("Chileno")
  const [location, setLocation] = useState("Licán Ray")
  const [profileImage, setProfileImage] = useState<string | null>(null)

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

  const handleRegister = () => {
    // Implement registration logic here
    console.log("Register with:", username, name, nationality, location)
    // Navigate to the main app after successful registration
    router.replace("/")
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
          <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePick}>
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
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Nacionalidad</Text>
            <TextInput style={styles.input} value={nationality} onChangeText={setNationality} />

            <Text style={styles.label}>Localidad</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />

            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={styles.registerButton}
                onPress={handleRegister}
                onPressIn={onPressIn}
                onPressOut={onPressOut}
              >
                <Text style={styles.registerButtonText}>Registrarse</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Iniciar sesión aquí</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
              erat molestie vehicula.
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
