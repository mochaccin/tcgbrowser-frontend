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
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import CollectionToast from "../../components/CollectionToast"
import { useAuth } from "../context/AuthContext"

export default function EditProfileScreen() {
  const { user, isLoading } = useAuth()

  // Form state
  const [username, setUsername] = useState("Jota")
  const [name, setName] = useState("Joaquin Escanilla Arauco")
  const [nationality, setNationality] = useState("Chileno")
  const [location, setLocation] = useState("Licán Ray")
  const [profileImage, setProfileImage] = useState(
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
  )
  const [isSaving, setIsSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  // Show loading while checking auth state or loading fonts
  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  const handleSaveChanges = () => {
    setIsSaving(true)

    // Simulate saving data
    setTimeout(() => {
      setIsSaving(false)
      setToastVisible(true)

      // Navigate to profile after toast is shown
      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    }, 1500)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Profile Update Toast */}
      <CollectionToast
        visible={toastVisible}
        message="Tu perfil ha sido actualizado correctamente"
        title="¡Perfil actualizado!"
        collectionName={name}
        collectionImage={profileImage}
        onDismiss={() => setToastVisible(false)}
        type="success"
        duration={3000}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
            <Feather name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre de usuario</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Ingresa tu nombre de usuario"
          />

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ingresa tu nombre completo"
          />

          <Text style={styles.label}>Nacionalidad</Text>
          <TextInput
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
            placeholder="Ingresa tu nacionalidad"
          />

          <Text style={styles.label}>Localidad</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ingresa tu localidad"
          />

          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dadada",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
    marginBottom: 24,
    color: "#222323",
    paddingHorizontal: 16,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 32,
    position: "relative",
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#f0f0f0",
  },
  addImageButton: {
    position: "absolute",
    bottom: 0,
    right: "30%",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6c08dd",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F8F8F8",
  },
  formContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    marginBottom: 8,
    color: "#5e616c",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    marginBottom: 16,
    color: "#222323",
  },
  saveButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    backgroundColor: "#b794e5",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  // Footer styles from home screen
  footer: {
    backgroundColor: "#222323",
    padding: 20,
    marginTop: 20,
    marginLeft: -20,
    marginRight: -20,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  footerSocialIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#3F3F46",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  footerText: {
    color: "#BBC5CB",
    fontSize: 10,
    textAlign: "center",
    marginVertical: 10,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  footerLink: {
    color: "#BBC5CB",
    fontSize: 10,
  },
  footerLinkDivider: {
    color: "#BBC5CB",
    fontSize: 10,
    marginHorizontal: 5,
  },
})
