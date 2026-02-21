import MediaViewer from "@/components/MediaViewer";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";

interface EbooksTabProps {
  conceptsData: any;
  arSheets: string[];
  safeScale: number;
  cardRadius: number;
}

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function EbooksTab({
  conceptsData,
  arSheets,
  safeScale,
  cardRadius,
}: EbooksTabProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    url: string;
    type: "images" | "videos";
  } | null>(null);
  const [selectedVolume, setSelectedVolume] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const ebooks = conceptsData?.ebooks || [];
  const currentEbook = ebooks[0];
  const currentVolume = currentEbook?.volumes?.[selectedVolume];
  const pages = currentVolume?.pages || [];

  const goToPage = (pageIndex: number) => {
    if (pageIndex >= 0 && pageIndex < pages.length) {
      flatListRef.current?.scrollToIndex({ index: pageIndex, animated: true });
      setCurrentPageIndex(pageIndex);
    }
  };

  const renderPage = ({ item: page, index }: { item: any; index: number }) => {
    const isImageVideo = page.type === "imageVideo";
    const imageUrl = page.content?.image || page.lastSavedContent?.image;
    const videoUrl = page.content?.video || page.lastSavedContent?.video;
    const videoPosition = page.content?.position || "right"; // left or right

    return (
      <View
        style={{
          width: SCREEN_WIDTH,
          paddingHorizontal: 20 * safeScale,
          alignItems: "center",
        }}
      >
        {/* Page Book Container */}
        <View
          style={{
            backgroundColor: "white",
            borderRadius: 16 * safeScale,
            padding: 16 * safeScale,
            width: "100%",
            maxWidth: 500 * safeScale,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 8 * safeScale },
            shadowOpacity: 0.15,
            shadowRadius: 20 * safeScale,
            elevation: 10,
            position: "relative",
          }}
        >
          {/* Page Number Badge */}
          <View
            style={{
              position: "absolute",
              top: -12 * safeScale,
              alignSelf: "center",
              zIndex: 10,
              backgroundColor: "#EC4899",
              paddingHorizontal: 16 * safeScale,
              paddingVertical: 6 * safeScale,
              borderRadius: 20 * safeScale,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 13 * safeScale,
                fontWeight: "700",
              }}
            >
              Page {index + 1} / {pages.length}
            </Text>
          </View>

          {/* Main Image */}
          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={{
                width: "100%",
                height: 500 * safeScale,
                borderRadius: 12 * safeScale,
                backgroundColor: "#F8FAFC",
              }}
              resizeMode="contain"
            />
          )}

          {/* ✅ ImageVideo Play Button - LEFT or RIGHT */}
          {isImageVideo && videoUrl && (
            <TouchableOpacity
              onPress={() =>
                setSelectedMedia({
                  url: videoUrl,
                  type: "videos" as const,
                })
              }
              style={{
                position: "absolute",
                [videoPosition === "left" ? "left" : "right"]: 30 * safeScale,
                top: "50%",
                transform: [{ translateY: -35 * safeScale }],
                backgroundColor: "#3B82F6",
                borderRadius: 35 * safeScale,
                width: 70 * safeScale,
                height: 70 * safeScale,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 * safeScale },
                shadowOpacity: 0.5,
                shadowRadius: 12 * safeScale,
                elevation: 10,
                borderWidth: 3,
                borderColor: "white",
              }}
            >
              <Ionicons
                name="play-circle"
                size={40 * safeScale}
                color="white"
              />
            </TouchableOpacity>
          )}

          {/* WriteImage Badge */}
          {page.type === "writeImage" && (
            <View
              style={{
                position: "absolute",
                top: 20 * safeScale,
                right: 20 * safeScale,
                backgroundColor: "#F59E0B",
                borderRadius: 20 * safeScale,
                paddingHorizontal: 14 * safeScale,
                paddingVertical: 8 * safeScale,
                flexDirection: "row",
                alignItems: "center",
                gap: 6 * safeScale,
              }}
            >
              <Ionicons name="pencil" size={14 * safeScale} color="white" />
              <Text
                style={{
                  color: "white",
                  fontSize: 12 * safeScale,
                  fontWeight: "700",
                }}
              >
                Write Activity
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header: Volume Selector */}
      <View
        style={{
          paddingHorizontal: 20 * safeScale,
          paddingTop: 20 * safeScale,
          paddingBottom: 12 * safeScale,
        }}
      >
        <Text
          style={{
            fontSize: 20 * safeScale,
            fontWeight: "bold",
            color: "#121826",
            marginBottom: 12 * safeScale,
          }}
        >
          📚 {currentEbook?.title || "E-Book"}
        </Text>

        {/* Volume Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 10 * safeScale }}>
            {currentEbook?.volumes?.map((volume: any, volIndex: number) => (
              <TouchableOpacity
                key={volume.id}
                onPress={() => {
                  setSelectedVolume(volIndex);
                  setCurrentPageIndex(0);
                  setTimeout(
                    () =>
                      flatListRef.current?.scrollToIndex({
                        index: 0,
                        animated: false,
                      }),
                    100,
                  );
                }}
                style={{
                  paddingHorizontal: 20 * safeScale,
                  paddingVertical: 10 * safeScale,
                  backgroundColor:
                    volIndex === selectedVolume
                      ? "#EC4899"
                      : "rgba(236,72,153,0.1)",
                  borderRadius: 25 * safeScale,
                  borderWidth: volIndex === selectedVolume ? 0 : 1.5,
                  borderColor: "rgba(236,72,153,0.3)",
                }}
              >
                <Text
                  style={{
                    color: volIndex === selectedVolume ? "white" : "#EC4899",
                    fontWeight: "700",
                    fontSize: 13 * safeScale,
                    textAlign: "center",
                  }}
                >
                  {volume.title || `Vol ${volIndex + 1}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* ✅ Flipbook Horizontal Swipe */}
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={renderPage}
        keyExtractor={(page, i) => page.pageId || `page-${i}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const pageIndex = Math.round(
            event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          );
          setCurrentPageIndex(pageIndex);
        }}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 30 * safeScale }}
      />

      {/* Bottom Navigation Controls */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20 * safeScale,
          paddingVertical: 20 * safeScale,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "rgba(0,0,0,0.1)",
        }}
      >
        <TouchableOpacity
          onPress={() => goToPage(currentPageIndex - 1)}
          disabled={currentPageIndex === 0}
          style={{
            backgroundColor: currentPageIndex === 0 ? "#E5E7EB" : "#EC4899",
            paddingHorizontal: 24 * safeScale,
            paddingVertical: 12 * safeScale,
            borderRadius: 25 * safeScale,
            flexDirection: "row",
            alignItems: "center",
            gap: 8 * safeScale,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={20 * safeScale}
            color={currentPageIndex === 0 ? "#9CA3AF" : "white"}
          />
          <Text
            style={{
              color: currentPageIndex === 0 ? "#9CA3AF" : "white",
              fontWeight: "700",
              fontSize: 14 * safeScale,
            }}
          >
            Previous
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 14 * safeScale,
            color: "#6B7280",
            fontWeight: "600",
          }}
        >
          {currentPageIndex + 1} / {pages.length}
        </Text>

        <TouchableOpacity
          onPress={() => goToPage(currentPageIndex + 1)}
          disabled={currentPageIndex === pages.length - 1}
          style={{
            backgroundColor:
              currentPageIndex === pages.length - 1 ? "#E5E7EB" : "#EC4899",
            paddingHorizontal: 24 * safeScale,
            paddingVertical: 12 * safeScale,
            borderRadius: 25 * safeScale,
            flexDirection: "row",
            alignItems: "center",
            gap: 8 * safeScale,
          }}
        >
          <Text
            style={{
              color:
                currentPageIndex === pages.length - 1 ? "#9CA3AF" : "white",
              fontWeight: "700",
              fontSize: 14 * safeScale,
            }}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20 * safeScale}
            color={currentPageIndex === pages.length - 1 ? "#9CA3AF" : "white"}
          />
        </TouchableOpacity>
      </View>

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
