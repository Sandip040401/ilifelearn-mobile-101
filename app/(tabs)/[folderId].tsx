// app/(tabs)/[folderId].tsx
import SafeAreaView from "@/components/SafeAreaView";
import { WebVRViewerModal } from "@/components/WebVRViewerModal"; // move modal to components
import { fetchWebVRContent } from "@/services/webVRService";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    FlatList,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function EnvironmentDetail() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const folderId = params.folderId as string;
  const folderName = params.folderName as string;

  const [environment, setEnvironment] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any>(null); // ← modal state

  useEffect(() => {
    const fetchEnvironment = async () => {
      try {
        setLoading(true);
        const response = await fetchWebVRContent(folderId);
        const data = response?.data?.data || response?.data || {};
        setEnvironment(data);
      } catch (error) {
        console.error("Error fetching environment:", error);
      } finally {
        setLoading(false);
      }
    };
    if (folderId) fetchEnvironment();
  }, [folderId]);

  // ✅ Hardware back: close modal first, then navigate
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selectedAsset) {
        setSelectedAsset(null); // close modal
        return true; // consume event, navigator doesn't fire
      }
      return false; // let navigator handle normal back
    });
    return () => sub.remove();
  }, [selectedAsset]);

  const assets = environment.topics || [];

  // ✅ No router.push — just open modal
  const handleAssetPress = (asset: any) => {
    setSelectedAsset(asset);
  };

  const handleModalClose = () => {
    setSelectedAsset(null);
  };

  const renderAsset = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{
        marginBottom: 16,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
      }}
      onPress={() => handleAssetPress(item)}
    >
      <View
        style={{
          height: 160,
          backgroundColor: "#E0F2FE",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 64 }}>{item.icon || "📚"}</Text>
      </View>
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: "#1E293B",
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={{ fontSize: 13, color: "#64748B", lineHeight: 18 }}
          numberOfLines={2}
        >
          {item.description || "Explore this immersive learning experience"}
        </Text>
        {item.webvr?.length > 0 && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
                backgroundColor: "#DBEAFE",
              }}
            >
              <Text
                style={{ fontSize: 11, fontWeight: "700", color: "#1E40AF" }}
              >
                👓 Immersive Experience
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "#F4F7FF",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 12, color: "#64748B" }}>
          Loading environment...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FF" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* ✅ Fixed: router.back() not router.push() */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => router.back()}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              elevation: 2,
            }}
          >
            <Text style={{ fontSize: 18, color: "#059669" }}>←</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#059669" }}>
            Back to Environments
          </Text>
        </TouchableOpacity>

        <View
          style={{
            height: 120,
            backgroundColor: "#0EA5E9",
            borderRadius: 24,
            justifyContent: "center",
            padding: 24,
            marginBottom: 24,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: "#FFFFFF",
              marginBottom: 6,
            }}
          >
            {folderName || environment.folderName || "WebVR Experience"}
          </Text>
          <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
            Select an asset to start your immersive journey 🚀
          </Text>
        </View>

        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "#111827",
            marginBottom: 16,
          }}
        >
          Available Experiences
        </Text>

        {assets.length > 0 ? (
          <FlatList
            data={assets}
            renderItem={renderAsset}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View
            style={{
              height: 200,
              backgroundColor: "#F8FAFC",
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#64748B" }}>
              No assets available
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ✅ Modal lives here — no route needed */}
      <WebVRViewerModal
        visible={!!selectedAsset}
        onClose={handleModalClose}
        assetTitle={selectedAsset?.title || ""}
        folderName={folderName}
        assetData={selectedAsset || {}}
      />
    </SafeAreaView>
  );
}
