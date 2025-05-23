import { Feather } from "@expo/vector-icons"
import React, { useEffect, useRef } from "react"
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface ToastProps {
  visible: boolean
  message: string
  title?: string
  cardName?: string
  cardImage?: string
  onDismiss?: () => void
  duration?: number
  type?: "success" | "error" | "info" | "warning"
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  title = "¡Éxito!",
  cardName,
  cardImage,
  onDismiss,
  duration = 3000,
  type = "success",
}) => {
  const animation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
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
        return <Feather name="check-circle" size={24} color="#4CAF50" style={styles.icon} />
      case "error":
        return <Feather name="alert-circle" size={24} color="#F44336" style={styles.icon} />
      case "warning":
        return <Feather name="alert-triangle" size={24} color="#FF9800" style={styles.icon} />
      case "info":
        return <Feather name="info" size={24} color="#2196F3" style={styles.icon} />
      default:
        return <Feather name="check-circle" size={24} color="#4CAF50" style={styles.icon} />
    }
  }

  // Get border color based on type
  const getBorderColor = () => {
    switch (type) {
      case "success":
        return "#4CAF50"
      case "error":
        return "#F44336"
      case "warning":
        return "#FF9800"
      case "info":
        return "#2196F3"
      default:
        return "#6c08dd" // Default purple color
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          borderLeftColor: getBorderColor(),
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [100, 0],
              }),
            },
          ],
          opacity: animation,
        },
      ]}
    >
      {cardImage ? <Image source={{ uri: cardImage }} style={styles.image} /> : null}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        {cardName ? <Text style={styles.cardName}>{cardName}</Text> : null}
      </View>
      {getIcon()}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          Animated.timing(animation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            if (onDismiss) onDismiss()
          })
        }}
      >
        <Feather name="x" size={16} color="#999" />
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 5,
    zIndex: 9999,
  },
  image: {
    width: 50,
    height: 70,
    borderRadius: 5,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#666",
  },
  cardName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6c08dd",
    marginTop: 4,
  },
  icon: {
    marginLeft: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
})

export default Toast