import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface ProductCardProps {
  imageUri: string
  title: string
  brand: string
  onPress?: () => void
}

export default function ProductCard({ imageUri, title, brand, onPress }: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.productCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.productImage} resizeMode="contain" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.productTitle} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.productBrand} numberOfLines={1} ellipsizeMode="tail">
          {brand}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  productCard: {
    width: 150,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    backgroundColor: "#F5F5F5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 150,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    padding: 12,
    paddingTop: 8,
    height: 80,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 4,
    lineHeight: 18,
  },
  productBrand: {
    fontSize: 13,
    color: "#5E616C",
  },
})
