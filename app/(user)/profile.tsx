"use client"
import {
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    useFonts,
} from "@expo-google-fonts/poppins"
import { AntDesign, Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
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
} from "react-native"
import ProductCarousel from "../../components/ProductCarousel"
import { useAuth } from "../context/AuthContext"

const { width, height } = Dimensions.get("window")

export default function ProfileScreen() {
  const { user, isLoading } = useAuth()

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  })

  // Sample published articles data
  const publishedArticles = [
    {
      id: "1",
      title: "Tarkir: Dragonstorm Play Caja de Sobres",
      brand: "Tarkir: Dragonstorm",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
    },
    {
      id: "2",
      title: "Prismatic Evolutions Paquete de Refuerzo",
      brand: "SV: Prismatic Evolutions",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
    },
    {
      id: "3",
      title: "Pokemon Prismatic Evolutions",
      brand: "Pokemon",
      imageUri: "https://cdnx.jumpseller.com/geekers1/image/56447402/resize/610/610?1747538860",
    },
  ]

  // Show loading while checking auth state or loading fonts
  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c08dd" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
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
          <TouchableOpacity style={styles.headerIcon} onPress={() => router.push("/(user)/edit-profile")}>
            <AntDesign name="edit" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={{
              uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
            }}
            style={styles.profileImage}
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
          <TouchableOpacity style={styles.socialIcon}>
            <Feather name="mail" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>Vicente Torres Pelizari Serrano</Text>
          <Text style={styles.userLocation}>Lican-Ray, Chile</Text>
          <Text style={styles.userNationality}>Chileno</Text>
        </View>

        {/* User Stats */}
        <View style={styles.userStatsContainer}>
          <Feather name="star" size={20} color="#3ac692" />
          <Text style={styles.userStats}>3,333 articulos publicados</Text>
        </View>

        {/* Collections Button */}
        <TouchableOpacity style={styles.collectionsButton} onPress={() => router.push("/my-collections")}>
          <Feather name="grid" size={20} color="#fff" />
          <Text style={styles.collectionsButtonText}>Ver mis colecciones</Text>
        </TouchableOpacity>

        {/* Published Articles */}
        <View style={styles.articlesSection}>
          <Text style={styles.sectionTitle}>Artículos Publicados</Text>
          <Text style={styles.sectionSubtitle}>Artículos que este usuario ha publicado</Text>

          <ProductCarousel products={publishedArticles} />
        </View>

        {/* Footer - Using the exact same implementation as home screen */}
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
    marginRight: 12,
  },
  headerIcon: {
    marginLeft: 16,
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
  userLocation: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: "#5e616c",
    marginTop: 4,
  },
  userNationality: {
    fontSize: 18,
    fontFamily: "Poppins_600SemiBold",
    color: "#6c08dd",
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
  collectionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6c08dd",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 50,
    marginBottom: 24,
  },
  collectionsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginLeft: 8,
  },
  articlesSection: {
    paddingHorizontal: 16,
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
})
