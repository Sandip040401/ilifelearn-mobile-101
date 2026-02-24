// app/(tabs)/webvr.tsx - FULLY FIXED with correct API mapping
import SafeAreaView from "@/components/SafeAreaView";
import { fetchWebVRFolders } from "@/services/webVRService";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const predefinedEnvironments = [
  {
    name: "Phonics Fun",
    imgURL: require("@/assets/images/phonics.jpg"),
    gradient: "coral",
    description: "Learn sounds and letters with playful words",
  },
  {
    name: "Numbers",
    imgURL: require("@/assets/images/numbers.jpg"),
    gradient: "secondary",
    description: "Count and play with numbers",
  },
  {
    name: "My Body",
    imgURL: require("@/assets/images/my-body.jpg"),
    gradient: "orchid",
    description: "Discover your amazing body parts",
  },
  {
    name: "Underwater World",
    imgURL: require("@/assets/images/underwater.jpg"),
    gradient: "teal",
    description: "Dive into the ocean depths",
  },
  {
    name: "Fruits & Vegetables",
    imgURL: require("@/assets/images/fruits-vegetables.jpg"),
    gradient: "teal",
    description: "Healthy and colorful treats",
  },
  {
    name: "Wild Animals",
    imgURL: require("@/assets/images/wild-animals.jpg"),
    gradient: "accent",
    description: "Meet amazing creatures of the wild",
  },
  {
    name: "Amphibians",
    imgURL: require("@/assets/images/amphibians.jpg"),
    gradient: "coral",
    description: "Learn about frogs, toads, and more",
  },
  {
    name: "Farm Animals",
    imgURL: require("@/assets/images/farm-animals.jpg"),
    gradient: "secondary",
    description: "Discover life on the farm",
  },
  {
    name: "Transportation",
    imgURL: require("@/assets/images/transportation.jpg"),
    gradient: "orchid",
    description: "Cars, planes, and everything that moves!",
  },
  {
    name: "Space Adventure",
    imgURL: require("@/assets/images/space.jpg"),
    gradient: "accent",
    description: "Planets, stars, and astronauts",
  },
  {
    name: "Extinct Animals",
    imgURL: require("@/assets/images/extinct-animals.jpg"),
    gradient: "coral",
    description: "Discover animals from the past",
  },
];

const ORDER = [
  "Phonics Fun",
  "Numbers",
  "My Body",
  "Underwater World",
  "Fruits & Vegetables",
  "Wild Animals",
  "Amphibians",
  "Farm Animals",
  "Transportation",
  "Space Adventure",
  "Extinct Animals",
];

const RANK = ORDER.reduce(
  (acc, name, idx) => {
    acc[name] = idx;
    return acc;
  },
  {} as Record<string, number>,
);

const normalizeName = (raw: string) => {
  const s = (raw || "").trim().toLowerCase();
  if (s.includes("phonics")) return "Phonics Fun";
  if (s.includes("number")) return "Numbers";
  if (s.includes("body")) return "My Body";
  if (s.includes("underwater")) return "Underwater World";
  if (s.includes("fruit") || s.includes("vegetable"))
    return "Fruits & Vegetables";
  if (s.includes("wild")) return "Wild Animals";
  if (s.includes("amphibian")) return "Amphibians";
  if (s.includes("farm")) return "Farm Animals";
  if (s.includes("transport")) return "Transportation";
  if (s.includes("space")) return "Space Adventure";
  if (s.includes("extinct")) return "Extinct Animals";
  return raw;
};

const getGradientColors = (gradient: string): [string, string] => {
  const map: Record<string, [string, string]> = {
    coral: ["#FF6B6B", "#FF8E8E"],
    secondary: ["#4ECDC4", "#6CD9D6"],
    orchid: ["#E8A2AF", "#F0B8C7"],
    teal: ["#45B7D1", "#7DD3E6"],
    accent: ["#FECA57", "#FED76B"],
    gray: ["#9CA3AF", "#D1D5DB"],
  };
  return map[gradient] ?? ["#9CA3AF", "#D1D5DB"];
};

