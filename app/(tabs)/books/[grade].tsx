// app/(tabs)/books/[grade].tsx - Perfect scaling across ALL devices
import SafeAreaView from "@/components/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function Grade() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Scale from BOTH dimensions for perfect fit (iPhone SE → iPad)
  const scaleW = screenWidth / 375;
  const scaleH = screenHeight / 812;
  const scale = Math.min(scaleW, scaleH, 1);

  const safeScale = Math.min(screenWidth / 390, 1); // Slightly wider base for safe areas

  const cardRadius = 24 * safeScale;
  const iconSize = 56 * safeScale;
  const iconRadius = 16 * safeScale;
  const paddingH = 20 * safeScale;
  const paddingV = 20 * safeScale;
  const textXL = 18 * safeScale;
  const textLG = 13 * safeScale;
  const textSM = 12 * safeScale;
  const gap = 16 * safeScale;
  const headerPadH = 24 * safeScale;
  const headerPadV = 16 * safeScale;
  const backBtnSize = 40 * safeScale;
  const titleSize = 24 * safeScale;
  const subtitleSize = 14 * safeScale;

  const { grade } = useLocalSearchParams();
  const data = gradeData[grade as keyof typeof gradeData];

  if (!data) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text style={{ fontSize: 18 * safeScale }}>Grade not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: data.bg }}>
      <View
        className="flex-1 px-[18px]"
        style={{
          paddingTop: Math.max(48 * safeScale, 20), // Safe area + minimum
          paddingBottom: 32 * safeScale,
        }}
      >
        {/* Header */}
        <View
          style={{
            marginBottom: 32 * safeScale,
            borderRadius: cardRadius,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={data.gradient}
            style={{
              paddingHorizontal: headerPadH,
              paddingVertical: headerPadV,
            }}
          >
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => router.navigate("/(tabs)/books")} // Changed from router.back()
                style={{
                  width: backBtnSize,
                  height: backBtnSize,
                  marginRight: 12 * safeScale,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 12 * safeScale,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="arrow-back"
                  size={20 * safeScale}
                  color="white"
                />
              </TouchableOpacity>

              <View className="flex-1">
                <Text
                  style={{
                    fontSize: 20 * safeScale,
                    fontWeight: "bold",
                    color: "white",
                  }}
                  numberOfLines={1}
                >
                  {data.name}
                </Text>
                <Text
                  style={{
                    fontSize: subtitleSize,
                    color: "rgba(255,255,255,0.9)",
                    lineHeight: 18 * safeScale,
                  }}
                  numberOfLines={1}
                >
                  {data.subtitle}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: titleSize,
            fontWeight: "bold",
            color: "#121826",
            marginBottom: 24 * safeScale,
            includeFontPadding: false,
          }}
        >
          Choose Your Subject
        </Text>

        {/* Subjects */}
        <View style={{ flex: 1, gap }}>
          {commonSubjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              activeOpacity={0.7}
              style={{ borderRadius: cardRadius, overflow: "hidden" }}
              onPress={() =>
                router.push(`/(tabs)/books/${grade}/${subject.id}`)
              }
            >
              <View
                style={{
                  paddingHorizontal: paddingH,
                  paddingVertical: paddingV,
                  paddingBottom: 24 * safeScale,
                  backgroundColor: `${subject.color}12`,
                  borderWidth: 1,
                  borderColor: `${subject.color}20`,
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-row items-start" style={{ flex: 1 }}>
                    <View
                      style={{
                        width: iconSize,
                        height: iconSize,
                        marginRight: 16 * safeScale,
                        marginTop: 2 * safeScale,
                        backgroundColor: subject.color,
                        borderRadius: iconRadius,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons
                        name={subject.icon}
                        size={28 * safeScale}
                        color="white"
                      />
                    </View>
                    <View style={{ flex: 1, marginTop: 1 * safeScale }}>
                      <Text
                        style={{
                          fontSize: textXL,
                          fontWeight: 600,
                          color: "#121826",
                          marginBottom: 2 * safeScale,
                          includeFontPadding: false,
                        }}
                        numberOfLines={1}
                      >
                        {subject.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: textLG,
                          color: "#6B7280",
                          lineHeight: 16 * safeScale,
                          includeFontPadding: false,
                        }}
                        numberOfLines={2}
                      >
                        {subject.desc}
                      </Text>
                      <Text
                        style={{
                          fontSize: textSM,
                          color: subject.color,
                          fontWeight: 500,
                          marginTop: 4 * safeScale,
                          includeFontPadding: false,
                        }}
                      >
                        {subject.subDesc}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{ alignItems: "flex-end", marginTop: 4 * safeScale }}
                  >
                    <Text
                      style={{
                        fontSize: 14 * safeScale,
                        color: "#6B7280",
                        fontWeight: 500,
                        lineHeight: 18 * safeScale,
                      }}
                    >
                      Explore →
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Move these outside component (shared)
const commonSubjects = [
  {
    id: "literacy",
    name: "Literacy readers",
    desc: "12 activities",
    icon: "book",
    color: "#EF4444",
  },
  {
    id: "numeracy",
    name: "Numeracy",
    desc: "Count, compare & play.",
    subDesc: "12 activities",
    icon: "calculator",
    color: "#3B82F6",
  },
  {
    id: "science",
    name: "Science",
    desc: "Discover & explore.",
    subDesc: "12 activities",
    icon: "flask",
    color: "#10B981",
  },
  {
    id: "rhymes",
    name: "Rhymes & Stories",
    desc: "Sing, talk, imagine.",
    subDesc: "12 activities",
    icon: "musical-notes",
    color: "#F59E0B",
  },
];

const gradeData = {
  hummingbird: {
    name: "Hummingbird",
    subtitle: "Nursery",
    gradient: ["#EC4899", "#F472B6"],
    bg: "#FEF7FF",
  },
  dove: {
    name: "Dove",
    subtitle: "Kindergarten",
    gradient: ["#3B82F6", "#60A5FA"],
    bg: "#EFF6FF",
  },
  macaw: {
    name: "Macaw",
    subtitle: "Grade 1",
    gradient: ["#F59E0B", "#FBBF24"],
    bg: "#FEF3C7",
  },
};
