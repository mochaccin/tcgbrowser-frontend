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
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native"
import { LineChart } from "react-native-chart-kit"
import NavigationDrawer from "../../components/NavigationDrawer"

const { width, height } = Dimensions.get("window")

// Tasa de cambio estática USD a CLP
const USD_TO_CLP_RATE = 950

// Función para convertir USD a CLP
const convertUSDToCLP = (usdAmount: number): number => {
  return Math.round(usdAmount * USD_TO_CLP_RATE)
}

// Función para formatear precios en CLP
const formatCLPPrice = (clpAmount: number): string => {
  return clpAmount.toLocaleString("es-CL")
}

// Interfaz para los datos de la carta de la API
interface ApiCard {
  _id: string
  name: string
  tcg_id: string
  supertype: string
  subtypes: string[]
  hp: string
  types: string[]
  evolvesFrom: string
  evolvesTo: string[]
  rules: string[]
  abilities: any[]
  attacks: {
    name: string
    cost: string[]
    convertedEnergyCost: number
    damage: string
    text: string
  }[]
  weaknesses: {
    type: string
    value: string
  }[]
  resistances: {
    type: string
    value: string
  }[]
  retreatCost: string[]
  convertedRetreatCost: number
  setInfo: {
    id: string
    name: string
    series: string
    printedTotal: number
    total: number
    ptcgoCode: string
    releaseDate: string
    updatedAt: string
    images: {
      symbol: string
      logo: string
    }
  }
  number: string
  artist: string
  rarity: string
  flavorText: string
  nationalPokedexNumbers: number[]
  legalities: {
    unlimited: string
  }
  images: {
    small: string
    large: string
  }
  tcgplayer: {
    url: string
    updatedAt: string
  }
  stock_quantity: number
  price: number
  cost_price: number
  is_available: boolean
  condition: string
  language: string
  tags: string[]
  created_at: string
  updated_at: string
}

// Interfaz para los datos de la carta transformados para la UI
interface CardDetails {
  id: string
  name: string
  fullName: string
  set: string
  rarity: string
  number: string
  type: string
  artist: string
  imageUri: string
  marketPrice: number
  recentPrice: number
  highPrice: number
  lowPrice: number
  totalListings: number
  avgSalesPrice: number
  totalSales: number
  avgDailySales: number
  basePriceCLP: number // 🔧 NUEVO: Precio base para generar datos
  volatility: number
  priceChange: number
  priceChangeColor: string
  hp: string
  types: string[]
  attacks: {
    name: string
    cost: string[]
    damage: string
    text: string
  }[]
  condition: string
  language: string
}

// Sample seller listings con precios en CLP
const SAMPLE_LISTINGS = [
  {
    id: "listing1",
    sellerName: "Jonnaa_",
    price: convertUSDToCLP(2.18),
    condition: "Ligeramente jugado",
    rating: 4.5,
    transactions: 3456,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing2",
    sellerName: "CardMaster",
    price: convertUSDToCLP(2.05),
    condition: "Mint",
    rating: 4.8,
    transactions: 2890,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing3",
    sellerName: "PokemonPro",
    price: convertUSDToCLP(2.32),
    condition: "Near Mint",
    rating: 4.7,
    transactions: 1567,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing4",
    sellerName: "TCGExpert",
    price: convertUSDToCLP(1.97),
    condition: "Excelente",
    rating: 4.9,
    transactions: 4123,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
]

// Chart configuration
const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(108, 8, 221, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#6c08dd",
  },
}

