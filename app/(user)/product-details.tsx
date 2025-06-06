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
  Linking,
  Alert,
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

// 🔧 NUEVO: Interfaz para usuarios de la base de datos
interface User {
  _id: string
  username: string
  name: string
  email: string
  img_url?: string
  location?: string
  nationality?: string
  rating?: string
  contact_info?: Map<string, string> | { [key: string]: string }
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
  basePriceCLP: number
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
  const [timeRange, setTimeRange] = useState("3m")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null)

  // 🔧 NUEVO: Estados para usuarios y modal de contacto
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

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

  // 🔧 NUEVO: Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true)
        setUsersError(null)

        const response = await fetch("http://localhost:3000/users")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const usersData: User[] = await response.json()
        setUsers(usersData)
        console.log("👥 Usuarios cargados:", usersData.length)
      } catch (err) {
        console.error("❌ Error fetching users:", err)
        setUsersError(err instanceof Error ? err.message : "Error al cargar usuarios")
      } finally {
        setUsersLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // 🔧 NUEVO: Función para abrir modal de contacto
  const openContactModal = (user: User) => {
    console.log("📞 Abriendo modal de contacto para:", user.username)
    console.log("📞 Contact info:", user.contact_info)
    setSelectedUser(user)
    setShowContactModal(true)
  }

  // 🔧 NUEVO: Función para manejar links de redes sociales
  const handleSocialLink = async (platform: string, url: string) => {
    try {
      console.log(`🔗 Intentando abrir ${platform}:`, url)

      // Verificar si la URL es válida
      if (!url || url.trim() === "") {
        Alert.alert("Error", `No hay ${platform} configurado para este usuario`)
        return
      }

      // Asegurar que la URL tenga protocolo
      let finalUrl = url
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        if (platform === "email") {
          finalUrl = `mailto:${url}`
        } else if (platform === "whatsapp") {
          finalUrl = `whatsapp://send?phone=${url}`
        } else {
          finalUrl = `https://${url}`
        }
      }

      // Verificar si se puede abrir la URL
      const canOpen = await Linking.canOpenURL(finalUrl)
      if (canOpen) {
        await Linking.openURL(finalUrl)
        setShowContactModal(false) // Cerrar modal después de abrir link
      } else {
        Alert.alert("Error", `No se puede abrir ${platform}. Verifica que tengas la aplicación instalada.`)
      }
    } catch (error) {
      console.error(`❌ Error opening ${platform}:`, error)
      Alert.alert("Error", `No se pudo abrir ${platform}`)
    }
  }

  // 🔧 NUEVO: Función para obtener el icono según la plataforma
  const getSocialIcon = (platform: string): string => {
    const iconMap: { [key: string]: string } = {
      facebook: "facebook",
      instagram: "instagram",
      email: "mail",
      whatsapp: "message-circle",
      twitter: "twitter",
      linkedin: "linkedin",
      website: "globe",
      phone: "phone",
      discord: "message-square",
      telegram: "send",
    }
    return iconMap[platform.toLowerCase()] || "link"
  }

  // 🔧 NUEVO: Función para obtener el color según la plataforma
  const getSocialColor = (platform: string): string => {
    const colorMap: { [key: string]: string } = {
      facebook: "#1877F2",
      instagram: "#E4405F",
      email: "#EA4335",
      whatsapp: "#25D366",
      twitter: "#1DA1F2",
      linkedin: "#0A66C2",
      website: "#6c08dd",
      phone: "#34C759",
      discord: "#5865F2",
      telegram: "#0088CC",
    }
    return colorMap[platform.toLowerCase()] || "#6c08dd"
  }

  // 🔧 NUEVO: Función para obtener información de contacto como objeto
  const getContactInfo = (
    contactInfo: Map<string, string> | { [key: string]: string } | undefined,
  ): { [key: string]: string } => {
    if (!contactInfo) return {}

    if (contactInfo instanceof Map) {
      return Object.fromEntries(contactInfo)
    }

    return contactInfo
  }

  // Función para generar datos de precio consistentes según el rango de tiempo
  const generatePriceHistoryData = (basePriceCLP: number, timeRange: string, cardId: string) => {
    const seed = cardId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)

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

    const priceData = Array(config.dataPoints)
      .fill(0)
      .map((_, index) => {
        const randomFactor = seededRandom(config.baseIndex + index)
        const variation = 0.8 + randomFactor * 0.4
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
    const basePriceCLP = convertUSDToCLP(apiCard.price)
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
      basePriceCLP,
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

  const getPriceHistoryData = () => {
    if (!cardDetails) return { labels: [], datasets: [] }
    return generatePriceHistoryData(cardDetails.basePriceCLP, timeRange, cardDetails.id)
  }

  const handleTimeRangeChange = (newTimeRange: string) => {
    console.log(`📊 Cambiando rango de tiempo de ${timeRange} a: ${newTimeRange}`)
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

          {/* Price Chart */}
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Historial de precios</Text>
              <View style={styles.timeRangeSelector}>
                {timeRangeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.timeRangeOption, timeRange === option.id && styles.timeRangeOptionActive]}
                    onPress={() => handleTimeRangeChange(option.id)}
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

        {/* 🔧 NUEVA SECCIÓN: Vendedores de la comunidad con estética de listados */}
        <View style={styles.sellersSection}>
          <View style={styles.sellersHeader}>
            <Text style={styles.sectionTitle}>{users.length} vendedores</Text>
            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Ordenar por</Text>
              <TouchableOpacity style={styles.sortButton}>
                <Text style={styles.sortButtonText}>Nombre</Text>
                <Feather name="chevron-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          {usersLoading && (
            <View style={styles.sellersLoadingContainer}>
              <ActivityIndicator size="small" color="#6c08dd" />
              <Text style={styles.sellersLoadingText}>Cargando vendedores...</Text>
            </View>
          )}

          {usersError && (
            <View style={styles.sellersErrorContainer}>
              <Text style={styles.sellersErrorText}>{usersError}</Text>
            </View>
          )}

          {!usersLoading && !usersError && users.length > 0 && (
            <View style={styles.sellersContainer}>
              {users.map((user) => (
                <View key={user._id} style={styles.sellerCard}>
                  <Image
                    source={{
                      uri:
                        user.img_url || "https://via.placeholder.com/60x80/6c08dd/ffffff?text=" + user.name.charAt(0),
                    }}
                    style={styles.sellerImage}
                  />
                  <View style={styles.sellerDetails}>
                    <View style={styles.sellerHeader}>
                      <Text style={styles.sellerPrice}>Disponible</Text>
                      <View style={styles.sellerStatusBadge}>
                        <Text style={styles.sellerStatusText}>Activo</Text>
                      </View>
                    </View>
                    <View style={styles.sellerInfo}>
                      <Feather name="user" size={16} color="#666" />
                      <Text style={styles.sellerName}>{user.name}</Text>
                    </View>
                    <View style={styles.sellerRatingInfo}>
                      <View style={styles.sellerStarsContainer}>
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Feather
                              key={i}
                              name="star"
                              size={14}
                              color={i < Number.parseFloat(user.rating || "4.5") ? "#FFD700" : "#e0e0e0"}
                            />
                          ))}
                      </View>
                      <Text style={styles.sellerRatingText}>{user.rating || "4.5"}</Text>
                      <Text style={styles.sellerLocationText}>{user.location || "Ubicación no especificada"}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.sellerContactButton}
                      onPress={() => openContactModal(user)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.sellerContactButtonText}>Contactar Vendedor</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {!usersLoading && !usersError && users.length === 0 && (
            <View style={styles.noSellersContainer}>
              <Feather name="users" size={48} color="#ccc" />
              <Text style={styles.noSellersText}>No hay vendedores disponibles</Text>
              <Text style={styles.noSellersSubtext}>Vuelve más tarde para ver nuevos vendedores</Text>
            </View>
          )}
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

      {/* 🔧 NUEVO: Modal de contacto con redes sociales */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowContactModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowContactModal(false)}>
          <View style={styles.contactModalContainer}>
            <View style={styles.contactModalHeader}>
              <View style={styles.contactModalUserInfo}>
                <Image
                  source={{
                    uri:
                      selectedUser?.img_url ||
                      "https://via.placeholder.com/60x60/6c08dd/ffffff?text=" + (selectedUser?.name.charAt(0) || "U"),
                  }}
                  style={styles.contactModalAvatar}
                />
                <View style={styles.contactModalUserDetails}>
                  <Text style={styles.contactModalUserName}>{selectedUser?.name}</Text>
                  <Text style={styles.contactModalUserUsername}>@{selectedUser?.username}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowContactModal(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={styles.contactModalContent}>
              <Text style={styles.contactModalTitle}>Información de contacto</Text>

              {(() => {
                const contactInfo = getContactInfo(selectedUser?.contact_info)
                const contactEntries = Object.entries(contactInfo)

                if (contactEntries.length === 0) {
                  return (
                    <View style={styles.noContactContainer}>
                      <Feather name="info" size={48} color="#ccc" />
                      <Text style={styles.noContactText}>Este usuario no ha configurado información de contacto</Text>
                    </View>
                  )
                }

                return (
                  <View style={styles.socialLinksContainer}>
                    {contactEntries.map(([platform, url]) => (
                      <TouchableOpacity
                        key={platform}
                        style={[styles.socialLinkButton, { backgroundColor: getSocialColor(platform) }]}
                        onPress={() => handleSocialLink(platform, url)}
                        activeOpacity={0.8}
                      >
                        <Feather name={getSocialIcon(platform)} size={20} color="#fff" />
                        <Text style={styles.socialLinkText}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Text>
                        <Feather name="external-link" size={16} color="#fff" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )
              })()}
            </View>
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
    width: Math.min(width * 0.6, 280),
    height: Math.min(width * 0.84, 392),
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
  // 🔧 NUEVOS ESTILOS: Sección de vendedores con estética de listados
  sellersSection: {
    backgroundColor: "#fff",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sellersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sellersLoadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 8,
  },
  sellersLoadingText: {
    fontSize: 14,
    color: "#666",
  },
  sellersErrorContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  sellersErrorText: {
    fontSize: 14,
    color: "#ff6b6b",
    textAlign: "center",
  },
  sellersContainer: {
    gap: 12,
  },
  sellerCard: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sellerImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  sellerDetails: {
    flex: 1,
    gap: 6,
  },
  sellerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sellerPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2ecc71",
  },
  sellerStatusBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellerStatusText: {
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
  sellerRatingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerStarsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  sellerRatingText: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginLeft: 4,
  },
  sellerLocationText: {
    fontSize: 12,
    color: "#666",
  },
  sellerContactButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  sellerContactButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  noSellersContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noSellersText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  noSellersSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  // 🔧 NUEVOS ESTILOS: Modal de contacto
  contactModalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    marginTop: "auto",
  },
  contactModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactModalUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  contactModalAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  contactModalUserDetails: {
    flex: 1,
  },
  contactModalUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  contactModalUserUsername: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  contactModalContent: {
    padding: 20,
  },
  contactModalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  socialLinksContainer: {
    gap: 12,
  },
  socialLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  socialLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  noContactContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noContactText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 24,
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
