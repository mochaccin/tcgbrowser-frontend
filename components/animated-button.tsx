import * as Haptics from "expo-haptics"
import {
    Animated,
    Easing,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    type StyleProp,
    type TextStyle,
    type TouchableOpacityProps,
    type ViewStyle,
} from "react-native"

interface AnimatedButtonProps extends TouchableOpacityProps {
  title: string
  buttonStyle?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export default function AnimatedButton({ title, buttonStyle, textStyle, onPress, ...props }: AnimatedButtonProps) {
  const buttonScale = new Animated.Value(1)

  const onPressIn = () => {
    // Add haptic feedback for a more tactile experience
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }

    Animated.timing(buttonScale, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  const onPressOut = () => {
    Animated.timing(buttonScale, {
      toValue: 1,
      duration: 100,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start()
  }

  const handlePress = () => {
    if (onPress) {
      onPress()
    }
  }

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        style={[styles.button, buttonStyle]}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        {...props}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#6c08dd",
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins_500Medium",
  },
})
