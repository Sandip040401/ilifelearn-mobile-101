// Login.tsx - Replace entire component
import SafeAreaView from "@/components/SafeAreaView";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const scale = Math.min(screenWidth / 375, 1);
const buttonRadius = 20 * scale;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

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
            paddingHorizontal: 24 * scale,
            paddingVertical: 32 * scale,
            paddingBottom: 100 * scale,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo & Title */}
          <View style={{ marginBottom: 48 * scale, alignItems: "center" }}>
            <View
              style={{
                width: 96 * scale,
                height: 96 * scale,
                backgroundColor: "#6C4CFF",
                borderRadius: 24 * scale,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24 * scale,
                shadowColor: "#6C4CFF",
                shadowOffset: { width: 0, height: 10 * scale },
                shadowOpacity: 0.4,
                shadowRadius: 20 * scale,
                elevation: 10,
              }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 64 * scale, height: 64 * scale }}
                resizeMode="contain"
              />
            </View>
            <Text
              style={{
                fontSize: 30 * scale,
                fontWeight: "bold",
                color: "#121826",
                textAlign: "center",
                lineHeight: 36 * scale,
              }}
            >
              Welcome Back!
            </Text>
            <Text
              style={{
                color: "#6B7280",
                fontSize: 16 * scale,
                marginTop: 8 * scale,
                textAlign: "center",
                paddingHorizontal: 16 * scale,
              }}
            >
              Sign in to continue your learning journey
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: 24 * scale }}>
            {/* Email */}
            <View>
              <Text
                style={{
                  color: "#121826",
                  fontWeight: 600,
                  marginBottom: 12 * scale,
                  marginLeft: 4 * scale,
                  fontSize: 16 * scale,
                }}
              >
                Email Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 20 * scale,
                  paddingVertical: 16 * scale,
                  borderRadius: 20 * scale,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  fontSize: 16 * scale,
                  color: "#121826",
                }}
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
              <Text
                style={{
                  color: "#121826",
                  fontWeight: 600,
                  marginBottom: 12 * scale,
                  marginLeft: 4 * scale,
                  fontSize: 16 * scale,
                }}
              >
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 20 * scale,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  paddingHorizontal: 20 * scale,
                  paddingVertical: 8 * scale,
                }}
              >
                <TextInput
                  style={{ flex: 1, fontSize: 16 * scale, color: "#121826" }}
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
                    size={24 * scale}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: "flex-end" }}>
              <Text
                style={{
                  color: "#6C4CFF",
                  fontSize: 16 * scale,
                  fontWeight: 600,
                }}
              >
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button - WRAPPED for perfect rounding */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.9}
              style={{ marginTop: 16 * scale }}
            >
              <View style={{ borderRadius: buttonRadius, overflow: "hidden" }}>
                <LinearGradient
                  colors={["#6C4CFF", "#9B5CFF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    paddingVertical: 20 * scale,
                    alignItems: "center",
                    shadowColor: "#6C4CFF",
                    shadowOffset: { width: 0, height: 10 * scale },
                    shadowOpacity: 0.4,
                    shadowRadius: 20 * scale,
                    elevation: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 18 * scale,
                      letterSpacing: 0.5 * scale,
                    }}
                  >
                    {isLoading ? "Signing In..." : "Log In"}
                  </Text>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
