import MediaViewer from "@/components/MediaViewer";
import SafeAreaView from "@/components/SafeAreaView";
import { getAllWebVRContents } from "@/services/webVRService";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // px-4=16px each side + 16px gutter

const ENV_ORDER = [
  "phonics",
  "numbers",
  "stories",
  "body",
  "underwater",
  "animals",
  "farm",
  "fruits",
  "amphibians",
  "transport",
  "space",
  "extinct",
];

const environments = [
  { id: "phonics", name: "Phonics", emoji: "🔤" },
  { id: "numbers", name: "Numbers", emoji: "🔢" },
  { id: "stories", name: "Stories", emoji: "⭐" },
  { id: "body", name: "My Body", emoji: "🧍" },
  { id: "underwater", name: "Underwater", emoji: "🐠" },
  { id: "animals", name: "Wild Animals", emoji: "🦁" },
  { id: "farm", name: "Farm Animals", emoji: "🐄" },
  { id: "fruits", name: "Fruits & Veggies", emoji: "🍎🥕" },
  { id: "amphibians", name: "Amphibians", emoji: "🐸" },
  { id: "transport", name: "Transport", emoji: "🛻" },
  { id: "space", name: "Space", emoji: "🚀" },
  { id: "extinct", name: "Extinct Animal", emoji: "🦖" },
];

const normalizeNameFolder = (s = "") => s.trim().toLowerCase();
const envMapToId = (folderName?: string | null) => {
  const key = normalizeNameFolder(folderName || "");
  if (key.includes("phonics")) return "phonics";
  if (key.includes("number")) return "numbers";
  if (key.includes("story")) return "stories";
  if (key.includes("body")) return "body";
  if (key.includes("underwater")) return "underwater";
  if (key.includes("wild animals") || key === "animals") return "animals";
  if (key.includes("farm")) return "farm";
  if (key.includes("fruits") || key.includes("vegetables")) return "fruits";
  if (key.includes("amphibian")) return "amphibians";
  if (key.includes("transport")) return "transport";
  if (key.includes("space")) return "space";
  if (key.includes("extinct")) return "extinct";
  return null;
};

