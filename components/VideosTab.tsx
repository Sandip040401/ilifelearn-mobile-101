import MediaViewer from "@/components/MediaViewer";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "videos";
  } | null>(null);

  const videoVolumes = conceptsData?.videoVolumes || [];

  // ✅ Filter videos by volume OR show all
  const getVideosForVolume = (volumeId: string | "all") => {
    if (volumeId === "all") {
      return videoVolumes.flatMap(
        (vol) => vol.topics?.flatMap((topic) => topic.videos) || [],
      );
    }
    const volume = videoVolumes.find((vol) => vol.id === volumeId);
    return volume?.topics?.flatMap((topic) => topic.videos) || [];
  };

  // ✅ Volume tabs (All + V1, V2...)
  const volumeNumbers = [
    ...new Set(
      videoVolumes.map((vol) => vol.title.match(/VOL-(\d+)/)?.[1] || "1"),
    ),
  ].sort();

  return (
    <View style={{ flex: 1 }}>
      {/* Volume Filter */}
      <View
        style={{
          paddingHorizontal: 20 * safeScale,
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
          Video Lessons (
          {videoVolumes.reduce(
            (acc, vol) =>
              acc +
              (vol.topics?.reduce(
                (tAcc, t) => tAcc + (t.videos?.length || 0),
                0,
              ) || 0),
            0,
          )}
          )
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 * safeScale }}
        >
          <View style={{ flexDirection: "row", gap: 8 * safeScale }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16 * safeScale,
                paddingVertical: 10 * safeScale,
                backgroundColor: "#EC4899",
                borderRadius: 20 * safeScale,
                minWidth: 60 * safeScale,
              }}
              onPress={() => {
                /* All videos logic here if needed */
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "600",
                  fontSize: 13 * safeScale,
                  textAlign: "center",
                }}
              >
                All
              </Text>
            </TouchableOpacity>
            {volumeNumbers.map((volNum) => (
              <TouchableOpacity
                key={volNum}
                style={{
                  paddingHorizontal: 16 * safeScale,
                  paddingVertical: 10 * safeScale,
                  backgroundColor: "rgba(236,72,153,0.1)",
                  borderRadius: 20 * safeScale,
                  borderWidth: 1,
                  borderColor: "rgba(236,72,153,0.2)",
                }}
                onPress={() => {
                  /* Volume filter logic */
                }}
              >
                <Text
                  style={{
                    color: "#EC4899",
                    fontWeight: "600",
                    fontSize: 13 * safeScale,
                  }}
                >
                  Vol {volNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* All Videos Grid */}
      <FlatList
        data={videoVolumes.flatMap(
          (vol) =>
            vol.topics?.map((topic) => ({
              ...topic,
              volumeTitle: vol.title,
              volumeNumber: vol.title.match(/VOL-(\d+)/)?.[1],
            })) || [],
        )}
        numColumns={2}
        keyExtractor={(item, index) => `video-${item.id || index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20 * safeScale,
          paddingBottom: 40 * safeScale,
        }}
        renderItem={({ item: topic }) => (
          <TouchableOpacity
            onPress={() => {
              if (topic.videos?.[0]) {
                setSelectedMedia({ url: topic.videos[0], type: "videos" });
              }
            }}
            style={{
              flex: 1,
              margin: 8 * safeScale,
              backgroundColor: "white",
              borderRadius: cardRadius,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 * safeScale },
              shadowOpacity: 0.1,
              shadowRadius: 12 * safeScale,
              elevation: 4,
            }}
          >
            <View
              style={{
                height: 140 * safeScale,
                borderTopLeftRadius: cardRadius,
                borderTopRightRadius: cardRadius,
                backgroundColor: "#F1F5F9",
                justifyContent: "center",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Ionicons
                name="play-circle"
                size={48 * safeScale}
                color="#3B82F6"
              />
              <View
                style={{
                  position: "absolute",
                  top: 8 * safeScale,
                  right: 8 * safeScale,
                  backgroundColor: "rgba(0,0,0,0.7)",
                  borderRadius: 12 * safeScale,
                  padding: 4 * safeScale,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 10 * safeScale,
                    fontWeight: "600",
                  }}
                >
                  {topic.videos?.length || 0}
                </Text>
              </View>
            </View>
            <View style={{ padding: 12 * safeScale }}>
              <Text
                style={{
                  fontSize: 14 * safeScale,
                  fontWeight: "700",
                  color: "#121826",
                  marginBottom: 4 * safeScale,
                }}
              >
                {topic.title}
              </Text>
              <Text style={{ fontSize: 12 * safeScale, color: "#6B7280" }}>
                {topic.volumeTitle || `Vol ${topic.volumeNumber}`}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ✅ MediaViewer Overlay */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </View>
  );
}
