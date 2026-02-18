import SafeAreaView from "@/components/SafeAreaView";
import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function GradeBook() {
  const { grade } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF]">
      <View className="flex-1 px-6 pt-12">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center mb-8"
        >
          <Text className="text-2xl mr-2">←</Text>
          <Text className="text-lg font-semibold text-[#121826]">Back</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-3xl font-bold text-[#121826] mb-4">
            {grade?.toString().replace(/^\w/, (c) => c.toUpperCase())}
          </Text>
          <Text className="text-lg text-[#6B7280] text-center">
            Content for {grade} grade books here
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
