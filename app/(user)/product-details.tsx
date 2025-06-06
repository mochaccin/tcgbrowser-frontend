"use client"
import { Feather } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
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
} from "react-native"
import { LineChart } from "react-native-chart-kit"
import NavigationDrawer from "../../components/NavigationDrawer"

const { width } = Dimensions.get("window")

// Sample card data - in a real app this would come from an API
const CARD_DETAILS = {
  card1: {
    id: "card1",
    name: "Magikarp",
    fullName: "Magikarp - 035/102 - Base Set (Shadowless)",
    set: "Base Set (Shadowless)",
    rarity: "Poco común",
    number: "035/102",
    type: "Agua",
    artist: "Mitsuhiro Arita",
    imageUri: "https://images.pokemontcg.io/base1/35.png",
    marketPrice: "800",
    recentPrice: "750",
    highPrice: "1200",
    lowPrice: "600",
    totalListings: 156,
    avgSalesPrice: "825",
    totalSales: 89,
    avgDailySales: 12,
    priceHistory: {
      labels: ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"],
      datasets: [
        {
          data: [650, 680, 720, 750, 790, 810, 780, 820, 850, 830, 800, 780],
          color: (opacity = 1) => `rgba(108, 8, 221, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    volatility: 0.75, // 0-1 scale
    priceChange: -2.5, // percentage
    priceChangeColor: "#e74c3c", // red for negative, green for positive
  },
  card2: {
    id: "card2",
    name: "Pikachu",
    fullName: "Pikachu - 058/102 - Base Set (Shadowless)",
    set: "Base Set (Shadowless)",
    rarity: "Común",
    number: "058/102",
    type: "Eléctrico",
    artist: "Atsuko Nishida",
    imageUri: "https://images.pokemontcg.io/base1/58.png",
    marketPrice: "1200",
    recentPrice: "1150",
    highPrice: "1800",
    lowPrice: "900",
    totalListings: 234,
    avgSalesPrice: "1175",
    totalSales: 156,
    avgDailySales: 18,
    priceHistory: {
      labels: ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"],
      datasets: [
        {
          data: [950, 1000, 1050, 1100, 1250, 1300, 1350, 1400, 1350, 1300, 1250, 1200],
          color: (opacity = 1) => `rgba(108, 8, 221, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    volatility: 0.5, // 0-1 scale
    priceChange: 3.2, // percentage
    priceChangeColor: "#2ecc71", // green for positive
  },
  card3: {
    id: "card3",
    name: "Charizard",
    fullName: "Charizard - 004/102 - Base Set (Shadowless)",
    set: "Base Set (Shadowless)",
    rarity: "Rara",
    number: "004/102",
    type: "Fuego",
    artist: "Mitsuhiro Arita",
    imageUri: "https://images.pokemontcg.io/base1/4.png",
    marketPrice: "45000",
    recentPrice: "42000",
    highPrice: "65000",
    lowPrice: "35000",
    totalListings: 45,
    avgSalesPrice: "43500",
    totalSales: 23,
    avgDailySales: 3,
    priceHistory: {
      labels: ["Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic", "Ene", "Feb"],
      datasets: [
        {
          data: [38000, 40000, 42000, 45000, 50000, 55000, 60000, 65000, 58000, 52000, 48000, 45000],
          color: (opacity = 1) => `rgba(108, 8, 221, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    },
    volatility: 0.85, // 0-1 scale
    priceChange: -5.8, // percentage
    priceChangeColor: "#e74c3c", // red for negative
  },
}

// Sample seller listings
const SAMPLE_LISTINGS = [
  {
    id: "listing1",
    sellerName: "Jonnaa_",
    price: "2070",
    condition: "Ligeramente jugado",
    rating: 4.5,
    transactions: 3456,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing2",
    sellerName: "CardMaster",
    price: "1950",
    condition: "Mint",
    rating: 4.8,
    transactions: 2890,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing3",
    sellerName: "PokemonPro",
    price: "2200",
    condition: "Near Mint",
    rating: 4.7,
    transactions: 1567,
    imageUri: "https://images.pokemontcg.io/base1/35.png",
  },
  {
    id: "listing4",
    sellerName: "TCGExpert",
    price: "1875",
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
  const cardId = (params.cardId as string) || "card1"
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState("price")
  const [timeRange, setTimeRange] = useState("3m") // 1m, 3m, 6m, 1y

  // Get card details (in a real app, this would be an API call)
  const cardDetails = CARD_DETAILS[cardId as keyof typeof CARD_DETAILS] || CARD_DETAILS.card1

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
    const volatility = cardDetails.volatility || 0.5
    const activeIndex = Math.floor(volatility * 5)
    return Array(5)
      .fill(0)
      .map((_, index) => index < activeIndex)
  }

  // Format price with commas
  const formatPrice = (price: string) => {
    return price.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
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

        {/* Card Image */}
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
          </View>
        </View>

        {/* Price Points */}
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
              <Text style={styles.priceValue}>$ {formatPrice(cardDetails.marketPrice)} CLP</Text>
              <View style={styles.priceChangeContainer}>
                <Feather
                  name={Number(cardDetails.priceChange) >= 0 ? "arrow-up" : "arrow-down"}
                  size={14}
                  color={cardDetails.priceChangeColor}
                />
                <Text style={[styles.priceChangeText, { color: cardDetails.priceChangeColor }]}>
                  {Math.abs(Number(cardDetails.priceChange))}%
                </Text>
              </View>
            </View>

            <View style={styles.priceStatsGrid}>
              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Venta reciente</Text>
                <Text style={styles.priceStatValue}>$ {formatPrice(cardDetails.recentPrice)}</Text>
              </View>

              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Precio más alto</Text>
                <Text style={styles.priceStatValue}>$ {formatPrice(cardDetails.highPrice)}</Text>
              </View>

              <View style={styles.priceStat}>
                <Text style={styles.priceStatLabel}>Precio más bajo</Text>
                <Text style={styles.priceStatValue}>$ {formatPrice(cardDetails.lowPrice)}</Text>
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

          {/* Price Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Historial de precios</Text>
              <View style={styles.timeRangeSelector}>
                {timeRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.timeRangeOption, timeRange === option.id && styles.timeRangeOptionActive]}
                    onPress={() => setTimeRange(option.id)}
                  >
                    <Text style={[styles.timeRangeText, timeRange === option.id && styles.timeRangeTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <LineChart
              data={cardDetails.priceHistory}
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
              <Text style={styles.summaryValue}>$ {formatPrice(cardDetails.highPrice)}</Text>
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
              <Text style={styles.summaryValue}>$ {formatPrice(cardDetails.avgSalesPrice)}</Text>
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
                  <Text style={styles.listingPrice}>$ {formatPrice(listing.price)} CLP</Text>
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
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: width * 0.7,
    height: width * 0.9,
    borderRadius: 12,
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
