import { View, TouchableOpacity, Text, StyleSheet } from "react-native"
import { Home, User, Search, Bookmark } from "lucide-react-native"

interface BottomNavigationProps {
  activeTab: "home" | "profile" | "search" | "collections"
  onTabPress: (tab: "home" | "profile" | "search" | "collections") => void
}

export default function BottomNavigation({ activeTab, onTabPress }: BottomNavigationProps) {
  const tabs = [
    {
      id: "home" as const,
      label: "Inicio",
      icon: Home,
    },
    {
      id: "search" as const,
      label: "Buscar",
      icon: Search,
    },
    {
      id: "collections" as const,
      label: "Colecciones",
      icon: Bookmark,
    },
    {
      id: "profile" as const,
      label: "Perfil",
      icon: User,
    },
  ]

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id

        return (
          <TouchableOpacity key={tab.id} style={styles.tab} onPress={() => onTabPress(tab.id)} activeOpacity={0.7}>
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Icon size={22} color={isActive ? "#FFFFFF" : "#6B7280"} strokeWidth={isActive ? 2.5 : 2} />
            </View>
            <Text style={[styles.label, { color: isActive ? "#8B5CF6" : "#6B7280" }]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingBottom: 20,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: "#8B5CF6",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
})
