"use client"

import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useState } from "react"
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CardBanner from "../components/CardBanner"
import FeaturedBanner from "../components/FeaturedBanner"
import HorizontalBanner from "../components/HorizontalBanner"
import NavigationDrawer from "../components/NavigationDrawer"
import ProductSection from "../components/ProductSection"

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false)

  const bestSellersProducts = [
    {
      id: "1",
      imageUri: "https://images.pokemontcg.io/sv4pt5/1.png",
      title: "Charizard ex",
      brand: "Prismatic Evolutions",
    },
    {
      id: "2",
      imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
      title: "Pikachu ex",
      brand: "Prismatic Evolutions",
    },
    {
      id: "3",
      imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
      title: "Eevee",
      brand: "Prismatic Evolutions",
    },
    {
      id: "4",
      imageUri: "https://images.pokemontcg.io/sv4pt5/26.png",
      title: "Sylveon ex",
      brand: "Prismatic Evolutions",
    },
    {
      id: "5",
      imageUri: "https://images.pokemontcg.io/swsh4/188.png",
      title: "Pikachu VMAX",
      brand: "Vivid Voltage",
    },
  ]

  const recentlySearchedProducts = [
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

  const newReleasesProducts = [
    {
      id: "11",
      imageUri: "https://images.pokemontcg.io/sv4pt5/1.png",
      title: "Charizard ex Special",
      brand: "Prismatic Evolutions",
    },
    {
      id: "12",
      imageUri: "https://images.pokemontcg.io/sv4pt5/6.png",
      title: "Pikachu ex Rainbow",
      brand: "Prismatic Evolutions",
    },
    {
      id: "13",
      imageUri: "https://images.pokemontcg.io/sv4pt5/9.png",
      title: "Eevee Holo Rare",
      brand: "Prismatic Evolutions",
    },
  ]

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
        <TextInput style={styles.searchInput} placeholder="Busca tu carta Pokemon" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Featured Cards */}
        <CardBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
          tag="POKEMON TCG"
          title="Prismatic Evolutions"
          subtitle="Disponible ahora"
        />

        <CardBanner
          imageUri="https://www.afkstore.cl/cdn/shop/collections/118594441_665467184090972_222420396841581889_o.webp?v=1712098583"
          tag="POKEMON TCG"
          title="Vivid Voltage"
          subtitle="Cartas eléctricas brillantes"
        />

        {/* Banners */}
        <HorizontalBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
          title="PRISMATIC"
          subtitle="EVOLUTIONS"
        />

        <HorizontalBanner
          imageUri="https://www.afkstore.cl/cdn/shop/collections/118594441_665467184090972_222420396841581889_o.webp?v=1712098583"
          title="SWORD & SHIELD"
          subtitle="SERIES"
          height={80}
        />
        {/* Product Sections */}
        <ProductSection
          title="Más Vendidos"
          subtitle="Las cartas Pokemon más populares"
          products={bestSellersProducts}
        />

        <ProductSection
          title="Buscados Recientemente"
          subtitle="Cartas de gran interés en la comunidad"
          products={recentlySearchedProducts}
        />

        <ProductSection
          title="Nuevos Lanzamientos"
          subtitle="Las últimas cartas de Prismatic Evolutions"
          products={newReleasesProducts}
        />

        {/* Featured Product */}
        <FeaturedBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg"
          title="Prismatic Evolutions"
          subtitle="Booster Box - Edición Especial"
        />

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
