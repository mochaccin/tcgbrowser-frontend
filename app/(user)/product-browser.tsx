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

// Sample card data
const CARD_DATA = [
  {
    id: "card1",
    name: "Magikarp",
    set: "Conjunto base (sin sombras)",
    rarity: "Poco común",
    number: "#035/102",
    listingCount: 3,
    price: "800",
    marketPrice: "900",
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "card2",
    name: "Pikachu",
    set: "Conjunto base (sin sombras)",
    rarity: "Común",
    number: "#058/102",
    listingCount: 5,
    price: "1.200",
    marketPrice: "1.500",
    imageUri: "https://images.pokemontcg.io/base1/58.png",
  },
  {
    id: "card3",
    name: "Charizard",
    set: "Conjunto base (sin sombras)",
    rarity: "Rara",
    number: "#004/102",
    listingCount: 2,
    price: "45.000",
    marketPrice: "50.000",
    imageUri: "https://images.pokemontcg.io/base1/4.png",
  },
  {
    id: "card4",
    name: "Blastoise",
    set: "Conjunto base (sin sombras)",
    rarity: "Rara",
    number: "#002/102",
    listingCount: 1,
    price: "35.000",
    marketPrice: "40.000",
    imageUri: "https://images.pokemontcg.io/base1/2.png",
  },
  {
    id: "card5",
    name: "Venusaur",
    set: "Conjunto base (sin sombras)",
    rarity: "Rara",
    number: "#015/102",
    listingCount: 2,
    price: "30.000",
    marketPrice: "32.000",
    imageUri: "https://images.pokemontcg.io/base1/15.png",
  },
  {
    id: "card6",
    name: "Gyarados",
    set: "Conjunto base (sin sombras)",
    rarity: "Rara",
    number: "#006/102",
    listingCount: 3,
    price: "15.000",
    marketPrice: "18.000",
    imageUri: "https://images.pokemontcg.io/base1/6.png",
  },
]

// Available filters
const AVAILABLE_FILTERS = {
  categories: ["Pokémon", "Magic", "Yu-Gi-Oh", "Digimon", "One Piece"],
  sets: ["Conjunto base", "Prismatic Evolutions", "Jungle", "Fossil", "Team Rocket"],
  rarities: ["Común", "Poco común", "Rara", "Ultra Rara", "Secreta Rara"],
  conditions: ["Mint", "Near Mint", "Excellent", "Good", "Played", "Poor"],
  priceRanges: ["0-1.000", "1.000-5.000", "5.000-10.000", "10.000-50.000", "50.000+"],
}

// Sort options
const SORT_OPTIONS = [
  { id: "price_asc", label: "Precio: menor a mayor" },
  { id: "price_desc", label: "Precio: mayor a menor" },
  { id: "name_asc", label: "Nombre: A-Z" },
  { id: "name_desc", label: "Nombre: Z-A" },
  { id: "newest", label: "Más recientes" },
  { id: "oldest", label: "Más antiguos" },
]

