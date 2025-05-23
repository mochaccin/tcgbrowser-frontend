"use client"

import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useRef } from "react"
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native"

const { width } = Dimensions.get("window")
const DRAWER_WIDTH = width * 0.8

interface NavigationDrawerProps {
  visible: boolean
  onClose: () => void
}

export default function NavigationDrawer({ visible, onClose }: NavigationDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current
  const overlayOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const navigateAndClose = (route: string) => {
    onClose()
    setTimeout(() => {
      return router.push(route as any)
    }, 250)
  }

  const menuItems = [
    {
      id: "home",
      title: "Inicio",
      icon: "home",
      route: "/",
    },
    {
      id: "browser",
      title: "Explorar",
      icon: "search",
      route: "/product-browser",
    },
    {
      id: "collections",
      title: "Mis Colecciones",
      icon: "grid",
      route: "/my-collections",
    },
    {
      id: "inventory",
      title: "Mi Inventario",
      icon: "package",
      route: "/inventory",
    },
    {
      id: "profile",
      title: "Mi Perfil",
      icon: "user",
      route: "/profile",
    },
  ]

  const secondaryItems = [
    {
      id: "settings",
      title: "Configuración",
      icon: "settings",
      route: "/settings",
    },
    {
      id: "help",
      title: "Ayuda y Soporte",
      icon: "help-circle",
      route: "/help",
    },
    {
      id: "about",
      title: "Acerca de",
      icon: "info",
      route: "/about",
    },
  ]

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Overlay */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
        </TouchableWithoutFeedback>

        {/* Drawer */}
        <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoTextPurple}>TCG</Text>
              <Text style={styles.logoTextBlack}>BROWSER</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* User Profile Section */}
          <View style={styles.userSection}>
            <Image
              source={{
                uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled-uaThW8rED8JCpG84CL2P8zc7QmRKR5.png",
              }}
              style={styles.userAvatar}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Vicente Torres</Text>
              <Text style={styles.userEmail}>vicente@tcgbrowser.com</Text>
            </View>
          </View>

          {/* Main Navigation */}
          <View style={styles.navigation}>
            <Text style={styles.sectionTitle}>Navegación</Text>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigateAndClose(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Feather name={item.icon as any} size={20} color="#6c08dd" />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Feather name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Secondary Navigation */}
          <View style={styles.secondaryNavigation}>
            <Text style={styles.sectionTitle}>Más</Text>
            {secondaryItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => navigateAndClose(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  <Feather name={item.icon as any} size={20} color="#666" />
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Feather name="chevron-right" size={16} color="#999" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>TCG Browser v1.0.0</Text>
            <Text style={styles.footerSubtext}>© 2025 Todos los derechos reservados</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#6c08dd",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  logoTextPurple: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6c08dd",
  },
  logoTextBlack: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  closeButton: {
    padding: 5,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
  },
  navigation: {
    paddingTop: 20,
  },
  secondaryNavigation: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f8f8",
  },
  menuItemIcon: {
    width: 30,
    alignItems: "center",
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#f8f8f8",
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 10,
    color: "#999",
    textAlign: "center",
  },
})
