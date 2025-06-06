import React from "react"
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

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
  onProductPress?: (id: string) => void
}

const ProductSection = ({ title, subtitle, products, onProductPress }: ProductSectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.viewAll}>Ver todo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {products.map((product) => (
          <TouchableOpacity 
            key={product.id} 
            style={styles.productCard}
            onPress={() => onProductPress && onProductPress(product.id)}
          >
            <Image source={{ uri: product.imageUri }} style={styles.productImage} />
            <Text style={styles.productTitle} numberOfLines={1}>
              {product.title}
            </Text>
            <Text style={styles.productBrand} numberOfLines={1}>
              {product.brand}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222323",
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  viewAll: {
    fontSize: 14,
    color: "#6c08dd",
    fontWeight: "500",
  },
  scrollView: {
    paddingLeft: 15,
  },
  productCard: {
    width: 120,
    marginRight: 15,
  },
  productImage: {
    width: 120,
    height: 168,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#222323",
  },
  productBrand: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
})

export default ProductSection