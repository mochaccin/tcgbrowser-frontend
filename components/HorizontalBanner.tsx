import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface HorizontalBannerProps {
  imageUri: string
  title: string
  subtitle?: string
  height?: number
  onPress?: () => void
}

export default function HorizontalBanner({ imageUri, title, subtitle, height = 80, onPress }: HorizontalBannerProps) {
  const handlePress = () => {
    if (onPress) {
      onPress()
    } else {
      router.push("/product-browser")
    }
  }

  return (
    <TouchableOpacity style={[styles.banner, { height }]} onPress={handlePress} activeOpacity={0.9}>
      <Image source={{ uri: imageUri }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay} />
      <View style={styles.bannerContent}>
        {title && <Text style={styles.bannerTitle}>{title}</Text>}
        {subtitle && <Text style={styles.bannerSubtitle}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  bannerContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bannerSubtitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
})
