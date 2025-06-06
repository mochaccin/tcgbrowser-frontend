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
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native"
import ProductCarousel from "../../components/ProductCarousel"
import { useUserStore } from "../../store/userStore"

const { width, height } = Dimensions.get("window")

// Interface para los datos del usuario desde la API
interface UserProfile {
  _id: string
  username: string
  name: string
  email: string
  location: string
  nationality: string
  img_url?: string
  createdAt?: string
  updatedAt?: string
}

// Interface para los productos publicados
interface PublishedProduct {
  id: string
  title: string
  brand: string
  imageUri: string
}

export default function ProfileScreen() {
  // Store hook
  const { currentUser, updateUser } = useUserStore()

  // Local state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [publishedProducts, setPublishedProducts] = useState<PublishedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productsCount, setProductsCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

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
      updateUser(userData)

      // Cargar productos publicados por el usuario (simulado por ahora)
      await loadUserProducts(userId)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al cargar el perfil"
      console.error("❌ PROFILE: Error cargando perfil:", err)
      setError(errorMsg)
      if (!showRefreshIndicator) {
        Alert.alert("Error", "No se pudo cargar el perfil del usuario")
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
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
    }, [currentUser._id, userProfile !== null])
  )

  // Cargar productos del usuario
  const loadUserProducts = async (userId: string) => {
    try {
      console.log(`🔍 PROFILE: Cargando productos del usuario: ${userId}`)

      // Por ahora usamos datos de ejemplo, pero podrías implementar un endpoint
      // como GET /products/user/:userId en tu backend
      const sampleProducts: PublishedProduct[] = [
        {
          id: "1",
          title: "Charizard ex",
          brand: "SV: Prismatic Evolutions",
          imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
        },
        {
          id: "2",
          title: "Pikachu VMAX",
          brand: "SWSH: Vivid Voltage",
          imageUri: "https://images.pokemontcg.io/swsh4/188.png",
        },
        {
          id: "3",
          title: "Eevee",
          brand: "SV: Prismatic Evolutions",
          imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
        },
      ]

      setPublishedProducts(sampleProducts)
      setProductsCount(sampleProducts.length)

      // Alternativa: Si tienes un endpoint real para productos del usuario
      /*
      const productsResponse = await fetch(`http://localhost:3000/products/user/${userId}`)
      if (productsResponse.ok) {
        const products = await productsResponse.json()
        const transformedProducts = products.map((product: any) => ({
          id: product._id,
          title: product.name,
          brand: product.setInfo?.name || 'Unknown Set',
          imageUri: product.images?.small || product.images?.large || 'https://images.pokemontcg.io/sv4pt5/1.png'
        }))
        setPublishedProducts(transformedProducts)
        setProductsCount(transformedProducts.length)
      }
      */
    } catch (err) {
      console.error("❌ PROFILE: Error cargando productos:", err)
      // No mostramos error aquí porque no es crítico
      setPublishedProducts([])
      setProductsCount(0)
    }
  }

  // Refresh profile data manualmente
  const refreshProfile = async () => {
    if (currentUser._id) {
      await loadUserProfile(true)
    }
  }

  // Navigate to edit profile
  const navigateToEditProfile = () => {
    router.push({
      pathname: "/edit-profile",
      params: {
        userId: userProfile?._id,
        currentName: userProfile?.name,
        currentUsername: userProfile?.username,
        currentEmail: userProfile?.email,
        currentLocation: userProfile?.location,
        currentNationality: userProfile?.nationality,
        currentImageUrl: userProfile?.img_url,
      },
    })
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
      </SafeAreaView>
    )
  }

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
          <TouchableOpacity 
            style={styles.headerIcon} 
            onPress={refreshProfile}
            disabled={refreshing}
          >
            <Feather 
              name="refresh-cw" 
              size={20} 
              color={refreshing ? "#ccc" : "black"} 
              style={refreshing ? { transform: [{ rotate: '180deg' }] } : {}}
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
          <TouchableOpacity style={styles.socialIcon}>
            <Feather name="facebook" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialIcon}>
            <Feather name="instagram" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialIcon}
            onPress={() => {
              // Abrir cliente de email con el email del usuario
              // En React Native podrías usar Linking.openURL(`mailto:${userProfile.email}`)
            }}
          >
            <Feather name="mail" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userUsername}>@{userProfile.username}</Text>
          <Text style={styles.userLocation}>{userProfile.location}</Text>
          <Text style={styles.userNationality}>{userProfile.nationality}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
        </View>

        {/* User Stats */}
        <View style={styles.userStatsContainer}>
          <Feather name="star" size={20} color="#3ac692" />
          <Text style={styles.userStats}>
            {productsCount} artículo{productsCount !== 1 ? "s" : ""} publicado{productsCount !== 1 ? "s" : ""}
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
          <Text style={styles.sectionTitle}>Artículos Publicados</Text>
          <Text style={styles.sectionSubtitle}>
            {publishedProducts.length > 0
              ? `${publishedProducts.length} artículo${publishedProducts.length !== 1 ? "s" : ""} que este usuario ha publicado`
              : "Este usuario no ha publicado artículos aún"}
          </Text>

          {publishedProducts.length > 0 ? (
            <ProductCarousel products={publishedProducts} />
          ) : (
            <View style={styles.emptyProductsContainer}>
              <Feather name="package" size={48} color="#ccc" />
              <Text style={styles.emptyProductsText}>No hay productos publicados</Text>
              <TouchableOpacity style={styles.addProductButton} onPress={() => router.push("/add-product")}>
                <Feather name="plus" size={16} color="#6c08dd" />
                <Text style={styles.addProductButtonText}>Publicar primer producto</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Info */}
        <View style={styles.accountInfoSection}>
          <Text style={styles.sectionTitle}>Información de la Cuenta</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usuario desde:</Text>
            <Text style={styles.infoValue}>
              {userProfile.createdAt
                ? new Date(userProfile.createdAt).toLocaleDateString("es-CL")
                : "Fecha no disponible"}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID de usuario:</Text>
            <Text style={styles.infoValue}>{userProfile._id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Última actualización:</Text>
            <Text style={styles.infoValue}>
              {userProfile.updatedAt
                ? new Date(userProfile.updatedAt).toLocaleString("es-CL")
                : "No disponible"}
            </Text>
          </View>
        </View>
      </ScrollView>
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