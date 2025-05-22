import { Stack } from "expo-router"

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 200,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        presentation: "card",
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="forgot-password-confirmation"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="verification-code"
        options={{
          title: "",
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: "",
        }}
      />
    </Stack>
  )
}
