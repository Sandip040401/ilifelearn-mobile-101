import SafeAreaView from "@/components/SafeAreaView";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.replace("/(auth)/login-signup");
    };

    return (
        <SafeAreaView className="flex-1 bg-[#F4F7FF]">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View className="px-6 pt-4 pb-2 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm mr-3"
                    >
                        <Ionicons name="arrow-back" size={20} color="#121826" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-[#121826]">Profile</Text>
                </View>

                {/* Avatar & Name */}
                <View className="items-center mt-6 mb-8">
                    <LinearGradient
                        colors={["#6C4CFF", "#9B5CFF"]}
                        className="w-24 h-24 rounded-full items-center justify-center mb-4 shadow-lg overflow-hidden"
                    >
                        <Text className="text-4xl text-white">
                            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </Text>
                    </LinearGradient>
                    <Text className="text-2xl font-bold text-[#121826]">
                        {user?.name || "User"}
                    </Text>
                    <Text className="text-base text-[#6B7280] mt-1">
                        {user?.email || "No email"}
                    </Text>
                </View>

                {/* Profile Details */}
                <View className="px-6 gap-4">
                    <Text className="text-lg font-semibold text-[#121826] mb-1">
                        Account Details
                    </Text>

                    {/* Name */}
                    <View className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-[#6C4CFF]/10 rounded-xl items-center justify-center mr-4">
                                <Ionicons name="person" size={20} color="#6C4CFF" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-[#6B7280] mb-0.5">Full Name</Text>
                                <Text className="text-base font-medium text-[#121826]">
                                    {user?.name || "Not set"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Email */}
                    <View className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-[#11C5A5]/10 rounded-xl items-center justify-center mr-4">
                                <Ionicons name="mail" size={20} color="#11C5A5" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-[#6B7280] mb-0.5">Email Address</Text>
                                <Text className="text-base font-medium text-[#121826]">
                                    {user?.email || "Not set"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* User ID */}
                    <View className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-[#FFB020]/10 rounded-xl items-center justify-center mr-4">
                                <Ionicons name="finger-print" size={20} color="#FFB020" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs text-[#6B7280] mb-0.5">User ID</Text>
                                <Text className="text-base font-medium text-[#121826]">
                                    {user?.id || "N/A"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <View className="px-6 mt-10">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-[#FF4F5A] rounded-2xl py-4 flex-row items-center justify-center shadow-md"
                    >
                        <Ionicons name="log-out-outline" size={22} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
