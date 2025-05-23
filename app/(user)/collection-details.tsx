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
} from "react-native"

// Sample card data
const SAMPLE_CARDS = {
  "1": [
    {
      id: "card1",
      name: "Agumon",
      brand: "Digimon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SV02/SV02_EN_238.png",
    },
    {
      id: "card2",
      name: "Prismatic Evolutions Booster",
      brand: "Pokemon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pikawiz.com/images/chillingreign/178.png",
    },
    {
      id: "card3",
      name: "Agumon",
      brand: "Digimon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SV02/SV02_EN_238.png",
    },
    {
      id: "card4",
      name: "Prismatic Evolutions Booster",
      brand: "Pokemon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pikawiz.com/images/chillingreign/178.png",
    },
    {
      id: "card5",
      name: "Agumon",
      brand: "Digimon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SV02/SV02_EN_238.png",
    },
    {
      id: "card6",
      name: "Prismatic Evolutions Booster",
      brand: "Pokemon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pikawiz.com/images/chillingreign/178.png",
    },
    {
      id: "card7",
      name: "Agumon",
      brand: "Digimon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SV02/SV02_EN_238.png",
    },
    {
      id: "card8",
      name: "Prismatic Evolutions Booster",
      brand: "Pokemon TCG",
      price: "5.000CLP",
      imageUri: "https://www.pikawiz.com/images/chillingreign/178.png",
    },
  ],
  "2": [
    {
      id: "card9",
      name: "Luffy",
      brand: "One Piece TCG",
      price: "7.500CLP",
      imageUri: "https://http2.mlstatic.com/D_NQ_NP_641905-MLC75087918259_032024-O.webp",
    },
    {
      id: "card10",
      name: "Zoro",
      brand: "One Piece TCG",
      price: "6.000CLP",
      imageUri: "https://http2.mlstatic.com/D_NQ_NP_641905-MLC75087918259_032024-O.webp",
    },
  ],
  "3": [
    {
      id: "card11",
      name: "Quagsire",
      brand: "Pokemon TCG",
      price: "3.000CLP",
      imageUri: "https://www.pokemon.com/static-assets/content-assets/cms2/img/cards/web/SV02/SV02_EN_238.png",
    },
    {
      id: "card12",
      name: "Slowpoke",
      brand: "Pokemon TCG",
      price: "2.500CLP",
      imageUri: "https://www.pikawiz.com/images/chillingreign/178.png",
    },
  ],
}

// Sample collections data
const COLLECTIONS = {
  "1": {
    id: "1",
    name: "Dragon Ball",
    cardCount: 8,
    totalPrice: "100.000CLP",
  },
  "2": {
    id: "2",
    name: "One Piece",
    cardCount: 2,
    totalPrice: "13.500CLP",
  },
  "3": {
    id: "3",
    name: "Weird Pokemon Cards",
    cardCount: 2,
    totalPrice: "5.500CLP",
  },
}

// Sort options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc"

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams()
  const collectionId = Array.isArray(id) ? id[0] : id || "1"

  const [collection, setCollection] = useState(COLLECTIONS[collectionId])
  const [cards, setCards] = useState(SAMPLE_CARDS[collectionId] || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCards, setFilteredCards] = useState(cards)
  const [sortOption, setSortOption] = useState<SortOption>("name_asc")
  const [showFilterModal, setShowFilterModal] = useState(false)

  // Filter and sort cards when search query or sort option changes
  useEffect(() => {
    let filtered = [...cards]

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (card) => card.name.toLowerCase().includes(query) || card.brand.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    filtered = sortCards(filtered, sortOption)

    setFilteredCards(filtered)
  }, [searchQuery, cards, sortOption])

  // Sort cards based on selected option
  const sortCards = (cardList: typeof cards, option: SortOption) => {
    const sorted = [...cardList]

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
      default:
        return sorted
    }
  }

  // Remove card from collection
  const removeCard = (cardId: string) => {
    const updatedCards = cards.filter((card) => card.id !== cardId)
    setCards(updatedCards)

    // Update collection info
    const newTotalPrice = calculateTotalPrice(updatedCards)
    setCollection({
      ...collection,
      cardCount: updatedCards.length,
      totalPrice: newTotalPrice,
    })
  }

  // Calculate total price
  const calculateTotalPrice = (cardList: typeof cards) => {
    const total = cardList.reduce((sum, card) => {
      const price = Number.parseFloat(card.price.replace("CLP", "").replace(".", "").replace(",", "."))
      return sum + price
    }, 0)

    return `${total.toLocaleString("es-CL")}CLP`
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

    const navigateToAddCard = () => {
    router.push({ pathname: "/add-card-collection", params: { collectionId } })
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
          <TouchableOpacity style={styles.headerButton}>
            <Feather name="plus" size={24} color="black" onPress={navigateToAddCard} />
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

      {/* Total Price */}
      <View style={styles.totalPriceContainer}>
        <Text style={styles.totalPriceText}>Precio Total: {collection.totalPrice}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Cards Grid */}
        <View style={styles.cardsGrid}>
          {filteredCards.map((card) => (
            <View key={card.id} style={styles.cardContainer}>
              <TouchableOpacity style={styles.removeButton} onPress={() => removeCard(card.id)}>
                <Feather name="x" size={16} color="white" />
              </TouchableOpacity>
              <Image source={{ uri: card.imageUri }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {card.name}
                </Text>
                <Text style={styles.cardBrand}>{card.brand}</Text>
                <Text style={styles.cardPrice}>{card.price}</Text>
              </View>
            </View>
          ))}
        </View>
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
  cardBrand: {
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
  selectedOption: {
  },
  optionText: {
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
