import SafeAreaView from "@/components/SafeAreaView";
import { Text } from "react-native";

export default function ReadAloud() {
  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF] items-center justify-center">
      <Text className="text-2xl font-bold text-[#121826]">Read Aloud Tab</Text>
    </SafeAreaView>
  );
}
