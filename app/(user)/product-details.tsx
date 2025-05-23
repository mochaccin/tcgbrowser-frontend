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

export default function CardDetailScreen() {
  const params = useLocalSearchParams()
  const cardId = (params.cardId as string) || "card1"
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSort, setSelectedSort] = useState("price")

  // Get card details (in a real app, this would be an API call)
  const cardDetails = CARD_DETAILS[cardId as keyof typeof CARD_DETAILS] || CARD_DETAILS.card1

  const sortOptions = [
    { id: "price", label: "Precio" },
    { id: "condition", label: "Estado" },
    { id: "seller", label: "Vendedor" },
    { id: "newest", label: "Más recientes" },
  ]

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
            <TouchableOpacity>
              <Text style={styles.clearDataText}>Clear nuevo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.priceGrid}>
            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Precio de mercado</Text>
              <Text style={styles.priceValue}>$ {cardDetails.marketPrice} CLP</Text>
              <Text style={styles.priceSubtext}>Venta más reciente</Text>
              <Text style={styles.priceChange}>$ {cardDetails.recentPrice} CLP</Text>
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Volatilidad Med</Text>
              <View style={styles.volatilityIndicator}>
                <View style={styles.volatilityBar} />
                <View style={styles.volatilityBar} />
                <View style={styles.volatilityBar} />
                <View style={[styles.volatilityBar, styles.volatilityBarActive]} />
                <View style={styles.volatilityBar} />
              </View>
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Mediana cotizada:</Text>
              <Text style={styles.priceValue}>$ {cardDetails.highPrice} CLP</Text>
              <Text style={styles.priceLabel}>Cantidad total:</Text>
              <Text style={styles.priceSubtext}>{cardDetails.totalListings}</Text>
            </View>

            <View style={styles.priceCard}>
              <Text style={styles.priceLabel}>Vendedores actuales:</Text>
              <Text style={styles.priceValue}>{Math.floor(Number(cardDetails.totalListings) * 0.6)}</Text>
            </View>
          </View>

          {/* Price Chart Placeholder */}
          <View style={styles.chartContainer}>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>Gráfico de precios (3 meses)</Text>
              <View style={styles.chartLine} />
            </View>
          </View>
        </View>

        {/* 3 Month Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Resumen de 3 meses</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Precio de venta alto:</Text>
              <Text style={styles.summaryValue}>$ {cardDetails.highPrice}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total vendidas:</Text>
              <Text style={styles.summaryValue}>{cardDetails.totalSales}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Precio de venta alto:</Text>
              <Text style={styles.summaryValue}>$ {cardDetails.avgSalesPrice}</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Promedio de ventas diarias:</Text>
              <Text style={styles.summaryValue}>{cardDetails.avgDailySales}</Text>
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
                  <Text style={styles.listingPrice}>$ {listing.price} CLP</Text>
                  <Text style={styles.listingCondition}>{listing.condition}</Text>
                </View>
                <View style={styles.sellerInfo}>
                  <Feather name="user" size={16} color="#666" />
                  <Text style={styles.sellerName}>{listing.sellerName}</Text>
                </View>
                <View style={styles.ratingInfo}>
                  <Feather name="star" size={14} color="#FFD700" />
                  <Text style={styles.ratingText}>{listing.rating}</Text>
                  <Text style={styles.transactionsText}>{listing.transactions} transacciones</Text>
                </View>
                <TouchableOpacity style={styles.sellerProfileButton}>
                  <Text style={styles.sellerProfileButtonText}>Perfil Vendedor</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.footerSocialIcon}>
              <Feather name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerSocialIcon}>
              <Feather name="instagram" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerSocialIcon}>
              <Feather name="twitter" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerSocialIcon}>
              <Feather name="help-circle" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Descubre el mundo de Pokemon TCG con las mejores cartas, estrategias y colecciones. Únete a millones de
            entrenadores en todo el mundo.
          </Text>

          <Text style={styles.footerText}>© 2025 Pokemon TCG Browser. Todos los derechos reservados.</Text>

          <View style={styles.footerLinks}>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Política de Privacidad</Text>
            </TouchableOpacity>
            <Text style={styles.footerLinkDivider}>|</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Términos de Servicio</Text>
            </TouchableOpacity>
            <Text style={styles.footerLinkDivider}>|</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Accesibilidad</Text>
            </TouchableOpacity>
          </View>
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
  clearDataText: {
    fontSize: 14,
    color: "#6c08dd",
    fontWeight: "500",
  },
  priceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  priceCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    width: (width - 56) / 2,
    minHeight: 80,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 11,
    color: "#999",
    marginBottom: 2,
  },
  priceChange: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c08dd",
  },
  volatilityIndicator: {
    flexDirection: "row",
    gap: 4,
    marginTop: 8,
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
    marginTop: 16,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  chartText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  chartLine: {
    width: "80%",
    height: 2,
    backgroundColor: "#6c08dd",
    borderRadius: 1,
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
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    width: (width - 56) / 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
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
    borderRadius: 8,
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
  listingCondition: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
  ratingText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
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
