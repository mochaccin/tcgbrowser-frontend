"use client"
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins"
import { Feather } from "@expo/vector-icons"
import { router, useFocusEffect } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useCallback, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import ProductCarousel from "../../components/ProductCarousel"
import Toast from "../../components/Toast"
import { useUserStore } from "../../store/userStore"

const { width, height } = Dimensions.get("window")

// Interface para los datos del usuario desde la API
interface UserProfile {
  _id: string
  username: string
  name: string
  email: string
  location?: string
  nationality?: string
  img_url?: string
  createdAt?: string
  updatedAt?: string
}

// Interface for carousel products
interface CarouselProduct {
  id: string
  imageUri: string
  title: string
  brand: string
}

export default function ProfileScreen() {
  // Store hook
  const { currentUser, updateUser, getInventoryStats, loadUserInventory, inventory, inventoryLoading } = useUserStore()

  // Local state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [carouselProducts, setCarouselProducts] = useState<CarouselProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    title: "",
    type: "success" as "success" | "error" | "info" | "warning",
  })

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  const showToast = (message: string, title: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ visible: true, message, title, type })
  }

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }))
  }

  // Get image URI with fallback
  const getImageUri = (item: any) => {
    return (
      item.images?.large || item.images?.small || item.images?.symbol || "https://images.pokemontcg.io/sv4pt5/1.png"
    )
  }

  // Cargar datos del usuario
  const loadUserProfile = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const userId = currentUser._id
      console.log(`🔍 PROFILE: Cargando perfil del usuario: ${userId}`)

      // Cargar datos del usuario
      const userResponse = await fetch(`http://localhost:3000/users/${userId}`)

      if (!userResponse.ok) {
        throw new Error(`Error ${userResponse.status}: ${userResponse.statusText}`)
      }

      const userData: UserProfile = await userResponse.json()
      console.log("✅ PROFILE: Datos del usuario cargados:", userData)
      setUserProfile(userData)

      // Actualizar el store global con los datos más recientes
      await updateUser({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        location: userData.location,
        nationality: userData.nationality,
        img_url: userData.img_url,
      })

      // Cargar inventory stats
      await loadUserInventory()

      // Process inventory items for carousel
      processInventoryForCarousel()

      if (showRefreshIndicator) {
        showToast("Perfil actualizado correctamente", "¡Éxito!", "success")
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar el perfil"
      console.error("❌ PROFILE: Error cargando perfil:", err)
      setError(errorMsg)

      if (showRefreshIndicator) {
        showToast(errorMsg, "Error", "error")
      } else {
        Alert.alert("Error", "No se pudo cargar el perfil del usuario")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Process inventory items for carousel
  const processInventoryForCarousel = () => {
    try {
      console.log(`🔍 PROFILE: Procesando ${inventory.length} productos para el carousel`)

      // Transform inventory items to carousel format
      const transformedProducts: CarouselProduct[] = inventory.map((item) => ({
        id: item._id,
        imageUri: getImageUri(item),
        title: item.name,
        brand: item.set?.name || item.product_type || "Unknown Set",
      }))

      setCarouselProducts(transformedProducts)
      console.log(`✅ PROFILE: ${transformedProducts.length} productos procesados para el carousel`)
    } catch (err) {
      console.error("❌ PROFILE: Error procesando productos para carousel:", err)
      setCarouselProducts([])
    }
  }

  // Usar useFocusEffect para recargar datos cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      console.log("🔄 PROFILE: Pantalla recibió foco, recargando datos...")
      if (currentUser._id) {
        // Si ya tenemos datos cargados, usar refresh indicator
        const showRefresh = userProfile !== null
        loadUserProfile(showRefresh)
      }
    }, [currentUser._id]),
  )

  // Effect to update carousel when inventory changes
  useFocusEffect(
    useCallback(() => {
      if (inventory.length > 0) {
        processInventoryForCarousel()
      }
    }, [inventory]),
  )

  // Refresh profile data manualmente
  const refreshProfile = async () => {
    if (currentUser._id) {
      await loadUserProfile(true)
    }
  }

  // Navigate to edit profile
  const navigateToEditProfile = () => {
    showToast("Edición de perfil próximamente disponible", "Información", "info")
  }

  // Navigate to add product
  const navigateToAddProduct = () => {
    router.push("/add-inventory-item")
  }

  // Handle product press
  const handleProductPress = (product: CarouselProduct) => {
    showToast(`Producto seleccionado: ${product.title}`, "Información", "info")
  }

  // Show loading while checking auth state or loading fonts
  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    )
  }

  // Show error state
  if (error || !userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Error al cargar el perfil</Text>
          <Text style={styles.errorText}>{error || "No se pudieron cargar los datos del usuario"}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshProfile}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
        <Toast
          visible={toast.visible}
          message={toast.message}
          title={toast.title}
          type={toast.type}
          onDismiss={hideToast}
        />
      </SafeAreaView>
    )
  }

  // Get inventory stats
  const inventoryStats = getInventoryStats()

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={navigateToEditProfile}>
            <Feather name="edit-2" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon} onPress={refreshProfile} disabled={refreshing}>
            <Feather
              name="refresh-cw"
              size={20}
              color={refreshing ? "#ccc" : "black"}
              style={refreshing ? { transform: [{ rotate: "180deg" }] } : {}}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Refresh Indicator */}
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#6c08dd" />
          <Text style={styles.refreshText}>Actualizando perfil...</Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri:
                userProfile.img_url ||
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
            }}
            style={styles.profileImage}
            key={userProfile.img_url} // Force re-render when image changes
          />
        </View>

        {/* Social Media Icons */}
        <View style={styles.socialIconsContainer}>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => showToast("Redes sociales próximamente disponibles", "Información", "info")}
          >
            <Feather name="facebook" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => showToast("Redes sociales próximamente disponibles", "Información", "info")}
          >
            <Feather name="instagram" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => showToast("Cliente de email próximamente disponible", "Información", "info")}
          >
            <Feather name="mail" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userUsername}>@{userProfile.username}</Text>
          {userProfile.location && <Text style={styles.userLocation}>{userProfile.location}</Text>}
          {userProfile.nationality && <Text style={styles.userNationality}>{userProfile.nationality}</Text>}
          <Text style={styles.userEmail}>{userProfile.email}</Text>
        </View>

        {/* User Stats */}
        <View style={styles.userStatsContainer}>
          <Feather name="star" size={20} color="#3ac692" />
          <Text style={styles.userStats}>
            {inventoryStats.totalProducts} artículo{inventoryStats.totalProducts !== 1 ? "s" : ""} en inventario
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/my-collections")}>
            <Feather name="grid" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Mis colecciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/inventory")}>
            <Feather name="package" size={20} color="#fff" />
            <Text style={styles.quickActionText}>Mi inventario</Text>
          </TouchableOpacity>
        </View>

        {/* Published Articles */}
        <View style={styles.articlesSection}>
          <Text style={styles.sectionTitle}>Artículos en Inventario</Text>
          <Text style={styles.sectionSubtitle}>
            {inventoryStats.totalProducts > 0
              ? `${inventoryStats.totalProducts} artículo${inventoryStats.totalProducts !== 1 ? "s" : ""} en tu inventario personal`
              : "Tu inventario está vacío"}
          </Text>

          {/* Loading state for carousel */}
          {inventoryLoading && (
            <View style={styles.carouselLoadingContainer}>
              <ActivityIndicator size="small" color="#6c08dd" />
              <Text style={styles.carouselLoadingText}>Cargando artículos...</Text>
            </View>
          )}

          {/* Carousel with inventory items */}
          {!inventoryLoading && carouselProducts.length > 0 ? (
            <ProductCarousel products={carouselProducts} onProductPress={handleProductPress} />
          ) : !inventoryLoading && carouselProducts.length === 0 ? (
            <View style={styles.emptyProductsContainer}>
              <Feather name="package" size={48} color="#ccc" />
              <Text style={styles.emptyProductsText}>No hay productos en tu inventario</Text>
              <TouchableOpacity style={styles.addProductButton} onPress={navigateToAddProduct}>
                <Feather name="plus" size={16} color="#6c08dd" />
                <Text style={styles.addProductButtonText}>Agregar primer producto</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        title={toast.title}
        type={toast.type}
        onDismiss={hideToast}
      />
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
    backgroundColor: "#F8F8F8",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontFamily: "Poppins_400Regular",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Poppins_400Regular",
  },
  retryButton: {
    backgroundColor: "#6c08dd",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Poppins_600SemiBold",
  },
  headerRight: {
    flexDirection: "row",
  },
  headerIcon: {
    marginLeft: 16,
  },
  refreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: "#f0f8ff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6c08dd",
    fontFamily: "Poppins_400Regular",
  },
  scrollView: {
    flex: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 24,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#6c08dd",
  },
  socialIconsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6c08dd",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  userInfoContainer: {
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 24,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    color: "#222323",
  },
  userUsername: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#6c08dd",
    marginTop: 4,
  },
  userLocation: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#5e616c",
    marginTop: 4,
  },
  userNationality: {
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
    color: "#333",
    marginTop: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#666",
    marginTop: 4,
  },
  userStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 24,
  },
  userStats: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#222323",
    marginLeft: 8,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  quickActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c08dd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 8,
    flex: 1,
  },
  quickActionText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 8,
  },
  articlesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Poppins_700Bold",
    color: "#222323",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#5e616c",
    marginBottom: 16,
  },
  carouselLoadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  carouselLoadingText: {
    fontSize: 14,
    color: "#666",
    marginTop: 12,
    fontFamily: "Poppins_400Regular",
  },
  emptyProductsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 8,
  },
  emptyProductsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 16,
    fontFamily: "Poppins_400Regular",
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6c08dd",
  },
  addProductButtonText: {
    color: "#6c08dd",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    fontFamily: "Poppins_600SemiBold",
  },
  accountInfoSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: "Poppins_500Medium",
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "Poppins_400Regular",
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
})