export default function CardDetailScreen() {
  const params = useLocalSearchParams()
  const cardId = (params.cardId as string) || ""
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState("price")
  const [timeRange, setTimeRange] = useState("3m") // 1m, 3m, 6m, 1y
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null)

  // Fetch card details from API
  useEffect(() => {
    const fetchCardDetails = async () => {
      if (!cardId) return

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:3000/products/${cardId}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const apiCard: ApiCard = await response.json()

        // Transform API data to UI format
        const transformedCard = transformCardData(apiCard)
        setCardDetails(transformedCard)
      } catch (err) {
        console.error("Error fetching card details:", err)
        setError(err instanceof Error ? err.message : "Error desconocido al cargar los detalles de la carta")
      } finally {
        setLoading(false)
      }
    }

    fetchCardDetails()
  }, [cardId])

  // 🔧 MEJORADO: Función para generar datos de precio consistentes según el rango de tiempo
  const generatePriceHistoryData = (basePriceCLP: number, timeRange: string, cardId: string) => {
    // Usar el cardId como seed para generar datos consistentes
    const seed = cardId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

    // Función para generar números pseudo-aleatorios consistentes
    const seededRandom = (index: number) => {
      const x = Math.sin(seed + index) * 10000
      return x - Math.floor(x)
    }

    const timeRangeConfig = {
      "1m": {
        labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
        dataPoints: 4,
        baseIndex: 0,
      },
      "3m": {
        labels: ["Mes 1", "Mes 2", "Mes 3"],
        dataPoints: 3,
        baseIndex: 10,
      },
      "6m": {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        dataPoints: 6,
        baseIndex: 20,
      },
      "1y": {
        labels: ["Q1", "Q2", "Q3", "Q4"],
        dataPoints: 4,
        baseIndex: 30,
      },
    }

    const config = timeRangeConfig[timeRange as keyof typeof timeRangeConfig] || timeRangeConfig["3m"]

    // Generar datos consistentes basados en el cardId y el rango de tiempo
    const priceData = Array(config.dataPoints)
      .fill(0)
      .map((_, index) => {
        const randomFactor = seededRandom(config.baseIndex + index)
        const variation = 0.8 + randomFactor * 0.4 // Variación entre 80% y 120%
        return Math.round(basePriceCLP * variation)
      })

    return {
      labels: config.labels,
      datasets: [
        {
          data: priceData,
          color: (opacity = 1) => `rgba(108, 8, 221, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    }
  }

  // Transform API card data to UI format
  const transformCardData = (apiCard: ApiCard): CardDetails => {
    // Convertir precios de USD a CLP
    const basePriceCLP = convertUSDToCLP(apiCard.price)

    // Calculate price change (mock data)
    const priceChange = Math.random() > 0.5 ? Math.random() * 5 : -Math.random() * 5

    return {
      id: apiCard._id,
      name: apiCard.name,
      fullName: `${apiCard.name} - ${apiCard.tcg_id} - ${apiCard.setInfo.name}`,
      set: `${apiCard.setInfo.name} (${apiCard.setInfo.series})`,
      rarity: apiCard.rarity,
      number: `#${apiCard.number}`,
      type: apiCard.types[0] || "Unknown",
      artist: apiCard.artist,
      imageUri: apiCard.images.large || apiCard.images.small,
      marketPrice: basePriceCLP,
      recentPrice: Math.round(basePriceCLP * 0.95),
      highPrice: Math.round(basePriceCLP * 1.2),
      lowPrice: Math.round(basePriceCLP * 0.8),
      totalListings: apiCard.stock_quantity || 0,
      avgSalesPrice: Math.round(basePriceCLP * 1.05),
      totalSales: Math.floor(Math.random() * 100),
      avgDailySales: Math.floor(Math.random() * 10),
      basePriceCLP, // 🔧 NUEVO: Guardar precio base
      volatility: Math.random(),
      priceChange,
      priceChangeColor: priceChange >= 0 ? "#2ecc71" : "#e74c3c",
      hp: apiCard.hp,
      types: apiCard.types,
      attacks: apiCard.attacks,
      condition: apiCard.condition,
      language: apiCard.language,
    }
  }

  // 🔧 MEJORADO: Función para obtener datos del gráfico según el rango de tiempo seleccionado
  const getPriceHistoryData = () => {
    if (!cardDetails) return { labels: [], datasets: [] }
    return generatePriceHistoryData(cardDetails.basePriceCLP, timeRange, cardDetails.id)
  }

  // 🔧 MEJORADO: Función para manejar cambio de rango de tiempo
  const handleTimeRangeChange = (newTimeRange: string) => {
    console.log(`📊 Cambiando rango de tiempo de ${timeRange} a: ${newTimeRange}`)
    console.log(`📊 Carta ID: ${cardDetails?.id}`)
    console.log(`📊 Precio base: ${cardDetails?.basePriceCLP} CLP`)
    setTimeRange(newTimeRange)
  }

  const sortOptions = [
    { id: "price", label: "Precio" },
    { id: "condition", label: "Estado" },
    { id: "seller", label: "Vendedor" },
    { id: "newest", label: "Más recientes" },
  ]

  const timeRangeOptions = [
    { id: "1m", label: "1 mes" },
    { id: "3m", label: "3 meses" },
    { id: "6m", label: "6 meses" },
    { id: "1y", label: "1 año" },
  ]

  // Calculate volatility bars
  const getVolatilityBars = () => {
    const volatility = cardDetails?.volatility || 0.5
    const activeIndex = Math.floor(volatility * 5)
    return Array(5)
      .fill(0)
      .map((_, index) => index < activeIndex)
  }

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c08dd" />
          <Text style={styles.loadingText}>Cargando detalles de la carta...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Error state
  if (error || !cardDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error al cargar los detalles</Text>
          <Text style={styles.errorSubtext}>{error || "No se pudo cargar la información de la carta"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Volver</Text>
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {cardDetails.name} {cardDetails.number}
        </Text>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Card Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.cardTitle}>{cardDetails.fullName}</Text>
        </View>

        {/* Card Image - Optimizado para mobile */}
        <View style={styles.cardImageContainer}>
          <Image source={{ uri: cardDetails.imageUri }} style={styles.cardImage} resizeMode="contain" />
        </View>

        {/* Product Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detalles del producto</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Número de carta:</Text>
              <Text style={styles.detailValue}>{cardDetails.number}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rareza:</Text>
              <Text style={styles.detailValue}>{cardDetails.rarity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo de carta:</Text>
              <Text style={styles.detailValue}>{cardDetails.type}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Artista:</Text>
              <Text style={styles.detailValue}>{cardDetails.artist}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>HP:</Text>
              <Text style={styles.detailValue}>{cardDetails.hp}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Condición:</Text>
              <Text style={styles.detailValue}>{cardDetails.condition}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Idioma:</Text>
              <Text style={styles.detailValue}>{cardDetails.language}</Text>
            </View>
          </View>
        </View>

        {/* Price Points - Actualizado con precios en CLP */}
        <View style={styles.priceSection}>
          <View style={styles.priceSectionHeader}>
            <Text style={styles.sectionTitle}>Puntos de precio</Text>
            <TouchableOpacity style={styles.refreshButton}>
              <Feather name="refresh-cw" size={16} color="#6c08dd" />
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceStatsContainer}>
            <View style={styles.priceMainStat}>
              <Text style={styles.priceLabel}>Precio de mercado</Text>
              <Text style={styles.priceValue}>$ {formatCLPPrice(cardDetails.marketPrice)} CLP</Text>
              <View style={styles.priceChangeContainer}>
                <Feather
                  name={Number(cardDetails.priceChange) >= 0 ? "arrow-up" : "arrow-down"}
                  size={14}
                  color={cardDetails.priceChangeColor}
                />
                <Text style={[styles.priceChangeText, { color: cardDetails.priceChangeColor }]}>
                  {Math.abs(Number(cardDetails.priceChange)).toFixed(1)}%
                </Text>
              </View>
            </View>

            <View style={styles.priceStatsGrid}>
              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Venta reciente</Text>
                <Text style={styles.priceStatValue}>$ {formatCLPPrice(cardDetails.recentPrice)}</Text>
              </View>

              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Precio más alto</Text>
                <Text style={styles.priceStatValue}>$ {formatCLPPrice(cardDetails.highPrice)}</Text>
              </View>

              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Precio más bajo</Text>
                <Text style={styles.priceStatValue}>$ {formatCLPPrice(cardDetails.lowPrice)}</Text>
              </View>

              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Volatilidad</Text>
                <View style={styles.volatilityContainer}>
                  {getVolatilityBars().map((isActive, index) => (
                    <View key={index} style={[styles.volatilityBar, isActive && styles.volatilityBarActive]} />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* 🔧 MEJORADO: Price Chart con datos consistentes y botones funcionales */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Historial de precios</Text>
              <View style={styles.timeRangeSelector}>
                {timeRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.timeRangeOption, timeRange === option.id && styles.timeRangeOptionActive]}
                    onPress={() => {
                      console.log(`📊 Botón presionado: ${option.label} (${option.id})`)
                      handleTimeRangeChange(option.id)
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeRangeText, timeRange === option.id && styles.timeRangeTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <LineChart
              data={getPriceHistoryData()}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withDots={false}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={false}
              yAxisSuffix=" CLP"
            />
          </View>
        </View>

        {/* 3 Month Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen de 3 meses</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Feather name="trending-up" size={20} color="#6c08dd" />
              </View>
              <Text style={styles.summaryValue}>$ {formatCLPPrice(cardDetails.highPrice)}</Text>
              <Text style={styles.summaryLabel}>Precio de venta alto</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Feather name="shopping-bag" size={20} color="#6c08dd" />
              </View>
              <Text style={styles.summaryValue}>{cardDetails.totalSales}</Text>
              <Text style={styles.summaryLabel}>Total vendidas</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Feather name="dollar-sign" size={20} color="#6c08dd" />
              </View>
              <Text style={styles.summaryValue}>$ {formatCLPPrice(cardDetails.avgSalesPrice)}</Text>
              <Text style={styles.summaryLabel}>Precio promedio</Text>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryIconContainer}>
                <Feather name="calendar" size={20} color="#6c08dd" />
              </View>
              <Text style={styles.summaryValue}>{cardDetails.avgDailySales}</Text>
              <Text style={styles.summaryLabel}>Ventas diarias</Text>
            </View>
          </View>
        </View>

        {/* Listings Section */}
        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <Text style={styles.sectionTitle}>{cardDetails.totalListings} listados</Text>
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Ordenar por</Text>
              <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
                <Text style={styles.sortButtonText}>Precio</Text>
                <Feather name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Listings */}
          {SAMPLE_LISTINGS.map((listing) => (
            <View key={listing.id} style={styles.listingCard}>
              <Image source={{ uri: listing.imageUri }} style={styles.listingImage} />
              <View style={styles.listingDetails}>
                <View style={styles.listingHeader}>
                  <Text style={styles.listingPrice}>$ {formatCLPPrice(listing.price)} CLP</Text>
                  <View style={styles.conditionBadge}>
                    <Text style={styles.conditionText}>{listing.condition}</Text>
                  </View>
                </View>
                <View style={styles.sellerInfo}>
                  <Feather name="user" size={16} color="#666" />
                  <Text style={styles.sellerName}>{listing.sellerName}</Text>
                </View>
                <View style={styles.ratingInfo}>
                  <View style={styles.starsContainer}>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Feather
                          key={i}
                          name={i < Math.floor(listing.rating) ? "star" : i < listing.rating ? "star" : "star"}
                          size={14}
                          color={i < listing.rating ? "#FFD700" : "#e0e0e0"}
                        />
                      ))}
                  </View>
                  <Text style={styles.ratingText}>{listing.rating}</Text>
                  <Text style={styles.transactionsText}>{listing.transactions.toLocaleString()} transacciones</Text>
                </View>
                <TouchableOpacity style={styles.sellerProfileButton} onPress={() => router.push("/profile")}>
                  <Text style={styles.sellerProfileButtonText}>Perfil Vendedor</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

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
              {sortOptions.map((option) => (
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 28,
  },
  cardImageContainer: {
    backgroundColor: "#fff",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: Math.min(width * 0.6, 280), // Máximo 280px de ancho
    height: Math.min(width * 0.84, 392), // Mantiene proporción de carta estándar
    maxWidth: 280,
    maxHeight: 392,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  detailsSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  attacksContainer: {
    gap: 16,
  },
  attackItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
  },
  attackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  attackName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  attackDamage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  attackText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  priceSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  priceSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  refreshText: {
    fontSize: 14,
    color: "#6c08dd",
    fontWeight: "500",
  },
  priceStatsContainer: {
    marginBottom: 20,
  },
  priceMainStat: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  priceChangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  priceChangeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  priceStat: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    width: (width - 56) / 2,
    alignItems: "center",
  },
  priceStatLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  volatilityContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  volatilityBar: {
    width: 8,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
  },
  volatilityBarActive: {
    backgroundColor: "#6c08dd",
  },
  chartContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  timeRangeSelector: {
    flexDirection: "row",
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    padding: 2,
  },
  timeRangeOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 18,
  },
  timeRangeOptionActive: {
    backgroundColor: "#6c08dd",
  },
  timeRangeText: {
    fontSize: 12,
    color: "#666",
  },
  timeRangeTextActive: {
    color: "#fff",
    fontWeight: "500",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
  summarySection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    width: (width - 56) / 2,
    alignItems: "center",
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  listingsSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  listingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: "#666",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: "#333",
  },
  listingCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  listingImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
  },
  listingDetails: {
    flex: 1,
    gap: 6,
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  conditionBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  conditionText: {
    fontSize: 12,
    color: "#2ecc71",
    fontWeight: "500",
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sellerName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginLeft: 4,
  },
  transactionsText: {
    fontSize: 12,
    color: "#666",
  },
  sellerProfileButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  sellerProfileButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  sortModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    width: "80%",
    maxHeight: "60%",
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
})
