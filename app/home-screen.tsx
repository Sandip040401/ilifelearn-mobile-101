// app/home-screen.tsx
import SafeAreaView from "@/components/SafeAreaView";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Redirect } from "expo-router";
import { Image, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useResolveClassNames } from "uniwind";

export default function Index() {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const styles = useResolveClassNames(`flex-grow items-center justify-center px-6 ${Platform.OS === 'web' ? 'py-6' : ''}`);

  if (!isHydrated) return null;
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login-signup" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF] overflow-hidden">
      <ScrollView className="flex-1" contentContainerStyle={styles} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-8 gap-3 w-full ">
          <View className="flex-row flex-1 items-center gap-1">
            {/* Top icon */}
          <View className="w-16 h-16 rounded-2xl bg-[#6C4CFF] items-center justify-center shrink-0 shadow-lg overflow-hidden">
            <Image
              source={require('../assets/images/logo.png')}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <View className="flex-1 items-center">
            <Text className="text-2xl font-bold text-[#121826]">
              Learning Hub
            </Text>
            <Text className="text-base text-[#6B7280]">
              Explore & Discover
            </Text>
          </View>

          </View>
          {/* Profile Button */}
          <View className="w-12 h-12 shrink-0 rounded-full bg-white items-center justify-center shadow-md border border-gray-100">
            <Link href="/profile" asChild>
            <TouchableOpacity className="w-12 h-12 rounded-full bg-white items-center justify-center shadow-md border border-gray-100">
              <Ionicons name="person-circle-outline" size={28} color="#6C4CFF" />
            </TouchableOpacity>
          </Link>
          </View>
        </View>

        {/* Main Grade Books card - stays prominent */}
        <Link href="/(tabs)/books" asChild>
          <LinearGradient
            colors={["#5C6CFF", "#9B5CFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full rounded-3xl overflow-hidden px-6 py-8 mb-6 shadow-xl"
          >
            <View className="items-center">
              <View className="w-12 h-12 rounded-2xl border border-white/50 items-center justify-center mb-4">
                <Ionicons name="book" size={28} color="white" />
              </View>
              <Text className="text-2xl font-semibold text-white mb-1">
                Grade Books
              </Text>
              <Text className="text-sm text-white/80">Start Learning</Text>
            </View>
          </LinearGradient>
        </Link>

        {/* 2x2 grid - now Links to tabs */}
        <View className="w-full flex-row flex-wrap justify-between mb-6">
          <Link href="/(tabs)/ar" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#11C5A5] px-4 py-5 mb-4 shadow-md items-center">
              <Ionicons name="glasses" size={32} color="white" className="mb-2" />
              <Text className="text-base font-semibold text-white text-center">
                Augmented Reality
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/webvr" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#B067FF] px-4 py-5 mb-4 shadow-md items-center">
              <Ionicons name="cube" size={32} color="white" className="mb-2" />
              <Text className="text-base font-semibold text-white text-center">
                WebVR
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/games" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#FFB020] px-4 py-5 mb-4 shadow-md items-center">
              <Ionicons name="game-controller" size={32} color="white" className="mb-2" />
              <Text className="text-base font-semibold text-white text-center">
                Games
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/readAloud" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#FF4F8B] px-4 py-5 mb-4 shadow-md items-center">
              <Ionicons name="mic" size={32} color="white" className="mb-2" />
              <Text className="text-base font-semibold text-white text-center">
                Read Aloud AI
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Bottom AR Sheets - Link to tab */}
        <Link href="/(tabs)/arsheets" asChild>
          <TouchableOpacity className="w-full rounded-3xl bg-[#06B6D4] px-6 py-5 shadow-md">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center mr-3">
                <Ionicons name="document-text" size={24} color="white" />
              </View>
              <View>
                <Text className="text-base font-semibold text-white">
                  AR Sheets
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}
