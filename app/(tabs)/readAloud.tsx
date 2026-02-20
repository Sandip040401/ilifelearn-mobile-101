import ReadAloudAnalytics from "@/components/ReadAloud/ReadAloudAnalytics";
import ReadAloudPractice from "@/components/ReadAloud/ReadAloudPractice";
import SafeAreaView from "@/components/SafeAreaView";
import {
  AGE_GROUPS,
  CURRICULUM_LENSES,
  READ_ALOUD_IMAGES,
  READ_ALOUD_SENTENCES,
  READ_ALOUD_STORIES,
  READ_ALOUD_WORDS,
} from "@/data/json/readAloudData";
import { getReadAloudAttempts, getReadAloudStudentDashboard } from "@/services/readAloudService";
import useAuthStore from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
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
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState(AGE_GROUPS[0]?.value || "3-4");
  const [selectedCurriculum, setSelectedCurriculum] = useState("in");
  const [showCurriculumMenu, setShowCurriculumMenu] = useState(false);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
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

  // Check if a mode has content for the selected age
  const hasContentForAge = (modeId: string, age: string) => {
    switch (modeId) {
      case "word":
        return READ_ALOUD_IMAGES.some((i) => i.ageGroup === age);
      case "words":
        return READ_ALOUD_WORDS.some((i) => i.ageGroup === age);
      case "sentence":
        return READ_ALOUD_SENTENCES.some((i) => i.ageGroup === age);
      case "story":
        return READ_ALOUD_STORIES.some((i) => i.ageGroup === age);
      default:
        return false;
    }
  };

  const allModes = [
    {
      id: "word",
      title: "Image Mode",
      description: "Look at the image and say the word clearly",
      icon: "image",
      color: "#3B82F6",
    },
    {
      id: "words",
      title: "Words Mode",
      description: "Read the word below clearly",
      icon: "text",
      color: "#06B6D4",
    },
    {
      id: "sentence",
      title: "Sentence Mode",
      description: "Read the sentence below clearly and at a good pace",
      icon: "document-text",
      color: "#8B5CF6",
    },
    {
      id: "story",
      title: "Story Mode",
      description: "Read the complete story fluently",
      icon: "book",
      color: "#F59E0B",
    },
  ];

  // Filter modes based on selected age
  const availableModes = useMemo(
    () => allModes.filter((m) => hasContentForAge(m.id, selectedAge)),
    [selectedAge]
  );

  const handleModeSelect = (modeId: string) => {
    setSelectedMode(modeId);
  };

  const handleBack = () => {
    setSelectedMode(null);
  };

  // ── When a mode is selected, show the practice screen ──
  if (selectedMode) {
    const currentMode = allModes.find(m => m.id === selectedMode);
    const currentCurriculum = CURRICULUM_LENSES.find(c => c.id === selectedCurriculum);

    return (
      <LinearGradient
        colors={["#FF80B5", "#9089FC", "#3B82F6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, width:"100%", height:'100%' }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: s(20),
              paddingTop: s(15),
            }}
          >
            {/* Premium Header */}
            <View className="flex-row items-center mb-5">
              {/* Back Button */}
              <TouchableOpacity
                onPress={handleBack}
                className="w-11 h-11 bg-white/20 rounded-2xl items-center justify-center mr-3 border border-white/30"
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={s(20)} color="white" />
              </TouchableOpacity>

              {/* Mode Icon */}
              <View
                className="w-11 h-11 rounded-2xl items-center justify-center mr-3 border border-white/30"
                style={{ backgroundColor: currentMode?.color + "40" }}
              >
                <Ionicons
                  name={(currentMode?.icon || "sparkles") as any}
                  size={s(22)}
                  color="white"
                />
              </View>

              {/* Title */}
              <View className="flex-1 mr-3">
                <Text className="text-xl font-black text-white leading-tight" numberOfLines={1}>
                  {currentMode?.title || "Practice"}
                </Text>
                <Text className="text-white/70 text-xs font-semibold" numberOfLines={1}>
                  Age {selectedAge} yrs
                </Text>
              </View>

              {/* Curriculum Selector */}
              <View className="z-50">
                <TouchableOpacity
                  onPress={() => setShowCurriculumMenu(!showCurriculumMenu)}
                  className="flex-row aspect-square items-center justify-center shrink-0 bg-white/20 rounded-full p-2 border border-white/30"
                  activeOpacity={0.7}
                >
                  <Text className="text-lg text-center">{currentCurriculum?.icon || "🌐"}</Text>
                </TouchableOpacity>

                {/* Curriculum Dropdown */}
                {showCurriculumMenu && (
                  <View
                    className="absolute top-12 right-0 bg-white rounded-2xl overflow-hidden border border-slate-100"
                    style={{
                      width: 220,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.15,
                      shadowRadius: 16,
                      elevation: 15,
                    }}
                  >
                    <View className="p-3 border-b border-slate-100 bg-slate-50">
                      <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Curriculum Lens
                      </Text>
                    </View>
                    {CURRICULUM_LENSES.map((lens) => (
                      <TouchableOpacity
                        key={lens.id}
                        onPress={() => {
                          setSelectedCurriculum(lens.id);
                          setShowCurriculumMenu(false);
                        }}
                        className={`flex-row items-center px-4 py-3 border-b border-slate-50 ${selectedCurriculum === lens.id ? "bg-violet-50" : ""
                          }`}
                        activeOpacity={0.7}
                      >
                        <Text className="text-lg mr-3">{lens.icon}</Text>
                        <View className="flex-1">
                          <Text className="text-sm font-bold text-slate-800">{lens.name}</Text>
                          <Text className="text-[10px] text-slate-400">{lens.description}</Text>
                        </View>
                        {selectedCurriculum === lens.id && (
                          <Ionicons name="checkmark-circle" size={18} color="#9089FC" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* Practice Component */}
            <ReadAloudPractice
              initialMode={selectedMode}
              selectedAge={selectedAge}
              selectedCurriculum={selectedCurriculum}
              onBack={handleBack}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Default: Mode selection + Analytics tabs ──
  return (
    <LinearGradient
      colors={["#FF80B5", "#9089FC", "#3B82F6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, width:"100%", height:'100%' }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1 bg-transparent">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: s(20),
            paddingTop: s(15),
            paddingBottom: s(30),
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center mb-6 pr-4">
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
                {activeTab === "practice" ? "AI-powered reading assistant" : "Performance Tracking"}
              </Text>
            </View>
          </View>

          {/* Tab Switcher */}
          <View className="flex-row bg-white/20 p-2 rounded-3xl mb-6 border border-white/30">
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

          {/* Content */}
          {activeTab === "practice" ? (
            <View>
              {/* Age Selection Dropdown */}
              <View className="mb-6 z-40">
                <Text className="text-white text-sm font-bold uppercase tracking-wider mb-3 opacity-80">
                  Select Age Group
                </Text>
                <View>
                  <TouchableOpacity
                    onPress={() => setShowAgeDropdown(!showAgeDropdown)}
                    activeOpacity={0.8}
                    className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-4"
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-9 h-9 bg-violet-100 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="people" size={18} color="#9089FC" />
                      </View>
                      <Text className="text-[#121826] text-base font-bold">
                        Age {selectedAge}
                      </Text>
                    </View>
                    <Ionicons
                      name={showAgeDropdown ? "chevron-up" : "chevron-down"}
                      size={18}
                      color="#9089FC"
                    />
                  </TouchableOpacity>

                  {showAgeDropdown && (
                    <View
                      className="absolute top-16 left-0 right-0 bg-white rounded-2xl overflow-hidden border border-slate-100"
                      style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.12,
                        shadowRadius: 16,
                        elevation: 12,
                      }}
                    >
                      {AGE_GROUPS.map((age) => (
                        <TouchableOpacity
                          key={age.value}
                          onPress={() => {
                            setSelectedAge(age.value);
                            setShowAgeDropdown(false);
                          }}
                          className={`flex-row items-center px-5 py-4 border-b border-slate-50 ${selectedAge === age.value ? "bg-violet-50" : ""
                            }`}
                          activeOpacity={0.7}
                        >
                          <View
                            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${selectedAge === age.value ? "bg-[#9089FC]" : "bg-slate-100"
                              }`}
                          >
                            <Ionicons
                              name="people"
                              size={18}
                              color={selectedAge === age.value ? "white" : "#64748B"}
                            />
                          </View>
                          <Text
                            className={`flex-1 text-base font-bold ${selectedAge === age.value ? "text-[#9089FC]" : "text-slate-700"
                              }`}
                          >
                            Age {age.value}
                          </Text>
                          {selectedAge === age.value && (
                            <Ionicons name="checkmark-circle" size={20} color="#9089FC" />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Mode Cards */}
              <Text className="text-white text-xl font-semibold mb-5">Choose a practice mode</Text>

              {availableModes.length > 0 ? (
                <View className="flex-row flex-wrap justify-between">
                  {availableModes.map((mode) => (
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
              ) : (
                <View className="bg-white/20 rounded-3xl p-8 items-center border border-white/30">
                  <Ionicons name="alert-circle-outline" size={40} color="white" />
                  <Text className="text-white font-bold text-base mt-3">
                    No content available
                  </Text>
                  <Text className="text-white/70 text-xs mt-1 text-center">
                    No practice modes have content for this age group yet.
                  </Text>
                </View>
              )}
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
                  modes={allModes}
                />
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
