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
  const [canStartPlayback, setCanStartPlayback] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [selectedLanguage, setSelectedLang] = useState("");
  const [selectedDifficulty, setSelectedDiff] = useState("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [videoViewMounted, setVideoViewMounted] = useState(false); // ← track mount

  const drawerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const lastAudioUrl = useRef<string | null>(null);
  const canStartPlaybackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isClosing = useRef(false);

  // ── Player: created lazily, only when videoUrl is known ──
  // Use a ref so it persists across renders without re-creating
  const playerRef = useRef<ReturnType<typeof createVideoPlayer> | null>(null);

  // Always get/create the player for current videoUrl
  const getPlayer = useCallback(() => {
    if (!videoUrl) return null;
    if (!playerRef.current) {
      playerRef.current = createVideoPlayer({ uri: videoUrl });
    }
    return playerRef.current;
  }, [videoUrl]);

  // Recreate player when videoUrl changes
  const lastVideoUrlRef = useRef("");
  if (videoUrl && videoUrl !== lastVideoUrlRef.current) {
    lastVideoUrlRef.current = videoUrl;
    if (playerRef.current) {
      try {
        playerRef.current.release();
      } catch {}
      playerRef.current = null;
    }
    if (videoUrl) {
      playerRef.current = createVideoPlayer({ uri: videoUrl });
    }
  }

  // ── Release on unmount ──
  useEffect(() => {
    return () => {
      if (canStartPlaybackTimerRef.current)
        clearTimeout(canStartPlaybackTimerRef.current);
      if (playerRef.current) {
        try {
          playerRef.current.release();
        } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  // ── Header show/hide ──
  const showHeader = useCallback(() => {
    setHeaderVisible(true);
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [headerAnim]);

  const closeMenu = useCallback(() => {
    Animated.timing(drawerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setMenuOpen(false));
  }, [drawerAnim]);

  const hideHeader = useCallback(() => {
    Animated.timing(headerAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setHeaderVisible(false);
      closeMenu();
    });
  }, [headerAnim, closeMenu]);

  const toggleHeader = useCallback(() => {
    if (headerVisible) hideHeader();
    else showHeader();
  }, [headerVisible, hideHeader, showHeader]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    Animated.spring(drawerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [drawerAnim]);

  // ── expo-audio ──
  const [selectedLanguage_s, setSelectedLang_s] = useState("");
  const [selectedDifficulty_s, setSelectedDiff_s] = useState("");

  // ─── Data maps ───
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

  // ── Auto-select defaults ──
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

  const audioPlayer = useAudioPlayer(
    selectedAudioObj?.url && mode === "audio" && visible
      ? { uri: selectedAudioObj.url }
      : null,
  );

  // ── Modal open/close lifecycle ──
  useEffect(() => {
    if (visible) {
      isClosing.current = false;
      if (canStartPlaybackTimerRef.current)
        clearTimeout(canStartPlaybackTimerRef.current);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      setMode("audio");
      setIsMuted(false);
      setVideoReady(false);
      setCanStartPlayback(false);
      setVideoError(false);
      setIsSwitching(false);
      setMenuOpen(false);
      setHeaderVisible(false);
      setVideoViewMounted(false); // ← reset mount flag
      drawerAnim.setValue(0);
      headerAnim.setValue(0);
      lastAudioUrl.current = null;
      // ⚠️ Do NOT call player.play() here — VideoView isn't mounted yet
      // Play is triggered by onVideoViewMount effect below
    } else {
      if (canStartPlaybackTimerRef.current)
        clearTimeout(canStartPlaybackTimerRef.current);
      const p = playerRef.current;
      if (p) {
        try {
          p.pause();
        } catch {}
      }
      try {
        audioPlayer?.pause();
      } catch {}
      lastAudioUrl.current = null;
    }
  }, [visible]);

  // ── Start video AFTER VideoView is confirmed mounted ──
  // This is the fix: wait for videoViewMounted before calling play()
  useEffect(() => {
    if (!videoViewMounted || !videoUrl || !visible) return;
    const p = playerRef.current;
    if (!p) return;
    try {
      p.loop = true;
      p.muted = true;
      p.currentTime = 0;
      p.play();
    } catch (e) {
      console.warn("Video play error:", e);
      setVideoError(true);
    }
  }, [videoViewMounted, videoUrl, visible]);

  // ── Audio: fires when canStartPlayback opens (initial load) ──
  useEffect(() => {
    if (!canStartPlayback || !visible || mode !== "audio") return;
    if (!audioPlayer || !selectedAudioObj?.url) return;
    if (lastAudioUrl.current === selectedAudioObj.url) return;
    lastAudioUrl.current = selectedAudioObj.url;
    try {
      audioPlayer.loop = true;
      audioPlayer.volume = isMuted ? 0 : 1;
      audioPlayer.play();
    } catch {}
    setIsSwitching(false);
  }, [canStartPlayback, visible, audioPlayer, selectedAudioObj?.url, mode]);

  // ── Audio: fires when lang/diff changes after already loaded ──
  useEffect(() => {
    if (!canStartPlayback || !visible || mode !== "audio") return;
    if (!audioPlayer || !selectedAudioObj?.url) return;
    if (lastAudioUrl.current === selectedAudioObj.url) return;
    lastAudioUrl.current = selectedAudioObj.url;
    setIsSwitching(true);
    try {
      audioPlayer.loop = true;
      audioPlayer.volume = isMuted ? 0 : 1;
      audioPlayer.play();
    } catch {}
    setTimeout(() => setIsSwitching(false), 150);
  }, [selectedAudioObj?.url]);

  // ── Mute sync ──
  useEffect(() => {
    if (!audioPlayer) return;
    try {
      audioPlayer.volume = isMuted ? 0 : 1;
    } catch {}
  }, [isMuted]);

  // ── Pause audio when modal closes ──
  useEffect(() => {
    if (!visible) {
      lastAudioUrl.current = null;
      try {
        audioPlayer?.pause();
      } catch {}
    }
  }, [visible]);

  // ── Video mute sync ──
  useEffect(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      p.muted = mode === "audio" ? true : isMuted;
    } catch {}
  }, [mode, isMuted]);

  // ── Close handler ──
  const handleClose = useCallback(() => {
    if (isClosing.current) return;
    isClosing.current = true;
    try {
      audioPlayer?.pause();
    } catch {}
    const p = playerRef.current;
    if (p) {
      try {
        p.pause();
      } catch {}
    }
    closeMenu();
    onClose();
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT_UP,
    ).catch(() => {});
    setTimeout(() => {
      isClosing.current = false;
    }, 500);
  }, [onClose, audioPlayer, closeMenu]);

  // ── Mode switch ──
  const switchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleModeChange = useCallback(
    (newMode: "audio" | "video") => {
      if (newMode === mode || isClosing.current) return;
      if (switchDebounce.current) clearTimeout(switchDebounce.current);
      setIsSwitching(true);
      setMode(newMode);
      switchDebounce.current = setTimeout(() => {
        const p = playerRef.current;
        try {
          if (newMode === "video") {
            try {
              audioPlayer?.pause();
            } catch {}
            if (p) {
              p.muted = isMuted;
              p.currentTime = 0;
              if (!p.playing) p.play();
            }
          } else {
            lastAudioUrl.current = null;
            if (p) {
              p.muted = true;
              if (!p.playing) p.play();
            }
          }
        } catch {}
        setIsSwitching(false);
      }, 150);
    },
    [mode, audioPlayer, isMuted],
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
    const p = playerRef.current;
    try {
      if (p) {
        p.currentTime = 0;
        if (!p.playing) p.play();
      }
      if (mode === "audio" && audioPlayer) {
        lastAudioUrl.current = null;
        audioPlayer.seekTo(0);
        audioPlayer.play();
      }
    } catch {}
  }, [audioPlayer, mode]);

  const sideInset = Math.max(insets.left, insets.right, 12);

  const drawerTranslateY = drawerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [220, 0],
  });

  const headerTranslateY = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const player = playerRef.current;

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
        {videoUrl && player ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
            onLayout={() => {
              // ← VideoView is now in the DOM/layout tree — safe to call play
              if (!videoViewMounted) setVideoViewMounted(true);
            }}
            onFirstFrameRender={() => {
              setVideoReady(true);
              if (canStartPlaybackTimerRef.current)
                clearTimeout(canStartPlaybackTimerRef.current);
              canStartPlaybackTimerRef.current = setTimeout(() => {
                setCanStartPlayback(true);
              }, 100);
            }}
          />
        ) : !videoUrl ? (
          <View style={styles.noVideo}>
            <Text style={{ fontSize: 48 }}>🌐</Text>
            <Text style={styles.noVideoText}>No video content available</Text>
          </View>
        ) : null}

        {/* ── PULL TAB ── */}
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

        {/* ── HEADER ── */}
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
        {!canStartPlayback && !videoError && videoUrl && (
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
                setCanStartPlayback(false);
                setVideoViewMounted(false);
                // Recreate the player for retry
                if (playerRef.current) {
                  try {
                    playerRef.current.release();
                  } catch {}
                  playerRef.current = null;
                }
                if (videoUrl) {
                  playerRef.current = createVideoPlayer({ uri: videoUrl });
                  setVideoViewMounted(true); // re-trigger mount effect
                }
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
  pullTab: {
    position: "absolute",
    top: 0,
    left: "50%" as any,
    transform: [{ translateX: -28 }],
    zIndex: 40,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
  },
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
