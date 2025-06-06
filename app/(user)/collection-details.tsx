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
import { useUserStore, userStore, type Collection } from "../../store/userStore"

// Interfaz para las cartas de la API
interface ApiCard {
  _id: string
  name: string
  tcg_id: string
  supertype: string
  subtypes: string[]
  hp: string
  types: string[]
  rarity: string
  setInfo: {
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

// Interfaz para las cartas transformadas para UI
interface Card {
  id: string
  name: string
  brand: string
  price: string
  imageUri: string
  hp: string
  types: string[]
  rarity: string
  condition: string
}

// Sort options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc"

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams()
  const collectionId = Array.isArray(id) ? id[0] : id || ""

  // Store hooks
  const { removeCardFromCollection, loading, error } = useUserStore()

  // Local state
  const [collection, setCollection] = useState<Collection | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCards, setFilteredCards] = useState<Card[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("name_asc")
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [loadingCards, setLoadingCards] = useState(true)
  const [totalPrice, setTotalPrice] = useState("0")

  // Transformar carta de API a formato UI
  const transformCard = (apiCard: ApiCard): Card => ({
    id: apiCard._id,
    name: apiCard.name,
    brand: `${apiCard.setInfo.name} (${apiCard.setInfo.series})`,
    price: `${apiCard.price.toLocaleString("es-CL")}CLP`,
    imageUri: apiCard.images.small || apiCard.images.large,
    hp: apiCard.hp,
    types: apiCard.types,
    rarity: apiCard.rarity,
    condition: apiCard.condition,
  })

  // Cargar datos de la collection y sus cartas
  useEffect(() => {
    const loadCollectionData = async () => {
      try {
        console.log(`🔍 COLLECTION_DETAIL: Cargando collection ${collectionId}`)

        // Obtener collection del store - SIN usar getCollectionById en dependencias
        const { collections } = userStore.getState()
        const collectionData = collections.find((c) => c._id === collectionId)

        if (!collectionData) {
          console.error("❌ COLLECTION_DETAIL: Collection no encontrada en store")
          Alert.alert("Error", "Colección no encontrada")
          router.back()
          return
        }

        console.log(`📊 COLLECTION_DETAIL: Collection encontrada:`, {
          _id: collectionData._id,
          name: collectionData.name,
          card_count: collectionData.card_count,
          cards_length: collectionData.cards?.length || 0,
        })

        setCollection(collectionData)

        // Cargar las cartas de la collection
        if (collectionData.cards && collectionData.cards.length > 0) {
          setLoadingCards(true)
          const cardPromises = collectionData.cards.map(async (cardItem) => {
            try {
              console.log(`🔍 COLLECTION_DETAIL: Cargando carta ${cardItem.product_id}`)

              const response = await fetch(`http://localhost:3000/products/${cardItem.product_id}`)
              if (!response.ok) {
                console.warn(`⚠️ COLLECTION_DETAIL: Error cargando carta ${cardItem.product_id}`)
                return null
              }

              const apiCard: ApiCard = await response.json()
              return transformCard(apiCard)
            } catch (err) {
              console.warn(`⚠️ COLLECTION_DETAIL: Error en carta ${cardItem.product_id}:`, err)
              return null
            }
          })

          const loadedCards = await Promise.all(cardPromises)
          const validCards = loadedCards.filter((card): card is Card => card !== null)

          console.log(`✅ COLLECTION_DETAIL: Cartas cargadas: ${validCards.length}/${collectionData.cards.length}`)

          setCards(validCards)

          // Calcular precio total
          const total = validCards.reduce((sum, card) => {
            const price = Number.parseFloat(card.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
            return sum + price
          }, 0)
          setTotalPrice(`${total.toLocaleString("es-CL")}CLP`)
        } else {
          console.log("📝 COLLECTION_DETAIL: Collection sin cartas")
          setCards([])
          setTotalPrice("0CLP")
        }
      } catch (err) {
        console.error("❌ COLLECTION_DETAIL: Error cargando collection:", err)
        Alert.alert("Error", "No se pudo cargar la colección")
      } finally {
        setLoadingCards(false)
      }
    }

    if (collectionId) {
      loadCollectionData()
    }
  }, [collectionId])

  // Filter and sort cards when search query or sort option changes
  useEffect(() => {
    let filtered = [...cards]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.brand.toLowerCase().includes(query) ||
          card.rarity.toLowerCase().includes(query) ||
          card.types.some((type) => type.toLowerCase().includes(query)),
      )
    }

    // Apply sorting
    filtered = sortCards(filtered, sortOption)

    setFilteredCards(filtered)
  }, [searchQuery, cards, sortOption])

  // Sort cards based on selected option
  const sortCards = (cardList: Card[], option: SortOption): Card[] => {
    const sorted = [...cardList]

    switch (option) {
      case "name_asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case "name_desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case "price_asc":
        return sorted.sort((a, b) => {
          const priceA = Number.parseFloat(a.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
          const priceB = Number.parseFloat(b.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
          return priceA - priceB
        })
      case "price_desc":
        return sorted.sort((a, b) => {
          const priceA = Number.parseFloat(a.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
          const priceB = Number.parseFloat(b.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
          return priceB - priceA
        })
      default:
        return sorted
    }
  }

  // Remove card from collection
  const removeCard = async (cardId: string) => {
    if (!collection?._id) return

    Alert.alert("Remover Carta", "¿Estás seguro de que quieres remover esta carta de la colección?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          try {
            console.log(`🗑️ COLLECTION_DETAIL: Removiendo carta ${cardId} de collection ${collection._id}`)

            await removeCardFromCollection(collection._id!, cardId)

            // Actualizar estado local
            const updatedCards = cards.filter((card) => card.id !== cardId)
            setCards(updatedCards)

            // Recalcular precio total
            const total = updatedCards.reduce((sum, card) => {
              const price = Number.parseFloat(card.price.replace("CLP", "").replace(/\./g, "").replace(",", "."))
              return sum + price
            }, 0)
            setTotalPrice(`${total.toLocaleString("es-CL")}CLP`)

            // Actualizar collection
            setCollection((prev) =>
              prev
                ? {
                    ...prev,
                    card_count: updatedCards.length,
                    cards: prev.cards.filter((item) => item.product_id !== cardId),
                  }
                : null,
            )

            console.log(`✅ COLLECTION_DETAIL: Carta removida exitosamente`)
          } catch (err) {
            console.error("❌ COLLECTION_DETAIL: Error removiendo carta:", err)
            Alert.alert("Error", "No se pudo remover la carta")
          }
        },
      },
    ])
  }

