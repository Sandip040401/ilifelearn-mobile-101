// app/(tabs)/books.tsx (inside tabs folder)
import SafeAreaView from "@/components/SafeAreaView";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router"; // ← ADD 'router' here
import { Text, TouchableOpacity, View } from "react-native";

export default function Books() {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#F4F7FF] to-[#E0E7FF]">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Header */}
        <LinearGradient
          colors={["#8B5CF6", "#D8B4FE"]}
          className="w-full rounded-3xl px-6 py-4 mb-8 shadow-xl"
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3"
            >
              <Text className="text-xl">←</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-xl font-bold text-white">
                Help every child read, explore, and create
              </Text>
              <Text className="text-sm text-white/90" numberOfLines={2}>
                Together with teachers and parents, making learning magical ✨
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Explore by Grade title */}
        <Text className="text-2xl font-bold text-[#121826] mb-6">
          Explore by Grade
        </Text>

        {/* Grade cards */}
        <View className="space-y-4">
          <Link href="/(tabs)/books/hummingbird" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#10B981]/10 border border-[#10B981]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#10B981] rounded-2xl items-center justify-center mr-4">
                    <Text className="text-2xl text-white">🐦</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-[#121826]">
                      Hummingbird
                    </Text>
                    <Text className="text-sm text-[#6B7280]">
                      first, big smiles.
                    </Text>
                  </View>
                </View>
                <Text className="text-[#10B981]">→</Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/books/dove" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#3B82F6] rounded-2xl items-center justify-center mr-4">
                    <Text className="text-2xl text-white">🕊</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-[#121826]">
                      Dove
                    </Text>
                    <Text className="text-sm text-[#6B7280]">
                      Build words. Count wonders.
                    </Text>
                  </View>
                </View>
                <Text className="text-[#3B82F6]">→</Text>
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/books/macaw" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#F59E0B] rounded-2xl items-center justify-center mr-4">
                    <Text className="text-2xl text-white">🦜</Text>
                  </View>
                  <View>
                    <Text className="text-lg font-semibold text-[#121826]">
                      Macaw
                    </Text>
                    <Text className="text-sm text-[#6B7280]">
                      Ready for reading adventures
                    </Text>
                  </View>
                </View>
                <Text className="text-[#F59E0B]">→</Text>
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
