import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import CardBanner from "../components/CardBanner"
import FeaturedBanner from "../components/FeaturedBanner"
import HorizontalBanner from "../components/HorizontalBanner"
import ProductSection from "../components/ProductSection"

export default function HomeScreen() {
  const bestSellersProducts = [
    {
      id: "1",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
    {
      id: "2",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
    {
      id: "3",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
  ]

  const recentlySearchedProducts = [
    {
      id: "4",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
    {
      id: "5",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
    {
      id: "6",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>TCG</Text>
          <Text style={styles.browserText}>BROWSER</Text>
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
        <TextInput style={styles.searchInput} placeholder="Busca tu carta" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Featured Cards */}
        <CardBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          tag="POKEMON"
          title="Prismatic Evolutions"
          subtitle="Disponible ahora"
        />

        <CardBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          tag="POKEMON"
          title="Las Mejores Cartas Pokemon"
        />

        <CardBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          tag="POKEMON"
          title="Prismatic Evolutions"
          subtitle="Edición Especial"
        />

        <CardBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          tag="POKEMON"
          title="Colección Premium de Pokemon"
        />

        {/* Banners */}
        <HorizontalBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          title="PRISMATIC"
          subtitle="EVOLUTIONS"
        />

        <HorizontalBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          title=""
          height={50}
        />

        <HorizontalBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          title=""
          height={50}
        />

        {/* Product Sections */}
        <ProductSection
          title="Más Vendidos"
          subtitle="Descubre estos productos destacados"
          products={bestSellersProducts}
        />

        <ProductSection
          title="Buscados Recientemente"
          subtitle="Descubre productos de gran interés"
          products={recentlySearchedProducts}
        />

        {/* Featured Product */}
        <FeaturedBanner
          imageUri="https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2025/01/prismatic-evo-logo.jpg?q=70&fit=contain&w=1200&h=628&dpr=1"
          title="Prismatic Evolutions"
          subtitle="Booster Box"
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
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullus et aliquam turpis. Morbi sagittis nisl eget
            magna feugiat, quis feugiat magna euismod. Mauris sed libero magna.
          </Text>

          <Text style={styles.footerText}>© 2023 Lorem Ipsum Company. Todos los derechos reservados.</Text>

          <Text style={styles.footerText}>
            Suspendisse in ligula lacus. Nulla facilisi. Curabitur iaculis fermentum ipsum. Donec maximus, nisl in
            auctor varius, massa velit pharetra purus, eget massa sem massa ante, et placerat magna ipsum eget diam.
          </Text>

          <Text style={styles.footerText}>
            Suspendisse in justo eu magna luctus suscipit. Sed lectus. Integer euismod lacus luctus magna. Quisque
            cursus, metus vitae pharetra pharetra purus, eget massa sem massa ante, et placerat magna ipsum eget diam.
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
