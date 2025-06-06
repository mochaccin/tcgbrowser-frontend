"use client"
import { Feather } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native"
import Toast from "../../components/Toast" // Import the Toast component
import { userStore } from "../../store/userStore"

// Interfaz para los productos de la API
interface ApiProduct {
  _id: string
  name: string
  product_type: string
  tcg_id?: string
  supertype?: string
  subtypes?: string[]
  hp?: string
  types?: string[]
  rarity?: string
  setInfo?: {
    id: string
    name: string
    series?: string
  }
  number?: string
  images?: {
    small?: string
    large?: string
  }
  price: number
  stock_quantity: number
  is_available: boolean
  condition?: string
}

// Interfaz para las cartas transformadas para UI
interface Card {
  id: string
  name: string
  edition: string
  price: string
  priceNumeric: number // Para cálculos y filtros en CLP
  originalPriceUSD: number // Precio original en USD para referencia
  imageUri: string
  hp?: string
  types: string[]
  rarity: string
  condition: string
}

// Filter options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "edition_asc"
type PriceRange = "all" | "0-5000" | "5000-10000" | "10000-20000" | "20000+"

interface FilterState {
  sortBy: SortOption
  priceRange: PriceRange
  selectedEditions: string[]
}

// 🔧 CONFIGURACIÓN DE CONVERSIÓN DE MONEDA (igual que en collection-detail-screen)
const EXCHANGE_RATE_USD_TO_CLP = 950 // 1 USD = 950 CLP (tasa estática)
const MIN_PRICE_CLP = 100 // Precio mínimo en CLP
const MIN_PRICE_CHEAP_CARDS_CLP = 500 // Precio mínimo para cartas muy baratas

/**
 * Convierte un precio de USD a CLP usando la tasa de cambio estática
 * @param usdPrice Precio en USD
 * @returns Precio en CLP redondeado
 */
const convertUSDToCLP = (usdPrice: number): number => {
  // Validar que el precio sea un número válido
  if (typeof usdPrice !== "number" || isNaN(usdPrice) || usdPrice < 0) {
    console.warn(`⚠️ PRICE_CONVERSION: Precio USD inválido: ${usdPrice}, usando precio mínimo`)
    return MIN_PRICE_CLP
  }

  let clpPrice = usdPrice * EXCHANGE_RATE_USD_TO_CLP

  // Aplicar precios mínimos según el valor original
  if (usdPrice < 0.1) {
    // Para cartas muy baratas (menos de $0.10 USD), establecer un precio mínimo más realista
    clpPrice = Math.max(clpPrice, MIN_PRICE_CHEAP_CARDS_CLP)
  } else {
    // Para otras cartas, aplicar precio mínimo general
    clpPrice = Math.max(clpPrice, MIN_PRICE_CLP)
  }

  return Math.round(clpPrice)
}

/**
 * Formatea un precio en CLP con separadores de miles
 * @param clpPrice Precio en CLP
 * @returns String formateado con símbolo de peso chileno
 */
const formatCLPPrice = (clpPrice: number): string => {
  if (typeof clpPrice !== "number" || isNaN(clpPrice)) {
    return "$0 CLP"
  }

  return `$${Math.round(clpPrice).toLocaleString("es-CL")} CLP`
}

