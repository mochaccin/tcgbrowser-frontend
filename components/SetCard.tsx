import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

interface SetCardProps {
  imageUri: string
  setName: string
  cardCount: number
  releaseDate?: string
  onPress?: () => void
}

export default function SetCard({ imageUri, setName, cardCount, releaseDate, onPress }: SetCardProps) {
  return (
    <TouchableOpacity style={styles.setCard} onPress={onPress}>
      <Image source={{ uri: imageUri }} style={styles.setImage} />
      <View style={styles.setContent}>
        <Text style={styles.setName}>{setName}</Text>
        <Text style={styles.cardCount}>{cardCount} cartas</Text>
        {releaseDate && <Text style={styles.releaseDate}>Lanzamiento: {releaseDate}</Text>}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  setCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginRight: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  setContent: {
    alignItems: "center",
  },
  setName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 12,
    color: "#5E616C",
    marginBottom: 2,
  },
  releaseDate: {
    fontSize: 10,
    color: "#5E616C",
  },
})
