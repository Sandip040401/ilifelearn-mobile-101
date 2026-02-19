import ReadAloudAnalytics from "@/components/ReadAloud/ReadAloudAnalytics";
import SafeAreaView from "@/components/SafeAreaView";
import { getReadAloudAttempts, getReadAloudStudentDashboard } from "@/services/readAloudService";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function ReadAloud() {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState("practice");
  const [isLoading, setIsLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [attempts, setAttempts] = useState<any[]>([]);
  const { user } = useAuthStore();

  const scale = Math.min(width / 375, 1.2);
  const s = (val: number) => Math.round(val * scale);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    if (!user?._id && !user?.id) return;
    setIsLoading(true);
    try {
      const studentId = user?._id || user?.id;
      const [dashboardRes, attemptsRes] = await Promise.all([
        getReadAloudStudentDashboard(studentId),
        getReadAloudAttempts(studentId)
      ]);

      setAnalyticsData(dashboardRes);
      setAttempts(attemptsRes?.data?.attempts || []);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const modes = [
    {
      id: "word",
      title: "Image Mode",
      description: "Look at the image and say the word clearly",
      icon: "image",
      color: "#3B82F6",
      key: "word",
    },
    {
      id: "words",
      title: "Words Mode",
      description: "Read the word below clearly",
      icon: "text",
      color: "#06B6D4",
      key: "words",
    },
    {
      id: "sentence",
      title: "Sentence Mode",
      description: "Read the sentence below clearly and at a good pace",
      icon: "document-text",
      color: "#8B5CF6",
      key: "sentence",
    },
    {
      id: "story",
      title: "Story Mode",
      description: "Read the complete story fluently",
      icon: "book",
      color: "#F59E0B",
      key: "story",
    },
  ];

  const handleModeSelect = (modeId: string) => {
    console.log("Selected mode:", modeId);
  };

  return (
    <LinearGradient
      colors={["#FF80B5", "#9089FC", "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: s(20),
            paddingTop: s(15),
            paddingBottom: s(0),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center mb-8 pr-4">
            <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4 border border-white/30 shrink-0">
              <Ionicons
                name={activeTab === "practice" ? "sparkles" : "analytics"}
                size={s(28)}
                color="white"
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-black text-white leading-tight" numberOfLines={2} adjustsFontSizeToFit>
                {activeTab === "practice" ? "Read Aloud AI" : "Analytics Dashboard"}
              </Text>
              <Text className="text-white/80 text-sm font-bold opacity-80" numberOfLines={1}>
                {activeTab === "practice" ? "AI Reading Assistant" : "Performance Tracking"}
              </Text>
            </View>
          </View>

          {/* Tab Switcher */}
          <View className="flex-row bg-white/20 p-2 rounded-3xl mb-10 border border-white/30">
            <TouchableOpacity
              onPress={() => setActiveTab("practice")}
              className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${activeTab === "practice" ? "bg-white shadow-sm" : ""
                }`}
            >
              <Ionicons
                name="book-outline"
                size={s(20)}
                color={activeTab === "practice" ? "#9089FC" : "white"}
              />
              <Text
                className={`ml-2 font-bold ${activeTab === "practice" ? "text-[#9089FC]" : "text-white"
                  }`}
              >
                Practice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("analytics")}
              className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl ${activeTab === "analytics" ? "bg-white shadow-sm" : ""
                }`}
            >
              <Ionicons
                name="stats-chart-outline"
                size={s(20)}
                color={activeTab === "analytics" ? "#9089FC" : "white"}
              />
              <Text
                className={`ml-2 font-bold ${activeTab === "analytics" ? "text-[#9089FC]" : "text-white"
                  }`}
              >
                Analytics
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === "practice" ? (
            <View>
              <Text className="text-white text-xl font-semibold mb-6">Choose a practice mode</Text>

              <View className="flex-row flex-wrap justify-between">
                {modes.map((mode) => (
                  <TouchableOpacity
                    key={mode.id}
                    onPress={() => handleModeSelect(mode.id)}
                    activeOpacity={0.9}
                    style={{
                      width: "48%",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: s(28),
                      padding: s(24),
                      marginBottom: s(16),
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 10 },
                      shadowOpacity: 0.1,
                      shadowRadius: 15,
                      elevation: 5,
                    }}
                  >
                    <View
                      style={{ backgroundColor: mode.color }}
                      className="w-14 h-14 rounded-2xl items-center justify-center mb-5 shadow-sm"
                    >
                      <Ionicons name={mode.icon as any} size={s(28)} color="white" />
                    </View>
                    <Text className="text-[#121826] text-lg font-bold mb-1" numberOfLines={1}>
                      {mode.title}
                    </Text>
                    <Text className="text-[#6B7280] text-xs leading-4" numberOfLines={2}>
                      {mode.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View>
              {isLoading ? (
                <View className="py-20">
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : (
                <ReadAloudAnalytics
                  user={user}
                  analyticsData={analyticsData}
                  attempts={attempts}
                  modes={modes}
                />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
