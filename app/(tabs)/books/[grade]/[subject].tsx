import ConceptsTab from "@/components/ConceptsTab";
import EbooksTab from "@/components/EbooksTab";
import SafeAreaView from "@/components/SafeAreaView";
import VideosTab from "@/components/VideosTab";
import { fetchConceptsForHome } from "@/services/conceptService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function SubjectContent() {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const params = useLocalSearchParams();
  const grade = (params.grade as string) || "";
  const subject = (params.subject as string) || "";

  if (!grade || !subject) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Invalid route parameters</Text>
      </View>
    );
  }

  // States
  const [activeTab, setActiveTab] = useState("concepts");
  const [conceptsData, setConceptsData] = useState<any>(null);
  const [selectedVolume, setSelectedVolume] = useState("all");
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(
    null,
  );
  const [flattenedTopics, setFlattenedTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // ✅ COMPLETE flattenTopicsForVolume function
  const flattenTopicsForVolume = useCallback((data: any, volume: string) => {
    if (!data?.concepts || !Array.isArray(data.concepts)) {
      console.warn("No valid concepts array:", data?.concepts);
      return [];
    }

    let filteredConcepts = data.concepts.filter((c: any) => c);
    if (volume !== "all") {
      filteredConcepts = filteredConcepts.filter(
        (c: any) => c.volumeNumber === parseInt(volume),
      );
    }

    const flattened = filteredConcepts
      .flatMap((concept: any, conceptIdx: number) => {
        const topics = concept.topics || [];
        if (!Array.isArray(topics)) return [];
        return topics.map((topic: any, topicIdx: number) => ({
          id: topic.id || `${concept.id}-topic-${topicIdx}`,
          title: topic.title || "Untitled",
          conceptTitle: concept.title || "Unknown Concept",
          volumeNumber: concept.volumeNumber || 1,
          conceptIndex: conceptIdx,
          images: Array.isArray(topic.images) ? topic.images : [],
          videos: Array.isArray(topic.videos) ? topic.videos : [],
          keyword: topic.keyword || "",
          color: data.subject?.color || "#EC4899",
        }));
      })
      .filter(Boolean);

    console.log(`✅ Flattened ${flattened.length} topics for vol ${volume}`);
    return flattened;
  }, []);

  // ✅ COMPLETE fetchConcepts function
  const fetchConcepts = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📡 Fetching /home/concepts/${grade}/${subject}`);
      const response = await fetchConceptsForHome(grade, subject);

      const apiData = response.data;
      console.log("📦 Full API data:", apiData);

      if (apiData?.success) {
        setConceptsData(apiData.data);
        const topics = flattenTopicsForVolume(apiData.data, "all");
        setFlattenedTopics(topics);
        if (screenWidth >= 768) {
          setSelectedTopicIndex(topics.length > 0 ? 0 : null);
        }
      } else {
        throw new Error("API success false");
      }
    } catch (err) {
      setError("Failed to load concepts");
      console.error("❌ API Error:", err);
      setFlattenedTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcepts();
  }, [grade, subject]);

  useEffect(() => {
    if (conceptsData) {
      const topics = flattenTopicsForVolume(conceptsData, selectedVolume);
      setFlattenedTopics(topics);
      setSelectedTopicIndex(
        screenWidth >= 768 ? (topics.length > 0 ? 0 : null) : null,
      );
    }
  }, [selectedVolume, conceptsData, screenWidth, flattenTopicsForVolume]);

  const goBackToSubjects = () => router.back();

  const tabs = [
    { id: "concepts", label: "Concepts", icon: "library-outline" },
    { id: "videos", label: "Videos", icon: "play-outline" },
    { id: "ebooks", label: "Ebooks", icon: "book-outline" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "concepts":
        return (
          <ConceptsTab
            conceptsData={conceptsData}
            flattenedTopics={flattenedTopics}
            selectedTopicIndex={selectedTopicIndex}
            setSelectedTopicIndex={setSelectedTopicIndex}
            selectedVolume={selectedVolume}
            setSelectedVolume={setSelectedVolume}
            loading={loading}
            error={error}
            safeScale={safeScale}
            fetchConcepts={fetchConcepts}
            cardRadius={cardRadius}
            paddingH={paddingH}
            paddingV={paddingV}
            textTitle={textTitle}
            textBody={textBody}
            iconSize={iconSize}
            iconRadius={iconRadius}
            grade={grade}
            subject={subject}
          />
        );
      case "videos":
        return (
          <VideosTab
            conceptsData={conceptsData}
            safeScale={safeScale}
            cardRadius={cardRadius}
          />
        );
      case "ebooks":
        return (
          <EbooksTab
            conceptsData={conceptsData}
            arSheets={conceptsData?.arSheets || []}
            safeScale={safeScale}
            cardRadius={cardRadius}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 18 * safeScale,
          paddingTop: 12 * safeScale,
          zIndex: 1000,
        }}
      >
        {/* Header gradient */}
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
            {/* Header gradient - NO three dots */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                onPress={goBackToSubjects}
                activeOpacity={0.7}
                style={{
                  width: 44 * safeScale,
                  height: 44 * safeScale,
                  borderRadius: 12 * safeScale,
                  backgroundColor: "rgba(255,255,255,0.25)",
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

              {/* ✅ SUBJECT + GRADE HEADER */}
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 8 * safeScale,
                }}
              >
                {/* Main subject name */}
                <Text
                  style={{
                    fontSize: 17 * safeScale,
                    fontWeight: "bold",
                    color: "white",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {conceptsData?.subject?.name || subject}
                </Text>
                {/* Grade + Subject subtitle */}
                <Text
                  style={{
                    marginTop: 2 * safeScale,
                    fontSize: 12 * safeScale,
                    color: "rgba(255,255,255,0.85)",
                    textAlign: "center",
                  }}
                  numberOfLines={1}
                >
                  {conceptsData?.grade?.name || grade} •{" "}
                  {conceptsData?.subject?.name || subject}
                </Text>
              </View>

              {/* ✅ Empty space for symmetry - NO three dots */}
              <View style={{ width: 44 * safeScale, height: 44 * safeScale }} />
            </View>
          </LinearGradient>
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 6 * safeScale,
            paddingBottom: 16 * safeScale,
            gap: 8 * safeScale,
          }}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12 * safeScale,
                paddingHorizontal: 16 * safeScale,
                backgroundColor:
                  activeTab === tab.id
                    ? "rgba(236,72,153,0.15)"
                    : "rgba(255,255,255,0.6)",
                borderRadius: 16 * safeScale,
                borderWidth: activeTab === tab.id ? 2 : 1,
                borderColor:
                  activeTab === tab.id ? "#EC4899" : "rgba(0,0,0,0.1)",
                alignItems: "center",
                flexDirection: "row",
                gap: 8 * safeScale,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Ionicons
                name={
                  (activeTab === tab.id
                    ? tab.icon.replace("-outline", "")
                    : tab.icon) as any
                }
                size={18 * safeScale}
                color="#EC4899"
              />
              <Text
                style={{
                  fontSize: 13 * safeScale,
                  color: "#EC4899",
                  fontWeight: activeTab === tab.id ? "700" : "600",
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === "concepts" && loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#EC4899" />
            <Text
              style={{
                fontSize: 14 * safeScale,
                color: "#6B7280",
                marginTop: 12 * safeScale,
              }}
            >
              Loading...
            </Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </View>
    </SafeAreaView>
  );
}
