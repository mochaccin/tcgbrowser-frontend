import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Easing } from "react-native"

// Import screens
import LoginScreen from "../(auth)/login"
import RegisterScreen from "../(auth)/register"

// Define the stack navigator param list
type RootStackParamList = {
  Login: undefined
  Register: undefined
  ForgotPassword: undefined
  Home: undefined
}

const Stack = createStackNavigator<RootStackParamList>()

// Custom transition config for shadcn-like animations
const transitionConfig = {
  animation: "timing" as const,
  config: {
    duration: 250,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  },
}

// Custom screen options with fade transitions
import type { StackCardInterpolationProps } from "@react-navigation/stack"

const screenOptions = {
  headerShown: false,
  cardStyleInterpolator: ({ current }: StackCardInterpolationProps) => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
  transitionSpec: {
    open: transitionConfig,
    close: transitionConfig,
  },
}

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* Add other screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
