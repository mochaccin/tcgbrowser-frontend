import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface FeaturedBannerProps {
  imageUri: string
  title: string
  subtitle: string
  onPress?: () => void
}

export default function FeaturedBanner({ imageUri, title, subtitle, onPress }: FeaturedBannerProps) {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push("/product-browser")
    }
  }

  const handleButtonPress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push("/product-browser")
    }
  }

  return (
    <TouchableOpacity style={styles.featuredContainer} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: imageUri }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredTitle}>{title}</Text>
        <Text style={styles.featuredSubtitle}>{subtitle}</Text>
        <TouchableOpacity style={styles.featuredButton} onPress={handleButtonPress}>
          <Text style={styles.featuredButtonText}>Ver más</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pagination}>
        <View style={styles.paginationDot} />
        <View style={[styles.paginationDot, styles.activeDot]} />
        <View style={styles.paginationDot} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  featuredContainer: {
    marginHorizontal: 15,
    marginVertical: 15,
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  featuredTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  featuredSubtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 2,
  },
  featuredButton: {
    backgroundColor: "#6C08DD",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  featuredButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
    position: "absolute",
    bottom: -25,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dadada",
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: "#6C08DD",
  },
})
