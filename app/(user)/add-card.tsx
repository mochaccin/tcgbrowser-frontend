"use client"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Alert,
  FlatList,
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
import { useProductStore } from "../../store/createProductStore"
import { useUserStore } from "../../store/userStore"

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

interface Product {
  _id: string
  name: string
  product_type: string
  description?: string
  tcg_id?: string
  supertype?: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  rarity?: string
  set?: {
    id: string
    name: string
    series?: string
    printedTotal?: number
    total?: number
    releaseDate?: string
    images?: {
      small?: string
      large?: string
      symbol?: string
      logo?: string
    }
  }
  number?: string
  artist?: string
  images?: {
    small?: string
    large?: string
    symbol?: string
    logo?: string
  }
  stock_quantity: number
  price: number
  cost_price?: number
  is_available?: boolean
  condition?: string
  language?: string
  tags?: string[]
  notes?: string
  abilities?: {
    name: string
    text: string
    type: string
  }[]
  attacks?: {
    name: string
    cost?: string[]
    convertedEnergyCost?: number
    damage?: string
    text?: string
  }[]
}

export default function AddInventoryItemScreen() {
  // Stores
  const { products, fetchProducts, createProduct } = useProductStore()
  const { currentUser, addProductToInventory } = useUserStore()

  // Form state
  const [itemName, setItemName] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSet, setSelectedSet] = useState("")
  const [selectedRarity, setSelectedRarity] = useState(RARITIES[1]) // "Poco Común"
  const [selectedCondition, setSelectedCondition] = useState(CARD_CONDITIONS[3]) // "Jugada ligeramente"
  const [isForSale, setIsForSale] = useState(true)
  const [price, setPrice] = useState("0.00")
  const [imageUri, setImageUri] = useState<string | null>(null)

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])

  // Toast state
  const [toastVisible, setToastVisible] = useState(false)
  const [publishedItem, setPublishedItem] = useState<{ name: string; imageUri: string } | null>(null)

  // Dropdown visibility states
  const [activeDropdown, setActiveDropdown] = useState<"rarity" | "condition" | null>(null)

  // Image picker modal state
  const [showImagePickerModal, setShowImagePickerModal] = useState(false)

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    if (!currentUser) {
      Alert.alert("Error", "Debes iniciar sesión para añadir productos", [
        { text: "OK", onPress: () => router.push("/login") },
      ])
      return
    }
  }, [currentUser])

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Handle item name change and filter products
  const handleItemNameChange = (text: string) => {
    setItemName(text)

    if (text.length > 0) {
      const filtered = products.filter((product) => product.name.toLowerCase().includes(text.toLowerCase()))
      setFilteredProducts(filtered)
      setShowAutocomplete(filtered.length > 0)
    } else {
      setShowAutocomplete(false)
      setFilteredProducts([])
      setSelectedProduct(null)
      // Reset form when clearing name
      setSelectedSet("")
      setSelectedRarity(RARITIES[1])
      setPrice("0.00")
      setImageUri(null)
    }
  }

  // Handle product selection from autocomplete
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setItemName(product.name)
    setSelectedSet(product.set?.name || "")
    setSelectedRarity(product.rarity || RARITIES[1])
    setPrice(product.price.toString())
    setImageUri(product.images?.large || product.images?.small || null)
    setShowAutocomplete(false)
  }

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
  const pickImageFromLibrary = async () => {
    try {
      setShowImagePickerModal(false)

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
      Alert.alert("Error", "Error al seleccionar la imagen. Inténtalo de nuevo.")
    }
  }

  // Take photo with camera
  const takePhotoWithCamera = async () => {
    try {
      setShowImagePickerModal(false)

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
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Error al tomar la foto. Inténtalo de nuevo.")
    }
  }

  // Show image picker modal
  const showImageOptions = () => {
    setShowImagePickerModal(true)
  }

  // Remove selected image
  const removeImage = () => {
    setImageUri(null)
  }

  // Publish item
  const publishItem = async () => {
    if (!itemName.trim()) {
      Alert.alert("Error", "Por favor, ingresa un nombre para el artículo")
      return
    }

    if (!currentUser) {
      Alert.alert("Error", "Debes iniciar sesión para añadir productos")
      return
    }

    setIsLoading(true)

    try {
      // Prepare product data according to your DTO schema
      const productData = {
        product_type: "card", // Assuming this is always a card
        name: itemName,
        description: selectedProduct?.description || `${itemName} - ${selectedRarity}`,
        tcg_id: selectedProduct?.tcg_id,
        supertype: selectedProduct?.supertype,
        subtypes: selectedProduct?.subtypes,
        hp: selectedProduct?.hp,
        types: selectedProduct?.types,
        rarity: selectedRarity,
        set: selectedProduct?.set,
        number: selectedProduct?.number,
        artist: selectedProduct?.artist,
        images: selectedProduct?.images || (imageUri ? { large: imageUri } : undefined),
        stock_quantity: 1, // Default to 1 for new inventory item
        price: Number.parseFloat(price) || 0,
        cost_price: selectedProduct?.cost_price,
        is_available: isForSale,
        condition: selectedCondition,
        language: selectedProduct?.language || "es",
        tags: selectedProduct?.tags,
        notes: selectedProduct?.notes,
        abilities: selectedProduct?.abilities,
        attacks: selectedProduct?.attacks,
      }

      console.log("🚀 SCREEN: Creando producto:", productData)

      // Create the product
      const newProduct = await createProduct(productData)
      console.log("✅ SCREEN: Producto creado:", newProduct)

      // Add product to user's inventory using the integrated store
      await addProductToInventory(newProduct._id)
      console.log("✅ SCREEN: Producto agregado al inventory")

      // Set published item for toast
      setPublishedItem({
        name: itemName,
        imageUri:
          imageUri ||
          selectedProduct?.images?.large ||
          selectedProduct?.images?.small ||
          "https://images.pokemontcg.io/sv4pt5/1.png",
      })

      // Show toast
      setToastVisible(true)

      // Reset form
      setItemName("")
      setSelectedProduct(null)
      setSelectedSet("")
      setSelectedRarity(RARITIES[1])
      setSelectedCondition(CARD_CONDITIONS[3])
      setIsForSale(true)
      setPrice("0.00")
      setImageUri(null)

      // Navigate back to inventory after a delay
      setTimeout(() => {
        router.push("/inventory")
      }, 2000)
    } catch (error) {
      console.error("❌ SCREEN: Error creating product:", error)
      Alert.alert("Error", "Error al crear el producto. Inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle dropdown
  const toggleDropdown = (dropdown: "rarity" | "condition") => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  // Render autocomplete item
  const renderAutocompleteItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.autocompleteItem} onPress={() => handleProductSelect(item)}>
      <View style={styles.autocompleteItemContent}>
        {item.images?.small && <Image source={{ uri: item.images.small }} style={styles.autocompleteItemImage} />}
        <View style={styles.autocompleteItemText}>
          <Text style={styles.autocompleteItemName}>{item.name}</Text>
          <Text style={styles.autocompleteItemDetails}>
            {item.set?.name} • {item.rarity} • ${item.price}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

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
            {/* Item Name with Autocomplete */}
            <Text style={styles.inputLabel}>Nombre del artículo</Text>
            <View style={styles.autocompleteContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ej: Charizard ex Holo"
                value={itemName}
                onChangeText={handleItemNameChange}
                maxLength={50}
              />

              {/* Autocomplete Dropdown */}
              {showAutocomplete && (
                <View style={styles.autocompleteDropdown}>
                  <FlatList
                    data={filteredProducts.slice(0, 5)} // Limit to 5 results
                    renderItem={renderAutocompleteItem}
                    keyExtractor={(item) => item._id}
                    style={styles.autocompleteList}
                    keyboardShouldPersistTaps="handled"
                  />
                </View>
              )}
            </View>

            {/* Set/Collection (Read-only when product selected) */}
            <Text style={styles.inputLabel}>Set/Colección</Text>
            <TextInput
              style={[styles.textInput, selectedProduct && styles.readOnlyInput]}
              placeholder="Set será llenado automáticamente"
              value={selectedSet}
              editable={!selectedProduct}
              onChangeText={setSelectedSet}
            />

            {/* Rarity */}
            <Text style={styles.inputLabel}>Rareza</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("rarity")}>
              <Text style={styles.dropdownButtonText}>{selectedRarity}</Text>
              <Feather name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

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
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.selectedImage} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                    <Feather name="x" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Feather name="image" size={24} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Toca para seleccionar una imagen</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Publish Button */}
            <TouchableOpacity
              style={[
                styles.publishButton,
                (!itemName.trim() || isLoading || !currentUser) && styles.publishButtonDisabled,
              ]}
              onPress={publishItem}
              disabled={!itemName.trim() || isLoading || !currentUser}
            >
              <Text style={styles.publishButtonText}>{isLoading ? "Creando..." : "Publicar Artículo"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.imagePickerModalOverlay}>
          <View style={styles.imagePickerModalContainer}>
            <View style={styles.imagePickerModalHeader}>
              <Text style={styles.imagePickerModalTitle}>Seleccionar imagen</Text>
              <TouchableOpacity onPress={() => setShowImagePickerModal(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.imagePickerOptions}>
              <TouchableOpacity style={styles.imagePickerOption} onPress={takePhotoWithCamera}>
                <View style={styles.imagePickerOptionIcon}>
                  <Feather name="camera" size={32} color="#6c08dd" />
                </View>
                <Text style={styles.imagePickerOptionTitle}>Tomar foto</Text>
                <Text style={styles.imagePickerOptionDescription}>Usa la cámara para tomar una nueva foto</Text>
              </TouchableOpacity>

              <View style={styles.imagePickerDivider} />

              <TouchableOpacity style={styles.imagePickerOption} onPress={pickImageFromLibrary}>
                <View style={styles.imagePickerOptionIcon}>
                  <Feather name="folder" size={32} color="#6c08dd" />
                </View>
                <Text style={styles.imagePickerOptionTitle}>Elegir de galería</Text>
                <Text style={styles.imagePickerOptionDescription}>Selecciona una imagen de tu galería</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.imagePickerCancelButton} onPress={() => setShowImagePickerModal(false)}>
              <Text style={styles.imagePickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    width: 34,
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
  userInfoContainer: {
    backgroundColor: "#e8f5e8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    color: "#2d5a2d",
    fontWeight: "500",
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
  readOnlyInput: {
    backgroundColor: "#f5f5f5",
    color: "#666",
  },
  autocompleteContainer: {
    position: "relative",
    zIndex: 1000,
  },
  autocompleteDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  autocompleteList: {
    maxHeight: 200,
  },
  autocompleteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  autocompleteItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  autocompleteItemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  autocompleteItemText: {
    flex: 1,
  },
  autocompleteItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  autocompleteItemDetails: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
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
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
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
  // Image Picker Modal Styles
  imagePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  imagePickerModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  imagePickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  imagePickerModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  imagePickerOptions: {
    padding: 20,
  },
  imagePickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  imagePickerOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f8f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  imagePickerOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    flex: 1,
  },
  imagePickerOptionDescription: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  imagePickerDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
  },
  imagePickerCancelButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  imagePickerCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  // Regular Modal Styles
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
})
