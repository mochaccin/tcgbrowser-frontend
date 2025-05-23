import { Feather } from "@expo/vector-icons"
import React, { useEffect, useRef } from "react"
import { Animated, Dimensions, Image, StyleSheet, Text, View } from "react-native"

interface CollectionToastProps {
  visible: boolean
  message: string
  title?: string
  collectionName?: string
  collectionImage?: string
  onDismiss?: () => void
  duration?: number
  type?: "success" | "error" | "info" | "warning"
}

const CollectionToast: React.FC<CollectionToastProps> = ({
  visible,
  message,
  title = "¡Colección creada!",
  collectionName,
  collectionImage,
  onDismiss,
  duration = 3000,
  type = "success",
}) => {
  const animation = useRef(new Animated.Value(0)).current
  const { width } = Dimensions.get("window")

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(animation, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        Animated.timing(animation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onDismiss) onDismiss()
        })
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible, duration, onDismiss, animation])

  if (!visible) return null

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case "success":
        return <Feather name="check-circle" size={24} color="#fff" />
      case "error":
        return <Feather name="alert-circle" size={24} color="#fff" />
      case "warning":
        return <Feather name="alert-triangle" size={24} color="#fff" />
      case "info":
        return <Feather name="info" size={24} color="#fff" />
      default:
        return <Feather name="check-circle" size={24} color="#fff" />
    }
  }

  // Get background color based on type
  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "#6c08dd" // Using the app's purple color for success
      case "error":
        return "#F44336"
      case "warning":
        return "#FF9800"
      case "info":
        return "#2196F3"
      default:
        return "#6c08dd"
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
          opacity: animation,
        },
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {collectionName ? <Text style={styles.collectionName}>{collectionName}</Text> : null}
      </View>
      {collectionImage ? (
        <Image source={{ uri: collectionImage }} style={styles.image} />
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    zIndex: 9999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  collectionName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
})

export default CollectionToast