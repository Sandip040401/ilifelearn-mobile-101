// app/home-screen.tsx
import SafeAreaView from "@/components/SafeAreaView";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Index() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { width } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const scale = Math.min(width / 375, 1.2);
  const s = (val: number) => Math.round(val * scale);

  const navbarPaddingTop = Math.max(insets.top, 8);
  // Navbar is taller now (profile row + centered logo/title)
  const navbarHeight = navbarPaddingTop + s(160);

  if (!isHydrated) return null;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  const gridItems = [
    {
      href: "/(tabs)/ar",
      color: "#11C5A5",
      icon: "glasses",
      label: "Augmented Reality",
    },
    { href: "/(tabs)/webvr", color: "#B067FF", icon: "cube", label: "WebVR" },
    {
      href: "/(tabs)/games",
      color: "#FFB020",
      icon: "game-controller",
      label: "Games",
    },
    {
      href: "/(tabs)/readAloud",
      color: "#FF4F8B",
      icon: "mic",
      label: "Read Aloud AI",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF] overflow-hidden">
      {/* ── Navbar ── */}
      <View
        className="absolute top-0 left-0 right-0 z-20 bg-[#F4F7FF]"
        style={{
          paddingTop: navbarPaddingTop,
          paddingBottom: s(16),
          paddingHorizontal: s(16),
        }}
      >
        {/* Profile top-right */}
        <View className="flex-row justify-end" style={{ marginBottom: s(8) }}>
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="rounded-full bg-[#6C4CFF]/10 items-center justify-center border border-gray-200"
            style={{ width: s(42), height: s(42) }}
          >
            <Ionicons
              name="person-circle-outline"
              size={s(26)}
              color="#6C4CFF"
            />
          </TouchableOpacity>
        </View>

        {/* Centered Logo + Title */}
        <View className="items-center">
          <View
            className="bg-[#6C4CFF] rounded-2xl items-center justify-center shadow-md overflow-hidden"
            style={{ width: s(64), height: s(64), marginBottom: s(10) }}
          >
            <Image
              source={require("../assets/images/logo.png")}
              style={{ width: s(44), height: s(44) }}
              resizeMode="contain"
            />
          </View>
          <Text
            className="font-bold text-[#121826] text-center"
            style={{ fontSize: s(24), lineHeight: s(28) }}
          >
            Learning Hub
          </Text>
          <Text
            className="text-[#6B7280] text-center"
            style={{ fontSize: s(13), lineHeight: s(18) }}
          >
            Explore & Discover
          </Text>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: navbarHeight + s(16),
          paddingHorizontal: s(20),
          paddingBottom: s(80),
        }}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Grade Books */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/books")}
          activeOpacity={0.85}
          style={{ marginBottom: s(16) }}
        >
          <LinearGradient
            colors={["#5C6CFF", "#9B5CFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              borderRadius: s(24),
              overflow: "hidden",
              shadowColor: "#6C4CFF",
              shadowOpacity: 0.3,
              shadowRadius: s(12),
              elevation: 6,
            }}
          >
            <View
              className="items-center"
              style={{ paddingVertical: s(28), paddingHorizontal: s(24) }}
            >
              <View
                className="border border-white/50 rounded-2xl items-center justify-center"
                style={{ width: s(48), height: s(48), marginBottom: s(12) }}
              >
                <Ionicons name="book" size={s(26)} color="white" />
              </View>
              <Text
                className="font-semibold text-white text-center"
                style={{ fontSize: s(22), marginBottom: s(4) }}
              >
                Grade Books
              </Text>
              <Text
                className="text-white/80 text-center"
                style={{ fontSize: s(13) }}
              >
                Start Learning
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* 2x2 Grid */}
        <View
          className="w-full flex-row flex-wrap justify-between"
          style={{ marginBottom: s(16) }}
        >
          {gridItems.map((item) => (
            <TouchableOpacity
              key={item.href}
              onPress={() => router.push(item.href as any)}
              activeOpacity={0.85}
              className="items-center"
              style={{
                width: "48%",
                backgroundColor: item.color,
                borderRadius: s(16),
                paddingVertical: s(20),
                paddingHorizontal: s(12),
                marginBottom: s(14),
                shadowColor: item.color,
                shadowOpacity: 0.25,
                shadowRadius: s(8),
                elevation: 4,
              }}
            >
              <Ionicons
                name={item.icon as any}
                size={s(30)}
                color="white"
                style={{ marginBottom: s(8) }}
              />
              <Text
                className="font-semibold text-white text-center"
                style={{ fontSize: s(13), lineHeight: s(18) }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AR Sheets */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/arsheets")}
          activeOpacity={0.85}
          className="w-full"
          style={{
            backgroundColor: "#06B6D4",
            borderRadius: s(20),
            paddingVertical: s(18),
            paddingHorizontal: s(20),
            shadowColor: "#06B6D4",
            shadowOpacity: 0.25,
            shadowRadius: s(8),
            elevation: 4,
          }}
        >
          <View className="flex-row items-center">
            <View
              className="bg-white/20 rounded-xl items-center justify-center"
              style={{ width: s(40), height: s(40), marginRight: s(14) }}
            >
              <Ionicons name="document-text" size={s(22)} color="white" />
            </View>
            <Text
              className="font-semibold text-white"
              style={{ fontSize: s(15) }}
            >
              AR Sheets
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
