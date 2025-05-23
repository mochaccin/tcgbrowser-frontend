"use client"
import { Feather } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"

export default function CollectionsScreen() {
  // Sample collections data
  const collections = [
    {
      id: "1",
      name: "Dragon Ball",
      cardCount: 24,
      isFavorite: true,
      imageUri: "https://comicbook.com/wp-content/uploads/sites/4/2025/05/Pokemon-TCG-Black-and-White.jpg",
    },
    {
      id: "2",
      name: "One Piece",
      cardCount: 12,
      isFavorite: true,
      imageUri: "https://comicbook.com/wp-content/uploads/sites/4/2025/03/Pokemon-TCG-Prismatic-Evolutions-SPC-Preorders.jpg",
    },
    {
      id: "3",
      name: "Weird Pokemon Cards",
      cardCount: 16,
      isFavorite: true,
      imageUri: "https://comicbook.com/wp-content/uploads/sites/4/2025/05/Pokemon-TCG-Black-and-White.jpg",
    },
  ]

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis colecciones</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Busca tu colección" placeholderTextColor="#999" />
        <TouchableOpacity style={styles.searchButton}>
          <Feather name="search" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Collections Header */}
        <View style={styles.collectionsHeader}>
          <Text style={styles.collectionsTitle}>Mis Colecciones</Text>
          <TouchableOpacity style={styles.cameraButton} onPress={() => router.push("/add-collection")}>
            <Feather name="camera" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Collections List */}
        <View style={styles.collectionsContainer}>
          {collections.map((collection) => (
            <TouchableOpacity key={collection.id} style={styles.collectionCard}>
              <Image source={{ uri: collection.imageUri }} style={styles.collectionImage} />
              <LinearGradient
                colors={["rgba(108, 8, 221, 0)", "rgba(108, 8, 221, 1)"]}
                locations={[0.5, 1]}
                style={styles.gradient}
              />
              <View style={styles.collectionContent}>
                <View style={styles.collectionCardCount}>
                  <Text style={styles.cardCountText}>{collection.cardCount} cartas</Text>
                </View>
                <View style={styles.collectionInfo}>
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <View style={styles.favoriteContainer}>
                    <Feather name="star" size={14} color="#3ac692" />
                    <Text style={styles.favoriteText}>Colección favorita</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {/* Create New Collection Button */}
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
    width: 24, // To balance the header
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
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    
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
  collectionCardCount: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  cardCountText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
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
  },
  favoriteText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
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
