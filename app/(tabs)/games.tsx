import SafeAreaView from "@/components/SafeAreaView";
import scienceGamesData from "@/data/json/science-games.json";
import * as NavigationBar from "expo-navigation-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import { Check, Filter, Gamepad2, LogOut, MoreVertical, RefreshCw, Search, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { WebView } from "react-native-webview";

import { getAllGames } from "@/services/gameService";

const CATEGORIES = ["All Games", "Literacy", "Numeracy", "Science", "Rhymes and Stories"];

// Parse the JSON data and map into a usable Game format
const PARSED_SCIENCE_GAMES = scienceGamesData.map((game: any, index: number) => {
  let url = "";
  if (game.basic?.games?.length > 0) url = game.basic.games[0];
  else if (game.intermediate?.games?.length > 0) url = game.intermediate.games[0];
  else if (game.advanced?.games?.length > 0) url = game.advanced.games[0];

  return {
    id: game.id || `science-${index}`,
    title: game.title,
    thumbnail: "https://img.freepik.com/free-vector/physics-science-concept-with-pendulum_1308-39322.jpg",
    icon: game.icon,
    url: url,
    category: "Science"
  };
}).filter((g: any) => g.url !== "");

export default function Games() {
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Games");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // API Games State
  const [apiGames, setApiGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const INITIAL_LOAD = 15;
  const LOAD_MORE = 15;
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);

  // Game Play State
  const [activeGame, setActiveGame] = useState<any>(null);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const response = await getAllGames({});
        if (isMounted) {
          const transformedApiGames = (response.data?.data || []).map((game: any, index: number) => ({
            id: game.id || `api-${index}`,
            title: game.title || "Untitled Game",
            category: game.category || "Literacy",
            skills: game.skills && game.skills.length > 0 ? game.skills : ["Learning"],
            // Provided a generic math/literacy thumbnail fallback
            thumbnail: "https://img.freepik.com/free-vector/colorful-abstract-geometric-background_1308-39908.jpg",
            icon: game.topicIcon,
            url: game.url,
          }));
          setApiGames(transformedApiGames);
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchGames();
    return () => { isMounted = false; };
  }, []);

  // Responsive columns calculation
  let numColumns = 1;
  if (width >= 900) numColumns = 3;
  else if (width >= 600) numColumns = 2;

  // Filtering games based on search and category combining local AND API games
  const buildFilteredGames = () => {
    let all = [...PARSED_SCIENCE_GAMES, ...apiGames];

    // Deduplicate by URL
    const uniqueMap = new Map();
    all.forEach(game => {
      if (game.url && !uniqueMap.has(game.url)) {
        uniqueMap.set(game.url, game);
      }
    });
    all = Array.from(uniqueMap.values());

    if (selectedCategory !== "All Games") {
      const catTarget = selectedCategory.toLowerCase();
      all = all.filter((g) => {
        const gameCat = (g.category || "").toLowerCase();
        // Matching rules based on old app categorizations (e.g., 'Rhymes and Stories' might be saved as 'rhymes')
        if (catTarget.includes("rhymes") && gameCat.includes("rhymes")) return true;
        return gameCat === catTarget || gameCat.includes(catTarget);
      });
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      all = all.filter((g) => (g.title || "").toLowerCase().includes(q));
    }

    // Sort alphabetically by title
    all.sort((a, b) => {
      const titleA = a.title || "";
      const titleB = b.title || "";
      return titleA.localeCompare(titleB);
    });

    return all;
  };

  const filteredGames = buildFilteredGames();

  // Cut down the full list to pagination bounds
  const paginatedGames = filteredGames.slice(0, visibleCount);

  // Load more function attached to FlatList
  const handleLoadMore = () => {
    if (visibleCount < filteredGames.length) {
      setVisibleCount((prev) => prev + LOAD_MORE);
    }
  };

  // Select a featured game (e.g., the first one or a specific one)
  const featuredGame = filteredGames.length > 0 ? filteredGames[0] : null;

  const handleOpenGame = async (game: any) => {
    setActiveGame(game);
    // Hide status and navigation bars for full immersion
    StatusBar.setHidden(true);
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    }
    // Switch orientation to landscape
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  const handleCloseGame = async () => {
    setShowKebabMenu(false);
    // Restore orientation back to portrait
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

    // Restore status and navigation bars
    StatusBar.setHidden(false);
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("visible");
      await NavigationBar.setBehaviorAsync("inset-swipe");
    }
    setActiveGame(null);
  };

  const handleReloadGame = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setShowKebabMenu(false);
  };

  // Exact theme color mappings from the main web application (index.css)
  const getCategoryTheme = (category: string) => {
    const catTarget = (category || "").toLowerCase();

    // Literacy (Coral / Primary: hsl(348, 90%, 65%))
    if (catTarget.includes("literacy")) return { bg: "bg-[#fb4f79]/10", border: "border-[#fb4f79]", text: "text-[#fb4f79]", badgeBg: "bg-[#fb4f79]/20" };

    // Numeracy (Sapphire / Secondary: hsl(205, 85%, 58%))
    if (catTarget.includes("numeracy") || catTarget.includes("math")) return { bg: "bg-[#389cf6]/10", border: "border-[#389cf6]", text: "text-[#389cf6]", badgeBg: "bg-[#389cf6]/20" };

    // Science (Orchid: hsl(265, 75%, 65%))
    if (catTarget.includes("science")) return { bg: "bg-[#935cee]/10", border: "border-[#935cee]", text: "text-[#935cee]", badgeBg: "bg-[#935cee]/20" };

    // Rhymes & Stories (Sun / Accent: hsl(45, 95%, 55%))
    if (catTarget.includes("rhyme") || catTarget.includes("stor")) return { bg: "bg-[#f9cd1a]/15", border: "border-[#f9cd1a]", text: "text-[#d1a700]", badgeBg: "bg-[#f9cd1a]/30" };

    // Default (Teal: hsl(175, 70%, 50%))
    return { bg: "bg-[#26d9c6]/10", border: "border-[#26d9c6]", text: "text-[#1fae9e]", badgeBg: "bg-[#26d9c6]/20" };
  };

  const renderGameCard = ({ item }: { item: any }) => {
    const theme = getCategoryTheme(item.category);

    return (
      <View style={{ flex: 1 / numColumns, padding: 8 }}>
        <TouchableOpacity
          activeOpacity={0.8}
          className={`rounded-3xl overflow-hidden shadow-md shadow-black/5 bg-white`}
          onPress={() => handleOpenGame(item)}
        >
          <Image
            source={{ uri: item.thumbnail }}
            className={`w-full h-36 ${theme.bg}`}
            resizeMode="cover"
          />
          <View className="px-4 py-3 bg-white/60">
            <View className="flex-row items-center space-x-2 mb-1">
              <View className={`${theme.badgeBg} px-2.5 py-1 rounded-full flex-row items-center shadow-sm`}>
                <Text className={`text-[10px] ${theme.text} font-black tracking-wide uppercase`}>{item.category}</Text>
              </View>
            </View>
            <Text className="text-base font-extrabold text-gray-800 leading-tight mt-1" numberOfLines={2}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-sky-50">
      <View className="px-5 py-4 bg-white shadow-sm shadow-gray-200/50 z-10 flex-row justify-between items-center hidden">
        {/* Placeholder for header space if needed */}
      </View>

      <FlatList
        data={paginatedGames}
        key={String(numColumns)} // Force re-render grid on column change
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 12, paddingBottom: 100 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          visibleCount < filteredGames.length ? (
            <View className="py-4 flex items-center justify-center">
              <View className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="py-20 items-center justify-center">
              <Text className="text-gray-400 font-bold text-lg">No games found for "{searchQuery}"</Text>
            </View>
          ) : (
            <View className="py-20 flex items-center justify-center">
              <View className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </View>
          )
        }
        ListHeaderComponent={
          <View className="mb-6 px-2">
            {/* Header Layout */}
            <View className="bg-[#fbc923] rounded-[24px] p-5 mb-6 mx-1 shadow-sm">
              <View className="flex-row items-center mb-1">
                <Gamepad2 size={28} color="white" strokeWidth={2.5} />
                <Text className="text-3xl font-black text-white tracking-tight ml-2.5">Learning Games</Text>
              </View>
              <Text className="text-white/95 text-sm font-semibold ml-[38px] mt-1">Play to learn - phonics, numbers, science, and more!</Text>
            </View>

            {/* Feature Games Banner */}
            {featuredGame && (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleOpenGame(featuredGame)}
                className="bg-[#f9cd1a] rounded-3xl overflow-hidden mb-8 h-56 shadow-xl shadow-[#f9cd1a]/40 relative"
              >
                <Image
                  source={{ uri: featuredGame.thumbnail || "https://img.freepik.com/free-vector/colorful-abstract-geometric-background_1308-39908.jpg" }}
                  className="absolute w-full h-full opacity-60"
                  resizeMode="cover"
                />
                <View className="w-full h-full flex-col justify-end p-6 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                  <View className="bg-white/20 self-start px-3.5 py-1.5 rounded-full mb-3 ml-1 shadow-sm border border-white/40 backdrop-blur-md">
                    <Text className="text-white text-xs font-black tracking-widest">⭐ FEATURED GAME</Text>
                  </View>
                  <Text className="text-white text-3xl font-black shadow-lg ml-1" numberOfLines={1}>{featuredGame.title}</Text>
                  <Text className="text-white/90 text-sm mt-1 mb-1 font-bold ml-1">Tap here to start playing right away!</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Search and Filter Row */}
            <View className="flex-row items-center bg-white rounded-3xl border-2 border-sky-100 p-2 py-1.5 shadow-sm shadow-sky-100 mb-4">
              <Search strokeWidth={3} size={22} className="text-sky-400 ml-4 mr-2" />
              <TextInput
                placeholder="Find a game..."
                placeholderTextColor="#A0ABC0"
                className="flex-1 h-12 text-base font-bold text-gray-800"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setVisibleCount(INITIAL_LOAD); // Reset pagination on search
                }}
                style={{ paddingVertical: 0 }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                className={`p-3 rounded-2xl ml-2 ${selectedCategory !== "All Games" ? 'bg-primary' : 'bg-sky-50'}`}
                onPress={() => setIsFilterModalVisible(true)}
              >
                <Filter strokeWidth={2.5} size={20} className={selectedCategory !== "All Games" ? "text-white" : "text-sky-500"} />
              </TouchableOpacity>
            </View>

            {/* Active Category Display */}
            {selectedCategory !== "All Games" && (
              <View className="flex-row items-center mb-5 ml-2">
                <Text className="text-sky-600 text-sm font-bold mr-2">Category Filter:</Text>
                <View className="bg-white border-2 border-primary border-dashed px-4 py-1.5 rounded-full flex-row items-center shadow-sm">
                  <Text className="text-primary text-sm font-black">{selectedCategory}</Text>
                </View>
              </View>
            )}
          </View>
        }
        renderItem={renderGameCard}
      />

      {/* Filter Modal */}
      <Modal visible={isFilterModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-gray-800">Filter Games</Text>
              <TouchableOpacity
                activeOpacity={0.7}
                className="bg-gray-100 p-2 rounded-full"
                onPress={() => setIsFilterModalVisible(false)}
              >
                <X size={20} className="text-gray-600" />
              </TouchableOpacity>
            </View>

            <View className="flex-col gap-2 mb-6">
              {CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  className={`flex-row items-center justify-between p-4 rounded-2xl ${selectedCategory === cat ? 'bg-primary/10 border border-primary/20' : 'bg-transparent border border-gray-100'}`}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(INITIAL_LOAD); // Reset pagination on filter
                    setIsFilterModalVisible(false);
                  }}
                >
                  <Text className={`text-base font-medium ${selectedCategory === cat ? 'text-primary font-bold' : 'text-gray-700'}`}>{cat}</Text>
                  {selectedCategory === cat && <Check size={20} className="text-primary" />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Game WebView Modal */}
      <Modal
        visible={activeGame !== null}
        animationType="fade"
        statusBarTranslucent={true}
        supportedOrientations={['landscape', 'portrait']}
        presentationStyle="fullScreen"
      >
        <View className="flex-1 bg-black">
          {Platform.OS === "ios" && <StatusBar hidden={true} />}

          {activeGame && (
            <WebView
              ref={webViewRef}
              source={{ uri: activeGame.url }}
              style={{ flex: 1, backgroundColor: 'black' }}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              injectedJavaScript={`
                (function() {
                  window.close = function() {
                    window.ReactNativeWebView.postMessage('closeGame');
                  };
                  window.history.back = function() {
                    window.ReactNativeWebView.postMessage('closeGame');
                  };
                  window.addEventListener('message', function(event) {
                    var msg = event.data;
                    if (typeof msg === 'string' && (msg.toLowerCase() === 'close' || msg.toLowerCase() === 'exit' || msg.toLowerCase() === 'quit')) {
                      window.ReactNativeWebView.postMessage('closeGame');
                    }
                  });
                })();
                true;
              `}
              onMessage={(event) => {
                if (event.nativeEvent.data === 'closeGame') {
                  handleCloseGame();
                }
              }}
            />
          )}

          {/* Overlay to close kebab menu if clicking outside */}
          {showKebabMenu && (
            <TouchableOpacity
              activeOpacity={1}
              className="absolute inset-0"
              onPress={() => setShowKebabMenu(false)}
            />
          )}

          {/* Translucent Kebab Button Array Base */}
          <View className="absolute top-3 right-3">
            {showKebabMenu ? (
              <View className="bg-black/80 rounded-2xl shadow-lg border border-white/10 overflow-hidden min-w-[130px]">
                <TouchableOpacity
                  activeOpacity={0.7}
                  className="px-4 py-3 border-b gap-2 border-white/10 flex-row items-center"
                  onPress={handleReloadGame}
                >
                  <RefreshCw size={16} color="white" />
                  <Text className="text-white font-medium text-sm">Reload</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  className="px-4 py-3 gap-2 flex-row items-center"
                  onPress={handleCloseGame}
                >
                  <LogOut size={16} color="#ef4444" />
                  <Text className="text-red-500 font-medium text-sm">Exit</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                className="h-10 w-10 bg-black/50 border border-white/20 rounded-full items-center justify-center backdrop-blur-md shadow-lg"
                onPress={() => setShowKebabMenu(true)}
              >
                <MoreVertical size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
