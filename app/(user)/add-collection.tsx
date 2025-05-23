"use client"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
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

export default function AddCollectionScreen() {
  const [collectionName, setCollectionName] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Predefined images for selection
  const predefinedImages = [
    {
      id: "1",
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdDXn-0lG1ym-zHe1EDJ5LF4pecZO3-wcoug&s",
    },
    {
      id: "2",
      uri: "https://external-preview.redd.it/try-not-to-get-scared-scariest-story-v0-YWR1anRyNjRjOThlMf4z2bnUq8P2iC1lfjLTEFdB7_ANdLqBbvP29enC4VT8.png?format=pjpg&auto=webp&s=dcef1c37221e4dd3b676ebded0f4647b90132975", // Brook from One Piece
    },
    {
      id: "3",
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx-0Ms3nL3NKtHMc9eEJ6ILG1krpG32zIgAc_ivammtmdsmvnaBttxqCrdUW6icBLRvr0&usqp=CAU", // Person selfie
    },
    {
      id: "4",
      uri: "https://media3.giphy.com/media/xT1z8Fz2YP7Tcc5Nwa/giphy_s.gif?cid=6c09b952fd0cb3c7wjwkim49spwex1zlke17gmgj7ukrjb5j&ep=v1_gifs_search&rid=giphy_s.gif&ct=g", // Quagsire Pokemon
    },
    {
      id: "5",
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdDXn-0lG1ym-zHe1EDJ5LF4pecZO3-wcoug&s", // Zoro from One Piece (repeated)
    },
    {
      id: "6",
      uri: "https://external-preview.redd.it/try-not-to-get-scared-scariest-story-v0-YWR1anRyNjRjOThlMf4z2bnUq8P2iC1lfjLTEFdB7_ANdLqBbvP29enC4VT8.png?format=pjpg&auto=webp&s=dcef1c37221e4dd3b676ebded0f4647b90132975", // Brook from One Piece (repeated)
    },
    {
      id: "7",
      uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRx-0Ms3nL3NKtHMc9eEJ6ILG1krpG32zIgAc_ivammtmdsmvnaBttxqCrdUW6icBLRvr0&usqp=CAU", // Person selfie (repeated)
    },
    {
      id: "8",
      uri: "https://media3.giphy.com/media/xT1z8Fz2YP7Tcc5Nwa/giphy_s.gif?cid=6c09b952fd0cb3c7wjwkim49spwex1zlke17gmgj7ukrjb5j&ep=v1_gifs_search&rid=giphy_s.gif&ct=g", // Quagsire Pokemon (repeated)
    },
  ]

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

  // Function to create the collection
  const createCollection = async () => {
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Navigate back to collections screen
      router.push("/my-collections")
    } catch (error) {
      console.error("Error creating collection:", error)
      alert("Error al crear la colección. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

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
              {predefinedImages.map((image) => (
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
              style={styles.createButton}
              onPress={createCollection}
              disabled={isLoading || !collectionName.trim() || !coverImage}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.createButtonText}>Crear Colección</Text>
              )}
            </TouchableOpacity>
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
    borderColor: "#dadada",
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
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    backgroundColor: "#222323",
    padding: 20,
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
  footerPrivacyText: {
    color: "#BBC5CB",
    fontSize: 10,
    textAlign: "center",
    marginTop: 15,
  },
})
