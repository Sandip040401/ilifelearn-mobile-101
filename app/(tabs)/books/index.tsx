// app/(tabs)/books.tsx (inside tabs folder)
import SafeAreaView from "@/components/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, router } from "expo-router"; // ← ADD 'router' here
import { Text, TouchableOpacity, View } from "react-native";

export default function Books() {
  return (
    <SafeAreaView className="flex-1 bg-linear-to-b from-[#F4F7FF] to-[#E0E7FF]">
      <View className="flex-1 px-6 pt-12 pb-8">
        {/* Header */}
        <LinearGradient
          colors={["#8B5CF6", "#D8B4FE"]}
          className="w-full rounded-3xl px-6 py-4 mb-8 shadow-xl overflow-hidden"
        >
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/")} // ← Go to root home
              className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-xl font-bold text-white mr-2">
                  Help every child read
                </Text>
                <Ionicons name="sparkles" size={18} color="white" />
              </View>
              <Text className="text-sm text-white/90" numberOfLines={2}>
                Together with teachers and parents, making learning magical
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Explore by Grade title */}
        <Text className="text-2xl font-bold text-[#121826] mb-6">
          Explore by Grade
        </Text>

        {/* Grade cards */}
        <View className="flex-1 gap-4">
          <Link href="/(tabs)/books/hummingbird" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#10B981]/10 border border-[#10B981]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#10B981] rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="trail-sign" size={28} color="white" />
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
                <Ionicons name="chevron-forward" size={20} color="#10B981" />
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/books/dove" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#3B82F6] rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="leaf" size={28} color="white" />
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
                <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
              </View>
            </TouchableOpacity>
          </Link>

          <Link href="/(tabs)/books/macaw" asChild>
            <TouchableOpacity className="w-full rounded-3xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 px-6 py-6 shadow-md">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-[#F59E0B] rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="color-palette" size={28} color="white" />
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
                <Ionicons name="chevron-forward" size={20} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
