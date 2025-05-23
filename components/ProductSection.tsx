import { StyleSheet, Text, View } from "react-native"
import ProductCarousel from "./ProductCarousel"

interface Product {
  id: string
  imageUri: string
  title: string
  brand: string
}

interface ProductSectionProps {
  title: string
  subtitle: string
  products: Product[]
  onProductPress?: (product: Product) => void
}

export default function ProductSection({ title, subtitle, products, onProductPress }: ProductSectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <ProductCarousel products={products} onProductPress={onProductPress} />
    </View>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#5e616c",
    marginBottom: 10,
  },
})
