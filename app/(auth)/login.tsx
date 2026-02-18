import SafeAreaView from "@/components/SafeAreaView";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useResolveClassNames } from "uniwind";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
  const styles = useResolveClassNames("flex-1");

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const mockUser = {
        id: "123",
        name: "Test User",
        email: email,
      };

      login(mockUser, "mock-token-123");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7FF]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 2}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Title */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-[#6C4CFF] rounded-3xl items-center justify-center mb-6 shadow-xl shadow-[#6C4CFF]/40">
              <Image
                source={require("../../assets/images/logo.png")}
                className="w-16 h-16"
                resizeMode="contain"
              />
            </View>
            <Text className="text-3xl font-bold text-[#121826] text-center leading-tight">
              Welcome Back!
            </Text>
            <Text className="text-[#6B7280] text-base mt-2 text-center px-4">
              Sign in to continue your learning journey
            </Text>
          </View>

          {/* Form */}
          <View className="gap-6">
            {/* Email */}
            <View>
              <Text className="text-[#121826] font-semibold mb-3 ml-1 text-base">
                Email Address
              </Text>
              <TextInput
                className="bg-white px-5 py-4 rounded-2xl border border-gray-200 text-[#121826] text-base"
                placeholder="hello@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-[#121826] font-semibold mb-3 ml-1 text-base">
                Password
              </Text>
              <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-5 py-1">
                <TextInput
                  className="flex-1 text-[#121826] text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity className="self-end">
              <Text className="text-[#6C4CFF] text-base font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className="mt-4"
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={["#6C4CFF", "#9B5CFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="py-5 rounded-2xl overflow-hidden items-center shadow-xl shadow-[#6C4CFF]/40"
              >
                <Text className="text-white  font-bold text-lg tracking-wide">
                  {isLoading ? "Signing In..." : "Log In"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