export default function ARSheets() {
  const [selectedEnvironment, setSelectedEnvironment] = useState("phonics");
  const [backend, setBackend] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Media viewer state
  const [showViewer, setShowViewer] = useState(false);
  const [viewerMedia, setViewerMedia] = useState<{
    type: string;
    url?: string;
  }>({ type: "" });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getAllWebVRContents();
        const payload = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
            ? res
            : Array.isArray(res?.data?.data)
              ? res.data.data
              : [];
        if (active) setBackend(payload || []);
      } catch (e) {
        if (active) setError("Failed to load AR sheets. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const availableLeftMenu = useMemo(() => {
    const presentIds = new Set(
      backend.map((doc) => envMapToId(doc?.folderName)).filter(Boolean),
    );
    const ORDER_RANK = ENV_ORDER.reduce(
      (acc, id, idx) => {
        acc[id] = idx;
        return acc;
      },
      {} as Record<string, number>,
    );
    const filtered = environments.filter((e) => presentIds.has(e.id));
    const sorted = [...filtered].sort(
      (a, b) => (ORDER_RANK[a.id] ?? 999) - (ORDER_RANK[b.id] ?? 999),
    );
    if (sorted.length && !sorted.some((e) => e.id === selectedEnvironment)) {
      setSelectedEnvironment(sorted[0].id);
    }
    return sorted;
  }, [backend, selectedEnvironment]);

  const topicsByLeftId = useMemo(() => {
    const acc = new Map<string, any[]>();
    for (const env of backend) {
      const leftId = envMapToId(env?.folderName);
      if (!leftId) continue;
      const list = acc.get(leftId) || [];
      if (Array.isArray(env?.topics)) list.push(...env.topics);
      acc.set(leftId, list);
    }
    return acc;
  }, [backend]);

  const currentAssets = useMemo(() => {
    const rawTopics = topicsByLeftId.get(selectedEnvironment) || [];
    return rawTopics.map((t: any, idx: number) => {
      let sheetUrls: string[] = [];
      if (Array.isArray(t?.arScanningSheets)) {
        sheetUrls = t.arScanningSheets.filter(Boolean);
      } else if (
        typeof t?.arScanningSheets === "string" &&
        t.arScanningSheets.trim()
      ) {
        sheetUrls = [t.arScanningSheets.trim()];
      }
      return {
        id: `${idx}-${t?.title || "topic"}`,
        name: t?.title || "Untitled Topic",
        icon: t?.icon,
        sheetUrls,
      };
    });
  }, [topicsByLeftId, selectedEnvironment]);

  const selectedEnvMeta =
    availableLeftMenu.find((e) => e.id === selectedEnvironment) || {};

  const handleCardPress = (asset: any) => {
    const url = asset.sheetUrls?.[0];
    if (url) {
      setViewerMedia({ type: "images", url });
      setShowViewer(true);
    }
  };

  const closeViewer = () => {
    setShowViewer(false);
    setViewerMedia({ type: "" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FF" }}>
      {" "}
      {/* ✅ Native styles */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#121826" }}>
            AR Scanning Sheets
          </Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: "#6B7280" }}>
            Print, scan and watch characters come alive.
          </Text>
        </View>

        {/* Environment pills */}
        <View style={{ marginTop: 8 }}>
          <FlatList
            data={availableLeftMenu}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => {
              const isSelected = item.id === selectedEnvironment;
              return (
                <TouchableOpacity
                  onPress={() => setSelectedEnvironment(item.id)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 20,
                    marginRight: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isSelected
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.8)",
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: "#2563EB",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 1,
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 6 }}>
                    {item.emoji}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected ? "#2563EB" : "#374151",
                    }}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Environment title */}
        <View
          style={{
            paddingHorizontal: 16,
            marginTop: 16,
            marginBottom: 12,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 36, marginRight: 8 }}>
            {selectedEnvMeta.emoji}
          </Text>
          <View>
            <Text style={{ fontSize: 18, fontWeight: "600", color: "#111827" }}>
              {selectedEnvMeta.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280" }}>
              Downloadable AR sheets for kids
            </Text>
          </View>
        </View>

        {loading ? (
          <View
            style={{
              marginTop: 32,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : error ? (
          <Text
            style={{
              paddingHorizontal: 16,
              marginTop: 16,
              fontSize: 14,
              color: "#EF4444",
            }}
          >
            {error}
          </Text>
        ) : !currentAssets.length ? (
          <Text
            style={{
              paddingHorizontal: 16,
              marginTop: 16,
              fontSize: 14,
              color: "#6B7280",
            }}
          >
            No topics with AR sheets yet.
          </Text>
        ) : null}

        {/* ✅ Card grid - Full height images */}
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <FlatList
            data={currentAssets}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false} // ✅ Inside ScrollView
            columnWrapperStyle={{ justifyContent: "space-between" }}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: CARD_WIDTH,
                  marginBottom: 16,
                  borderRadius: 20,
                  backgroundColor: "#FFFFFF",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => handleCardPress(item)}
              >
                {/* Icon */}
                <View style={{ alignItems: "center", marginBottom: 8 }}>
                  <Text style={{ fontSize: 44 }}>{item.icon || "🗂️"}</Text>
                </View>

                {/* Title */}
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: "#111827",
                    textAlign: "center",
                    minHeight: 36,
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>

                {/* ✅ Full-height thumbnail - FIXED */}

                {/* Eye icon preview area */}
                <View
                  style={{
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: "#F3F4F6",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {/* <Text style={{ fontSize: 36, color: "#9CA3AF" }}>👁️</Text> */}
                  <Text
                    style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}
                  >
                    Tap to preview
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
      {/* MediaViewer */}
      {showViewer && <MediaViewer media={viewerMedia} onClose={closeViewer} />}
    </SafeAreaView>
  );
}
