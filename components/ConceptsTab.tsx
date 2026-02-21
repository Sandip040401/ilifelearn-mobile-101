import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; // ✅ ADD THIS
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
// ✅ REMOVE: import TopicModal from "./TopicModal";

interface ConceptsTabProps {
  conceptsData: any;
  flattenedTopics: any[];
  selectedTopicIndex: number | null;
  setSelectedTopicIndex: (index: number | null) => void;
  selectedVolume: string;
  setSelectedVolume: (volume: string) => void;
  loading: boolean;
  error: string | null;
  safeScale: number;
  fetchConcepts: () => void;
  cardRadius: number;
  paddingH: number;
  paddingV: number;
  textTitle: number;
  textBody: number;
  iconSize: number;
  iconRadius: number;
  grade: string; // ✅ ADD - for navigation path
  subject: string; // ✅ ADD - for navigation path
}

export default function ConceptsTab({
  conceptsData,
  flattenedTopics,
  selectedTopicIndex,
  setSelectedTopicIndex,
  selectedVolume,
  setSelectedVolume,
  loading,
  error,
  safeScale,
  fetchConcepts,
  paddingH,
  paddingV,
  textTitle,
  textBody,
  iconSize,
  iconRadius,
  cardRadius,
  grade, // ✅ NEW
  subject, // ✅ NEW
}: ConceptsTabProps) {
  // ✅ REMOVE THESE MODAL STATES
  // const [showTopicModal, setShowTopicModal] = useState(false);
  // const [selectedTopicForModal, setSelectedTopicForModal] = useState<any>(null);

  const volumeNumbers = conceptsData?.concepts
    ? [
        ...new Set(
          conceptsData.concepts.map((c: any) => c.volumeNumber).filter(Boolean),
        ),
      ].sort((a, b) => a - b)
    : [];

  // ✅ UPDATED - Navigate instead of modal
  const handleTopicPress = (topic: any, index: number) => {
    setSelectedTopicIndex(index);

    // Navigate to topic page with topic data
    router.push({
      pathname: `/books/${grade}/topic`,
      params: {
        topic: JSON.stringify(topic),
        safeScale: safeScale.toString(),
        cardRadius: cardRadius.toString(),
      },
    });
  };

  const handleVolumeSelect = (volume: string) => {
    setSelectedVolume(volume);
  };

  // ... ALL your existing loading/error/empty states - NO CHANGES ...

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text
          style={{
            fontSize: 14 * safeScale,
            color: "#6B7280",
            marginTop: 12 * safeScale,
          }}
        >
          Loading concepts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons
          name="alert-circle-outline"
          size={48 * safeScale}
          color="#EF4444"
        />
        <Text
          style={{
            fontSize: 16 * safeScale,
            color: "#EF4444",
            marginTop: 12 * safeScale,
          }}
        >
          {error}
        </Text>
        <Pressable
          onPress={fetchConcepts}
          style={{
            marginTop: 16 * safeScale,
            paddingHorizontal: 24 * safeScale,
            paddingVertical: 12 * safeScale,
            backgroundColor: "#EC4899",
            borderRadius: 8 * safeScale,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (!flattenedTopics?.length) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons
          name="library-outline"
          size={64 * safeScale}
          color="#6B7280"
        />
        <Text
          style={{
            fontSize: 16 * safeScale,
            color: "#6B7280",
            marginTop: 12 * safeScale,
          }}
        >
          No topics available
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* ALL your volume filters - NO CHANGES */}
      <View
        style={{
          paddingHorizontal: 16 * safeScale,
          paddingVertical: 20 * safeScale,
        }}
      >
        <Text
          style={{
            fontSize: 20 * safeScale,
            fontWeight: "bold",
            color: "#121826",
            marginBottom: 16 * safeScale,
          }}
        >
          Units & Concepts ({flattenedTopics.length})
        </Text>
        <View
          style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 * safeScale }}
        >
          <Pressable
            onPress={() => handleVolumeSelect("all")}
            style={({ pressed }) => ({
              paddingHorizontal: 16 * safeScale,
              paddingVertical: 10 * safeScale,
              backgroundColor:
                selectedVolume === "all" ? "#EC4899" : "rgba(236,72,153,0.1)",
              borderRadius: 20 * safeScale,
              borderWidth: 1,
              borderColor:
                selectedVolume === "all" ? "#EC4899" : "rgba(236,72,153,0.2)",
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <Text
              style={{
                color: selectedVolume === "all" ? "white" : "#EC4899",
                fontSize: 13 * safeScale,
                fontWeight: "600",
              }}
            >
              All
            </Text>
          </Pressable>
          {volumeNumbers.slice(0, 4).map((vol) => (
            <Pressable
              key={vol}
              onPress={() => handleVolumeSelect(vol.toString())}
              style={({ pressed }) => ({
                paddingHorizontal: 12 * safeScale,
                paddingVertical: 10 * safeScale,
                backgroundColor:
                  selectedVolume === vol.toString()
                    ? "#EC4899"
                    : "rgba(236,72,153,0.1)",
                borderRadius: 20 * safeScale,
                borderWidth: 1,
                borderColor:
                  selectedVolume === vol.toString()
                    ? "#EC4899"
                    : "rgba(236,72,153,0.2)",
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <Text
                style={{
                  color:
                    selectedVolume === vol.toString() ? "white" : "#EC4899",
                  fontSize: 13 * safeScale,
                  fontWeight: "600",
                }}
              >
                V{vol}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* FlatList - NO CHANGES */}
      <FlatList
        data={flattenedTopics}
        renderItem={({ item: topic, index }) => (
          <Pressable
            onPress={() => handleTopicPress(topic, index)} // ✅ Now navigates!
            style={({ pressed }) => ({
              marginHorizontal: 16 * safeScale,
              marginBottom: 16 * safeScale,
              backgroundColor: "white",
              borderRadius: cardRadius,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 * safeScale },
              shadowOpacity: 0.1,
              shadowRadius: 12 * safeScale,
              elevation: 5,
              opacity: pressed ? 0.95 : 1,
            })}
          >
            {/* Your existing topic card content - NO CHANGES */}
            <View style={{ padding: 20 * safeScale }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: iconSize,
                    height: iconSize,
                    marginRight: 16 * safeScale,
                    backgroundColor: topic.color || "#10B981",
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
                    {index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: textTitle,
                      fontWeight: "700",
                      color: "#121826",
                      marginBottom: 4 * safeScale,
                    }}
                  >
                    {topic.title}
                  </Text>
                  <Text style={{ fontSize: textBody, color: "#6B7280" }}>
                    {topic.conceptTitle}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 8 * safeScale,
                      gap: 12 * safeScale,
                    }}
                  >
                    {topic.images?.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4 * safeScale,
                        }}
                      >
                        <View
                          style={{
                            width: 8 * safeScale,
                            height: 8 * safeScale,
                            backgroundColor: "#10B981",
                            borderRadius: 4 * safeScale,
                          }}
                        />
                        <Text
                          style={{ fontSize: 12 * safeScale, color: "#6B7280" }}
                        >
                          {topic.images.length} imgs
                        </Text>
                      </View>
                    )}
                    {topic.videos?.length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4 * safeScale,
                        }}
                      >
                        <View
                          style={{
                            width: 8 * safeScale,
                            height: 8 * safeScale,
                            backgroundColor: "#3B82F6",
                            borderRadius: 4 * safeScale,
                          }}
                        />
                        <Text
                          style={{ fontSize: 12 * safeScale, color: "#6B7280" }}
                        >
                          {topic.videos.length} videos
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </Pressable>
        )}
        keyExtractor={(item, index) => item.id || `topic-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 * safeScale }}
      />

      {/* ✅ DELETE THIS ENTIRE TopicModal BLOCK */}
      {/* <TopicModal visible={showTopicModal} ... /> */}
    </View>
  );
}
