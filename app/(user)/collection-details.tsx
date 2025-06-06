"use client"
import { Feather } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState, useCallback } from "react"
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
// Importar useFocusEffect para recargar datos cuando la pantalla vuelve a estar en foco
import { useFocusEffect } from "@react-navigation/native"
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
  priceNumeric: number // Para cálculos en CLP
  originalPriceUSD: number // Precio original en USD para referencia
  imageUri: string
  hp: string
  types: string[]
  rarity: string
  condition: string
}

// Sort options
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc"

// Configuración de conversión de moneda
const EXCHANGE_RATE_USD_TO_CLP = 950 // 1 USD = 950 CLP (tasa estática)
const MIN_PRICE_CLP = 100 // Precio mínimo en CLP
const MIN_PRICE_CHEAP_CARDS_CLP = 500 // Precio mínimo para cartas muy baratas

// 🔧 CONFIGURACIÓN DEL SERVIDOR
const API_BASE_URL = "http://localhost:3000"

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

/**
 * Calcula el precio total de una lista de cartas en CLP
 * @param cards Array de cartas
 * @returns Precio total formateado en CLP
 */
const calculateTotalPrice = (cards: Card[]): string => {
  const total = cards.reduce((sum, card) => {
    return sum + (card.priceNumeric || 0)
  }, 0)

  return formatCLPPrice(total)
}

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
  const [totalPrice, setTotalPrice] = useState("$0 CLP")
  const [removingCardId, setRemovingCardId] = useState<string | null>(null)

  // Transformar carta de API a formato UI
  const transformCard = (apiCard: ApiCard): Card => {
    // Asegurar que el precio sea un número válido
    let usdPrice = 0

    if (typeof apiCard.price === "number") {
      usdPrice = apiCard.price
    } else if (typeof apiCard.price === "string") {
      usdPrice = Number.parseFloat(apiCard.price) || 0
    }

    // Convertir a CLP
    const clpPrice = convertUSDToCLP(usdPrice)

    console.log(`💰 PRICE_CONVERSION: ${apiCard.name}`)
    console.log(`   USD: $${usdPrice.toFixed(2)} -> CLP: $${clpPrice.toLocaleString("es-CL")}`)

    return {
      id: apiCard._id,
      name: apiCard.name,
      brand: `${apiCard.setInfo.name} (${apiCard.setInfo.series})`,
      price: formatCLPPrice(clpPrice), // ✅ Precio formateado en CLP para mostrar
      priceNumeric: clpPrice, // ✅ Precio numérico en CLP para cálculos
      originalPriceUSD: usdPrice, // Precio original en USD para referencia
      imageUri: apiCard.images.small || apiCard.images.large,
      hp: apiCard.hp,
      types: apiCard.types,
      rarity: apiCard.rarity,
      condition: apiCard.condition,
    }
  }

  // Extraer la función loadCollectionData fuera del efecto para poder reutilizarla
  const loadCollectionData = async () => {
    try {
      console.log(`🔍 COLLECTION_DETAIL: Cargando collection ${collectionId}`)
      setLoadingCards(true)

      // Obtener collection del store
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
        const cardPromises = collectionData.cards.map(async (cardItem) => {
          try {
            console.log(`🔍 COLLECTION_DETAIL: Cargando carta ${cardItem.product_id}`)

            const response = await fetch(`${API_BASE_URL}/products/${cardItem.product_id}`)
            if (!response.ok) {
              console.warn(`⚠️ COLLECTION_DETAIL: Error cargando carta ${cardItem.product_id}`)
              return null
            }

            const apiCard: ApiCard = await response.json()
            const transformedCard = transformCard(apiCard)

            console.log(`✅ COLLECTION_DETAIL: Carta transformada:`, {
              name: transformedCard.name,
              originalUSD: transformedCard.originalPriceUSD,
              convertedCLP: transformedCard.priceNumeric,
              displayPrice: transformedCard.price,
            })

            return transformedCard
          } catch (err) {
            console.warn(`⚠️ COLLECTION_DETAIL: Error en carta ${cardItem.product_id}:`, err)
            return null
          }
        })

        const loadedCards = await Promise.all(cardPromises)
        const validCards = loadedCards.filter((card): card is Card => card !== null)

        console.log(`✅ COLLECTION_DETAIL: Cartas cargadas: ${validCards.length}/${collectionData.cards.length}`)

        setCards(validCards)

        // Calcular precio total usando la función helper
        const totalPriceFormatted = calculateTotalPrice(validCards)
        console.log(`💰 COLLECTION_DETAIL: Precio total calculado: ${totalPriceFormatted}`)
        setTotalPrice(totalPriceFormatted)
      } else {
        console.log("📝 COLLECTION_DETAIL: Collection sin cartas")
        setCards([])
        setTotalPrice("$0 CLP")
      }
    } catch (err) {
      console.error("❌ COLLECTION_DETAIL: Error cargando collection:", err)
      Alert.alert("Error", "No se pudo cargar la colección")
    } finally {
      setLoadingCards(false)
    }
  }

  // Usar useFocusEffect para recargar los datos cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 COLLECTION_DETAIL: Pantalla enfocada, recargando datos...")
      if (collectionId) {
        loadCollectionData()
      }
      return () => {
        // Cleanup si es necesario
      }
    }, [collectionId]),
  )

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
        return sorted.sort((a, b) => (a.priceNumeric || 0) - (b.priceNumeric || 0))
      case "price_desc":
        return sorted.sort((a, b) => (b.priceNumeric || 0) - (a.priceNumeric || 0))
      default:
        return sorted
    }
  }

  // 🔧 FUNCIÓN SIMPLIFICADA: Remove card from collection con logging extensivo
  const removeCard = async (cardId: string) => {
    if (!collection?._id) {
      console.error("❌ REMOVE_CARD: No hay collection ID")
      Alert.alert("Error", "No se pudo identificar la colección")
      return
    }

    console.log(`🚀 REMOVE_CARD: Iniciando proceso de eliminación`)
    console.log(`   Collection ID: ${collection._id}`)
    console.log(`   Collection Name: ${collection.name}`)
    console.log(`   Card ID: ${cardId}`)
    console.log(`   Cards actuales en UI: ${cards.length}`)
    console.log(`   Cards en collection store: ${collection.cards?.length || 0}`)

    // Buscar la carta en el estado local
    const cardToRemove = cards.find((c) => c.id === cardId)
    if (cardToRemove) {
      console.log(`🎯 REMOVE_CARD: Carta encontrada en UI:`, {
        name: cardToRemove.name,
        id: cardToRemove.id,
        price: cardToRemove.price,
      })
    } else {
      console.warn(`⚠️ REMOVE_CARD: Carta ${cardId} no encontrada en estado local`)
    }

    console.log(`📱 REMOVE_CARD: Mostrando Alert de confirmación...`)

    // 🔧 VERSIÓN SIMPLIFICADA PARA TESTING - SIN ALERT
    // Comentamos el Alert temporalmente para hacer testing directo
    /*
    Alert.alert("Remover Carta", "¿Estás seguro de que quieres remover esta carta de la colección?", [
      {
        text: "Cancelar",
        style: "cancel",
        onPress: () => {
          console.log(`❌ REMOVE_CARD: Operación cancelada por el usuario`)
        },
      },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await executeRemoval(cardId)
        },
      },
    ])
    */

    // 🔧 EJECUTAR DIRECTAMENTE PARA TESTING
    console.log(`🔥 REMOVE_CARD: Ejecutando eliminación directamente (sin Alert)`)
    await executeRemoval(cardId)
  }

  // 🔧 FUNCIÓN SEPARADA PARA LA LÓGICA DE ELIMINACIÓN
  const executeRemoval = async (cardId: string) => {
    try {
      setRemovingCardId(cardId)
      console.log(`🗑️ EXECUTE_REMOVAL: Usuario confirmó eliminación`)
      console.log(`🔄 EXECUTE_REMOVAL: Estableciendo loading state para card: ${cardId}`)

      // 🔧 LLAMAR AL STORE ACTUALIZADO
      console.log(`📞 EXECUTE_REMOVAL: Llamando al store para eliminar carta...`)
      console.log(`   Collection ID: ${collection?._id}`)
      console.log(`   Card ID: ${cardId}`)

      if (!collection?._id) {
        throw new Error("Collection ID no disponible")
      }

      await removeCardFromCollection(collection._id, cardId)

      console.log(`✅ EXECUTE_REMOVAL: Store completó la eliminación`)

      // 🔧 ACTUALIZAR ESTADO LOCAL INMEDIATAMENTE
      console.log(`🔄 EXECUTE_REMOVAL: Actualizando estado local de UI...`)

      const updatedCards = cards.filter((card) => card.id !== cardId)
      console.log(`   Cards antes: ${cards.length}`)
      console.log(`   Cards después: ${updatedCards.length}`)

      setCards(updatedCards)

      // Recalcular precio total
      const newTotalPrice = calculateTotalPrice(updatedCards)
      setTotalPrice(newTotalPrice)
      console.log(`   Nuevo precio total: ${newTotalPrice}`)

      // Actualizar collection local
      setCollection((prev) => {
        if (!prev) return null

        const updatedCollection = {
          ...prev,
          card_count: updatedCards.length,
          cards: prev.cards.filter((item) => item.product_id !== cardId),
        }

        console.log(`   Collection actualizada:`, {
          card_count: updatedCollection.card_count,
          cards_length: updatedCollection.cards.length,
        })

        return updatedCollection
      })

      console.log(`🎉 EXECUTE_REMOVAL: Proceso completado exitosamente`)
      Alert.alert("Éxito", "Carta removida de la colección")
    } catch (error) {
      // Manejo de errores
      console.error("❌ EXECUTE_REMOVAL: Error en el proceso:", error)

      let errorMessage = "Error desconocido"
      if (error instanceof Error) {
        errorMessage = error.message
        console.error(`❌ EXECUTE_REMOVAL: Error message: ${errorMessage}`)
        console.error(`❌ EXECUTE_REMOVAL: Error stack:`, error.stack)
      } else if (typeof error === "string") {
        errorMessage = error
        console.error(`❌ EXECUTE_REMOVAL: String error: ${errorMessage}`)
      } else {
        console.error(`❌ EXECUTE_REMOVAL: Unknown error type:`, typeof error, error)
      }

      Alert.alert("Error", `No se pudo remover la carta: ${errorMessage}`)
    } finally {
      console.log(`🔄 EXECUTE_REMOVAL: Limpiando loading state`)
      setRemovingCardId(null)
    }
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
        <Text style={styles.exchangeRateText}>
          Tasa de cambio: 1 USD = ${EXCHANGE_RATE_USD_TO_CLP.toLocaleString("es-CL")} CLP
        </Text>
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
                {/* 🔧 BOTÓN DE ELIMINAR con mejor feedback visual */}
                <TouchableOpacity
                  style={[styles.removeButton, removingCardId === card.id && styles.removeButtonLoading]}
                  onPress={() => {
                    console.log(`🖱️ REMOVE_BUTTON: Usuario presionó eliminar para carta: ${card.id} (${card.name})`)
                    removeCard(card.id)
                  }}
                  disabled={removingCardId === card.id}
                >
                  {removingCardId === card.id ? (
                    <ActivityIndicator size={12} color="white" />
                  ) : (
                    <Feather name="x" size={16} color="white" />
                  )}
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
                  {/* ✅ PRECIO EN CLP */}
                  <Text style={styles.cardPrice}>{card.price}</Text>
                  {/* Precio original en USD como referencia */}
                  <Text style={styles.cardPriceUSD}>{`($${card.originalPriceUSD.toFixed(2)} USD)`}</Text>
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
    paddingVertical: 12,
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
    marginBottom: 4,
  },
  exchangeRateText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeButtonLoading: {
    backgroundColor: "#ff9999",
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
    marginBottom: 2,
  },
  cardPriceUSD: {
    fontSize: 10,
    color: "#999",
    fontStyle: "italic",
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
