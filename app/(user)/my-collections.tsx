"use client"
import { AntDesign, Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native"
import { useUserStore, type Collection } from "../../store/userStore"

export default function MyCollectionsScreen() {
  // State for search query and filtered collections
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Hook para el store del usuario
  const { currentUser, collections, loading, error, loadUserCollections, toggleFavorite, deleteCollection, debug } =
    useUserStore()

  // Cargar las collections del usuario al iniciar
  useEffect(() => {
    console.log("🔄 SCREEN: Iniciando carga de collections...")
    loadUserCollections()
      .then(() => {
        console.log("✅ SCREEN: Carga completada exitosamente")
      })
      .catch((error) => {
        console.error("❌ SCREEN: Error en carga:", error)
      })
  }, [])

  // Filter collections when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCollections(collections)
    } else {
      const query = searchQuery.toLowerCase().trim()
      const filtered = collections.filter((collection) => collection.name.toLowerCase().includes(query))
      setFilteredCollections(filtered)
    }
  }, [searchQuery, collections])

  // Clear search query
  const clearSearch = () => {
    setSearchQuery("")
  }

  // Navigate to collection detail
  const navigateToCollection = (collectionId: string) => {
    router.push({ pathname: "/collection-details", params: { id: collectionId } })
  }

  // Handle toggle favorite
  const handleToggleFavorite = async (collectionId: string) => {
    try {
      console.log(`🌟 Toggling favorite para collection: ${collectionId}`)
      await toggleFavorite(collectionId)
      console.log(`✅ Favorito actualizado para collection: ${collectionId}`)
    } catch (error) {
      console.error("❌ Error toggling favorite:", error)
    }
  }

  // 🔧 MÉTODO SIMPLIFICADO: Eliminar directamente sin confirmación
  const handleDeleteCollection = async (collectionId: string, collectionName: string) => {
    try {
      console.log(`🗑️ SCREEN: Eliminando collection: ${collectionId} - ${collectionName}`)

      // Mostrar indicador de carga
      setDeletingId(collectionId)

      // Llamar al método del store para eliminar
      await deleteCollection(collectionId)

      console.log(`✅ SCREEN: Collection eliminada exitosamente: ${collectionId}`)

      // No mostrar alerta de éxito, solo log
    } catch (error) {
      console.error("❌ SCREEN: Error eliminando collection:", error)
      console.error("❌ SCREEN: Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      })

      // Solo mostrar alerta de error en móvil si es necesario
      if (Platform.OS !== "web") {
        Alert.alert(
          "Error",
          `No se pudo eliminar la colección "${collectionName}". ${error instanceof Error ? error.message : "Error desconocido"}`,
        )
      }
    } finally {
      // Ocultar indicador de carga
      setDeletingId(null)
    }
  }

  // Loading state
  if (loading && collections.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis colecciones</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6c08dd" />
          <Text style={styles.loadingText}>Cargando colecciones...</Text>
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
        <Text style={styles.headerTitle}>Mis colecciones</Text>
        <TouchableOpacity onPress={debug}>
          <Feather name="info" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca tu colección"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchQuery ? clearSearch : undefined}>
          {searchQuery ? (
            <Feather name="x" size={20} color="black" />
          ) : (
            <Feather name="search" size={20} color="black" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Collections Header */}
        <View style={styles.collectionsHeader}>
          <View>
            <Text style={styles.collectionsTitle}>Mis Colecciones</Text>
            <Text style={styles.collectionsSubtitle}>
              {collections.length} colección{collections.length !== 1 ? "es" : ""}
            </Text>
          </View>
          <TouchableOpacity style={styles.cameraButton} onPress={() => router.push("/add-collection")}>
            <AntDesign name="addfolder" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Error message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Collections List */}
        <View style={styles.collectionsContainer}>
          {filteredCollections.length > 0 ? (
            filteredCollections.map((collection) => (
              <View key={collection._id} style={styles.collectionCard}>
                <TouchableOpacity
                  style={styles.collectionTouchable}
                  onPress={() => navigateToCollection(collection._id!)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{
                      uri: collection.img_url || "https://images.pokemontcg.io/sv4pt5/1.png",
                    }}
                    style={styles.collectionImage}
                  />
                  <LinearGradient
                    colors={["rgba(108, 8, 221, 0)", "rgba(107, 8, 221, 1)"]}
                    locations={[0.2, 1]}
                    style={styles.gradient}
                  />
                  <View style={styles.collectionContent}>
                    <View style={styles.topRow}>
                      <View style={styles.collectionCardCount}>
                        <Text style={styles.cardCountText}>
                          {collection.card_count || 0} carta{(collection.card_count || 0) !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionName}>{collection.name}</Text>
                      {collection.is_favorite && (
                        <View style={styles.favoriteContainer}>
                          <Feather name="star" size={14} color="#FFD700" />
                          <Text style={styles.favoriteText}>Colección favorita</Text>
                        </View>
                      )}
                      <Text style={styles.createdDate}>
                        Creada:{" "}
                        {collection.createdAt
                          ? new Date(collection.createdAt).toLocaleDateString()
                          : "Fecha desconocida"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Botones de acción */}
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => {
                      console.log("🌟 Botón favorito presionado para:", collection._id)
                      handleToggleFavorite(collection._id!)
                    }}
                    activeOpacity={0.7}
                  >
                    <Feather name="star" size={16} color={collection.is_favorite ? "#FFD700" : "#fff"} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.deleteButton, deletingId === collection._id && styles.deleteButtonLoading]}
                    onPress={() => {
                      console.log("🗑️ Botón eliminar presionado para:", collection._id, collection.name)
                      handleDeleteCollection(collection._id!, collection.name)
                    }}
                    disabled={deletingId === collection._id}
                    activeOpacity={0.7}
                  >
                    {deletingId === collection._id ? (
                      <ActivityIndicator size={16} color="#fff" />
                    ) : (
                      <Feather name="x" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : collections.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Feather name="search" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No se encontraron colecciones</Text>
              <Text style={styles.noResultsSubtext}>Intenta con otro término de búsqueda</Text>
            </View>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Feather name="folder" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No tienes colecciones aún</Text>
              <Text style={styles.emptyStateSubtext}>Crea tu primera colección para empezar</Text>
            </View>
          )}

          <TouchableOpacity style={styles.createCollectionButton} onPress={() => router.push("/add-collection")}>
            <Feather name="plus" size={24} color="#6c08dd" />
            <Text style={styles.createCollectionText}>Crear nueva colección</Text>
          </TouchableOpacity>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#dadada",
    borderRadius: 20,
    overflow: "hidden",
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
  },
  searchButton: {
    padding: 8,
    backgroundColor: "#f8f8f8",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  collectionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 10,
  },
  collectionsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  collectionsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
  },
  collectionsContainer: {
    paddingHorizontal: 15,
  },
  collectionCard: {
    height: 180,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: "relative",
  },
  collectionTouchable: {
    width: "100%",
    height: "100%",
  },
  collectionImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  collectionContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 15,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  collectionCardCount: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  actionButtonsContainer: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    gap: 8,
    zIndex: 10,
  },
  favoriteButton: {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 8,
    borderRadius: 20,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 8,
    borderRadius: 20,
    minWidth: 32,
    minHeight: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonLoading: {
    backgroundColor: "#ff6666",
  },
  collectionInfo: {
    justifyContent: "flex-end",
  },
  collectionName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  favoriteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  favoriteText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
  },
  createdDate: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.8)",
  },
  createCollectionButton: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#6c08dd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  createCollectionText: {
    fontSize: 24,
    color: "#6c08dd",
    marginTop: 8,
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
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 60,
    marginVertical: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
})
