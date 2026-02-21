import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface TopicModalProps {
  visible: boolean;
  topic: any | null;
  onClose: () => void;
  safeScale: number;
  cardRadius: number;
}

export default function TopicModal({
  visible,
  topic,
  onClose,
  safeScale,
  cardRadius,
}: TopicModalProps) {
  const [activeMedia, setActiveMedia] = useState({
    url: "",
    type: "" as "images" | "videos" | "worksheets",
    index: -1,
  });

  const closeMedia = () => {
    setActiveMedia({ url: "", type: "", index: -1 });
  };

  const openMedia = (
    url: string,
    type: "images" | "videos" | "worksheets",
    index: number,
  ) => {
    console.log("Opening media:", { url, type, index });
    setActiveMedia({ url, type, index });
  };

  const renderContentSection = (
    title: string,
    items: any[],
    icon: string,
    type: "images" | "videos" | "worksheets",
  ) => {
    if (!items?.length) return null;

    return (
      <View style={{ marginBottom: 24 * safeScale }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16 * safeScale,
          }}
        >
          <Ionicons name={icon as any} size={20 * safeScale} color="#EC4899" />
          <Text
            style={{
              fontSize: 16 * safeScale,
              fontWeight: "700",
              color: "#121826",
              marginLeft: 8 * safeScale,
            }}
          >
            {title} ({items.length})
          </Text>
        </View>

        <ScrollView
          horizontal={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            paddingHorizontal: 4 * safeScale,
          }}
        >
          {items.map((item, index) => (
            <TouchableOpacity
              key={`item-${index}`}
              onPress={() => openMedia(item, type, index)}
              style={{
                width: "30%",
                height: 100 * safeScale,
                margin: 4 * safeScale,
                backgroundColor: "#F1F5F9",
                borderRadius: 12 * safeScale,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor:
                  activeMedia.type === type && activeMedia.index === index
                    ? "#EC4899"
                    : "rgba(0,0,0,0.05)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 * safeScale },
                shadowOpacity: 0.08,
                shadowRadius: 3 * safeScale,
                elevation: 2,
              }}
            >
              {type === "images" ? (
                <Ionicons
                  name="image-outline"
                  size={28 * safeScale}
                  color="#10B981"
                />
              ) : type === "videos" ? (
                <Ionicons
                  name="play-circle-outline"
                  size={32 * safeScale}
                  color="#3B82F6"
                />
              ) : (
                <Ionicons
                  name="document-outline"
                  size={28 * safeScale}
                  color="#F59E0B"
                />
              )}
              <Text
                style={{
                  fontSize: 10 * safeScale,
                  color: "#6B7280",
                  marginTop: 6 * safeScale,
                  fontWeight: "600",
                }}
                numberOfLines={1}
              >
                {type === "images"
                  ? "Image"
                  : type === "videos"
                    ? "Video"
                    : "Sheet"}{" "}
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (!topic) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 18 * safeScale,
            paddingVertical: 16 * safeScale,
            backgroundColor: "white",
            borderBottomWidth: 1,
            borderBottomColor: "rgba(0,0,0,0.08)",
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{ padding: 8 * safeScale }}
          >
            <Ionicons
              name="close-outline"
              size={24 * safeScale}
              color="#EF4444"
            />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 18 * safeScale,
                fontWeight: "700",
                color: "#121826",
              }}
            >
              {topic.title}
            </Text>
            <Text style={{ fontSize: 14 * safeScale, color: "#6B7280" }}>
              {topic.conceptTitle} • Vol {topic.volumeNumber}
            </Text>
          </View>
          <View style={{ width: 24 * safeScale }} />
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: 20 * safeScale,
            paddingBottom: 40 * safeScale,
          }}
          showsVerticalScrollIndicator={false}
        >
          {renderContentSection(
            "Images",
            topic.images || [],
            "image-outline",
            "images",
          )}
          {renderContentSection(
            "Videos",
            topic.videos || [],
            "play-outline",
            "videos",
          )}
          {topic.arSheets?.length > 0 &&
            renderContentSection(
              "Worksheets",
              topic.arSheets || [],
              "document-outline",
              "worksheets",
            )}

          {topic.keyword && (
            <View
              style={{
                backgroundColor: "rgba(236,72,153,0.1)",
                padding: 16 * safeScale,
                borderRadius: 12 * safeScale,
                marginBottom: 24 * safeScale,
              }}
            >
              <Text
                style={{
                  fontSize: 14 * safeScale,
                  fontWeight: "600",
                  color: "#EC4899",
                  marginBottom: 8 * safeScale,
                }}
              >
                Keyword
              </Text>
              <Text style={{ fontSize: 16 * safeScale, color: "#121826" }}>
                {topic.keyword}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: "#EC4899",
              paddingVertical: 16 * safeScale,
              borderRadius: 12 * safeScale,
              alignItems: "center",
              marginTop: 20 * safeScale,
            }}
            activeOpacity={0.9}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16 * safeScale,
                fontWeight: "700",
              }}
            >
              Start Learning This Topic
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ✅ SINGLE FULLSCREEN MEDIA VIEWER - Replaces nested modal */}
        {activeMedia.url && (
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.95)",
              zIndex: 2000,
            }}
            activeOpacity={1}
            onPress={closeMedia}
          >
            <TouchableOpacity
              style={{
                position: "absolute",
                top: 60,
                right: 20,
                zIndex: 3000,
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={closeMedia}
            >
              <Ionicons name="close-outline" size={28} color="white" />
            </TouchableOpacity>

            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {activeMedia.type === "images" && (
                <Image
                  source={{ uri: activeMedia.url }}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: 400,
                    maxHeight: 600,
                  }}
                  resizeMode="contain"
                />
              )}

              {activeMedia.type === "videos" && (
                <Video
                  source={{ uri: activeMedia.url }}
                  style={{
                    width: "100%",
                    height: "100%",
                    maxWidth: 400,
                    maxHeight: 600,
                  }}
                  useNativeControls
                  resizeMode="contain"
                  shouldPlay
                  isLooping={false}
                />
              )}

              {activeMedia.type === "worksheets" && (
                <View
                  style={{
                    backgroundColor: "#FCD34D",
                    padding: 60,
                    borderRadius: 20,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="document" size={80} color="#B45309" />
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      textAlign: "center",
                      marginTop: 20,
                    }}
                  >
                    Worksheet PDF Viewer Coming Soon
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}