export default function AddCardScreen() {
  const { collectionId } = useLocalSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEdition, setSelectedEdition] = useState("Todas las ediciones")
  const [showEditionDropdown, setShowEditionDropdown] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filteredCards, setFilteredCards] = useState<Card[]>([])

  // Toast notification state
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastCardName, setToastCardName] = useState("")
  const [toastCardImage, setToastCardImage] = useState("")

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name_asc",
    priceRange: "all",
    selectedEditions: [],
  })

  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [errorProducts, setErrorProducts] = useState<string | null>(null)

  // 🔧 FUNCIÓN ACTUALIZADA: Transformar producto de API a formato UI con conversión CLP
  const transformProduct = (apiProduct: ApiProduct): Card => {
    // Asegurar que el precio sea un número válido
    let usdPrice = 0

    if (typeof apiProduct.price === "number" && !isNaN(apiProduct.price)) {
      usdPrice = apiProduct.price
    } else if (typeof apiProduct.price === "string") {
      const parsedPrice = Number.parseFloat(apiProduct.price)
      usdPrice = !isNaN(parsedPrice) ? parsedPrice : 0
    }

    // Asegurar que usdPrice sea un número válido
    if (typeof usdPrice !== "number" || isNaN(usdPrice) || usdPrice < 0) {
      usdPrice = 0
    }

    // Convertir a CLP
    const clpPrice = convertUSDToCLP(usdPrice)

    console.log(`💰 ADD_CARD_PRICE_CONVERSION: ${apiProduct.name}`)
    console.log(`   USD: $${usdPrice.toFixed(2)} -> CLP: $${clpPrice.toLocaleString("es-CL")}`)

    return {
      id: apiProduct._id,
      name: apiProduct.name,
      edition: apiProduct.setInfo
        ? `${apiProduct.setInfo.name}${apiProduct.setInfo.series ? ` (${apiProduct.setInfo.series})` : ""}`
        : "Set desconocido",
      price: formatCLPPrice(clpPrice), // ✅ Precio formateado en CLP para mostrar
      priceNumeric: clpPrice, // ✅ Precio numérico en CLP para cálculos y filtros
      originalPriceUSD: usdPrice, // ✅ Asegurar que siempre sea un número válido
      imageUri: apiProduct.images?.small || apiProduct.images?.large || "https://images.pokemontcg.io/sv4pt5/1.png",
      hp: apiProduct.hp,
      types: apiProduct.types || [],
      rarity: apiProduct.rarity || "Common",
      condition: apiProduct.condition || "Near Mint",
    }
  }

  // Cargar productos al iniciar
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true)
        setErrorProducts(null)

        console.log("🔍 ADD_CARD: Cargando productos desde API...")

        const response = await fetch("http://localhost:3000/products")

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const apiProducts: ApiProduct[] = await response.json()
        console.log(`✅ ADD_CARD: ${apiProducts.length} productos cargados`)

        setProducts(apiProducts)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Error al cargar productos"
        console.error("❌ ADD_CARD: Error cargando productos:", err)
        setErrorProducts(errorMsg)
        Alert.alert("Error", "No se pudieron cargar las cartas disponibles")
      } finally {
        setLoadingProducts(false)
      }
    }

    loadProducts()
  }, [])

  // Apply all filters
  useEffect(() => {
    let filtered = products.map(transformProduct)

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (card) => card.name.toLowerCase().includes(query) || card.edition.toLowerCase().includes(query),
      )
    }

    // Apply edition filter from dropdown
    if (selectedEdition !== "Todas las ediciones") {
      filtered = filtered.filter((card) => card.edition.includes(selectedEdition))
    }

    // Apply advanced edition filters
    if (filters.selectedEditions.length > 0) {
      filtered = filtered.filter((card) => filters.selectedEditions.some((edition) => card.edition.includes(edition)))
    }

    // 🔧 FILTRO DE PRECIO ACTUALIZADO: Usar priceNumeric en CLP
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((card) => {
        const price = card.priceNumeric // Ya está en CLP
        switch (filters.priceRange) {
          case "0-5000":
            return price <= 5000
          case "5000-10000":
            return price > 5000 && price <= 10000
          case "10000-20000":
            return price > 10000 && price <= 20000
          case "20000+":
            return price > 20000
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered = sortCards(filtered, filters.sortBy)

    setFilteredCards(filtered)
  }, [searchQuery, selectedEdition, filters, products])

  // Show toast notification
  const showToast = (message: string, cardName?: string, cardImage?: string) => {
    setToastMessage(message)
    setToastCardName(cardName || "")
    setToastCardImage(cardImage || "")
    setToastVisible(true)
  }

  // 🔧 FUNCIÓN DE ORDENAMIENTO ACTUALIZADA: Usar priceNumeric para ordenar por precio
  const sortCards = (cardList: Card[], option: SortOption) => {
    const sorted = [...cardList]

    switch (option) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "price_asc":
        return sorted.sort((a, b) => a.priceNumeric - b.priceNumeric) // ✅ Usar priceNumeric
      case "price_desc":
        return sorted.sort((a, b) => b.priceNumeric - a.priceNumeric) // ✅ Usar priceNumeric
      case "edition_asc":
        return sorted.sort((a, b) => a.edition.localeCompare(b.edition))
      default:
        return sorted
    }
  }

  // Add card to collection
  const addCardToCollection = async (cardId: string) => {
    console.log(`🃏 ADD_CARD: Agregando carta ${cardId} a colección ${collectionId}`)

    try {
      // Find the card that was added for the toast notification
      const addedCard = filteredCards.find((card) => card.id === cardId)

      // Call the API through the store
      await userStore.addCardToCollection(collectionId as string, cardId)

      // Forzar actualización de colecciones en el store para asegurar datos frescos
      console.log("🔄 ADD_CARD: Actualizando colecciones en el store...")
      await userStore.loadUserCollections()

      // Show success toast
      if (addedCard) {
        showToast("Carta añadida a la colección", addedCard.name, addedCard.imageUri)
      } else {
        showToast("Carta añadida a la colección")
      }
    } catch (error) {
      console.error("❌ ADD_CARD: Error agregando carta:", error)
      showToast("Error al añadir la carta a la colección")
    }
  }

  // Update filter state
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Toggle edition in advanced filters
  const toggleEditionFilter = (edition: string) => {
    const currentEditions = filters.selectedEditions
    if (currentEditions.includes(edition)) {
      updateFilters({
        selectedEditions: currentEditions.filter((e) => e !== edition),
      })
    } else {
      updateFilters({
        selectedEditions: [...currentEditions, edition],
      })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      sortBy: "name_asc",
      priceRange: "all",
      selectedEditions: [],
    })
    setSelectedEdition("Todas las ediciones")
    setSearchQuery("")
  }

  // Generar ediciones dinámicamente desde los productos
  const getAvailableEditions = (): string[] => {
    const editions = new Set<string>()
    products.forEach((product) => {
      if (product.setInfo?.name) {
        const edition = product.setInfo.series
          ? `${product.setInfo.name} (${product.setInfo.series})`
          : product.setInfo.name
        editions.add(edition)
      }
    })
    return ["Todas las ediciones", ...Array.from(editions).sort()]
  }

  const POKEMON_EDITIONS = getAvailableEditions()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            console.log("🔙 ADD_CARD: Volviendo a la pantalla de colección...")
            router.back()
          }}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Añadir carta a la colección</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Loading State */}
      {loadingProducts && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c08dd" />
          <Text style={styles.loadingText}>Cargando cartas disponibles...</Text>
        </View>
      )}

      {/* Error State */}
      {errorProducts && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorProducts}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setErrorProducts(null)
              // Trigger reload by calling the useEffect again
              window.location.reload()
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cartas disponibles"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.editionDropdown} onPress={() => setShowEditionDropdown(!showEditionDropdown)}>
          <Text style={styles.editionDropdownText}>{selectedEdition}</Text>
          <Feather name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Feather name="filter" size={20} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Edition Dropdown Menu - Moved outside of filtersContainer */}
      {showEditionDropdown && (
        <View style={styles.dropdownMenu}>
          <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
            {POKEMON_EDITIONS.map((edition) => (
              <TouchableOpacity
                key={edition}
                style={[styles.dropdownItem, selectedEdition === edition && styles.selectedDropdownItem]}
                onPress={() => {
                  setSelectedEdition(edition)
                  setShowEditionDropdown(false)
                }}
              >
                <Text style={[styles.dropdownItemText, selectedEdition === edition && styles.selectedDropdownItemText]}>
                  {edition}
                </Text>
                {selectedEdition === edition && <Feather name="check" size={16} color="#6c08dd" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Backdrop to close dropdown when clicking outside */}
      {showEditionDropdown && (
        <TouchableOpacity style={styles.backdrop} activeOpacity={0} onPress={() => setShowEditionDropdown(false)} />
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Filters Display */}
        {(filters.priceRange !== "all" || filters.selectedEditions.length > 0 || filters.sortBy !== "name_asc") && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersTitle}>Filtros activos:</Text>
            <View style={styles.activeFiltersRow}>
              {filters.priceRange !== "all" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Precio: {filters.priceRange}</Text>
                </View>
              )}
              {filters.selectedEditions.map((edition) => (
                <View key={edition} style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>{edition}</Text>
                </View>
              ))}
              {filters.sortBy !== "name_asc" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Ordenado por: {filters.sortBy}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 🔧 INFORMACIÓN DE TASA DE CAMBIO */}
        <View style={styles.exchangeRateContainer}>
          <Text style={styles.exchangeRateText}>
            Tasa de cambio: 1 USD = ${EXCHANGE_RATE_USD_TO_CLP.toLocaleString("es-CL")} CLP
          </Text>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsGrid}>
          {filteredCards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <TouchableOpacity style={styles.addButton} onPress={() => addCardToCollection(card.id)}>
                <Feather name="plus" size={16} color="white" />
              </TouchableOpacity>
              <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {card.name}
                </Text>
                <Text style={styles.cardEdition}>{card.edition}</Text>
                {/* ✅ PRECIO EN CLP */}
                <Text style={styles.cardPrice}>{card.price}</Text>
                {/* Precio original en USD como referencia */}
                <Text style={styles.cardPriceUSD}>{`($${(card.originalPriceUSD || 0).toFixed(2)} USD)`}</Text>
              </View>
            </View>
          ))}
        </View>

        {filteredCards.length === 0 && !loadingProducts && (
          <View style={styles.noResultsContainer}>
            <Feather name="search" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron cartas</Text>
            <Text style={styles.noResultsSubtext}>Intenta ajustar tus filtros de búsqueda</Text>
          </View>
        )}
      </ScrollView>

      {/* Toast Component */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        cardName={toastCardName}
        cardImage={toastCardImage}
        onDismiss={() => setToastVisible(false)}
        type="success"
      />

      {/* Advanced Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filtros Avanzados</Text>
                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                  <Feather name="x" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {/* Sort Options */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Ordenar por</Text>
                  {[
                    { key: "name_asc", label: "Nombre (A-Z)" },
                    { key: "name_desc", label: "Nombre (Z-A)" },
                    { key: "price_asc", label: "Precio (menor a mayor)" },
                    { key: "price_desc", label: "Precio (mayor a menor)" },
                    { key: "edition_asc", label: "Edición (A-Z)" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.filterOption, filters.sortBy === option.key && styles.selectedFilterOption]}
                      onPress={() => updateFilters({ sortBy: option.key as SortOption })}
                    >
                      <Text style={styles.filterOptionText}>{option.label}</Text>
                      {filters.sortBy === option.key && <Feather name="check" size={18} color="#6c08dd" />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Price Range */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Rango de precio (CLP)</Text>
                  {[
                    { key: "all", label: "Todos los precios" },
                    { key: "0-5000", label: "$0 - $5.000 CLP" },
                    { key: "5000-10000", label: "$5.000 - $10.000 CLP" },
                    { key: "10000-20000", label: "$10.000 - $20.000 CLP" },
                    { key: "20000+", label: "Más de $20.000 CLP" },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.key}
                      style={[styles.filterOption, filters.priceRange === option.key && styles.selectedFilterOption]}
                      onPress={() => updateFilters({ priceRange: option.key as PriceRange })}
                    >
                      <Text style={styles.filterOptionText}>{option.label}</Text>
                      {filters.priceRange === option.key && <Feather name="check" size={18} color="#6c08dd" />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Edition Selection */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Ediciones específicas</Text>
                  {POKEMON_EDITIONS.slice(1).map((edition) => (
                    <TouchableOpacity
                      key={edition}
                      style={[
                        styles.filterOption,
                        filters.selectedEditions.includes(edition) && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleEditionFilter(edition)}
                    >
                      <Text style={styles.filterOptionText}>{edition}</Text>
                      {filters.selectedEditions.includes(edition) && <Feather name="check" size={18} color="#6c08dd" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                  <Text style={styles.clearButtonText}>Limpiar filtros</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={() => setShowFilterModal(false)}>
                  <Text style={styles.applyButtonText}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
  },
  filtersContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 10,
    position: "relative",
    zIndex: 1001, // Ensure this is above other elements
  },
  editionDropdown: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
  },
  editionDropdownText: {
    fontSize: 14,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 5,
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    zIndex: 999, // Below dropdown but above other content
  },
  dropdownMenu: {
    position: "absolute",
    top: 165, // Adjusted to position below the filters container with some spacing
    left: 15,
    right: 67,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 5,
    zIndex: 1000, // Increased z-index to ensure it appears on top
    elevation: 1000, // Increased elevation for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxHeight: 200,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDropdownItem: {
    backgroundColor: "#f0e6ff",
  },
  dropdownItemText: {
    fontSize: 14,
    color: "#333",
  },
  selectedDropdownItemText: {
    color: "#6c08dd",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
    zIndex: 1, // Lower z-index than the dropdown
  },
  activeFiltersContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  activeFilterChip: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  activeFilterText: {
    color: "#fff",
    fontSize: 12,
  },
  clearFiltersButton: {
    backgroundColor: "#ff4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  // 🔧 NUEVO ESTILO: Contenedor para mostrar la tasa de cambio
  exchangeRateContainer: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  exchangeRateText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  cardContainer: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dadada",
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  addButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#6c08dd",
    justifyContent: "center",
    alignItems: "center",
  },
  cardImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
  },
  cardInfo: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  cardEdition: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c08dd",
    marginTop: 5,
  },
  // 🔧 NUEVO ESTILO: Precio en USD como referencia
  cardPriceUSD: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginVertical: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    zIndex: 1100, // Ensure modal is on top
    elevation: 1100, // For Android
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
    flex: 1,
    padding: 15,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  filterOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedFilterOption: {
    backgroundColor: "#f0e6ff",
    borderRadius: 5,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#333",
  },
  modalActions: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#666",
    fontWeight: "bold",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#6c08dd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: "#f44336",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
})
