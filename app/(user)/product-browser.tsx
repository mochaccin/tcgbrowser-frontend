"use client"
import { Feather } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import NavigationDrawer from "../../components/NavigationDrawer"

const { width } = Dimensions.get("window")

// Tasa de cambio estática USD a CLP
const USD_TO_CLP_RATE = 950 // Actualizar según sea necesario

// Función para convertir USD a CLP
const convertUSDToCLP = (usdAmount: number): number => {
  if (typeof usdAmount !== "number" || isNaN(usdAmount) || usdAmount < 0) {
    return 100 // Precio mínimo en CLP
  }
  return Math.round(usdAmount * USD_TO_CLP_RATE)
}

// Función para formatear precios en CLP
const formatCLPPrice = (clpAmount: number): string => {
  if (typeof clpAmount !== "number" || isNaN(clpAmount)) {
    return "0"
  }
  return clpAmount.toLocaleString("es-CL")
}

// API Card interface based on your endpoint structure
interface ApiCard {
  _id: string
  name: string
  tcg_id: string
  supertype: string
  subtypes: string[]
  hp: string
  types: string[]
  rarity: string
  setInfo?: {
    // 🔧 Hacer opcional
    name: string
    series: string
  }
  number: string
  images: {
    small: string
    large: string
  }
  price: number
  stock_quantity: number
  is_available: boolean
  condition: string
}

// Transformed card interface for UI - Actualizado con precios en CLP
interface Card {
  id: string
  name: string
  set: string
  rarity: string
  number: string
  listingCount: number
  price: number // Ahora en CLP
  marketPrice: number // Ahora en CLP
  imageUri: string
  hp: string
  types: string[]
  supertype: string
  condition: string
  isAvailable: boolean
}

// Available filters - Actualizado con rangos de precios en CLP
const AVAILABLE_FILTERS = {
  categories: ["Pokémon", "Magic", "Yu-Gi-Oh", "Digimon", "One Piece"],
  sets: [] as string[], // Will be populated from API data
  rarities: [] as string[], // Will be populated from API data
  conditions: ["Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"],
  priceRanges: ["0-950", "950-4750", "4750-9500", "9500-47500", "47500+"], // Rangos en CLP
  types: [] as string[], // Will be populated from API data
}

// Sort options
const SORT_OPTIONS = [
  { id: "price_asc", label: "Precio: menor a mayor" },
  { id: "price_desc", label: "Precio: mayor a menor" },
  { id: "name_asc", label: "Nombre: A-Z" },
  { id: "name_desc", label: "Nombre: Z-A" },
  { id: "hp_desc", label: "HP: mayor a menor" },
  { id: "hp_asc", label: "HP: menor a mayor" },
]