export default function SearchResultsScreen() {
  const params = useLocalSearchParams()
  const searchQuery = (params.query as string) || ""
  const [drawerVisible, setDrawerVisible] = useState(false)

  // State
  const [cards, setCards] = useState(CARD_DATA)
  const [filteredCards, setFilteredCards] = useState(CARD_DATA)
  const [activeFilters, setActiveFilters] = useState<string[]>(["Pokémon"])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState("name_asc")
  const [selectedFilters, setSelectedFilters] = useState({
    categories: ["Pokémon"],
    sets: [],
    rarities: [],
    conditions: [],
    priceRanges: [],
  })
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery)

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...CARD_DATA]

    // Apply search query first
    if (currentSearchQuery.trim()) {
      const query = currentSearchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.set.toLowerCase().includes(query) ||
          card.rarity.toLowerCase().includes(query),
      )
    }

    // Apply category filters
    if (selectedFilters.categories.length > 0) {
      // In a real app, you would filter by category
      // For this demo, we'll just keep all cards if Pokémon is selected
      if (!selectedFilters.categories.includes("Pokémon")) {
        filtered = []
      }
    }

    // Apply set filters
    if (selectedFilters.sets.length > 0) {
      filtered = filtered.filter((card) => selectedFilters.sets.some((set) => card.set.includes(set)))
    }

    // Apply rarity filters
    if (selectedFilters.rarities.length > 0) {
      filtered = filtered.filter((card) => selectedFilters.rarities.includes(card.rarity))
    }

    // Apply price range filters
    if (selectedFilters.priceRanges.length > 0) {
      filtered = filtered.filter((card) => {
        const price = Number.parseInt(card.price.replace(/\./g, ""))
        return selectedFilters.priceRanges.some((range) => {
          const [min, max] = range.split("-").map((val) => Number.parseInt(val.replace(/\./g, "")))
          if (max) {
            return price >= min && price <= max
          } else {
            // Handle "50.000+" case
            return price >= min
          }
        })
      })
    }

    // Apply sorting
    switch (selectedSort) {
      case "price_asc":
        filtered.sort(
          (a, b) => Number.parseInt(a.price.replace(/\./g, "")) - Number.parseInt(b.price.replace(/\./g, "")),
        )
        break
      case "price_desc":
        filtered.sort(
          (a, b) => Number.parseInt(b.price.replace(/\./g, "")) - Number.parseInt(a.price.replace(/\./g, "")),
        )
        break
      case "name_asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name_desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name))
        break
      // In a real app, you would implement newest/oldest sorting based on date fields
    }

    setFilteredCards(filtered)

    // Update active filters display
    const newActiveFilters: string[] = []
    if (selectedFilters.categories.length > 0) {
      newActiveFilters.push(...selectedFilters.categories)
    }
    if (selectedFilters.sets.length > 0) {
      newActiveFilters.push(...selectedFilters.sets)
    }
    if (selectedFilters.rarities.length > 0) {
      newActiveFilters.push(...selectedFilters.rarities)
    }
    if (selectedFilters.priceRanges.length > 0) {
      newActiveFilters.push(...selectedFilters.priceRanges)
    }
    setActiveFilters(newActiveFilters)
  }, [selectedFilters, selectedSort, currentSearchQuery])

  // Toggle filter selection
  const toggleFilter = (category: keyof typeof selectedFilters, filter: string) => {
    setSelectedFilters((prev) => {
      const current = [...prev[category]]
      if (current.includes(filter)) {
        return { ...prev, [category]: current.filter((f) => f !== filter) }
      } else {
        return { ...prev, [category]: [...current, filter] }
      }
    })
  }

  // Remove a specific filter
  const removeFilter = (filter: string) => {
    // Find which category contains this filter
    for (const [category, filters] of Object.entries(selectedFilters)) {
      if (filters.includes(filter)) {
        setSelectedFilters((prev) => ({
          ...prev,
          [category]: prev[category as keyof typeof selectedFilters].filter((f) => f !== filter),
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
          onSubmitEditing={() => {
            // Trigger search when user presses enter
          }}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Results Count and Filters */}
      <View style={styles.resultsHeader}>
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.resultsCount}>{filteredCards.length} resultados</Text>

          <View style={styles.filtersActions}>
            <TouchableOpacity style={styles.filtersButton} onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filtersButtonText}>Filtros</Text>
              <View style={styles.filtersBadge}>
                <Text style={styles.filtersBadgeText}>{activeFilters.length}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
              <Text style={styles.sortButtonText}>A - Z</Text>
              <Feather name="chevron-down" size={16} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {activeFilters.map((filter) => (
            <TouchableOpacity key={filter} style={styles.filterChip} onPress={() => removeFilter(filter)}>
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

        {/* Card Listings */}
        {filteredCards.map((card) => (
          <TouchableOpacity key={card.id} style={styles.cardListing} onPress={() => navigateToCardDetail(card.id)}>
            <View style={styles.cardImageContainer}>
              <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
            </View>

            <View style={styles.cardDetails}>
              <Text style={styles.cardName}>{card.name}</Text>
              <Text style={styles.cardSet}>{card.set}</Text>
              <Text style={styles.cardRarity}>{card.rarity}</Text>
              <Text style={styles.cardNumber}>{card.number}</Text>
              <Text style={styles.cardListingCount}>{card.listingCount} anuncio de</Text>
              <Text style={styles.cardPrice}>$ {card.price} CLP</Text>
              <Text style={styles.cardMarketPrice}>Precio de mercado:</Text>
              <Text style={styles.cardMarketPriceValue}>$ {card.marketPrice} CLP</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredCards.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Feather name="search" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron resultados</Text>
            <Text style={styles.noResultsSubtext}>Intenta con otros filtros o términos de búsqueda</Text>
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
                  {AVAILABLE_FILTERS.categories.map((category) => (
                    <TouchableOpacity
                      key={category}
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
                  {AVAILABLE_FILTERS.sets.map((set) => (
                    <TouchableOpacity
                      key={set}
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

              {/* Rarities */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rareza</Text>
                <View style={styles.filterOptions}>
                  {AVAILABLE_FILTERS.rarities.map((rarity) => (
                    <TouchableOpacity
                      key={rarity}
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
                  {AVAILABLE_FILTERS.conditions.map((condition) => (
                    <TouchableOpacity
                      key={condition}
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

              {/* Price Ranges */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Rango de Precio</Text>
                <View style={styles.filterOptions}>
                  {AVAILABLE_FILTERS.priceRanges.map((range) => (
                    <TouchableOpacity
                      key={range}
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
                        {range} CLP
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
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
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
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6c08dd",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  logoTextPurple: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  logoTextBlack: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    width: 40,
  },
  // Update the resultsHeader style
  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  // Update the activeFiltersContainer style
  activeFiltersContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  // Add this new style
  filtersActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Update the resultsCount style
  resultsCount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  // Update the filtersScroll style
  filtersScroll: {
    marginTop: 5,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    marginRight: 5,
  },
  filtersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  filtersBadge: {
    backgroundColor: "#6c08dd",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 5,
  },
  scrollView: {
    flex: 1,
  },
  featuredBanner: {
    height: 120,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  featuredBannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 15,
  },
  featuredBannerContent: {
    width: "70%",
  },
  featuredBannerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  featuredBannerSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
  },
  featuredBannerButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
  },
  featuredBannerButtonText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardListing: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
  },
  cardImageContainer: {
    width: 100,
    height: 140,
    marginRight: 15,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  cardName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardSet: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  cardListingCount: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardMarketPrice: {
    fontSize: 12,
    color: "#999",
  },
  cardMarketPriceValue: {
    fontSize: 14,
    color: "#6c08dd",
    fontWeight: "bold",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  filterModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  filterModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  filterModalContent: {
    padding: 15,
    maxHeight: 500,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  filterOption: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterOptionSelected: {
    backgroundColor: "#6c08dd",
  },
  filterOptionText: {
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#fff",
  },
  filterModalActions: {
    flexDirection: "row",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
  },
  clearFiltersText: {
    color: "#666",
    fontWeight: "bold",
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: "#6c08dd",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  applyFiltersText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sortModalContainer: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sortModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  sortModalContent: {
    maxHeight: 300,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sortOptionSelected: {
    backgroundColor: "#f0e6ff",
  },
  sortOptionText: {
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