export default function WebVR() {
  const router = useRouter();
  const [environments, setEnvironments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchWebVRFolders();

        // ✅ API returns: { data: [ { folders: { webvrFolderName, webvrFolderId: { _id, folderName } } } ] }
        const raw: any[] = Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
              ? response
              : [];

        const seen = new Set<string>();
        const folders: { _id: string; folderName: string }[] = [];

        for (const item of raw) {
          // ✅ folders is an ARRAY — loop through it
          const folderList = Array.isArray(item?.folders) ? item.folders : [];

          for (const f of folderList) {
            const fId = f?.webvrFolderId?._id;
            const fName = f?.webvrFolderId?.folderName ?? f?.webvrFolderName;

            if (!fId || !fName) continue;
            if (fName.toLowerCase().includes("test")) continue;
            if (fName.toLowerCase().includes("stories")) continue;
            if (seen.has(fId)) continue;

            seen.add(fId);
            folders.push({ _id: fId, folderName: fName });
          }
        }

        // Merge with predefined metadata
        const merged = folders.map((folder) => {
          const canonical = normalizeName(folder.folderName);
          const match = predefinedEnvironments.find(
            (env) => normalizeName(env.name) === canonical,
          );
          return {
            _id: folder._id,
            folderName: folder.folderName,
            name: match?.name ?? folder.folderName,
            description: match?.description ?? "",
            imgURL: match?.imgURL ?? null,
            gradient: match?.gradient ?? "gray",
          };
        });

        // Sort by ORDER
        const sorted = [...merged].sort((a, b) => {
          const ra = RANK[a.name] ?? 999;
          const rb = RANK[b.name] ?? 999;
          return ra - rb;
        });

        setEnvironments(sorted);
      } catch (err) {
        console.error("WebVR fetch error:", err);
        setEnvironments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderEnvironment = ({ item }: { item: any }) => {
    const [bg1, bg2] = getGradientColors(item.gradient);
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={{
          marginBottom: 20,
          borderRadius: 24,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 8,
        }}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/[folderId]",
            params: { folderId: item._id, folderName: item.folderName },
          })
        }
      >
        <LinearGradient
          colors={[bg1, bg2]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ height: 220, justifyContent: "flex-end", padding: 20 }}
        >
          {/* Image at top */}
          {item.imgURL && (
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                right: 12,
                height: 130,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "rgba(255,255,255,0.15)",
              }}
            >
              <Image
                source={item.imgURL}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Text at bottom */}
          <View style={{ marginTop: item.imgURL ? 100 : 0 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#FFFFFF",
                marginBottom: 4,
                textShadowColor: "rgba(0,0,0,0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.95)",
                lineHeight: 18,
                fontWeight: "500",
              }}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FAFC" }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            marginTop: 8,
            marginBottom: 28,
            borderRadius: 28,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={["#3B82F6", "#1D4ED8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 130,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text style={{ fontSize: 32 }}>👓</Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "900",
                  color: "#FFFFFF",
                  marginLeft: 12,
                }}
              >
                Web-VR Worlds
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: "rgba(255,255,255,0.92)" }}>
              Explore immersive 3D learning experiences ✨
            </Text>
          </LinearGradient>
        </View>

        {loading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 60,
            }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 15 }}>
              Loading environments...
            </Text>
          </View>
        ) : (
          <FlatList
            data={environments}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={renderEnvironment}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <Text style={{ fontSize: 48, marginBottom: 12 }}>🌍</Text>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#6B7280",
                    textAlign: "center",
                    fontWeight: "600",
                  }}
                >
                  No environments found
                </Text>
                <Text style={{ fontSize: 14, color: "#9CA3AF", marginTop: 6 }}>
                  Check your API connection
                </Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
