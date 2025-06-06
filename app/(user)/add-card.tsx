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
  ActivityIndicator,
  Alert,
} from "react-native"
import CollectionToast from "../../components/CollectionToast"

// Interfaces basadas en tu schema de Product
interface ProductImages {
  small?: string
  large?: string
  symbol?: string
  logo?: string
}

interface SetInfo {
  id: string
  name: string
  series?: string
  printedTotal?: number
  total?: number
  ptcgoCode?: string
  releaseDate?: string
}

interface CreateProductData {
  product_type: string
  name: string
  description?: string
  tcg_id?: string
  supertype?: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  rarity?: string
  setInfo?: SetInfo
  number?: string
  artist?: string
  images?: ProductImages
  stock_quantity: number
  price: number
  cost_price?: number
  is_available: boolean
  condition?: string
  language?: string
  tags?: string[]
  notes?: string
}

// Opciones para los dropdowns
const PRODUCT_TYPES = [
  { value: "card", label: "Carta Individual" },
  { value: "booster_pack", label: "Sobre/Booster" },
  { value: "expansion_pack", label: "Pack de Expansión" },
  { value: "set", label: "Set Completo" },
]

const SUPERTYPES = ["Pokémon", "Trainer", "Energy"]

const POKEMON_TYPES = [
  "Grass",
  "Fire",
  "Water",
  "Lightning",
  "Psychic",
  "Fighting",
  "Darkness",
  "Metal",
  "Fairy",
  "Dragon",
  "Colorless",
]

const RARITIES = [
  "Common",
  "Uncommon",
  "Rare",
  "Rare Holo",
  "Rare Ultra",
  "Rare Secret",
  "Rare Rainbow",
  "Promo",
  "Amazing Rare",
]

const CARD_CONDITIONS = ["Mint", "Near Mint", "Excellent", "Good", "Light Played", "Played", "Heavy Played", "Damaged"]

const LANGUAGES = ["English", "Spanish", "Japanese", "French", "German", "Italian"]

