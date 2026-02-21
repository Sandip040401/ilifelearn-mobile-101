// components/MediaViewer.tsx - Background tap DISABLED
import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
const ActiveVideoPlayer = ({ url }: { url: string }) => {
  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
    // player.play() is not called initially, shouldPlay={false} was previously used
  });
  return (
    <VideoView
      player={player}
      style={{ flex: 1, width: "100%" }}
      allowsFullscreen
      allowsPictureInPicture
    />
  );
};
export default function MediaViewer({
  media,
  onClose,
}: {
  media: { type: string; url?: string };
  onClose: () => void;
}) {
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      statusBarTranslucent
      // ✅ presentationStyle="overFullScreen" prevents background taps on iOS
      presentationStyle="overFullScreen"
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)" }}>
        {/* ✅ NO background TouchableOpacity - only X button closes */}

        {/* IMAGE - Only X closes */}
        {media.type === "images" && media.url && (
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
              onPress={onClose}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }} // ✅ Bigger tap target
            >
              <Ionicons name="close-outline" size={28} color="white" />
            </TouchableOpacity>
            <Image
              source={{ uri: media.url }}
              style={{ flex: 1, width: "100%" }}
              resizeMode="contain"
            />
          </View>
        )}

        {/* VIDEO - Only X closes, video controls work */}
        {media.type === "videos" && media.url && (
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
              onPress={onClose}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <Ionicons name="close-outline" size={28} color="white" />
            </TouchableOpacity>
            <ActiveVideoPlayer url={media.url} />
          </View>
        )}

        {/* WORKSHEET - Only X closes */}
        {media.type === "worksheets" && (
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
                zIndex: 1000,
                backgroundColor: "rgba(0,0,0,0.8)",
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onClose}
              hitSlop={{ top: 20, right: 20, bottom: 20, left: 20 }}
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
                Worksheet PDF Viewer Coming Soon
              </Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}
