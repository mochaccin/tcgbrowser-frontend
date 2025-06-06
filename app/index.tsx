"use client"

import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useEffect, useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CardBanner from "../components/CardBanner"
import FeaturedBanner from "../components/FeaturedBanner"
import HorizontalBanner from "../components/HorizontalBanner"
import NavigationDrawer from "../components/NavigationDrawer"
import ProductSection from "../components/ProductSection"

// Interfaz para los datos de la carta de la API
interface ApiCard {
  _id: string
  name: string
  tcg_id: string
  supertype: string
  subtypes: string[]
  hp: string
  types: string[]
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

// Interfaz para los productos que se muestran en los carruseles
interface Product {
  id: string
  imageUri: string
  title: string
  brand: string
}

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Estados para almacenar las cartas obtenidas de la API
  const [bestSellersProducts, setBestSellersProducts] = useState<Product[]>([])
  const [recentlySearchedProducts, setRecentlySearchedProducts] = useState<Product[]>([])
  const [newReleasesProducts, setNewReleasesProducts] = useState<Product[]>([])

  // IDs de las cartas para los carruseles
  const cardIds = [
    "6841139ce0bf7aed1bbed35",
    "6841139ce0bf7aed1bbed357",
    "6841139ce0bf7aed1bbed359",
    "6841139ce0bf7aed1bbed35d",
    "6841139ce0bf7aed1bbed37d",
    "6841139ce0bf7aed1bbed37f",
    "6841139ce0bf7aed1bbed381",
    "6841139ce0bf7aed1bbed383",
    "6841139ce0bf7aed1bbed3a5",
    "6841139ce0bf7aed1bbed3a9",
    "6841139ce0bf7aed1bbed3ab",
    "6841139ce0bf7aed1bbed3ad",
    "6841139ce0bf7aed1bbed3af",
  ]

  // Datos estáticos de respaldo actualizados con sets reales
  const staticBestSellersProducts = [
    {
      id: "1",
      imageUri: "https://images.pokemontcg.io/sv4pt5/1.png",
      title: "Charizard ex",
      brand: "Battle Styles",
    },
    {
      id: "2",
      imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
      title: "Pikachu ex",
      brand: "Champion's Path",
    },
    {
      id: "3",
      imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
      title: "Eevee",
      brand: "Sword & Shield",
    },
    {
      id: "4",
      imageUri: "https://images.pokemontcg.io/sv4pt5/26.png",
      title: "Sylveon ex",
      brand: "Silver Tempest",
    },
    {
      id: "5",
      imageUri: "https://images.pokemontcg.io/swsh4/188.png",
      title: "Pikachu VMAX",
      brand: "Shining Fates",
    },
  ]

  const staticRecentlySearchedProducts = [
    {
      id: "6",
      imageUri: "https://images.pokemontcg.io/swsh7/215.png",
      title: "Umbreon VMAX",
      brand: "Evolving Skies",
    },
    {
      id: "7",
      imageUri: "https://images.pokemontcg.io/swsh5/110.png",
      title: "Rayquaza ex",
      brand: "Battle Styles",
    },
    {
      id: "8",
      imageUri: "https://images.pokemontcg.io/swsh8/151.png",
      title: "Mew ex",
      brand: "Fusion Strike",
    },
    {
      id: "9",
      imageUri: "https://images.pokemontcg.io/sv3/197.png",
      title: "Charizard ex",
      brand: "Obsidian Flames",
    },
    {
      id: "10",
      imageUri: "https://images.pokemontcg.io/sv2/193.png",
      title: "Miraidon ex",
      brand: "Paldea Evolved",
    },
  ]

  const staticNewReleasesProducts = [
    {
      id: "11",
      imageUri: "https://images.pokemontcg.io/sv4pt5/1.png",
      title: "Charizard ex Special",
      brand: "Silver Tempest",
    },
    {
      id: "12",
      imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
      title: "Pikachu ex Rainbow",
      brand: "Champion's Path",
    },
    {
      id: "13",
      imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
      title: "Eevee Holo Rare",
      brand: "Sword & Shield",
    },
  ]

  // Función para transformar los datos de la API al formato de producto
  const transformCardToProduct = (card: ApiCard): Product => {
    return {
      id: card._id,
      imageUri: card.images?.small || card.images?.large || "https://images.pokemontcg.io/sv4pt5/1.png",
      title: card.name || "Carta Pokemon",
      brand: card.setInfo ? `${card.setInfo.name} (${card.setInfo.series})` : "Pokemon TCG",
    }
  }

