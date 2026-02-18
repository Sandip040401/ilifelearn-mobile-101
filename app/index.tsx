import SafeAreaView from "@/components/SafeAreaView";
import { useSafeAreaSpacing } from "@/hooks/useSafeAreaSpacing";
import { Text, View } from "react-native";

export default function Index() {
  
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-gray-900" >
      <Text className="text-2xl font-bold text-white text-center">Edit app/index.tsx to edit this screen.</Text>
    </SafeAreaView>
  );
}