export default function AddProductScreen() {
  // Form state básico
  const [productType, setProductType] = useState("card")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tcgId, setTcgId] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("1")
  const [isAvailable, setIsAvailable] = useState(true)
  const [condition, setCondition] = useState("Near Mint")
  const [language, setLanguage] = useState("English")
  const [notes, setNotes] = useState("")

  // Card specific fields
  const [supertype, setSupertype] = useState("")
  const [subtypes, setSubtypes] = useState<string[]>([])
  const [hp, setHp] = useState("")
  const [types, setTypes] = useState<string[]>([])
  const [rarity, setRarity] = useState("")
  const [number, setNumber] = useState("")
  const [artist, setArtist] = useState("")

  // Set information
  const [setId, setSetId] = useState("")
  const [setInfoName, setSetInfoName] = useState("")
  const [setSeries, setSetSeries] = useState("")

  // Images
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [imageUrlSmall, setImageUrlSmall] = useState("")
  const [imageUrlLarge, setImageUrlLarge] = useState("")

  // UI state
  const [loading, setLoading] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [publishedProduct, setPublishedProduct] = useState<{ name: string; imageUri: string } | null>(null)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Format price input
  const handlePriceChange = (text: string, setter: (value: string) => void) => {
    const numericValue = text.replace(/[^0-9.]/g, "")
    const parts = numericValue.split(".")
    if (parts.length > 2) return

    if (parts.length === 2 && parts[1].length > 2) {
      parts[1] = parts[1].substring(0, 2)
      setter(parts.join("."))
    } else {
      setter(numericValue)
    }
  }

  // Image picker functions
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
      Alert.alert("Error", "Error al seleccionar la imagen")
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
        setImageUri(result.assets[0].uri)
      }
    } catch (error) {
      console.error("Error taking photo:", error)
      Alert.alert("Error", "Error al tomar la foto")
    }
  }

  const showImageOptions = () => {
    if (Platform.OS === "web") {
      pickImage()
      return
    }

    Alert.alert("Seleccionar imagen", "¿Cómo quieres añadir una imagen?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Tomar foto", onPress: takePhoto },
      { text: "Elegir de la galería", onPress: pickImage },
    ])
  }

  // Create product
  const createProduct = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "El nombre del producto es obligatorio")
      return
    }

    if (!price || Number.parseFloat(price) <= 0) {
      Alert.alert("Error", "El precio debe ser mayor a 0")
      return
    }

    try {
      setLoading(true)

      // Preparar datos del producto
      const productData: CreateProductData = {
        product_type: productType,
        name: name.trim(),
        description: description.trim() || undefined,
        tcg_id: tcgId.trim() || undefined,
        price: Number.parseFloat(price),
        cost_price: costPrice ? Number.parseFloat(costPrice) : undefined,
        stock_quantity: Number.parseInt(stockQuantity) || 1,
        is_available: isAvailable,
        condition: condition || undefined,
        language: language || undefined,
        notes: notes.trim() || undefined,
      }

      // Agregar campos específicos de cartas si es necesario
      if (productType === "card") {
        if (supertype) productData.supertype = supertype
        if (subtypes.length > 0) productData.subtypes = subtypes
        if (hp) productData.hp = hp
        if (types.length > 0) productData.types = types
        if (rarity) productData.rarity = rarity
        if (number) productData.number = number
        if (artist) productData.artist = artist

        // Set information
        if (setId || setInfoName) {
          productData.setInfo = {
            id: setId || `set_${Date.now()}`,
            name: setInfoName || "Unknown Set",
            series: setSeries || undefined,
          }
        }
      }

      // Images
      if (imageUri || imageUrlSmall || imageUrlLarge) {
        productData.images = {
          small: imageUrlSmall || imageUri || undefined,
          large: imageUrlLarge || imageUri || undefined,
        }
      }

      console.log("🚀 Creating product:", productData)

      // Llamada al API
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Error ${response.status}: ${errorData}`)
      }

      const createdProduct = await response.json()
      console.log("✅ Product created:", createdProduct)

      // Mostrar toast de éxito
      setPublishedProduct({
        name: name,
        imageUri: imageUri || imageUrlSmall || "https://images.pokemontcg.io/sv4pt5/1.png",
      })
      setToastVisible(true)

      // Limpiar formulario
      resetForm()

      // Navegar de vuelta después de un delay
      setTimeout(() => {
        router.back()
      }, 2000)
    } catch (error) {
      console.error("❌ Error creating product:", error)
      Alert.alert("Error", "No se pudo crear el producto. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setName("")
    setDescription("")
    setTcgId("")
    setPrice("")
    setCostPrice("")
    setStockQuantity("1")
    setSupertype("")
    setSubtypes([])
    setHp("")
    setTypes([])
    setRarity("")
    setNumber("")
    setArtist("")
    setSetId("")
    setSetInfoName("")
    setSetSeries("")
    setImageUri(null)
    setImageUrlSmall("")
    setImageUrlLarge("")
    setNotes("")
  }

  // Toggle dropdown
  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown)
  }

  // Toggle array values (for types, subtypes)
  const toggleArrayValue = (array: string[], value: string, setter: (arr: string[]) => void) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value))
    } else {
      setter([...array, value])
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Toast notification */}
      <CollectionToast
        visible={toastVisible}
        message="Producto añadido al inventario"
        title="¡Producto creado!"
        collectionName={publishedProduct?.name}
        collectionImage={publishedProduct?.imageUri}
        onDismiss={() => setToastVisible(false)}
        type="success"
        duration={3000}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Producto</Text>
        <View style={styles.headerRight} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Product Type */}
            <Text style={styles.inputLabel}>Tipo de Producto *</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("productType")}>
              <Text style={styles.dropdownButtonText}>
                {PRODUCT_TYPES.find((type) => type.value === productType)?.label}
              </Text>
              <Feather name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {/* Product Name */}
            <Text style={styles.inputLabel}>Nombre del Producto *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Charizard ex"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />

            {/* Description */}
            <Text style={styles.inputLabel}>Descripción</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Descripción del producto..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {/* TCG ID */}
            <Text style={styles.inputLabel}>TCG ID</Text>
            <TextInput style={styles.textInput} placeholder="Ej: sv4pt5-6" value={tcgId} onChangeText={setTcgId} />

            {/* Card-specific fields */}
            {productType === "card" && (
              <>
                {/* Supertype and HP */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfColumn}>
                    <Text style={styles.inputLabel}>Supertipo</Text>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("supertype")}>
                      <Text style={styles.dropdownButtonText}>{supertype || "Seleccionar"}</Text>
                      <Feather name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfColumn}>
                    <Text style={styles.inputLabel}>HP</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="120"
                      value={hp}
                      onChangeText={setHp}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                {/* Types */}
                <Text style={styles.inputLabel}>Tipos de Pokémon</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("types")}>
                  <Text style={styles.dropdownButtonText}>
                    {types.length > 0 ? types.join(", ") : "Seleccionar tipos"}
                  </Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>

                {/* Rarity and Number */}
                <View style={styles.rowContainer}>
                  <View style={styles.halfColumn}>
                    <Text style={styles.inputLabel}>Rareza</Text>
                    <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("rarity")}>
                      <Text style={styles.dropdownButtonText}>{rarity || "Seleccionar"}</Text>
                      <Feather name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.halfColumn}>
                    <Text style={styles.inputLabel}>Número</Text>
                    <TextInput style={styles.textInput} placeholder="006" value={number} onChangeText={setNumber} />
                  </View>
                </View>

                {/* Artist */}
                <Text style={styles.inputLabel}>Artista</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nombre del artista"
                  value={artist}
                  onChangeText={setArtist}
                />

                {/* Set Information */}
                <Text style={styles.sectionTitle}>Información del Set</Text>
                <Text style={styles.inputLabel}>Nombre del Set</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Prismatic Evolutions"
                  value={setInfoName}
                  onChangeText={setSetInfoName}
                />

                <Text style={styles.inputLabel}>Serie</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Scarlet & Violet"
                  value={setSeries}
                  onChangeText={setSetSeries}
                />
              </>
            )}

            {/* Pricing */}
            <Text style={styles.sectionTitle}>Precio e Inventario</Text>
            <View style={styles.rowContainer}>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Precio de Venta (CLP) *</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    value={price}
                    onChangeText={(text) => handlePriceChange(text, setPrice)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Precio de Costo (CLP)</Text>
                <View style={styles.priceInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0.00"
                    value={costPrice}
                    onChangeText={(text) => handlePriceChange(text, setCostPrice)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Stock and Availability */}
            <View style={styles.rowContainer}>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Cantidad en Stock</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="1"
                  value={stockQuantity}
                  onChangeText={setStockQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Disponible para Venta</Text>
                <View style={styles.switchContainer}>
                  <Switch
                    trackColor={{ false: "#dadada", true: "#a970e1" }}
                    thumbColor={isAvailable ? "#6c08dd" : "#f4f3f4"}
                    ios_backgroundColor="#dadada"
                    onValueChange={setIsAvailable}
                    value={isAvailable}
                  />
                </View>
              </View>
            </View>

            {/* Condition and Language */}
            <View style={styles.rowContainer}>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Condición</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("condition")}>
                  <Text style={styles.dropdownButtonText}>{condition}</Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.halfColumn}>
                <Text style={styles.inputLabel}>Idioma</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => toggleDropdown("language")}>
                  <Text style={styles.dropdownButtonText}>{language}</Text>
                  <Feather name="chevron-down" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Images */}
            <Text style={styles.sectionTitle}>Imágenes</Text>

            {/* Image Upload */}
            <Text style={styles.inputLabel}>Imagen Principal</Text>
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

            {/* Image URLs */}
            <Text style={styles.inputLabel}>URL Imagen Pequeña</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://..."
              value={imageUrlSmall}
              onChangeText={setImageUrlSmall}
            />

            <Text style={styles.inputLabel}>URL Imagen Grande</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://..."
              value={imageUrlLarge}
              onChangeText={setImageUrlLarge}
            />

            {/* Notes */}
            <Text style={styles.inputLabel}>Notas Adicionales</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Notas internas sobre el producto..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              maxLength={500}
            />

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.publishButton, (!name.trim() || !price || loading) && styles.publishButtonDisabled]}
              onPress={createProduct}
              disabled={!name.trim() || !price || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.publishButtonText}>Crear Producto</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modals for dropdowns */}
      {/* Product Type Modal */}
      <Modal
        visible={activeDropdown === "productType"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tipo de Producto</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {PRODUCT_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.modalOption, productType === type.value && styles.selectedModalOption]}
                    onPress={() => {
                      setProductType(type.value)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type.label}</Text>
                    {productType === type.value && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Supertype Modal */}
      <Modal
        visible={activeDropdown === "supertype"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Supertipo</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {SUPERTYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.modalOption, supertype === type && styles.selectedModalOption]}
                    onPress={() => {
                      setSupertype(type)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                    {supertype === type && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Types Modal (Multi-select) */}
      <Modal
        visible={activeDropdown === "types"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tipos de Pokémon</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {POKEMON_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.modalOption, types.includes(type) && styles.selectedModalOption]}
                    onPress={() => toggleArrayValue(types, type, setTypes)}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                    {types.includes(type) && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rarity Modal */}
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
                <Text style={styles.modalTitle}>Rareza</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {RARITIES.map((rarityOption) => (
                  <TouchableOpacity
                    key={rarityOption}
                    style={[styles.modalOption, rarity === rarityOption && styles.selectedModalOption]}
                    onPress={() => {
                      setRarity(rarityOption)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{rarityOption}</Text>
                    {rarity === rarityOption && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Condition Modal */}
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
                <Text style={styles.modalTitle}>Condición</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {CARD_CONDITIONS.map((conditionOption) => (
                  <TouchableOpacity
                    key={conditionOption}
                    style={[styles.modalOption, condition === conditionOption && styles.selectedModalOption]}
                    onPress={() => {
                      setCondition(conditionOption)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{conditionOption}</Text>
                    {condition === conditionOption && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={activeDropdown === "language"}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveDropdown(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveDropdown(null)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Idioma</Text>
                <TouchableOpacity onPress={() => setActiveDropdown(null)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScrollView}>
                {LANGUAGES.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[styles.modalOption, language === lang && styles.selectedModalOption]}
                    onPress={() => {
                      setLanguage(lang)
                      setActiveDropdown(null)
                    }}
                  >
                    <Text style={styles.modalOptionText}>{lang}</Text>
                    {language === lang && <Feather name="check" size={18} color="#6c08dd" />}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
    color: "#333",
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
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
    flex: 1,
  },
  switchContainer: {
    marginTop: 16,
    alignItems: "flex-start",
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
})
