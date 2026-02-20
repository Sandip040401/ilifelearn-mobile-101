import { Ionicons } from "@expo/vector-icons";
import { FlatList, Pressable, Text, View } from "react-native";

interface VideosTabProps {
  conceptsData: any;
  safeScale: number;
  cardRadius: number;
}

export default function VideosTab({
  conceptsData,
  safeScale,
  cardRadius,
}: VideosTabProps) {
  const renderVideoItem = ({ item }: { item: any }) => (
    <Pressable style={{ marginBottom: 16 * safeScale }}>
      <View
        style={{
          height: 200 * safeScale,
          backgroundColor: "#F1F5F9",
          borderRadius: cardRadius,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 * safeScale },
          shadowOpacity: 0.1,
          shadowRadius: 8 * safeScale,
          elevation: 3,
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <Ionicons name="play-circle" size={48 * safeScale} color="white" />
        </View>
      </View>
      <Text
        style={{
          fontSize: 16 * safeScale,
          fontWeight: "600",
          color: "#121826",
          marginTop: 8 * safeScale,
        }}
      >
        {item.title || "Video"}
      </Text>
      <Text
        style={{
          fontSize: 14 * safeScale,
          color: "#6B7280",
          marginTop: 4 * safeScale,
        }}
      >
        Volume {item.volumeNumber || 1}
      </Text>
    </Pressable>
  );

  const videoVolumes = conceptsData?.videoVolumes || [];

  return (
    <View style={{ flex: 1, paddingHorizontal: 20 * safeScale }}>
      <Text
        style={{
          fontSize: 20 * safeScale,
          fontWeight: "bold",
          color: "#121826",
          marginBottom: 20 * safeScale,
        }}
      >
        Video Lessons
      </Text>
      <FlatList
        data={videoVolumes}
        renderItem={renderVideoItem}
        keyExtractor={(item, index) => `video-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 * safeScale }}
      />
    </View>
  );
}
