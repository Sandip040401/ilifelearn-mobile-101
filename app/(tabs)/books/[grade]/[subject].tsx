// app/(tabs)/books/[grade]/[subject].tsx - FIXED back button + scrollable
import SafeAreaView from "@/components/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
    Pressable,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from "react-native";

export default function SubjectContent() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { grade, subject } = params;

  const scaleW = screenWidth / 375;
  const scaleH = screenHeight / 812;
  const scale = Math.min(scaleW, scaleH, 1);
  const safeScale = Math.min(screenWidth / 390, 1);

  const cardRadius = 20 * safeScale;
  const iconSize = 48 * safeScale;
  const iconRadius = 14 * safeScale;
  const paddingH = 20 * safeScale;
  const paddingV = 18 * safeScale;
  const textTitle = 16 * safeScale;
  const textBody = 14 * safeScale;

  // Dynamic subject config
  const subjectConfig = {
    literacy: {
      gradeName: "Literacy Grade",
      bg: "#FEF7FF",
      title: "Units & Concepts",
      subtitle: "Tap to expand view materials",
      units: [
        {
          num: "1",
          color: "#EF4444",
          name: "Red & Green materials",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "2",
          color: "#3B82F6",
          name: "Blue & Yellow Vol-1",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "3",
          color: "#EC4899",
          name: "Pink & Orange",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "4",
          color: "#1E40AF",
          name: "Black & White Vol-1",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "5",
          color: "#D97706",
          name: "Brown & Grey",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "6",
          color: "#A855F7",
          name: "Violet Vol-1 Vol-1",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "7",
          color: "#10B981",
          name: "Combined Sheet",
          desc: "Literacy Vol-1 Vol-1",
        },
        {
          num: "8",
          color: "#EF4444",
          name: "Extra Practice",
          desc: "Literacy Review",
        },
        {
          num: "9",
          color: "#3B82F6",
          name: "Advanced Colors",
          desc: "Literacy Vol-2",
        },
        {
          num: "10",
          color: "#EC4899",
          name: "Final Assessment",
          desc: "Literacy Complete",
        },
      ],
    },
    numeracy: {
      gradeName: "Numeracy Grade",
      bg: "#EFF6FF",
      title: "Topics & Activities",
      subtitle: "Tap to start learning",
      units: [
        {
          num: "1",
          color: "#10B981",
          name: "Numbers 1-10",
          desc: "Numeracy Basics",
        },
        {
          num: "2",
          color: "#F59E0B",
          name: "Counting Practice",
          desc: "Numeracy Vol-1",
        },
        {
          num: "3",
          color: "#3B82F6",
          name: "Addition Intro",
          desc: "Numeracy Vol-1",
        },
        {
          num: "4",
          color: "#EF4444",
          name: "Shapes & Patterns",
          desc: "Numeracy Vol-1",
        },
        {
          num: "5",
          color: "#8B5CF6",
          name: "Measurement",
          desc: "Numeracy Vol-1",
        },
        {
          num: "6",
          color: "#EC4899",
          name: "Time Telling",
          desc: "Numeracy Vol-1",
        },
        {
          num: "7",
          color: "#06B6D4",
          name: "Mixed Review",
          desc: "Numeracy Vol-1",
        },
        {
          num: "8",
          color: "#10B981",
          name: "Subtraction Basics",
          desc: "Numeracy Vol-2",
        },
        {
          num: "9",
          color: "#F59E0B",
          name: "Number Patterns",
          desc: "Numeracy Vol-2",
        },
        {
          num: "10",
          color: "#3B82F6",
          name: "Data & Graphs",
          desc: "Numeracy Complete",
        },
      ],
    },
    science: {
      gradeName: "Science Grade",
      bg: "#F0FDF4",
      title: "Experiments & Discoveries",
      subtitle: "Interactive learning activities",
      units: Array(12)
        .fill(0)
        .map((_, i) => ({
          num: (i + 1).toString(),
          color: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"][i % 4],
          name: `Science Topic ${i + 1}`,
          desc: "Science Vol-1",
        })),
    },
    rhymes: {
      gradeName: "Rhymes Grade",
      bg: "#FEF3C7",
      title: "Songs & Stories",
      subtitle: "Listen and sing along",
      units: Array(12)
        .fill(0)
        .map((_, i) => ({
          num: (i + 1).toString(),
          color: ["#F59E0B", "#EF4444", "#3B82F6", "#10B981"][i % 4],
          name: `Rhyme ${i + 1}`,
          desc: "Rhymes Vol-1",
        })),
    },
  };

  const data =
    subjectConfig[subject as keyof typeof subjectConfig] ||
    subjectConfig.literacy;

  const goBackToSubjects = () => {
    "worklet"; // Ensures smooth navigation on gesture-heavy screens
    router.back();
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: data.bg }}>
      {/* FIXED: Header with pointerEvents to block ScrollView interference */}
      <View
        pointerEvents="box-none" // Allows touches through gaps
        style={{
          paddingHorizontal: 18 * safeScale,
          paddingTop: 12 * safeScale,
          zIndex: 1000, // Ensures header stays above scroll
        }}
      >
        {/* Header Card */}
        <View
          style={{
            marginBottom: 20 * safeScale,
            borderRadius: cardRadius,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 * safeScale },
            shadowOpacity: 0.1,
            shadowRadius: 8 * safeScale,
            elevation: 4,
          }}
        >
          <LinearGradient
            colors={["#EC4899", "#F472B6"]}
            style={{
              paddingTop: 14 * safeScale,
              paddingBottom: 14 * safeScale,
              paddingHorizontal: 18 * safeScale,
            }}
          >
            <View className="flex-row items-center justify-between">
              {/* ULTRA-RELIABLE Back Button */}
              <Pressable
                onPress={goBackToSubjects}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                android_ripple={{
                  color: "rgba(255,255,255,0.3)",
                  radius: 24 * safeScale,
                }}
                style={({ pressed }) => ({
                  width: 44 * safeScale,
                  height: 44 * safeScale,
                  borderRadius: 12 * safeScale,
                  backgroundColor: pressed
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <Ionicons
                  name="arrow-back"
                  size={20 * safeScale}
                  color="white"
                />
              </Pressable>

              <Text
                style={{
                  fontSize: 17 * safeScale,
                  fontWeight: "bold",
                  color: "white",
                  flex: 1,
                  textAlign: "center",
                  marginLeft: -30 * safeScale,
                }}
              >
                {data.gradeName}
              </Text>

              <Pressable
                style={({ pressed }) => ({
                  width: 44 * safeScale,
                  height: 44 * safeScale,
                  borderRadius: 12 * safeScale,
                  backgroundColor: pressed
                    ? "rgba(255,255,255,0.35)"
                    : "rgba(255,255,255,0.25)",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20 * safeScale}
                  color="white"
                />
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 6 * safeScale,
            paddingBottom: 12 * safeScale,
            gap: 8 * safeScale,
          }}
        >
          {[
            { name: "Concepts", icon: "albums-outline" },
            { name: "Videos", icon: "play-outline" },
            { name: "E-books", icon: "book-outline" },
          ].map((tab, i) => (
            <Pressable
              key={i}
              android_ripple={{ color: "#EC4899", radius: 20 * safeScale }}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 10 * safeScale,
                paddingHorizontal: 14 * safeScale,
                backgroundColor: pressed
                  ? "rgba(236,72,153,0.25)"
                  : "rgba(236,72,153,0.15)",
                borderRadius: 16 * safeScale,
                borderWidth: 1,
                borderColor: "rgba(236,72,153,0.25)",
                alignItems: "center",
              })}
            >
              <Ionicons name={tab.icon} size={16 * safeScale} color="#EC4899" />
              <Text
                style={{
                  fontSize: 10 * safeScale,
                  color: "#EC4899",
                  fontWeight: "600",
                  marginTop: 2 * safeScale,
                }}
              >
                {tab.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* FIXED ScrollView - Separated from header */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 18 * safeScale,
          paddingBottom: 40 * safeScale,
          paddingTop: 8 * safeScale,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false} // Reduces gesture conflicts
        scrollEventThrottle={16}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        pointerEvents="box-none"
      >
        {/* Title */}
        <View style={{ marginBottom: 20 * safeScale }}>
          <Text
            style={{
              fontSize: 20 * safeScale,
              fontWeight: "bold",
              color: "#121826",
            }}
          >
            {data.title}
          </Text>
          <Text
            style={{
              fontSize: 14 * safeScale,
              color: "#6B7280",
              marginTop: 4 * safeScale,
            }}
          >
            {data.subtitle}
          </Text>
        </View>

        {/* FIXED Units - Correct Pressable syntax */}
        <View style={{ gap: 14 * safeScale }}>
          {data.units.map((unit, index) => (
            <Pressable
              key={index}
              android_ripple={{
                color: "rgba(0,0,0,0.1)",
                radius: 24 * safeScale,
              }}
              style={({ pressed }) => ({
                borderRadius: cardRadius,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <View
                style={{
                  paddingHorizontal: paddingH,
                  paddingVertical: paddingV,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: cardRadius,
                  borderWidth: 1,
                  borderColor: "rgba(0,0,0,0.08)",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 * safeScale },
                  shadowOpacity: 0.08,
                  shadowRadius: 4 * safeScale,
                  elevation: 3,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={{
                        width: iconSize,
                        height: iconSize,
                        marginRight: 16 * safeScale,
                        backgroundColor: unit.color,
                        borderRadius: iconRadius,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 18 * safeScale,
                          fontWeight: "bold",
                          color: "white",
                        }}
                      >
                        {unit.num}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: textTitle,
                          fontWeight: "600",
                          color: "#121826",
                          marginBottom: 4 * safeScale,
                        }}
                      >
                        {unit.name}
                      </Text>
                      <Text style={{ fontSize: textBody, color: "#6B7280" }}>
                        {unit.desc}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16 * safeScale, color: "#6B7280" }}>
                    ▶
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
