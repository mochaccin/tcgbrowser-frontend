import { router } from "expo-router"
import type React from "react"
import { StyleSheet, Text, View } from "react-native"
import ProductCarousel from "../components/ProductCarousel"

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
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle, products }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <ProductCarousel
        products={products}
        onProductPress={(product) => {
          router.push("/product-browser")
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 140,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 10,
    color: "#666",
  },
  separator: {
    width: 12,
  },
})

export default ProductSection
