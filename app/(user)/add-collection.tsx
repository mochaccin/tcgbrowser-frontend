"use client"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import CollectionToast from "../../components/CollectionToast"
import { PREDEFINED_COLLECTION_IMAGES, useUserStore } from "../../store/userStore"

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Toast state
  const [toastVisible, setToastVisible] = useState(false)

  // Hook para el store del usuario
  const { currentUser, createCollection, loading, error, debug } = useUserStore()

  // Debug info al cargar
  useEffect(() => {
    console.log("🔄 ADD_COLLECTION: Pantalla cargada")
    console.log("👤 ADD_COLLECTION: Usuario actual:", {
      _id: currentUser._id,
      username: currentUser.username,
      name: currentUser.name,
    })
    debug()
  }, [])

  // Function to pick an image from the device
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCoverImage(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      alert("Error al seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  // Function to select a predefined image
  const selectPredefinedImage = (imageUri: string) => {
    setCoverImage(imageUri)
  }

  // Function to create the collection using real API
  const handleCreateCollection = async () => {
    if (!collectionName.trim()) {
      alert("Por favor, ingresa un nombre para la colección")
      return
    }

    if (!coverImage) {
      alert("Por favor, selecciona una imagen de portada")
      return
    }

    setIsLoading(true)

    try {
      console.log("🚀 ADD_COLLECTION: Iniciando creación de collection")
      console.log("📝 ADD_COLLECTION: Datos:", {
        name: collectionName.trim(),
        img_url: coverImage,
        createdBy: currentUser._id,
        createdByType: typeof currentUser._id,
      })

      // Crear collection usando la API real a través del store
      const newCollection = await createCollection(collectionName.trim(), coverImage)

      console.log("✅ ADD_COLLECTION: Collection creada exitosamente:", {
        _id: newCollection._id,
        name: newCollection.name,
        createdBy: newCollection.createdBy,
      })

      // Show success toast
      setToastVisible(true)

      // Navigate after a short delay to allow toast to be seen
      setTimeout(() => {
        router.push("/my-collections")
      }, 1500)
    } catch (error) {
      console.error("❌ ADD_COLLECTION: Error creating collection:", error)
      alert(`Error al crear la colección: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Collection Toast */}
      <CollectionToast
        visible={toastVisible}
        message="Tu colección ha sido creada exitosamente"
        collectionName={collectionName}
        collectionImage={coverImage || undefined}
        onDismiss={() => setToastVisible(false)}
        duration={3000}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nueva colección</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>

            {/* Collection Name Input */}
            <Text style={styles.inputLabel}>Nombre de la colección</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: La colección muy molona de tito Vichodr"
              value={collectionName}
              onChangeText={setCollectionName}
              maxLength={50}
            />

            {/* Collection Cover Image */}
            <Text style={styles.inputLabel}>Portada de la colección</Text>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="upload" size={24} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Arrastra una imagen o haz clic para seleccionar</Text>
                  <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                    <Text style={styles.selectImageButtonText}>Seleccionar Imagen</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>

            {/* Predefined Images */}
            <Text style={styles.inputLabel}>O seleccione una imagen predefinida</Text>
            <View style={styles.predefinedImagesGrid}>
              {PREDEFINED_COLLECTION_IMAGES.map((image) => (
                <TouchableOpacity
                  key={image.id}
                  style={[styles.predefinedImageContainer, coverImage === image.uri && styles.selectedPredefinedImage]}
                  onPress={() => selectPredefinedImage(image.uri)}
                >
                  <Image source={{ uri: image.uri }} style={styles.predefinedImage} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Create Collection Button */}
            <TouchableOpacity
              style={[styles.createButton, (!collectionName.trim() || !coverImage) && styles.createButtonDisabled]}
              onPress={handleCreateCollection}
              disabled={isLoading || loading || !collectionName.trim() || !coverImage}
            >
              {isLoading || loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Crear Colección</Text>
              )}
            </TouchableOpacity>

            {/* Error message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#dadada",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    width: 34, // To balance the header
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  debugContainer: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  debugText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 16,
    color: "#222",
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  imagePickerContainer: {
    borderWidth: 2,
    borderColor: "#6c08dd",
    borderStyle: "dashed",
    borderRadius: 8,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  imagePlaceholderText: {
    textAlign: "center",
    color: "#666",
    marginTop: 8,
    marginBottom: 16,
  },
  selectImageButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  selectImageButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  predefinedImagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  predefinedImageContainer: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedPredefinedImage: {
    borderColor: "#6c08dd",
  },
  predefinedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  createButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  createButtonDisabled: {
    backgroundColor: "#b984f1", // Lighter purple for disabled state
    opacity: 0.7,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
})
