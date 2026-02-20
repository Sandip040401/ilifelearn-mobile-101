import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av"; // npx expo install expo-av
import { useState } from "react";
import {
    FlatList,
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
  const [mediaModal, setMediaModal] = useState({
    visible: false,
    url: "",
    type: "" as "images" | "videos" | "worksheets",
  });

  const closeMediaModal = () => {
    setMediaModal({ visible: false, url: "", type: "" });
  };

  const openMedia = (
    url: string,
    type: "images" | "videos" | "workssheets",
  ) => {
    setMediaModal({ visible: true, url, type });
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

        <FlatList
          data={items}
          numColumns={3}
          keyExtractor={(_, index) => `item-${index}`}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => openMedia(item, type)}
              style={{
                flex: 1,
                margin: 4 * safeScale,
                height: 100 * safeScale,
                backgroundColor: "#F1F5F9",
                borderRadius: 12 * safeScale,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 2,
                borderColor: "rgba(0,0,0,0.05)",
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
          )}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  if (!topic) return null;

  return (
    <>
      {/* MAIN TOPIC MODAL */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
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
        </View>
      </Modal>

      {/* FIXED MEDIA VIEWER */}
      <Modal
        visible={mediaModal.visible}
        animationType="fade"
        transparent={true}
        statusBarTranslucent
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}
          activeOpacity={1}
          onPress={closeMediaModal}
        >
          {/* IMAGE - Working */}
          {mediaModal.type === "images" && mediaModal.url && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 60,
                  right: 20,
                  zIndex: 1000,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={closeMediaModal}
              >
                <Ionicons name="close-outline" size={28} color="white" />
              </TouchableOpacity>

              <Image
                source={{ uri: mediaModal.url }}
                style={{ flex: 1, width: "100%", height: "100%" }}
                resizeMode="contain"
              />
            </View>
          )}

          {/* VIDEO - FULLY WORKING */}
          {mediaModal.type === "videos" && mediaModal.url && (
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 60,
                  right: 20,
                  zIndex: 1000,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={closeMediaModal}
              >
                <Ionicons name="close-outline" size={28} color="white" />
              </TouchableOpacity>

              <Video
                source={{ uri: mediaModal.url }}
                style={{ flex: 1, width: "100%", height: "100%" }}
                useNativeControls
                resizeMode="contain"
                shouldPlay={false}
                isLooping={false}
              />
            </View>
          )}

          {/* WORKSHEET PLACEHOLDER */}
          {mediaModal.type === "worksheets" && (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 40,
              }}
            >
              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 60,
                  right: 20,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  borderRadius: 25,
                  width: 50,
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={closeMediaModal}
              >
                <Ionicons name="close-outline" size={28} color="white" />
              </TouchableOpacity>

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
                  Worksheet PDF{"\n"}Viewer Coming Soon
                </Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </>
  );
}
