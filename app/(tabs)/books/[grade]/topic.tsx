import MediaViewer from "@/components/MediaViewer";
import SafeAreaView from "@/components/SafeAreaView";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TopicScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { topic, safeScale = "1", cardRadius = "20" } = params;

  const parsedTopic = JSON.parse(topic);
  const scale = Number(safeScale);
  const [selectedMedia, setSelectedMedia] = useState(null);

  const renderContentSection = (title, items, icon, type) => {
    // ✅ FIXED ABOVE
    if (!items?.length) return null;
    return (
      <View style={{ marginBottom: 24 * scale }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16 * scale,
          }}
        >
          <Ionicons name={icon} size={20 * scale} color="#EC4899" />
          <Text
            style={{
              fontSize: 16 * scale,
              fontWeight: "700",
              color: "#121826",
              marginLeft: 8 * scale,
            }}
          >
            {title} ({items.length})
          </Text>
        </View>
        <ScrollView
          style={{ maxHeight: 200 * scale }}
          horizontal={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 * scale }}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={`media-${type}-${index}`}
              onPress={() => setSelectedMedia({ url: item, type })}
              style={{
                width: "30%",
                height: 100 * scale,
                margin: 4 * scale,
                backgroundColor: "#F1F5F9",
                borderRadius: 12 * scale,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(0,0,0,0.05)",
              }}
            >
              <Ionicons
                name={
                  type === "images"
                    ? "image-outline"
                    : type === "videos"
                      ? "play-circle-outline"
                      : "document-outline"
                }
                size={28 * scale}
                color={
                  type === "images"
                    ? "#10B981"
                    : type === "videos"
                      ? "#3B82F6"
                      : "#F59E0B"
                }
              />
              <Text
                style={{
                  fontSize: 10 * scale,
                  color: "#6B7280",
                  marginTop: 6 * scale,
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {type === "images" ? "IMG" : type === "videos" ? "VID" : "SHT"}{" "}
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: "#F8FAFC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 18 * scale,
          paddingVertical: 16 * scale,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0,0,0,0.08)",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ padding: 8 * scale }}
        >
          <Ionicons name="arrow-back" size={24 * scale} color="#EF4444" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 18 * scale,
              fontWeight: "700",
              color: "#121826",
            }}
          >
            {parsedTopic?.title || "Topic"}
          </Text>
          <Text style={{ fontSize: 14 * scale, color: "#6B7280" }}>
            {parsedTopic?.conceptTitle} • Vol {parsedTopic?.volumeNumber}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20 * scale,
          paddingBottom: 120 * scale,
        }}
        showsVerticalScrollIndicator={false}
      >
        {renderContentSection(
          "Images",
          parsedTopic?.images || [],
          "image-outline",
          "images",
        )}
        {renderContentSection(
          "Videos",
          parsedTopic?.videos || [],
          "play-outline",
          "videos",
        )}
        {renderContentSection(
          "Worksheets",
          parsedTopic?.arSheets || [],
          "document-outline",
          "worksheets",
        )}

        {parsedTopic?.keyword && (
          <View
            style={{
              backgroundColor: "rgba(236,72,153,0.1)",
              padding: 16 * scale,
              borderRadius: 12 * scale,
              marginBottom: 24 * scale,
            }}
          >
            <Text
              style={{
                fontSize: 14 * scale,
                fontWeight: "600",
                color: "#EC4899",
                marginBottom: 8 * scale,
              }}
            >
              Keyword
            </Text>
            <Text style={{ fontSize: 16 * scale, color: "#121826" }}>
              {parsedTopic.keyword}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: "#EC4899",
            paddingVertical: 16 * scale,
            borderRadius: 12 * scale,
            alignItems: "center",
            marginTop: 20 * scale,
            marginBottom: 40 * scale,
          }}
        >
          <Text
            style={{ color: "white", fontSize: 16 * scale, fontWeight: "700" }}
          >
            Start Learning This Topic
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}
    </SafeAreaView>
  );
}
