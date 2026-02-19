// app/(tabs)/books/index.tsx - Complete mobile-working version
import SafeAreaView from "@/components/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const scale = Math.min(screenWidth / 375, 1);
const cardRadius = 24 * scale;
const iconSize = 56 * scale;
const iconRadius = 16 * scale;

export default function Books() {
  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#F4F7FF] to-[#E0E7FF]">
      <View
        className="flex-1 px-[18px]"
        style={{ paddingTop: 48 * scale, paddingBottom: 32 * scale }}
      >
        {/* Header */}
        <View
          className="mb-[32px]"
          style={{
            marginBottom: 32 * scale,
            borderRadius: cardRadius,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["#8B5CF6", "#D8B4FE"]}
            style={{
              paddingHorizontal: 24 * scale,
              paddingVertical: 16 * scale,
            }}
          >
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.push("/")}
                style={{
                  width: 40 * scale,
                  height: 40 * scale,
                  marginRight: 12 * scale,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 12 * scale,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="arrow-back" size={20 * scale} color="white" />
              </TouchableOpacity>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text
                    style={{
                      fontSize: 20 * scale,
                      fontWeight: "bold",
                      color: "white",
                      marginRight: 8 * scale,
                    }}
                  >
                    Help every child read
                  </Text>
                  <Ionicons name="sparkles" size={18 * scale} color="white" />
                </View>
                <Text
                  style={{
                    fontSize: 14 * scale,
                    color: "rgba(255,255,255,0.9)",
                  }}
                  numberOfLines={2}
                >
                  Together with teachers and parents, making learning magical
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 24 * scale,
            fontWeight: "bold",
            color: "#121826",
            marginBottom: 24 * scale,
          }}
        >
          Explore by Grade
        </Text>

        {/* Cards */}
        <View className="flex-1" style={{ gap: 16 * scale }}>
          {/* Hummingbird */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/books/hummingbird")}
            style={{ borderRadius: cardRadius, overflow: "hidden" }}
          >
            <View
              style={{
                paddingHorizontal: 24 * scale,
                paddingVertical: 24 * scale,
                backgroundColor: "rgba(16,185,129,0.1)",
                borderWidth: 1,
                borderColor: "rgba(16,185,129,0.3)",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: iconSize,
                      height: iconSize,
                      marginRight: 16 * scale,
                      backgroundColor: "#10B981",
                      borderRadius: iconRadius,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="trail-sign"
                      size={28 * scale}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 18 * scale,
                        fontWeight: 600,
                        color: "#121826",
                      }}
                    >
                      Hummingbird
                    </Text>
                    <Text style={{ fontSize: 14 * scale, color: "#6B7280" }}>
                      first, big smiles.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20 * scale}
                  color="#10B981"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Dove */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/books/dove")}
            style={{ borderRadius: cardRadius, overflow: "hidden" }}
          >
            <View
              style={{
                paddingHorizontal: 24 * scale,
                paddingVertical: 24 * scale,
                backgroundColor: "rgba(59,130,246,0.1)",
                borderWidth: 1,
                borderColor: "rgba(59,130,246,0.3)",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: iconSize,
                      height: iconSize,
                      marginRight: 16 * scale,
                      backgroundColor: "#3B82F6",
                      borderRadius: iconRadius,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="leaf" size={28 * scale} color="white" />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 18 * scale,
                        fontWeight: 600,
                        color: "#121826",
                      }}
                    >
                      Dove
                    </Text>
                    <Text style={{ fontSize: 14 * scale, color: "#6B7280" }}>
                      Build words. Count wonders.
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20 * scale}
                  color="#3B82F6"
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Macaw */}
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/books/macaw")}
            style={{ borderRadius: cardRadius, overflow: "hidden" }}
          >
            <View
              style={{
                paddingHorizontal: 24 * scale,
                paddingVertical: 24 * scale,
                backgroundColor: "rgba(245,158,11,0.1)",
                borderWidth: 1,
                borderColor: "rgba(245,158,11,0.3)",
              }}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View
                    style={{
                      width: iconSize,
                      height: iconSize,
                      marginRight: 16 * scale,
                      backgroundColor: "#F59E0B",
                      borderRadius: iconRadius,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="color-palette"
                      size={28 * scale}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 18 * scale,
                        fontWeight: 600,
                        color: "#121826",
                      }}
                    >
                      Macaw
                    </Text>
                    <Text style={{ fontSize: 14 * scale, color: "#6B7280" }}>
                      Ready for reading adventures
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20 * scale}
                  color="#F59E0B"
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