export default function SearchResultsScreen() {
  const params = useLocalSearchParams()

  // Debug detallado de parámetros
  console.log("🔍 SEARCH: Raw params object:", params)
  console.log("🔍 SEARCH: Params keys:", Object.keys(params))
  console.log("🔍 SEARCH: Params values:", Object.values(params))

  // Extraer parámetros de la URL
  const searchQuery = (params.query as string) || ""
  const filterType = (params.filter as string) || ""
  const filterValue = (params.value as string) || ""

  console.log("📥 SEARCH: Parámetros extraídos:", {
    filterType,
    filterValue,
    searchQuery,
    rawParams: params,
  })

  console.log("📥 SEARCH: Parámetros recibidos:", { filterType, filterValue, searchQuery, allParams: params })

  const [drawerVisible, setDrawerVisible] = useState(false)

  // State
  const [cards, setCards] = useState<Card[]>([])
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>(["Pokémon"])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState("name_asc")
  const [selectedFilters, setSelectedFilters] = useState<{
    categories: string[]
    sets: string[]
    rarities: string[]
    conditions: string[]
    priceRanges: string[]
    types: string[]
  }>({
    categories: ["Pokémon"],
    sets: [],
    rarities: [],
    conditions: [],
    priceRanges: [],
    types: [],
  })
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery)
  const [availableFilters, setAvailableFilters] = useState<{
    categories: string[]
    sets: string[]
    rarities: string[]
    conditions: string[]
    priceRanges: string[]
    types: string[]
  }>(AVAILABLE_FILTERS)

  // 🔧 FUNCIÓN CORREGIDA: Transform API card data to UI format con validaciones
  const transformCard = (apiCard: ApiCard): Card => {
    // Validar precio
    let usdPrice = 0
    if (typeof apiCard.price === "number" && !isNaN(apiCard.price)) {
      usdPrice = apiCard.price
    } else if (typeof apiCard.price === "string") {
      const parsedPrice = Number.parseFloat(apiCard.price)
      usdPrice = !isNaN(parsedPrice) ? parsedPrice : 0
    }

    const priceCLP = convertUSDToCLP(usdPrice)
    const marketPriceCLP = convertUSDToCLP(usdPrice * 1.2) // Assuming 20% markup for market price

    // 🔧 VALIDAR setInfo antes de acceder a sus propiedades
    let setName = "Set desconocido"
    if (apiCard.setInfo && apiCard.setInfo.name) {
      setName = apiCard.setInfo.series ? `${apiCard.setInfo.name} (${apiCard.setInfo.series})` : apiCard.setInfo.name
    }

    // 🔧 VALIDAR otras propiedades que podrían ser undefined
    const cardName = apiCard.name || "Carta sin nombre"
    const cardRarity = apiCard.rarity || "Common"
    const cardNumber = apiCard.number ? `#${apiCard.number}` : "#000"
    const cardHp = apiCard.hp || ""
    const cardTypes = Array.isArray(apiCard.types) ? apiCard.types : []
    const cardSupertype = apiCard.supertype || "Unknown"
    const cardCondition = apiCard.condition || "Near Mint"
    const cardImageUri = apiCard.images?.small || apiCard.images?.large || "https://images.pokemontcg.io/sv4pt5/1.png"
    const stockQuantity = typeof apiCard.stock_quantity === "number" ? apiCard.stock_quantity : 0
    const isAvailable = typeof apiCard.is_available === "boolean" ? apiCard.is_available : false

    console.log(`💰 SEARCH_PRICE_CONVERSION: ${cardName}`)
    console.log(`   USD: $${usdPrice.toFixed(2)} -> CLP: $${priceCLP.toLocaleString("es-CL")}`)

    return {
      id: apiCard._id,
      name: cardName,
      set: setName,
      rarity: cardRarity,
      number: cardNumber,
      listingCount: stockQuantity,
      price: priceCLP,
      marketPrice: marketPriceCLP,
      imageUri: cardImageUri,
      hp: cardHp,
      types: cardTypes,
      supertype: cardSupertype,
      condition: cardCondition,
      isAvailable: isAvailable,
    }
  }

  // Fetch cards from API
  const fetchCards = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 SEARCH: Iniciando carga de productos...")

      const response = await fetch("http://localhost:3000/products")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const apiCards: ApiCard[] = await response.json()
      console.log(`📦 SEARCH: ${apiCards.length} productos recibidos de la API`)

      // 🔧 TRANSFORMAR CON MANEJO DE ERRORES
      const transformedCards: Card[] = []
      const failedTransformations: string[] = []

      apiCards.forEach((apiCard, index) => {
        try {
          const transformedCard = transformCard(apiCard)
          transformedCards.push(transformedCard)
        } catch (err) {
          console.error(`❌ SEARCH: Error transformando carta ${index}:`, err)
          console.error(`   Carta problemática:`, apiCard)
          failedTransformations.push(apiCard._id || `index-${index}`)
        }
      })

      console.log(`✅ SEARCH: ${transformedCards.length} cartas transformadas exitosamente`)
      if (failedTransformations.length > 0) {
        console.warn(
          `⚠️ SEARCH: ${failedTransformations.length} cartas fallaron en la transformación:`,
          failedTransformations,
        )
      }

      setCards(transformedCards)

      // Extract unique values for filters - con validaciones
      const uniqueSets = [
        ...new Set(apiCards.filter((card) => card.setInfo && card.setInfo.name).map((card) => card.setInfo!.name)),
      ]

      const uniqueRarities = [...new Set(apiCards.filter((card) => card.rarity).map((card) => card.rarity))]

      const uniqueTypes = [
        ...new Set(apiCards.filter((card) => Array.isArray(card.types)).flatMap((card) => card.types)),
      ]

      setAvailableFilters((prev) => ({
        ...prev,
        sets: uniqueSets,
        rarities: uniqueRarities,
        types: uniqueTypes,
      }))

      console.log("📦 SEARCH: Sets disponibles:", uniqueSets.slice(0, 10), "... (total:", uniqueSets.length, ")")
    } catch (err) {
      console.error("❌ SEARCH: Error fetching cards:", err)
      setError(err instanceof Error ? err.message : "Error desconocido al cargar las cartas")
    } finally {
      setLoading(false)
    }
  }

  // Apply filters from navigation params - VERSIÓN ARREGLADA
  useEffect(() => {
    console.log("🔄 SEARCH: useEffect de filtros ejecutándose...")
    console.log("   filterType:", filterType)
    console.log("   filterValue:", filterValue)

    if (filterType && filterValue) {
      console.log(`🎯 SEARCH: Aplicando filtro: ${filterType} = ${filterValue}`)

      setSelectedFilters((prev) => {
        const newFilters = { ...prev }

        switch (filterType) {
          case "sets":
            // Limpiar filtros de sets anteriores y aplicar el nuevo
            newFilters.sets = [filterValue]
            console.log(`✅ SEARCH: Filtro de set aplicado: ${filterValue}`)
            break

          case "categories":
            if (!newFilters.categories.includes(filterValue)) {
              newFilters.categories = [...newFilters.categories, filterValue]
              console.log(`✅ SEARCH: Filtro de categoría aplicado: ${filterValue}`)
            }
            break

          case "rarities":
            if (!newFilters.rarities.includes(filterValue)) {
              newFilters.rarities = [...newFilters.rarities, filterValue]
            }
            break

          case "types":
            if (!newFilters.types.includes(filterValue)) {
              newFilters.types = [...newFilters.types, filterValue]
            }
            break

          case "conditions":
            if (!newFilters.conditions.includes(filterValue)) {
              newFilters.conditions = [...newFilters.conditions, filterValue]
            }
            break

          default:
            console.warn(`❌ SEARCH: Tipo de filtro no reconocido: ${filterType}`)
        }

        console.log(`📊 SEARCH: Filtros después de aplicar:`, newFilters)
        return newFilters
      })
    } else {
      console.log("⚠️ SEARCH: No hay filtros para aplicar desde navegación")
    }
  }, [filterType, filterValue])

  // Initial data fetch
  useEffect(() => {
    fetchCards()
  }, [])

  // Apply filters and sorting - Actualizado para precios en CLP
  useEffect(() => {
    let filtered = [...cards]

    console.log(`🔍 SEARCH: Iniciando filtrado con ${filtered.length} cartas`)

    // Apply search query first
    if (currentSearchQuery.trim()) {
      const query = currentSearchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.set.toLowerCase().includes(query) ||
          card.rarity.toLowerCase().includes(query) ||
          card.types.some((type: string) => type.toLowerCase().includes(query)),
      )
      console.log(`🔍 SEARCH: Después de búsqueda por texto: ${filtered.length} cartas`)
    }

    // Apply category filters (assuming Pokémon for now)
    if (selectedFilters.categories.length > 0) {
      if (!selectedFilters.categories.includes("Pokémon")) {
        filtered = []
        console.log(`🔍 SEARCH: Filtro de categoría eliminó todas las cartas`)
      }
    }

    // Apply set filters - VERSIÓN MEJORADA
    if (selectedFilters.sets.length > 0) {
      console.log(`🔍 SEARCH: Aplicando filtros de sets:`, selectedFilters.sets)
      console.log(`📦 SEARCH: Cartas antes del filtro de sets:`, filtered.length)

      const originalFiltered = [...filtered]
      filtered = filtered.filter((card) => {
        const cardSetName = card.set.toLowerCase()
        const matchesAnySet = selectedFilters.sets.some((filterSet) => {
          const filterSetLower = filterSet.toLowerCase()
          // Búsqueda más flexible - coincidencia parcial en ambas direcciones
          const matches = cardSetName.includes(filterSetLower) || filterSetLower.includes(cardSetName)

          if (matches) {
            console.log(`✅ SEARCH: Carta coincide: ${card.name} - Set: ${card.set}`)
          }

          return matches
        })

        return matchesAnySet
      })

      console.log(`📦 SEARCH: Cartas después del filtro de sets: ${filtered.length}`)

      if (filtered.length === 0 && originalFiltered.length > 0) {
        console.log(`⚠️ SEARCH: El filtro de sets eliminó todas las cartas. Verificando coincidencias...`)
        console.log(`   Sets buscados:`, selectedFilters.sets)
        console.log(
          `   Algunos sets de cartas:`,
          originalFiltered.slice(0, 5).map((c) => c.set),
        )
      }
    }

    // Apply rarity filters
    if (selectedFilters.rarities.length > 0) {
      filtered = filtered.filter((card) => selectedFilters.rarities.includes(card.rarity))
      console.log(`🔍 SEARCH: Después de filtro de rareza: ${filtered.length} cartas`)
    }

    // Apply condition filters
    if (selectedFilters.conditions.length > 0) {
      filtered = filtered.filter((card) => selectedFilters.conditions.includes(card.condition))
      console.log(`🔍 SEARCH: Después de filtro de condición: ${filtered.length} cartas`)
    }

    // Apply type filters
    if (selectedFilters.types.length > 0) {
      filtered = filtered.filter((card) => card.types.some((type: string) => selectedFilters.types.includes(type)))
      console.log(`🔍 SEARCH: Después de filtro de tipos: ${filtered.length} cartas`)
    }

    // Apply price range filters - Actualizado para CLP
    if (selectedFilters.priceRanges.length > 0) {
      filtered = filtered.filter((card) => {
        const price = card.price // Ya está en CLP
        return selectedFilters.priceRanges.some((range) => {
          const parts = range.split("-")
          const min = Number.parseInt(parts[0] || "0")
          const max = parts[1] ? Number.parseInt(parts[1]) : null
          if (max) {
            return price >= min && price <= max
          } else {
            return price >= min
          }
        })
      })
      console.log(`🔍 SEARCH: Después de filtro de precio: ${filtered.length} cartas`)
    }

    // Apply sorting - Actualizado para precios en CLP
    switch (selectedSort) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "hp_desc":
        filtered.sort((a, b) => Number.parseInt(b.hp || "0") - Number.parseInt(a.hp || "0"))
        break
      case "hp_asc":
        filtered.sort((a, b) => Number.parseInt(a.hp || "0") - Number.parseInt(b.hp || "0"))
        break
    }

    console.log(`🎯 SEARCH: Resultados finales: ${filtered.length} cartas`)
    console.log(`   Filtros activos:`, selectedFilters)
    console.log(`   Filtro desde navegación: ${filterValue || "ninguno"}`)

    setFilteredCards(filtered)

    // Update active filters display
    const newActiveFilters: string[] = []
    Object.entries(selectedFilters).forEach(([key, values]) => {
      if (Array.isArray(values) && values.length > 0) {
        newActiveFilters.push(...values)
      }
    })
    setActiveFilters(newActiveFilters)
  }, [selectedFilters, selectedSort, currentSearchQuery, cards])

  // Toggle filter selection
  const toggleFilter = (category: keyof typeof selectedFilters, filter: string) => {
    setSelectedFilters((prev) => {
      const current = [...(prev[category] as string[])]
      if (current.includes(filter)) {
        return { ...prev, [category]: current.filter((f) => f !== filter) }
      } else {
        return { ...prev, [category]: [...current, filter] }
      }
    })
  }

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    for (const [category, filters] of Object.entries(selectedFilters)) {
      if (filters.includes(filter)) {
        setSelectedFilters((prev) => ({
          ...prev,
          [category]: (prev[category as keyof typeof selectedFilters] as string[]).filter((f) => f !== filter),
        }))
        break
      }
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      sets: [],
      rarities: [],
      conditions: [],
      priceRanges: [],
      types: [],
    })
  }

  // Apply filters and close modal
  const applyFilters = () => {
    setShowFilterModal(false)
  }

  // Navigate to card detail
  const navigateToCardDetail = (cardId: string) => {
    router.push({ pathname: "/product-details", params: { cardId } })
  }

  // Refresh data
  const handleRefresh = () => {
    fetchCards()
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando cartas...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error al cargar las cartas</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Navigation Drawer */}
      <NavigationDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoTextPurple}>TCG</Text>
          <Text style={styles.logoTextBlack}>BROWSER</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="user" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleRefresh}>
            <Feather name="refresh-cw" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca tu carta"
          placeholderTextColor="#999"
          value={currentSearchQuery}
          onChangeText={setCurrentSearchQuery}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Results Count and Filters */}
      <View style={styles.resultsHeader}>
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.resultsCount}>{filteredCards.length} resultados</Text>
          {filterValue && <Text style={styles.appliedFilterText}>Filtrado por: {filterValue}</Text>}

          <View style={styles.filtersActions}>
            <TouchableOpacity style={styles.filtersButton} onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filtersButtonText}>Filtros</Text>
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>{activeFilters.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
              <Text style={styles.sortButtonText}>
                {SORT_OPTIONS.find((opt) => opt.id === selectedSort)?.label.split(":")[0] || "A - Z"}
              </Text>
              <Feather name="chevron-down" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {activeFilters.map((filter, index) => (
            <TouchableOpacity
              key={`filter-${index}-${filter}`}
              style={styles.filterChip}
              onPress={() => removeFilter(filter)}
            >
              <Text style={styles.filterChipText}>{filter}</Text>
              <Feather name="x" size={14} color="black" />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Banner */}
        <View style={styles.featuredBanner}>
          <Image
            source={{
              uri: "https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1",
            }}
            style={styles.featuredBannerImage}
          />
          <View style={styles.featuredBannerOverlay}>
            <View style={styles.featuredBannerContent}>
              <Text style={styles.featuredBannerTitle}>SV: Prismatic Evolutions</Text>
              <Text style={styles.featuredBannerSubtitle}>Nuevo Paquete de Refuerzo</Text>
              <TouchableOpacity style={styles.featuredBannerButton}>
                <Text style={styles.featuredBannerButtonText}>Ver más</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Card Listings - Actualizado con precios en CLP */}
        {filteredCards.map((card) => (
          <TouchableOpacity
            key={`card-${card.id}`}
            style={styles.cardListing}
            onPress={() => navigateToCardDetail(card.id)}
          >
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
            </View>

            <View style={styles.cardDetails}>
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardSet}>{card.set}</Text>
              <Text style={styles.cardRarity}>{card.rarity}</Text>
              <Text style={styles.cardNumber}>{card.number}</Text>
              {card.hp && <Text style={styles.cardHp}>HP: {card.hp}</Text>}
              <View style={styles.cardTypes}>
                {card.types.map((type, index) => (
                  <Text key={`${card.id}-type-${index}`} style={styles.cardType}>
                    {type}
                  </Text>
                ))}
              </View>
              <Text style={styles.cardListingCount}>
                {card.listingCount} {card.isAvailable ? "disponible" : "agotado"}
              </Text>
              <Text style={styles.cardPrice}>$ {formatCLPPrice(card.price)} CLP</Text>
              <Text style={styles.cardMarketPrice}>Precio de mercado:</Text>
              <Text style={styles.cardMarketPriceValue}>$ {formatCLPPrice(card.marketPrice)} CLP</Text>
              <Text style={styles.cardCondition}>Estado: {card.condition}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredCards.length === 0 && !loading && (
          <View style={styles.noResultsContainer}>
            <Feather name="search" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron resultados</Text>
            <Text style={styles.noResultsSubtext}>
              {filterValue
                ? `No hay cartas disponibles para "${filterValue}"`
                : "Intenta con otros filtros o términos de búsqueda"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModalContainer}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalContent}>
              {/* Categories */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Categorías</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.categories.map((category, index) => (
                    <TouchableOpacity
                      key={`category-${index}-${category}`}
                      style={[
                        styles.filterOption,
                        selectedFilters.categories.includes(category) && styles.filterOptionSelected,
                      ]}
                      onPress={() => toggleFilter("categories", category)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.categories.includes(category) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sets */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Sets</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.sets.map((set, index) => (
                    <TouchableOpacity
                      key={`set-${index}-${set}`}
                      style={[styles.filterOption, selectedFilters.sets.includes(set) && styles.filterOptionSelected]}
                      onPress={() => toggleFilter("sets", set)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.sets.includes(set) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {set}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Types */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Tipos</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.types.map((type, index) => (
                    <TouchableOpacity
                      key={`type-${index}-${type}`}
                      style={[styles.filterOption, selectedFilters.types.includes(type) && styles.filterOptionSelected]}
                      onPress={() => toggleFilter("types", type)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.types.includes(type) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Rarities */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rareza</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.rarities.map((rarity, index) => (
                    <TouchableOpacity
                      key={`rarity-${index}-${rarity}`}
                      style={[
                        styles.filterOption,
                        selectedFilters.rarities.includes(rarity) && styles.filterOptionSelected,
                      ]}
                      onPress={() => toggleFilter("rarities", rarity)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.rarities.includes(rarity) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {rarity}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Conditions */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Estado</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.conditions.map((condition, index) => (
                    <TouchableOpacity
                      key={`condition-${index}-${condition}`}
                      style={[
                        styles.filterOption,
                        selectedFilters.conditions.includes(condition) && styles.filterOptionSelected,
                      ]}
                      onPress={() => toggleFilter("conditions", condition)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.conditions.includes(condition) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {condition}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Price Ranges - Actualizado con rangos en CLP */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rango de Precio</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.priceRanges.map((range, index) => (
                    <TouchableOpacity
                      key={`price-${index}-${range}`}
                      style={[
                        styles.filterOption,
                        selectedFilters.priceRanges.includes(range) && styles.filterOptionSelected,
                      ]}
                      onPress={() => toggleFilter("priceRanges", range)}
                    >
                      <Text
                        style={[
                          styles.filterOptionText,
                          selectedFilters.priceRanges.includes(range) && styles.filterOptionTextSelected,
                        ]}
                      >
                        {range.replace(/(\d+)/g, (match) => formatCLPPrice(Number.parseInt(match)))} CLP
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.filterModalActions}>
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                <Text style={styles.clearFiltersText}>Limpiar filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyFiltersButton} onPress={applyFilters}>
                <Text style={styles.applyFiltersText}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModalContainer}>
            <View style={styles.sortModalHeader}>
              <Text style={styles.sortModalTitle}>Ordenar por</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sortModalContent}>
              {SORT_OPTIONS.map((option, index) => (
                <TouchableOpacity
                  key={`sort-${index}-${option.id}`}
                  style={[styles.sortOption, selectedSort === option.id && styles.sortOptionSelected]}
                  onPress={() => {
                    setSelectedSort(option.id)
                    setShowSortModal(false)
                  }}
                >
                  <Text style={styles.sortOptionText}>{option.label}</Text>
                  {selectedSort === option.id && <Feather name="check" size={18} color="#6c08dd" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

// Complete StyleSheet with all styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff6b6b",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextPurple: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  logoTextBlack: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  appliedFilterText: {
    fontSize: 12,
    color: "#6c08dd",
    fontWeight: "500",
    marginLeft: 8,
  },
  filtersActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filtersButtonText: {
    fontSize: 14,
    color: "black",
    marginRight: 4,
  },
  filtersBadge: {
    backgroundColor: "#6c08dd",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersBadgeText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortButtonText: {
    fontSize: 14,
    color: "black",
    marginRight: 4,
  },
  filtersScroll: {
    marginTop: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    color: "black",
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  featuredBanner: {
    height: 200,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  featuredBannerImage: {
    width: "100%",
    height: "100%",
  },
  featuredBannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  featuredBannerContent: {
    alignItems: "center",
  },
  featuredBannerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  featuredBannerSubtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  featuredBannerButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  featuredBannerButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cardListing: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageContainer: {
    width: 80,
    height: 112,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 2,
  },
  cardSet: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cardHp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  cardTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  cardType: {
    fontSize: 10,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  cardListingCount: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c08dd",
    marginBottom: 2,
  },
  cardMarketPrice: {
    fontSize: 10,
    color: "#999",
  },
  cardMarketPriceValue: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cardCondition: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ccc",
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  filterModalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  filterModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  filterModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#f8f8f8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#6c08dd",
  },
  filterOptionText: {
    fontSize: 14,
    color: "black",
  },
  filterOptionTextSelected: {
    color: "white",
  },
  filterModalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  clearFiltersText: {
    fontSize: 16,
    color: "black",
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: "#6c08dd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  applyFiltersText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  sortModalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "50%",
  },
  sortModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
  },
  sortModalContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortOptionSelected: {
    backgroundColor: "#f8f8ff",
  },
  sortOptionText: {
    fontSize: 16,
    color: "black",
  },
})
