import { Image, StyleSheet, Text, View } from "react-native"

interface HorizontalBannerProps {
  imageUri: string
  title: string
  subtitle?: string
  height?: number
}

export default function HorizontalBanner({ imageUri, title, subtitle, height = 60 }: HorizontalBannerProps) {
  return (
    <View style={[styles.banner, { height }]}>
      <Image source={{ uri: imageUri }} style={styles.bannerImage} />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerText}>{title}</Text>
        {subtitle && <Text style={styles.bannerSubtext}>{subtitle}</Text>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bannerSubtext: {
    color: "#fff",
    fontSize: 14,
  },
})
