"use client"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
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
} from "react-native"

// Sample inventory data
const INVENTORY_ITEMS = [
  {
    id: "item1",
    name: "Prismatic Evolutions Booster",
    brand: "Pokemon TCG",
    price: "5.000CLP",
    imageUri: "https://images.pokemontcg.io/sv4pt5/1.png",
  },
  {
    id: "item2",
    name: "Charizard ex",
    brand: "Pokemon TCG",
    price: "15.000CLP",
    imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
  },
  {
    id: "item3",
    name: "Pikachu VMAX",
    brand: "Pokemon TCG",
    price: "8.000CLP",
    imageUri: "https://images.pokemontcg.io/swsh4/188.png",
  },
  {
    id: "item4",
    name: "Eevee",
    brand: "Pokemon TCG",
    price: "12.000CLP",
    imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
  },
  {
    id: "item5",
    name: "Rayquaza ex",
    brand: "Pokemon TCG",
    price: "4.500CLP",
    imageUri: "https://images.pokemontcg.io/swsh5/110.png",
  },
  {
    id: "item6",
    name: "Umbreon VMAX",
    brand: "Pokemon TCG",
    price: "20.000CLP",
    imageUri: "https://images.pokemontcg.io/swsh7/215.png",
  },
  {
    id: "item7",
    name: "Sylveon ex",
    brand: "Pokemon TCG",
    price: "6.000CLP",
    imageUri: "https://images.pokemontcg.io/sv4pt5/26.png",
  },
  {
    id: "item8",
    name: "Mew ex",
    brand: "Pokemon TCG",
    price: "3.000CLP",
    imageUri: "https://images.pokemontcg.io/swsh8/151.png",
  },
]

// Filter options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc" | "brand_asc"
type PriceRange = "all" | "0-5000" | "5000-10000" | "10000-20000" | "20000+"

interface FilterState {
  sortBy: SortOption
  priceRange: PriceRange
  selectedBrands: string[]
}

export default function InventoryScreen() {
  const [inventory, setInventory] = useState(INVENTORY_ITEMS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredItems, setFilteredItems] = useState(inventory)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [totalPrice, setTotalPrice] = useState("100.000CLP")

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sortBy: "name_asc",
    priceRange: "all",
    selectedBrands: [],
  })

  // Available brands
  const availableBrands = ["Pokemon TCG", "Digimon TCG", "One Piece TCG", "Magic: The Gathering"]

  // Apply all filters
  useEffect(() => {
    let filtered = [...inventory]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (item) => item.name.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query),
      )
    }

    // Apply brand filters
    if (filters.selectedBrands.length > 0) {
      filtered = filtered.filter((item) => filters.selectedBrands.includes(item.brand))
    }

    // Apply price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((item) => {
        const price = Number.parseFloat(item.price.replace("CLP", "").replace(".", "").replace(",", "."))
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
  const sortItems = (itemList: typeof inventory, option: SortOption) => {
    const sorted = [...itemList]

    switch (option) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "price_asc":
        return sorted.sort((a, b) => {
          const priceA = Number.parseFloat(a.price.replace("CLP", "").replace(".", "").replace(",", "."))
          const priceB = Number.parseFloat(b.price.replace("CLP", "").replace(".", "").replace(",", "."))
          return priceA - priceB
        })
      case "price_desc":
        return sorted.sort((a, b) => {
          const priceA = Number.parseFloat(a.price.replace("CLP", "").replace(".", "").replace(",", "."))
          const priceB = Number.parseFloat(b.price.replace("CLP", "").replace(".", "").replace(",", "."))
          return priceB - priceA
        })
      case "brand_asc":
        return sorted.sort((a, b) => a.brand.localeCompare(b.brand))
      default:
        return sorted
    }
  }

  // Remove item from inventory
  const removeItem = (itemId: string) => {
    const updatedInventory = inventory.filter((item) => item.id !== itemId)
    setInventory(updatedInventory)

    // Recalculate total price
    const newTotalPrice = calculateTotalPrice(updatedInventory)
    setTotalPrice(newTotalPrice)
  }

  // Calculate total price
  const calculateTotalPrice = (items: typeof inventory) => {
    const total = items.reduce((sum, item) => {
      const price = Number.parseFloat(item.price.replace("CLP", "").replace(".", "").replace(",", "."))
      return sum + price
    }, 0)

    return `${total.toLocaleString("es-CL")}CLP`
  }

  // Navigate to add item screen
  const navigateToAddItem = () => {
    router.push("/add-card")
  }

  // Update filter state
  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  // Toggle brand in filters
  const toggleBrandFilter = (brand: string) => {
    const currentBrands = filters.selectedBrands
    if (currentBrands.includes(brand)) {
      updateFilters({
        selectedBrands: currentBrands.filter((b) => b !== brand),
      })
    } else {
      updateFilters({
        selectedBrands: [...currentBrands, brand],
      })
    }
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      sortBy: "name_asc",
      priceRange: "all",
      selectedBrands: [],
    })
    setSearchQuery("")
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

      {/* Total Price */}
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceText}>Precio Total: {totalPrice}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Active Filters Display */}
        {(filters.priceRange !== "all" || filters.selectedBrands.length > 0 || filters.sortBy !== "name_asc") && (
          <View style={styles.activeFiltersContainer}>
            <Text style={styles.activeFiltersTitle}>Filtros activos:</Text>
            <View style={styles.activeFiltersRow}>
              {filters.priceRange !== "all" && (
                <View style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>Precio: {filters.priceRange}</Text>
                </View>
              )}
              {filters.selectedBrands.map((brand) => (
                <View key={brand} style={styles.activeFilterChip}>
                  <Text style={styles.activeFilterText}>{brand}</Text>
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

        {/* Items Grid */}
        <View style={styles.itemsGrid}>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeItem(item.id)}>
                <Feather name="x" size={16} color="white" />
              </TouchableOpacity>
              <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.itemBrand}>{item.brand}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
            </View>
          ))}
        </View>

        {filteredItems.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Feather name="package" size={48} color="#ccc" />
            <Text style={styles.noResultsText}>No se encontraron artículos</Text>
            <Text style={styles.noResultsSubtext}>
              {searchQuery || filters.priceRange !== "all" || filters.selectedBrands.length > 0
                ? "Intenta ajustar tus filtros de búsqueda"
                : "Añade artículos a tu inventario"}
            </Text>
            {!searchQuery && filters.priceRange === "all" && filters.selectedBrands.length === 0 && (
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
                    { key: "brand_asc", label: "Marca (A-Z)" },
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

                {/* Brand Selection */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Marcas</Text>
                  {availableBrands.map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.filterOption,
                        filters.selectedBrands.includes(brand) && styles.selectedFilterOption,
                      ]}
                      onPress={() => toggleBrandFilter(brand)}
                    >
                      <Text style={styles.filterOptionText}>{brand}</Text>
                      {filters.selectedBrands.includes(brand) && <Feather name="check" size={18} color="#6c08dd" />}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Additional Options */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>Opciones adicionales</Text>
                  <TouchableOpacity style={styles.filterOption}>
                    <Feather name="download" size={20} color="#333" />
                    <Text style={styles.filterOptionText}>Exportar inventario</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Feather name="bar-chart-2" size={20} color="#333" />
                    <Text style={styles.filterOptionText}>Ver estadísticas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.filterOption}>
                    <Feather name="trash-2" size={20} color="#ff4444" />
                    <Text style={[styles.filterOptionText, { color: "#ff4444" }]}>Vaciar inventario</Text>
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
  totalPriceContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
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
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c08dd",
    marginTop: 5,
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
