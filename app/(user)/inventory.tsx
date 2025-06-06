"use client"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native"
import { useUserStore, type Product } from "../../store/userStore"

// Filter options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "condition_asc" | "rarity_asc"
type PriceRange = "all" | "0-5000" | "5000-10000" | "10000-20000" | "20000+"

interface FilterState {
  sortBy: SortOption
  priceRange: PriceRange
  selectedConditions: string[]
  selectedRarities: string[]
  availableOnly: boolean
}

export default function InventoryScreen() {
  const {
    inventory,
    inventoryLoading,
    inventoryError,
    currentUser,
    loadUserInventory,
    removeProductFromInventory,
    getInventoryStats,
  } = useUserStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState<Product[]>([])
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null) // 🔧 NUEVO: Estado para indicador de carga

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name_asc",
    priceRange: "all",
    selectedConditions: [],
    selectedRarities: [],
    availableOnly: false,
  })

  // Get unique values for filters
  const getUniqueConditions = () => {
    const conditions = inventory
      .map((item) => item.condition)
      .filter((condition): condition is string => Boolean(condition))
    return [...new Set(conditions)]
  }

  const getUniqueRarities = () => {
    const rarities = inventory.map((item) => item.rarity).filter((rarity): rarity is string => Boolean(rarity))
    return [...new Set(rarities)]
  }

  // Load inventory on component mount
  useEffect(() => {
    if (currentUser && !inventoryLoading) {
      loadUserInventory()
    }
  }, [currentUser])

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await loadUserInventory()
    } catch (error) {
      console.error("Error refreshing inventory:", error)
    } finally {
      setRefreshing(false)
    }
  }

  // Get inventory stats
  const inventoryStats = getInventoryStats()

  // Format price for display
  const formatPrice = (price: number) => {
    return `${price.toLocaleString("es-CL")} CLP`
  }

  // Get image URI with fallback
  const getImageUri = (item: Product) => {
    return (
      item.images?.large || item.images?.small || item.images?.symbol || "https://images.pokemontcg.io/sv4pt5/1.png"
    )
  }

  // Auto-load inventory even without currentUser for now
  useEffect(() => {
    if (!currentUser && !inventoryLoading) {
      loadUserInventory()
    }
  }, [currentUser, inventoryLoading, loadUserInventory])

  // 🔧 MÉTODO SIMPLIFICADO: Eliminar producto directamente sin confirmación
  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      console.log(`🗑️ INVENTORY: Eliminando producto: ${productId} - ${productName}`)

      // Mostrar indicador de carga
      setDeletingId(productId)

      // Llamar al método del store para eliminar
      await removeProductFromInventory(productId)

      console.log(`✅ INVENTORY: Producto eliminado exitosamente: ${productId}`)
    } catch (error) {
      console.error("❌ INVENTORY: Error eliminando producto:", error)
      console.error("❌ INVENTORY: Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      })
    } finally {
      // Ocultar indicador de carga
      setDeletingId(null)
    }
  }

  // Calculate total price
  const calculateTotalPrice = () => {
    const total = filteredItems.reduce((sum, item) => sum + item.price, 0)
    return total.toLocaleString("es-CL")
  }

  // Navigate to add item screen
  const navigateToAddItem = () => {
    router.push("/add-card")
  }

  // Update filter state
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Toggle condition in filters
  const toggleConditionFilter = (condition: string) => {
    const currentConditions = filters.selectedConditions
    if (currentConditions.includes(condition)) {
      updateFilters({
        selectedConditions: currentConditions.filter((c) => c !== condition),
      })
    } else {
      updateFilters({
        selectedConditions: [...currentConditions, condition],
      })
    }
  }

  // Toggle rarity in filters
  const toggleRarityFilter = (rarity: string) => {
    const currentRarities = filters.selectedRarities
    if (currentRarities.includes(rarity)) {
      updateFilters({
        selectedRarities: currentRarities.filter((r) => r !== rarity),
      })
    } else {
      updateFilters({
        selectedRarities: [...currentRarities, rarity],
      })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      sortBy: "name_asc",
      priceRange: "all",
      selectedConditions: [],
      selectedRarities: [],
      availableOnly: false,
    })
    setSearchQuery("")
  }

  // Apply all filters
  useEffect(() => {
    let filtered = [...inventory]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.product_type.toLowerCase().includes(query) ||
          item.set?.name?.toLowerCase().includes(query) ||
          item.rarity?.toLowerCase().includes(query) ||
          item.condition?.toLowerCase().includes(query),
      )
    }

    // Apply condition filters
    if (filters.selectedConditions.length > 0) {
      filtered = filtered.filter((item) => item.condition && filters.selectedConditions.includes(item.condition))
    }

    // Apply rarity filters
    if (filters.selectedRarities.length > 0) {
      filtered = filtered.filter((item) => item.rarity && filters.selectedRarities.includes(item.rarity))
    }

    // Apply availability filter
    if (filters.availableOnly) {
      filtered = filtered.filter((item) => item.is_available === true)
    }

    // Apply price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((item) => {
        const price = item.price
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
    filtered = sortItems(filtered, filters.sortBy)

    setFilteredItems(filtered)
  }, [searchQuery, inventory, filters])

  // Sort items based on selected option
  const sortItems = (itemList: Product[], option: SortOption) => {
    const sorted = [...itemList]

    switch (option) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "price_asc":
        return sorted.sort((a, b) => a.price - b.price)
      case "price_desc":
        return sorted.sort((a, b) => b.price - a.price)
      case "condition_asc":
        return sorted.sort((a, b) => (a.condition || "").localeCompare(b.condition || ""))
      case "rarity_asc":
        return sorted.sort((a, b) => (a.rarity || "").localeCompare(b.rarity || ""))
      default:
        return sorted
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
        <Text style={styles.headerTitle}>Mis Artículos</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={navigateToAddItem}>
            <Feather name="plus" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShowFilterModal(true)}>
            <Feather name="more-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en el inventario"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats Container */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inventoryStats.totalProducts}</Text>
          <Text style={styles.statLabel}>Artículos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{inventoryStats.forSale}</Text>
          <Text style={styles.statLabel}>En venta</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatPrice(inventoryStats.totalValue)}</Text>
          <Text style={styles.statLabel}>Valor total</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Loading State */}
        {inventoryLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando inventario...</Text>
          </View>
        )}

        {/* Error State */}
        {inventoryError && (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color="#ff4444" />
            <Text style={styles.errorText}>Error al cargar inventario</Text>
            <Text style={styles.errorSubtext}>{inventoryError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUserInventory}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Filters Display */}
        {!inventoryLoading &&
          (filters.priceRange !== "all" ||
            filters.selectedConditions.length > 0 ||
            filters.selectedRarities.length > 0 ||
            filters.availableOnly ||
            filters.sortBy !== "name_asc") && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersTitle}>Filtros activos:</Text>
              <View style={styles.activeFiltersRow}>
                {filters.priceRange !== "all" && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>Precio: {filters.priceRange}</Text>
                  </View>
                )}
                {filters.selectedConditions.map((condition) => (
                  <View key={condition} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>{condition}</Text>
                  </View>
                ))}
                {filters.selectedRarities.map((rarity) => (
                  <View key={rarity} style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>{rarity}</Text>
                  </View>
                ))}
                {filters.availableOnly && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>Solo disponibles</Text>
                  </View>
                )}
                {filters.sortBy !== "name_asc" && (
                  <View style={styles.activeFilterChip}>
                    <Text style={styles.activeFilterText}>Ordenado</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                  <Text style={styles.clearFiltersText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        {/* Items Grid */}
        {!inventoryLoading && !inventoryError && (
          <View style={styles.itemsGrid}>
            {filteredItems.map((item) => (
              <View key={item._id} style={styles.itemContainer}>
                <Image source={{ uri: getImageUri(item) }} style={styles.itemImage} />

                {/* 🔧 BOTÓN DE ELIMINAR SIMPLIFICADO */}
                <TouchableOpacity
                  style={[styles.removeButton, deletingId === item._id && styles.removeButtonLoading]}
                  onPress={() => {
                    console.log(`🗑️ Botón eliminar presionado para producto: ${item._id} - ${item.name}`)
                    handleDeleteProduct(item._id, item.name)
                  }}
                  disabled={deletingId === item._id}
                  activeOpacity={0.7}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  {deletingId === item._id ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : (
                    <Feather name="x" size={16} color="white" />
                  )}
                </TouchableOpacity>

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemBrand}>{item.set?.name || item.product_type}</Text>
                  <Text style={styles.itemCondition}>{item.condition}</Text>
                  <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
                  {item.is_available && <View style={styles.availableBadge} />}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Results */}
        {!inventoryLoading && !inventoryError && filteredItems.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Feather name="package" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron artículos</Text>
            <Text style={styles.noResultsSubtext}>
              {searchQuery ||
              filters.priceRange !== "all" ||
              filters.selectedConditions.length > 0 ||
              filters.selectedRarities.length > 0
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Añade artículos a tu inventario"}
            </Text>
            {!searchQuery &&
              filters.priceRange === "all" &&
              filters.selectedConditions.length === 0 &&
              filters.selectedRarities.length === 0 && (
                <TouchableOpacity style={styles.addItemButton} onPress={navigateToAddItem}>
                  <Text style={styles.addItemButtonText}>Añadir Artículo</Text>
                </TouchableOpacity>
              )}
          </View>
        )}
      </ScrollView>

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
                <Text style={styles.modalTitle}>Filtros y Ordenamiento</Text>
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
                    { key: "condition_asc", label: "Condición (A-Z)" },
                    { key: "rarity_asc", label: "Rareza (A-Z)" },
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
                  <Text style={styles.filterSectionTitle}>Rango de precio</Text>
                  {[
                    { key: "all", label: "Todos los precios" },
                    { key: "0-5000", label: "0 - 5.000 CLP" },
                    { key: "5000-10000", label: "5.000 - 10.000 CLP" },
                    { key: "10000-20000", label: "10.000 - 20.000 CLP" },
                    { key: "20000+", label: "Más de 20.000 CLP" },
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

                {/* Condition Selection */}
                {getUniqueConditions().length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Condición</Text>
                    {getUniqueConditions().map((condition) => (
                      <TouchableOpacity
                        key={condition}
                        style={[
                          styles.filterOption,
                          filters.selectedConditions.includes(condition) && styles.selectedFilterOption,
                        ]}
                        onPress={() => toggleConditionFilter(condition)}
                      >
                        <Text style={styles.filterOptionText}>{condition}</Text>
                        {filters.selectedConditions.includes(condition) && (
                          <Feather name="check" size={18} color="#6c08dd" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Rarity Selection */}
                {getUniqueRarities().length > 0 && (
                  <View style={styles.filterSection}>
                    <Text style={styles.filterSectionTitle}>Rareza</Text>
                    {getUniqueRarities().map((rarity) => (
                      <TouchableOpacity
                        key={rarity}
                        style={[
                          styles.filterOption,
                          filters.selectedRarities.includes(rarity) && styles.selectedFilterOption,
                        ]}
                        onPress={() => toggleRarityFilter(rarity)}
                      >
                        <Text style={styles.filterOptionText}>{rarity}</Text>
                        {filters.selectedRarities.includes(rarity) && (
                          <Feather name="check" size={18} color="#6c08dd" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Availability Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Disponibilidad</Text>
                  <TouchableOpacity
                    style={[styles.filterOption, filters.availableOnly && styles.selectedFilterOption]}
                    onPress={() => updateFilters({ availableOnly: !filters.availableOnly })}
                  >
                    <Text style={styles.filterOptionText}>Solo artículos disponibles para venta</Text>
                    {filters.availableOnly && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
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
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    marginLeft: 15,
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
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff4444",
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  itemContainer: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dadada",
    marginBottom: 15,
    overflow: "hidden",
    position: "relative",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 999,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  // 🔧 NUEVO: Estilo para botón en estado de carga
  removeButtonLoading: {
    backgroundColor: "#ff6666",
  },
  itemImage: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    backgroundColor: "#f5f5f5",
  },
  itemInfo: {
    padding: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  itemBrand: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  itemCondition: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c08dd",
    marginTop: 5,
  },
  availableBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4CAF50",
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
  addItemButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
  },
  addItemButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
    marginLeft: 10,
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
})
