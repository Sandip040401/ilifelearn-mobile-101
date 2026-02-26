// components/WebVRViewerModal.tsx
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import * as ScreenOrientation from "expo-screen-orientation";
import { createVideoPlayer, VideoView } from "expo-video";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LANGUAGE_ORDER = [
  "english (india)",
  "english (us)",
  "english (uk)",
  "hindi",
  "marathi",
  "malayalam",
  "punjabi",
  "gujarati",
  "telugu",
  "kannada",
  "tamil",
  "odia",
  "bengali",
];
const DIFFICULTY_ORDER = ["basic", "intermediate", "advance", "advanced"];
const norm = (s: string) => (s || "").trim().toLowerCase();
const ucFirst = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

interface WebVRViewerModalProps {
  visible: boolean;
  onClose: () => void;
  assetTitle: string;
  folderName: string;
  assetData: any;
}

export function WebVRViewerModal({
  visible,
  onClose,
  assetTitle,
  folderName,
  assetData,
}: WebVRViewerModalProps) {
  const insets = useSafeAreaInsets();

  const items: any[] = assetData?.webvr || [];
  const videoFile = useMemo(
    () => items.find((m) => m.type === "video"),
    [items],
  );
  const audioFiles = useMemo(
    () => items.filter((m) => m.type === "audio"),
    [items],
  );
  const hasAudio = audioFiles.length > 0;
  const videoUrl = videoFile?.url || "";
  const isImmersive = assetData?.isImmersive === true;

  const [mode, setMode] = useState<"audio" | "video">("audio");
  const [isMuted, setIsMuted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [selectedLanguage, setSelectedLang] = useState("");
  const [selectedDifficulty, setSelectedDiff] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false); // ← new

  const drawerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current; // ← new

  // ── Header show/hide ──
  const showHeader = () => {
    setHeaderVisible(true);
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const hideHeader = () => {
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setHeaderVisible(false);
      // Also close drawer when header hides
      if (menuOpen) closeMenu();
    });
  };

  const toggleHeader = () => {
    if (headerVisible) {
      hideHeader();
    } else {
      showHeader();
    }
  };

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(drawerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  };

  // ── Player: recreate when videoUrl changes ──
  const videoUrlRef = useRef(videoUrl);
  const playerRef = useRef(
    createVideoPlayer(videoUrl ? { uri: videoUrl } : null),
  );

  if (videoUrl !== videoUrlRef.current) {
    videoUrlRef.current = videoUrl;
    try {
      playerRef.current.release();
    } catch {}
    playerRef.current = createVideoPlayer(videoUrl ? { uri: videoUrl } : null);
  }

  const player = playerRef.current;

  useEffect(() => {
    return () => {
      try {
        playerRef.current.release();
      } catch {}
    };
  }, []);

  // ── Close handler ──
  const isClosing = useRef(false);
  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    try {
      audioPlayer?.pause();
    } catch {}
    try {
      player.pause();
    } catch {}
    closeMenu();
    onClose();
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(() => {});
    setTimeout(() => {
      isClosing.current = false;
    }, 500);
  }, [onClose, audioPlayer, player]);

  // ── Modal open/close lifecycle ──
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setMode("audio");
      setIsMuted(false);
      setVideoReady(false);
      setVideoError(false);
      setIsSwitching(false);
      setMenuOpen(false);
      setHeaderVisible(false); // ← reset: header hidden on open
      drawerAnim.setValue(0);
      headerAnim.setValue(0); // ← reset
      if (videoUrl) {
        try {
          player.loop = true;
          player.muted = true;
          player.currentTime = 0;
        } catch {}
        player.play();
      }
    } else {
      try {
        player.pause();
      } catch {}
    }
  }, [visible, videoUrl]);

  // ─── Data maps ───────────────────────────────
  const byLanguage = useMemo(() => {
    return audioFiles.reduce((acc: any, a: any) => {
      const lang = norm(a.language || a.keyword);
      const diff = norm(a.difficulty);
      if (!lang || !diff) return acc;
      acc[lang] ??= {};
      acc[lang][diff] = a;
      return acc;
    }, {});
  }, [audioFiles]);

  const languageLabels = useMemo(() => {
    return audioFiles.reduce((m: any, a: any) => {
      const key = norm(a.language || a.keyword);
      if (!key) return m;
      if (!m[key]) m[key] = a.language || a.keyword || key;
      return m;
    }, {});
  }, [audioFiles]);

  const languages = useMemo(() => {
    return Object.keys(byLanguage).sort((a, b) => {
      const ai = LANGUAGE_ORDER.indexOf(a);
      const bi = LANGUAGE_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [byLanguage]);

  const difficultiesForLang = useMemo(() => {
    if (!selectedLanguage) return [];
    return Object.keys(byLanguage[selectedLanguage] || {}).sort((a, b) => {
      const ai = DIFFICULTY_ORDER.indexOf(a);
      const bi = DIFFICULTY_ORDER.indexOf(b);
      if (ai !== -1 || bi !== -1) {
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      }
      return a.localeCompare(b);
    });
  }, [byLanguage, selectedLanguage]);

  const selectedAudioObj = useMemo(() => {
    if (!selectedLanguage || !selectedDifficulty) return null;
    return byLanguage[selectedLanguage]?.[selectedDifficulty] || null;
  }, [byLanguage, selectedLanguage, selectedDifficulty]);

  useEffect(() => {
    if (!languages.length) return;
    setSelectedLang((prev) => {
      if (prev && languages.includes(prev)) return prev;
      return languages.includes("english (india)")
        ? "english (india)"
        : languages[0];
    });
  }, [languages]);

  useEffect(() => {
    if (!selectedLanguage) return;
    const diffs = Object.keys(byLanguage[selectedLanguage] || {});
    setSelectedDiff((prev) => {
      if (prev && diffs.includes(prev)) return prev;
      return diffs.includes("basic") ? "basic" : diffs[0] || "";
    });
  }, [selectedLanguage, byLanguage]);

  // ── expo-audio ──
  const audioPlayer = useAudioPlayer(
    selectedAudioObj?.url && mode === "audio" && visible
      ? { uri: selectedAudioObj.url }
      : null,
  );
  const lastAudioUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!audioPlayer || mode !== "audio" || !selectedAudioObj?.url || !visible)
      return;
    if (lastAudioUrl.current === selectedAudioObj.url) return;
    lastAudioUrl.current = selectedAudioObj.url;
    const t = setTimeout(() => {
      try {
        audioPlayer.loop = true;
        audioPlayer.volume = isMuted ? 0 : 1;
        audioPlayer.play();
      } catch {}
      setIsSwitching(false);
    }, 80);
    return () => clearTimeout(t);
  }, [audioPlayer, selectedAudioObj?.url, mode, visible]);

  useEffect(() => {
    if (!audioPlayer) return;
    try {
      audioPlayer.volume = isMuted ? 0 : 1;
    } catch {}
  }, [isMuted]);

  useEffect(() => {
    if (!visible) {
      try {
        audioPlayer?.pause();
      } catch {}
    }
  }, [visible]);

  useEffect(() => {
    try {
      player.muted = mode === "audio" ? true : isMuted;
    } catch {}
  }, [mode, isMuted]);

  const switchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleModeChange = useCallback(
    (newMode: "audio" | "video") => {
      if (newMode === mode || isClosing.current) return;
      if (switchDebounce.current) clearTimeout(switchDebounce.current);
      setIsSwitching(true);
      setMode(newMode);
      switchDebounce.current = setTimeout(() => {
        try {
          if (newMode === "video") {
            audioPlayer?.pause();
            player.muted = isMuted;
            player.currentTime = 0;
            if (!player.playing) player.play();
          } else {
            player.muted = true;
            if (!player.playing) player.play();
          }
        } catch {}
        setIsSwitching(false);
      }, 150);
    },
    [mode, audioPlayer, player, isMuted],
  );

  const handleLangChange = useCallback(
    (lang: string) => {
      if (lang === selectedLanguage || isClosing.current) return;
      lastAudioUrl.current = null;
      setIsSwitching(true);
      setSelectedLang(lang);
    },
    [selectedLanguage],
  );

  const handleDiffChange = useCallback(
    (diff: string) => {
      if (diff === selectedDifficulty || isClosing.current) return;
      lastAudioUrl.current = null;
      setIsSwitching(true);
      setSelectedDiff(diff);
    },
    [selectedDifficulty],
  );

  const handleRestart = useCallback(() => {
    try {
      player.currentTime = 0;
      if (!player.playing) player.play();
      if (mode === "audio" && audioPlayer) {
        lastAudioUrl.current = null;
        audioPlayer.seekTo(0);
        audioPlayer.play();
      }
    } catch {}
  }, [player, audioPlayer, mode]);

  const sideInset = Math.max(insets.left, insets.right, 12);

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
  });

  // Header slides down from top
  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0], // ← slides in from above
  });

  return (
    <Modal
      visible={visible}
      onRequestClose={handleClose}
      animationType="fade"
      statusBarTranslucent
      supportedOrientations={["landscape", "landscape-left", "landscape-right"]}
    >
      <StatusBar hidden />
      <View style={styles.root}>
        {/* ── VIDEO ── */}
        {videoUrl ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            onFirstFrameRender={() => setVideoReady(true)}
          />
        ) : (
          <View style={styles.noVideo}>
            <Text style={{ fontSize: 48 }}>🌐</Text>
            <Text style={styles.noVideoText}>No video content available</Text>
          </View>
        )}

        {/* ── PULL TAB — always visible at top center ── */}
        <TouchableOpacity
          onPress={toggleHeader}
          style={styles.pullTab}
          activeOpacity={0.8}
        >
          <Ionicons
            name={headerVisible ? "chevron-up" : "chevron-down"}
            size={14}
            color="#fff"
          />
        </TouchableOpacity>

        {/* ── HEADER — slides in when headerVisible ── */}
        {headerVisible && (
          <Animated.View
            style={[
              styles.header,
              {
                paddingHorizontal: sideInset,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={handleClose}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <View style={styles.titleBlock}>
              <Text style={styles.titleText} numberOfLines={1}>
                {assetTitle}
              </Text>
              <Text style={styles.subtitleText} numberOfLines={1}>
                {folderName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsMuted((m) => !m)}
              style={styles.iconBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={menuOpen ? closeMenu : openMenu}
              style={[styles.iconBtn, menuOpen && styles.iconBtnActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── BOTTOM DRAWER ── */}
        {menuOpen && (
          <>
            <Pressable style={styles.drawerBackdrop} onPress={closeMenu} />
            <Animated.View
              style={[
                styles.drawer,
                {
                  paddingHorizontal: sideInset,
                  transform: [{ translateY: drawerTranslateY }],
                },
              ]}
            >
              <View style={styles.drawerHandle} />
              <View style={styles.drawerRow}>
                <Text style={styles.drawerSectionLabel}>Controls</Text>
                <View style={styles.drawerRowButtons}>
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="arrow-back" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleRestart}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="refresh" size={14} color="#fff" />
                    <Text style={styles.actionBtnText}>Restart</Text>
                  </TouchableOpacity>
                  {isImmersive && (
                    <TouchableOpacity
                      onPress={() =>
                        handleModeChange(mode === "video" ? "audio" : "video")
                      }
                      style={[
                        styles.actionBtn,
                        mode === "video" && styles.actionBtnImmersiveActive,
                      ]}
                    >
                      <Ionicons
                        name="glasses-outline"
                        size={14}
                        color={mode === "video" ? "#E8A2AF" : "#fff"}
                      />
                      <Text
                        style={[
                          styles.actionBtnText,
                          mode === "video" && { color: "#E8A2AF" },
                        ]}
                      >
                        {mode === "video" ? "Immersive ON" : "Immersive"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {hasAudio && mode === "audio" && (
                <>
                  <View style={styles.drawerRow}>
                    <Text style={styles.drawerSectionLabel}>Language</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      <View style={styles.chipRow}>
                        {languages.map((lang) => (
                          <TouchableOpacity
                            key={lang}
                            onPress={() => handleLangChange(lang)}
                            style={[
                              styles.chip,
                              selectedLanguage === lang
                                ? styles.chipActiveTeal
                                : styles.chipInactive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selectedLanguage === lang && { color: "#000" },
                              ]}
                            >
                              {languageLabels[lang] || ucFirst(lang)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                  <View style={styles.drawerRow}>
                    <Text style={styles.drawerSectionLabel}>Level</Text>
                    <View style={styles.chipRow}>
                      {difficultiesForLang.map((diff) => (
                        <TouchableOpacity
                          key={diff}
                          onPress={() => handleDiffChange(diff)}
                          style={[
                            styles.chip,
                            selectedDifficulty === diff
                              ? styles.chipActiveTeal
                              : styles.chipInactive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              selectedDifficulty === diff && { color: "#000" },
                            ]}
                          >
                            {ucFirst(diff)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
            </Animated.View>
          </>
        )}

        {/* ── Switching overlay ── */}
        {isSwitching && videoReady && !isClosing.current && (
          <View style={[styles.overlay, { zIndex: 10 }]}>
            <ActivityIndicator size="small" color="#4ECDC4" />
            <Text style={styles.overlaySubText}>Switching...</Text>
          </View>
        )}

        {/* ── Loading overlay ── */}
        {!videoReady && !videoError && videoUrl && (
          <View style={[styles.overlay, { zIndex: 10 }]}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.overlayText}>Loading WebVR Experience...</Text>
            <Text style={styles.overlaySubText}>
              Preparing your immersive content
            </Text>
          </View>
        )}

        {/* ── Error overlay ── */}
        {videoError && (
          <View style={[styles.overlay, { zIndex: 10 }]}>
            <Ionicons name="alert-circle" size={64} color="#EF4444" />
            <Text style={styles.overlayText}>Failed to Load</Text>
            <Text
              style={[
                styles.overlaySubText,
                { textAlign: "center", paddingHorizontal: 32 },
              ]}
            >
              Unable to load the WebVR experience. Check your connection and try
              again.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setVideoError(false);
                setVideoReady(false);
              }}
              style={styles.retryBtn}
            >
              <Text style={{ color: "#000", fontWeight: "700" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  noVideo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
  },
  noVideoText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginTop: 12,
  },

  // ── Pull tab — always at top center ──
  pullTab: {
    position: "absolute",
    top: 0,
    alignSelf: "center", // ← won't work on absolute, use left trick below
    left: "50%", // ← fallback, overridden by marginLeft below
    zIndex: 40, // above header
    backgroundColor: "rgba(0,0,0,0.55)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    // Center horizontally
    transform: [{ translateX: -28 }], // half of approx width (56)
  },

  // Header — slides down from top
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titleBlock: { flex: 1, minWidth: 0 },
  titleText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  subtitleText: { fontSize: 10, color: "rgba(255,255,255,0.6)" },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnActive: { backgroundColor: "rgba(255,255,255,0.25)" },

  drawerBackdrop: { ...StyleSheet.absoluteFillObject, zIndex: 19 },
  drawer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: "rgba(15,20,30,0.96)",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  drawerHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 4,
  },
  drawerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  drawerSectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    width: 52,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  drawerRowButtons: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  actionBtnImmersiveActive: {
    backgroundColor: "rgba(232,162,175,0.15)",
    borderColor: "#E8A2AF",
  },
  actionBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  chipRow: { flexDirection: "row", gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  chipActiveTeal: { backgroundColor: "#4ECDC4" },
  chipInactive: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  chipText: { fontSize: 11, fontWeight: "600", color: "#fff" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.88)",
  },
  overlayText: {
    marginTop: 16,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  overlaySubText: {
    marginTop: 6,
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  retryBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
});
