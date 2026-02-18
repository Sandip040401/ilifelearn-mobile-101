// app/index.tsx
import SafeAreaView from "@/components/SafeAreaView";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF]">
      <View className="flex-1 items-center px-6 pt-10 pb-6">
        {/* Top icon */}
        <View className="w-16 h-16 rounded-2xl bg-[#6C4CFF] items-center justify-center mb-4 shadow-lg">
          <Text className="text-2xl text-white">✨</Text>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-[#121826] mb-1">
          Learning Hub
        </Text>
        <Text className="text-base text-[#6B7280] mb-8">
          Explore & Discover
        </Text>

        {/* Main Grade Books card - stays prominent */}
        <Link href="/(tabs)/books" asChild>
          <LinearGradient
            colors={["#5C6CFF", "#9B5CFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="w-full rounded-3xl px-6 py-8 mb-6 shadow-xl"
          >
            <View className="items-center">
              <View className="w-12 h-12 rounded-2xl border border-white/50 items-center justify-center mb-4">
                <Text className="text-2xl text-white">📘</Text>
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
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#11C5A5] px-4 py-5 mb-4 shadow-md">
              <Text className="text-2xl mb-2 text-center">👓</Text>
              <Text className="text-base font-semibold text-white text-center">
                Augmented Reality
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/webvr" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#B067FF] px-4 py-5 mb-4 shadow-md">
              <Text className="text-2xl mb-2 text-center">🧊</Text>
              <Text className="text-base font-semibold text-white text-center">
                WebVR
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/games" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#FFB020] px-4 py-5 mb-4 shadow-md">
              <Text className="text-2xl mb-2 text-center">🎮</Text>
              <Text className="text-base font-semibold text-white text-center">
                Games
              </Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/readAloud" asChild>
            <TouchableOpacity className="w-[48%] rounded-2xl bg-[#FF4F8B] px-4 py-5 mb-4 shadow-md">
              <Text className="text-2xl mb-2 text-center">🎙</Text>
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
              <Text className="text-2xl mr-3">📄</Text>
              <View>
                <Text className="text-base font-semibold text-white">
                  AR Sheets
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