  // Función para obtener los datos de una carta por ID
  const fetchCardById = async (id: string): Promise<Product | null> => {
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`)

      if (!response.ok) {
        console.warn(`Error fetching card ${id}: ${response.status}`)
        return null
      }

      const card: ApiCard = await response.json()
      return transformCardToProduct(card)
    } catch (err) {
      console.warn(`Error fetching card ${id}:`, err)
      return null
    }
  }

  // Función para obtener todas las cartas
  const fetchCards = async () => {
    try {
      // Obtener las cartas para cada sección
      const bestSellers: Product[] = []
      const recentlySearched: Product[] = []
      const newReleases: Product[] = []

      // Distribuir los IDs entre las secciones
      const bestSellerIds = cardIds.slice(0, 5)
      const recentlySearchedIds = cardIds.slice(5, 10)
      const newReleasesIds = cardIds.slice(10)

      // Obtener las cartas para "Más Vendidos"
      for (const id of bestSellerIds) {
        const product = await fetchCardById(id)
        if (product) bestSellers.push(product)
      }

      // Obtener las cartas para "Buscados Recientemente"
      for (const id of recentlySearchedIds) {
        const product = await fetchCardById(id)
        if (product) recentlySearched.push(product)
      }

      // Obtener las cartas para "Nuevos Lanzamientos"
      for (const id of newReleasesIds) {
        const product = await fetchCardById(id)
        if (product) newReleases.push(product)
      }

      // Actualizar los estados con las cartas obtenidas o usar los datos estáticos si no hay resultados
      setBestSellersProducts(bestSellers.length > 0 ? bestSellers : staticBestSellersProducts)
      setRecentlySearchedProducts(recentlySearched.length > 0 ? recentlySearched : staticRecentlySearchedProducts)
      setNewReleasesProducts(newReleases.length > 0 ? newReleases : staticNewReleasesProducts)
    } catch (err) {
      console.error("Error fetching cards:", err)

      // En caso de error, usar los datos estáticos
      setBestSellersProducts(staticBestSellersProducts)
      setRecentlySearchedProducts(staticRecentlySearchedProducts)
      setNewReleasesProducts(staticNewReleasesProducts)
    }
  }

  // Cargar los datos al iniciar
  useEffect(() => {
    fetchCards()
  }, [])

  // Función para navegar a la búsqueda con filtros - ARREGLADA
  const navigateToSearchWithFilter = (setName: string) => {
    console.log(`🚀 HOME: Navegando a search con filtro: ${setName}`)

    // Usar router.push con string de query en lugar de objeto params
    const queryString = `filter=sets&value=${encodeURIComponent(setName)}`
    console.log(`🔗 HOME: Query string: ${queryString}`)

    router.push(`/search-results?${queryString}`)
  }

  // Función para manejar la búsqueda
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const queryString = `query=${encodeURIComponent(searchQuery.trim())}`
      router.push(`/search-results?${queryString}`)
    }
  }

  // Función para navegar al detalle de una carta
  const navigateToCardDetail = (cardId: string) => {
    router.push({
      pathname: "/product-details",
      params: { cardId },
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Navigation Drawer */}
      <NavigationDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>POKEMON</Text>
          <Text style={styles.browserText}>TCG</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/profile")}>
            <Feather name="user" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="bell" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Busca tu carta Pokemon"
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Cards - ACTUALIZADOS CON SETS REALES */}
        <TouchableOpacity onPress={() => navigateToSearchWithFilter("Battle Styles")}>
          <CardBanner
            imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
            tag="POKEMON TCG"
            title="Battle Styles"
            subtitle="Disponible ahora"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigateToSearchWithFilter("Silver Tempest")}>
          <CardBanner
            imageUri="https://www.afkstore.cl/cdn/shop/collections/118594441_665467184090972_222420396841581889_o.webp?v=1712098583"
            tag="POKEMON TCG"
            title="Silver Tempest"
            subtitle="Cartas eléctricas brillantes"
          />
        </TouchableOpacity>

        {/* Banners - ACTUALIZADOS CON SETS REALES */}
        <TouchableOpacity onPress={() => navigateToSearchWithFilter("Champion's Path")}>
          <HorizontalBanner
            imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
            title="CHAMPION'S"
            subtitle="PATH"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigateToSearchWithFilter("Sword & Shield")}>
          <HorizontalBanner
            imageUri="https://www.afkstore.cl/cdn/shop/collections/118594441_665467184090972_222420396841581889_o.webp?v=1712098583"
            title="SWORD & SHIELD"
            subtitle="SERIES"
            height={80}
          />
        </TouchableOpacity>

        {/* Product Sections */}
        <ProductSection
          title="Más Vendidos"
          subtitle="Las cartas Pokemon más populares"
          products={bestSellersProducts}
          onProductPress={navigateToCardDetail}
        />

        <ProductSection
          title="Buscados Recientemente"
          subtitle="Cartas de gran interés en la comunidad"
          products={recentlySearchedProducts}
          onProductPress={navigateToCardDetail}
        />

        <ProductSection
          title="Nuevos Lanzamientos"
          subtitle="Las últimas cartas disponibles"
          products={newReleasesProducts}
          onProductPress={navigateToCardDetail}
        />

        {/* Featured Product - ACTUALIZADO CON SET REAL */}
        <TouchableOpacity onPress={() => navigateToSearchWithFilter("Shining Fates")}>
          <FeaturedBanner
            imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
            title="Shining Fates"
            subtitle="Booster Box - Edición Especial"
          />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.socialIcons}>
            <TouchableOpacity style={styles.socialIcon}>
              <Feather name="facebook" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Feather name="instagram" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Feather name="twitter" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialIcon}>
              <Feather name="youtube" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>
            Descubre el mundo de Pokemon TCG con las mejores cartas, estrategias y colecciones. Únete a millones de
            entrenadores en todo el mundo.
          </Text>

          <Text style={styles.footerText}>© 2025 Pokemon TCG Browser. Todos los derechos reservados.</Text>

          <Text style={styles.footerText}>
            Pokemon y todas las marcas relacionadas son propiedad de Nintendo, Game Freak y Creatures Inc. Este sitio no
            está afiliado oficialmente con Pokemon Company International.
          </Text>

          <Text style={styles.footerText}>
            Explora, colecciona y batalla con las cartas más increíbles del universo Pokemon. Desde cartas clásicas
            hasta las últimas expansiones.
          </Text>

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
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  browserText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222323",
    marginLeft: 4,
  },
  headerIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 15,
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
  footer: {
    backgroundColor: "#222323",
    padding: 20,
    marginTop: 20,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  socialIcon: {
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
})
