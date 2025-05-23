import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface CardBannerProps {
  imageUri: string
  tag: string
  title: string
  subtitle?: string
  onPress?: () => void
}

export default function CardBanner({ imageUri, tag, title, subtitle, onPress }: CardBannerProps) {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push("/product-browser")
    }
  }

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: imageUri }} style={styles.cardImage} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardTag}>{tag}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        <TouchableOpacity
          style={styles.cardButton}
          onPress={(e) => {
            e.stopPropagation() // Prevent triggering parent's onPress
            handlePress()
          }}
        >
          <Text style={styles.cardButtonText}>Ver más</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 15,
    marginVertical: 10,
    height: 180,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cardTag: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 5,
  },
  cardSubtitle: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
  cardButton: {
    backgroundColor: "#3AC692",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  cardButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
})
