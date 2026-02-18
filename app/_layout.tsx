import { Stack } from "expo-router";
import { useState } from "react";
import { StatusBar } from "react-native";
import AnimatedSplashScreen from "../components/AnimatedSplashScreen";
import "../global.css";

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);

  if (!splashFinished) {
    return (
      <AnimatedSplashScreen
        onAnimationFinish={() => {
          setSplashFinished(true);
        }}
      />
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="home-screen" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