  // Toggle filter modal
  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal)
  }

  // Apply sort option and close modal
  const applySortOption = (option: SortOption) => {
    setSortOption(option)
    setShowFilterModal(false)
  }

  // Navigate to add card
  const navigateToAddCard = () => {
    router.push({ pathname: "/add-card-collection", params: { collectionId } })
  }

  // Navigate to card detail
  const navigateToCardDetail = (cardId: string) => {
    router.push({ pathname: "/product-details", params: { cardId } })
  }

  // Loading state
  if (!collection || loadingCards) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c08dd" />
          <Text style={styles.loadingText}>Cargando colección...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{collection.name}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={navigateToAddCard}>
            <Feather name="plus" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleFilterModal}>
            <Feather name="more-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en esta colección"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Collection Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.cardCountText}>
          {collection.card_count || 0} carta{(collection.card_count || 0) !== 1 ? "s" : ""}
        </Text>
        <Text style={styles.totalPriceText}>Precio Total: {totalPrice}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cards Grid */}
        {filteredCards.length > 0 ? (
          <View style={styles.cardsGrid}>
            {filteredCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.cardContainer}
                onPress={() => navigateToCardDetail(card.id)}
              >
                <TouchableOpacity style={styles.removeButton} onPress={() => removeCard(card.id)}>
                  <Feather name="x" size={16} color="white" />
                </TouchableOpacity>
                <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>
                    {card.name}
                  </Text>
                  <Text style={styles.cardBrand} numberOfLines={1}>
                    {card.brand}
                  </Text>
                  <Text style={styles.cardRarity}>{card.rarity}</Text>
                  {card.hp && <Text style={styles.cardHp}>HP: {card.hp}</Text>}
                  <View style={styles.cardTypes}>
                    {card.types.slice(0, 2).map((type, index) => (
                      <Text key={index} style={styles.cardType}>
                        {type}
                      </Text>
                    ))}
                  </View>
                  <Text style={styles.cardPrice}>{card.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : cards.length > 0 ? (
          <View style={styles.emptySearchContainer}>
            <Feather name="search" size={48} color="#ccc" />
            <Text style={styles.emptySearchText}>No se encontraron cartas</Text>
            <Text style={styles.emptySearchSubtext}>Intenta con otro término de búsqueda</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="folder" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Esta colección está vacía</Text>
            <Text style={styles.emptySubtext}>Agrega cartas para empezar tu colección</Text>
            <TouchableOpacity style={styles.addCardButton} onPress={navigateToAddCard}>
              <Feather name="plus" size={20} color="#6c08dd" />
              <Text style={styles.addCardButtonText}>Agregar primera carta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilterModal(false)}>
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Ordenar por</Text>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsContainer}>
                  <TouchableOpacity
                    style={[styles.optionItem, sortOption === "name_asc" && styles.selectedOption]}
                    onPress={() => applySortOption("name_asc")}
                  >
                    <Text style={styles.optionText}>Nombre (A-Z)</Text>
                    {sortOption === "name_asc" && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionItem, sortOption === "name_desc" && styles.selectedOption]}
                    onPress={() => applySortOption("name_desc")}
                  >
                    <Text style={styles.optionText}>Nombre (Z-A)</Text>
                    {sortOption === "name_desc" && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionItem, sortOption === "price_asc" && styles.selectedOption]}
                    onPress={() => applySortOption("price_asc")}
                  >
                    <Text style={styles.optionText}>Precio (menor a mayor)</Text>
                    {sortOption === "price_asc" && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.optionItem, sortOption === "price_desc" && styles.selectedOption]}
                    onPress={() => applySortOption("price_desc")}
                  >
                    <Text style={styles.optionText}>Precio (mayor a menor)</Text>
                    {sortOption === "price_desc" && <Feather name="check" size={18} color="#6c08dd" />}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
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
    flex: 1,
    textAlign: "center",
    marginHorizontal: 10,
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
  infoContainer: {
    alignItems: "center",
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dadada",
  },
  cardCountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  scrollView: {
    flex: 1,
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
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    zIndex: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ff6b6b",
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
    marginBottom: 2,
  },
  cardBrand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 11,
    color: "#888",
    marginBottom: 2,
  },
  cardHp: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  cardTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  cardType: {
    fontSize: 9,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginRight: 3,
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    marginVertical: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8ff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6c08dd",
    marginTop: 20,
  },
  addCardButtonText: {
    fontSize: 16,
    color: "#6c08dd",
    marginLeft: 8,
    fontWeight: "600",
  },
  emptySearchContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginVertical: 20,
  },
  emptySearchText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySearchSubtext: {
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
    width: "100%",
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
  optionsContainer: {
    padding: 15,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {},
  optionText: {
    fontSize: 16,
    color: "#333",
  },
})
