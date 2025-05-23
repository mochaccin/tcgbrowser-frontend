"use client"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import CollectionToast from "../../components/CollectionToast"

// Sample data for dropdowns
const SETS = [
  "Tarkir Dragonstorm",
  "Prismatic Evolutions",
  "Vivid Voltage",
  "Battle Styles",
  "Evolving Skies",
  "Fusion Strike",
  "Paldea Evolved",
  "Obsidian Flames",
]

const RARITIES = ["Común", "Poco Común", "Rara", "Ultra Rara", "Secreta Rara", "Holo Rara", "Full Art"]

const CARD_CONDITIONS = [
  "Mint (Perfecta)",
  "Near Mint (Casi perfecta)",
  "Excellent (Excelente)",
  "Jugada ligeramente",
  "Jugada",
  "Muy jugada",
  "Dañada",
]

export default function AddInventoryItemScreen() {
  // Form state
  const [itemName, setItemName] = useState("")
  const [selectedSet, setSelectedSet] = useState(SETS[0])
  const [selectedRarity, setSelectedRarity] = useState(RARITIES[1]) // "Poco Común"
  const [selectedCondition, setSelectedCondition] = useState(CARD_CONDITIONS[3]) // "Jugada ligeramente"
  const [isForSale, setIsForSale] = useState(true)
  const [price, setPrice] = useState("0.00")
  const [imageUri, setImageUri] = useState<string | null>(null)

  // Toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [publishedItem, setPublishedItem] = useState<{ name: string; imageUri: string } | null>(null)

  // Dropdown visibility states
  const [activeDropdown, setActiveDropdown] = useState<"set" | "rarity" | "condition" | null>(null)

  // Format price input
  const handlePriceChange = (text: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = text.replace(/[^0-9.]/g, "")

    // Ensure only one decimal point
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      return
    }

    // Format with two decimal places if there's a decimal point
    if (parts.length === 2) {
      if (parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2)
      }
      setPrice(parts.join("."))
    } else {
      setPrice(numericValue)
    }
  }

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      alert("Error al seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  // Take photo with camera
  const takePhoto = async () => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync()

      if (cameraPermission.status !== "granted") {
        alert("Se necesitan permisos de cámara para tomar fotos")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      alert("Error al tomar la foto. Inténtalo de nuevo.")
    }
  }

  // Show image options
  const showImageOptions = () => {
    // In a real app, you would show an ActionSheet or Modal with options
    // For simplicity, we'll just show an alert with options
    if (Platform.OS === "web") {
      pickImage()
      return
    }

    alert("Seleccionar imagen", "¿Cómo quieres añadir una imagen?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Elegir de la galería", onPress: pickImage },
    ])
  }

  // Publish item
  const publishItem = () => {
    if (!itemName.trim()) {
      alert("Por favor, ingresa un nombre para el artículo")
      return
    }

    // Format price for display
    const numericPrice = Number.parseFloat(price || "0")
    const formattedPrice = `${numericPrice.toLocaleString("es-CL")}CLP`

    // Default image if none selected
    const defaultImage = "https://images.pokemontcg.io/sv4pt5/1.png"

    // Create new item
    const newItem = {
      id: `item${Date.now()}`,
      name: itemName,
      brand: selectedSet,
      price: formattedPrice,
      imageUri: imageUri || defaultImage,
    }

    console.log("New item:", newItem)

    // Set published item for toast
    setPublishedItem({
      name: itemName,
      imageUri: imageUri || defaultImage,
    })

    // Show toast
    setToastVisible(true)

    // Navigate back to inventory after a delay
    setTimeout(() => {
      router.push("/inventory")
    }, 2000)
  }

  // Toggle dropdown
  const toggleDropdown = (dropdown: "set" | "rarity" | "condition") => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Toast notification */}
      <CollectionToast
        visible={toastVisible}
        message="Artículo añadido a tu inventario"
        title="¡Artículo publicado!"
        collectionName={publishedItem?.name}
        collectionImage={publishedItem?.imageUri}
        onDismiss={() => setToastVisible(false)}
        type="success"
        duration={3000}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicar artículo</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Item Name */}
            <Text style={styles.inputLabel}>Nombre del artículo</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Charizard ex Holo"
              value={itemName}
              onChangeText={setItemName}
              maxLength={50}
            />

            {/* Set/Collection and Rarity in a row */}
            <View style={styles.rowContainer}>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Set/Colección</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("set")}>
                  <Text style={styles.dropdownButtonText}>{selectedSet}</Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Rareza</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("rarity")}>
                  <Text style={styles.dropdownButtonText}>{selectedRarity}</Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Card Condition */}
            <Text style={styles.inputLabel}>Estado de la carta</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("condition")}>
              <Text style={styles.dropdownButtonText}>{selectedCondition}</Text>
              <Feather name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {/* Available for Sale Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.inputLabel}>Disponible para venta</Text>
              <Switch
                trackColor={{ false: "#dadada", true: "#a970e1" }}
                thumbColor={isForSale ? "#6c08dd" : "#f4f3f4"}
                ios_backgroundColor="#dadada"
                onValueChange={() => setIsForSale(!isForSale)}
                value={isForSale}
              />
            </View>

            {/* Price */}
            <Text style={styles.inputLabel}>Precio (CLP)</Text>
            <View style={styles.priceInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                value={price}
                onChangeText={handlePriceChange}
                keyboardType="numeric"
                editable={isForSale}
              />
            </View>

            {/* Image Upload */}
            <Text style={styles.inputLabel}>Imagen del artículo</Text>
            <TouchableOpacity style={styles.imagePickerContainer} onPress={showImageOptions}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={24} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Toca para seleccionar una imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Publish Button */}
            <TouchableOpacity
              style={[styles.publishButton, !itemName.trim() && styles.publishButtonDisabled]}
              onPress={publishItem}
              disabled={!itemName.trim()}
            >
              <Text style={styles.publishButtonText}>Publicar Artículo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Set Dropdown Modal */}
      <Modal
        visible={activeDropdown === "set"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Set</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {SETS.map((set) => (
                  <TouchableOpacity
                    key={set}
                    style={[styles.modalOption, selectedSet === set && styles.selectedModalOption]}
                    onPress={() => {
                      setSelectedSet(set)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{set}</Text>
                    {selectedSet === set && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rarity Dropdown Modal */}
      <Modal
        visible={activeDropdown === "rarity"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Rareza</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {RARITIES.map((rarity) => (
                  <TouchableOpacity
                    key={rarity}
                    style={[styles.modalOption, selectedRarity === rarity && styles.selectedModalOption]}
                    onPress={() => {
                      setSelectedRarity(rarity)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{rarity}</Text>
                    {selectedRarity === rarity && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Condition Dropdown Modal */}
      <Modal
        visible={activeDropdown === "condition"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Estado</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {CARD_CONDITIONS.map((condition) => (
                  <TouchableOpacity
                    key={condition}
                    style={[styles.modalOption, selectedCondition === condition && styles.selectedModalOption]}
                    onPress={() => {
                      setSelectedCondition(condition)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{condition}</Text>
                    {selectedCondition === condition && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfColumn: {
    width: "48%",
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 8,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: "#333",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#333",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  imagePickerContainer: {
    borderWidth: 2,
    borderColor: "#6c08dd",
    borderStyle: "dashed",
    borderRadius: 8,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    overflow: "hidden",
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  publishButton: {
    backgroundColor: "#6c08dd",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  publishButtonDisabled: {
    backgroundColor: "#b794e5",
    opacity: 0.7,
  },
  publishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "60%",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedModalOption: {
    backgroundColor: "#f0e6ff",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#333",
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
