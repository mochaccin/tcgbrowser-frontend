import { Stack } from "expo-router"

export default function UserLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
        animationDuration: 200,
        gestureEnabled: true,
        gestureDirection: "horizontal",
        presentation: "card",
        navigationBarHidden: true,
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: "",
          headerShown: false,
          navigationBarHidden: true,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: "",
          headerShown: false,
          navigationBarHidden: true,
        }}
      />
    </Stack>
  )
}
