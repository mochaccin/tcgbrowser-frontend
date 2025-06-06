"use client"

import { useRef, useState } from "react"
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native"
import ProductCard from "./ProductCard"

interface Product {
  id: string
  imageUri: string
  title: string
  brand: string
}

interface ProductCarouselProps {
  products: Product[]
  onProductPress?: (product: Product) => void
}

export default function ProductCarousel({ products, onProductPress }: ProductCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  // Card dimensions
  const cardWidth = 150
  const cardMargin = 15
  const cardTotalWidth = cardWidth + cardMargin

  // Handle scroll event to update active index
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x
    const currentIndex = Math.round(contentOffsetX / cardTotalWidth)

    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex)
    }
  }

  // Scroll to a specific card when dot is pressed
  const scrollToCard = (index: number) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * cardTotalWidth,
        animated: true,
      })
    }
  }

  // Don't render if no products
  if (!products || products.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
        contentContainerStyle={styles.productsContentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={cardTotalWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        pagingEnabled={false}
      >
        {products.map((product, index) => (
          <View
            key={product.id}
            style={[styles.cardWrapper, { marginRight: index === products.length - 1 ? 16 : cardMargin }]}
          >
            <ProductCard
              imageUri={product.imageUri}
              title={product.title}
              brand={product.brand}
              onPress={() => onProductPress?.(product)}
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination dots */}
      {products.length > 1 && (
        <View style={styles.pagination}>
          {products.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.paginationDot, index === activeIndex && styles.activeDot]}
              onPress={() => scrollToCard(index)}
              activeOpacity={0.7}
            />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  horizontalScroll: {
    flexDirection: "row",
  },
  productsContentContainer: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 10,
  },
  cardWrapper: {
    // This wrapper ensures consistent spacing and sizing
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
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
