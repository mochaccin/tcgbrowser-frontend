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
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
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
  Platform,
} from "react-native"
import CollectionToast from "../../components/CollectionToast"
import { useUserStore } from "../../store/userStore"

// Interface para los datos del usuario
interface UserProfile {
  _id: string
  username: string
  name: string
  email: string
  location: string
  nationality: string
  img_url?: string
}

// Interface para actualizar usuario
interface UpdateUserData {
  username?: string
  name?: string
  location?: string
  nationality?: string
  img_url?: string
}

export default function EditProfileScreen() {
  // Store y parámetros
  const { currentUser } = useUserStore()
  const params = useLocalSearchParams()

  // Form state
  const [username, setUsername] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [nationality, setNationality] = useState("")
  const [location, setLocation] = useState("")
  const [profileImage, setProfileImage] = useState("")

  // UI state
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Original data for comparison
  const [originalData, setOriginalData] = useState<UserProfile | null>(null)

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  // Cargar datos del usuario
  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = currentUser._id
      console.log(`🔍 EDIT_PROFILE: Cargando datos del usuario: ${userId}`)

      const response = await fetch(`http://localhost:3000/users/${userId}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const userData: UserProfile = await response.json()
      console.log("✅ EDIT_PROFILE: Datos del usuario cargados:", userData)

      // Establecer datos originales
      setOriginalData(userData)

      // Poblar formulario
      setUsername(userData.username || "")
      setName(userData.name || "")
      setEmail(userData.email || "")
      setNationality(userData.nationality || "")
      setLocation(userData.location || "")
      setProfileImage(
        userData.img_url ||
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
      )
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar los datos del usuario"
      console.error("❌ EDIT_PROFILE: Error cargando datos:", err)
      setError(errorMsg)
      Alert.alert("Error", "No se pudieron cargar los datos del usuario")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser._id) {
      loadUserData()
    }
  }, [currentUser._id])

  // Detectar cambios en el formulario
  useEffect(() => {
    if (originalData) {
      const hasFormChanges =
        username !== originalData.username ||
        name !== originalData.name ||
        nationality !== originalData.nationality ||
        location !== originalData.location ||
        profileImage !==
          (originalData.img_url ||
            "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png")

      setHasChanges(hasFormChanges)
    }
  }, [username, name, nationality, location, profileImage, originalData])

  // Show loading while checking auth state or loading fonts
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
        <Text style={styles.loadingText}>Cargando datos del perfil...</Text>
      </View>
    )
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Error al cargar el perfil</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const handlePickImage = async () => {
    try {
      if (Platform.OS === "web") {
        // En web, usar input file
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })

        if (!result.canceled && result.assets && result.assets.length > 0) {
          setProfileImage(result.assets[0].uri)
        }
      } else {
        // En móvil, mostrar opciones
        Alert.alert("Cambiar foto de perfil", "¿Cómo quieres seleccionar tu nueva foto?", [
          { text: "Cancelar", style: "cancel" },
          { text: "Tomar foto", onPress: takePhoto },
          { text: "Elegir de galería", onPress: pickFromGallery },
        ])
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  const takePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()
      if (cameraPermission.status !== "granted") {
        Alert.alert("Permisos", "Se necesitan permisos de cámara para tomar fotos")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "No se pudo tomar la foto")
    }
  }

  const pickFromGallery = async () => {
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
      console.error("Error picking from gallery:", error)
      Alert.alert("Error", "No se pudo seleccionar la imagen")
    }
  }

  const validateForm = (): boolean => {
    if (!username.trim()) {
      Alert.alert("Error", "El nombre de usuario es obligatorio")
      return false
    }

    if (!name.trim()) {
      Alert.alert("Error", "El nombre es obligatorio")
      return false
    }

    if (!location.trim()) {
      Alert.alert("Error", "La localidad es obligatoria")
      return false
    }

    if (!nationality.trim()) {
      Alert.alert("Error", "La nacionalidad es obligatoria")
      return false
    }

    return true
  }

  const handleSaveChanges = async () => {
    if (!validateForm()) return

    try {
      setIsSaving(true)

      const userId = currentUser._id
      console.log(`💾 EDIT_PROFILE: Guardando cambios para usuario: ${userId}`)

      // Preparar datos para actualizar
      const updateData: UpdateUserData = {}

      if (username !== originalData?.username) updateData.username = username.trim()
      if (name !== originalData?.name) updateData.name = name.trim()
      if (location !== originalData?.location) updateData.location = location.trim()
      if (nationality !== originalData?.nationality) updateData.nationality = nationality.trim()
      if (profileImage !== (originalData?.img_url || "")) updateData.img_url = profileImage

      console.log("📝 EDIT_PROFILE: Datos a actualizar:", updateData)

      // Si no hay cambios, no hacer nada
      if (Object.keys(updateData).length === 0) {
        Alert.alert("Sin cambios", "No se detectaron cambios para guardar")
        setIsSaving(false)
        return
      }

      // Llamar al API
      const response = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const updatedUser = await response.json()
      console.log("✅ EDIT_PROFILE: Usuario actualizado:", updatedUser)

      // Actualizar datos originales
      setOriginalData(updatedUser)
      setHasChanges(false)

      // Mostrar toast de éxito
      setToastVisible(true)

      // Navegar de vuelta al perfil después de un delay
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (error) {
      console.error("❌ EDIT_PROFILE: Error guardando cambios:", error)
      Alert.alert("Error", "No se pudieron guardar los cambios. Inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardChanges = () => {
    if (hasChanges) {
      Alert.alert("Descartar cambios", "¿Estás seguro de que quieres descartar los cambios?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Descartar",
          style: "destructive",
          onPress: () => router.back(),
        },
      ])
    } else {
      router.back()
    }
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
        <TouchableOpacity onPress={handleDiscardChanges}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.headerRight}>
          {hasChanges && (
            <View style={styles.changesIndicator}>
              <Text style={styles.changesText}>•</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
          <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
            <Feather name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nombre de usuario *</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Ingresa tu nombre de usuario"
            maxLength={50}
          />

          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ingresa tu nombre completo"
            maxLength={100}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={email}
            placeholder="Email no editable"
            editable={false}
          />
          <Text style={styles.helpText}>El email no se puede modificar</Text>

          <Text style={styles.label}>Nacionalidad *</Text>
          <TextInput
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
            placeholder="Ingresa tu nacionalidad"
            maxLength={50}
          />

          <Text style={styles.label}>Localidad *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Ingresa tu localidad"
            maxLength={100}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, (!hasChanges || isSaving) && styles.saveButtonDisabled]}
              onPress={handleSaveChanges}
              disabled={!hasChanges || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>{hasChanges ? "Guardar Cambios" : "Sin Cambios"}</Text>
              )}
            </TouchableOpacity>

            {hasChanges && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (originalData) {
                    setUsername(originalData.username)
                    setName(originalData.name)
                    setNationality(originalData.nationality)
                    setLocation(originalData.location)
                    setProfileImage(
                      originalData.img_url ||
                        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
                    )
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>Deshacer Cambios</Text>
              </TouchableOpacity>
            )}
          </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },
  retryButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
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
  headerRight: {
    width: 24,
    alignItems: "center",
  },
  changesIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
  },
  changesText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
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
    borderWidth: 3,
    borderColor: "#6c08dd",
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
  disabledInput: {
    backgroundColor: "#f5f5f5",
    color: "#999",
  },
  helpText: {
    fontSize: 12,
    color: "#999",
    fontFamily: "Poppins_400Regular",
    marginTop: -12,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#b794e5",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dadada",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
})
