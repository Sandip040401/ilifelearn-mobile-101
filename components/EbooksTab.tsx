import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, Text, View } from "react-native";

interface EbooksTabProps {
  conceptsData: any;
  arSheets: string[];
  safeScale: number;
  cardRadius: number;
}

export default function EbooksTab({
  conceptsData,
  arSheets,
  safeScale,
  cardRadius,
}: EbooksTabProps) {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20 * safeScale,
          paddingHorizontal: 20 * safeScale,
        }}
      >
        <Text
          style={{
            fontSize: 20 * safeScale,
            fontWeight: "bold",
            color: "#121826",
          }}
        >
          Ebooks & Worksheets ({arSheets.length})
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: 40 * safeScale,
          paddingHorizontal: 20 * safeScale,
        }}
      >
        <View style={{ gap: 16 * safeScale }}>
          {conceptsData?.ebooks?.map((ebook: any, index: number) => (
            <Pressable
              key={`ebook-${index}`}
              style={{ alignItems: "center", marginBottom: 24 * safeScale }}
            >
              <View
                style={{
                  width: 280 * safeScale,
                  height: 360 * safeScale,
                  backgroundColor: "#F8FAFC",
                  borderRadius: cardRadius,
                  padding: 20 * safeScale,
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 * safeScale },
                  shadowOpacity: 0.1,
                  shadowRadius: 12 * safeScale,
                  elevation: 6,
                }}
              >
                <Ionicons
                  name="book-outline"
                  size={64 * safeScale}
                  color="#EC4899"
                />
                <Text
                  style={{
                    fontSize: 18 * safeScale,
                    fontWeight: "bold",
                    color: "#121826",
                    marginTop: 16 * safeScale,
                    textAlign: "center",
                  }}
                >
                  {ebook.title || `Ebook ${index + 1}`}
                </Text>
                <Text
                  style={{
                    fontSize: 14 * safeScale,
                    color: "#6B7280",
                    marginTop: 8 * safeScale,
                    textAlign: "center",
                  }}
                >
                  {arSheets.length} pages
                </Text>
              </View>
            </Pressable>
          ))}

          {arSheets.slice(0, 4).map((sheetUrl, index) => (
            <Pressable
              key={`sheet-${index}`}
              style={{
                padding: 16 * safeScale,
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius: cardRadius,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 * safeScale },
                shadowOpacity: 0.08,
                shadowRadius: 4 * safeScale,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 16 * safeScale,
                  fontWeight: "600",
                  color: "#121826",
                }}
              >
                Worksheet Page {index + 1}
              </Text>
              <Text style={{ fontSize: 14 * safeScale, color: "#6B7280" }}>
                AR Interactive Sheet
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
