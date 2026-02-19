import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// ┌──────────────────────────────────────────────────────────────────────┐
// │  REAL STT — uncomment when using a development build               │
// │  Also remove the MOCK STT block further below.                     │
// └──────────────────────────────────────────────────────────────────────┘
// import {
//     ExpoSpeechRecognitionModule,
//     useSpeechRecognitionEvent,
// } from "expo-speech-recognition";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";

import {
    AGE_GROUPS,
    CURRICULUM_LENSES,
    READ_ALOUD_IMAGES,
    READ_ALOUD_SENTENCES,
    READ_ALOUD_STORIES,
    READ_ALOUD_WORDS,
    READING_MODES,
} from "@/data/json/readAloudData";
import { readAloudAttempts } from "@/services/readAloudService";
import useAuthStore from "@/store/authStore";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const shuffleArray = (array: any[], excludeId: any = null) => {
    if (array.length <= 1) return [...array];
    let shuffled: any[];
    let attempts = 0;
    do {
        shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        attempts++;
    } while (excludeId && shuffled[0].id === excludeId && attempts < 5);
    if (excludeId && shuffled[0].id === excludeId && shuffled.length > 1) {
        [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }
    return shuffled;
};

const formatDuration = (seconds: number) => {
    const totalSeconds = Math.floor(seconds || 0);
    if (totalSeconds <= 0) return "0s";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const parts: string[] = [];
    if (hours > 0) {
        parts.push(`${hours}hr`);
        if (minutes > 0) parts.push(`${minutes}m`);
    } else if (minutes > 0) {
        parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);
    } else {
        parts.push(`${secs}s`);
    }
    return parts.join(" ");
};

const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 85) return "#10B981";
    if (accuracy >= 60) return "#F59E0B";
    return "#EF4444";
};

const getAccuracyLabel = (accuracy: number) => {
    if (accuracy >= 85) return "Excellent";
    if (accuracy >= 60) return "Good";
    return "Needs Practice";
};

// ─────────────────────────────────────────────────────────────
// Dropdown Component
// ─────────────────────────────────────────────────────────────
interface DropdownProps {
    label: string;
    items: { value: string; label: string }[];
    selected: string;
    onSelect: (val: string) => void;
    icon?: string;
}

const Dropdown = ({ label, items, selected, onSelect, icon }: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const selectedItem = items.find((i) => i.value === selected);

    return (
        <View className="flex-1">
            <TouchableOpacity
                onPress={() => setOpen(!open)}
                className="flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 py-3"
                activeOpacity={0.7}
            >
                {icon && (
                    <Ionicons name={icon as any} size={16} color="white" style={{ marginRight: 6 }} />
                )}
                <Text className="text-white font-bold text-xs flex-1" numberOfLines={1}>
                    {selectedItem?.label || label}
                </Text>
                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={14} color="white" />
            </TouchableOpacity>

            {open && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    className="absolute top-14 left-0 right-0 bg-white rounded-2xl shadow-xl z-50 border border-slate-100 overflow-hidden"
                    style={{ elevation: 10 }}
                >
                    <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                        {items.map((item) => (
                            <TouchableOpacity
                                key={item.value}
                                onPress={() => {
                                    onSelect(item.value);
                                    setOpen(false);
                                }}
                                className={`px-4 py-3 border-b border-slate-50 ${selected === item.value ? "bg-violet-50" : ""
                                    }`}
                                activeOpacity={0.7}
                            >
                                <Text
                                    className={`text-sm font-semibold ${selected === item.value ? "text-[#9089FC]" : "text-slate-700"
                                        }`}
                                >
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </Animated.View>
            )}
        </View>
    );
};

// ─────────────────────────────────────────────────────────────
// Curriculum Tooltip
// ─────────────────────────────────────────────────────────────
const CurriculumTooltip = ({
    selected,
    onSelect,
}: {
    selected: string;
    onSelect: (id: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const current = CURRICULUM_LENSES.find((c) => c.id === selected);

    return (
        <View>
            <TouchableOpacity
                onPress={() => setOpen(!open)}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30"
                activeOpacity={0.7}
            >
                <Text className="text-lg">{current?.icon || "🌐"}</Text>
            </TouchableOpacity>

            {open && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    className="absolute top-12 right-0 bg-white rounded-2xl shadow-xl z-50 border border-slate-100 overflow-hidden"
                    style={{ width: 220, elevation: 10 }}
                >
                    <View className="p-3 border-b border-slate-100">
                        <Text className="text-xs font-bold text-slate-500 uppercase">
                            Curriculum Lens
                        </Text>
                    </View>
                    {CURRICULUM_LENSES.map((lens) => (
                        <TouchableOpacity
                            key={lens.id}
                            onPress={() => {
                                onSelect(lens.id);
                                setOpen(false);
                            }}
                            className={`flex-row items-center px-4 py-3 border-b border-slate-50 ${selected === lens.id ? "bg-violet-50" : ""
                                }`}
                        >
                            <Text className="text-lg mr-3">{lens.icon}</Text>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-slate-800">{lens.name}</Text>
                                <Text className="text-[10px] text-slate-500">{lens.description}</Text>
                            </View>
                            {selected === lens.id && (
                                <Ionicons name="checkmark-circle" size={18} color="#9089FC" />
                            )}
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}
        </View>
    );
};

// ─────────────────────────────────────────────────────────────
// AI Analysis Panel
// ─────────────────────────────────────────────────────────────
const AIAnalysisPanel = ({
    analysis,
    isAnalyzing,
    transcript,
    onRetry,
    onNext,
    isLastQuestion,
    selectedMode,
}: any) => {
    const pulseAnim = useSharedValue(1);

    useEffect(() => {
        if (isAnalyzing) {
            pulseAnim.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                true
            );
        } else {
            pulseAnim.value = withTiming(1, { duration: 200 });
        }
    }, [isAnalyzing]);

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    if (isAnalyzing) {
        return (
            <View className="items-center py-10">
                <Animated.View style={pulseStyle}>
                    <View className="w-16 h-16 bg-violet-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="sparkles" size={32} color="#9089FC" />
                    </View>
                </Animated.View>
                <Text className="text-slate-700 font-bold text-lg mt-2">Analyzing…</Text>
                <Text className="text-slate-400 text-xs mt-1">
                    Checking your pronunciation
                </Text>
            </View>
        );
    }

    if (!analysis) {
        return (
            <View className="items-center py-10">
                <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                    <Ionicons name="sparkles-outline" size={32} color="#94A3B8" />
                </View>
                <Text className="text-slate-700 font-bold text-lg">Ready to start!</Text>
                <Text className="text-slate-400 text-xs mt-1 text-center px-4">
                    Click the microphone button to begin reading
                </Text>
            </View>
        );
    }

    const accuracy = analysis.accuracy ?? 0;
    const color = getAccuracyColor(accuracy);

    return (
        <Animated.View entering={FadeInDown.duration(400)}>
            {/* Score */}
            <View className="items-center mb-6">
                <View
                    style={{ borderColor: color, borderWidth: 4 }}
                    className="w-24 h-24 rounded-full items-center justify-center mb-3"
                >
                    <Text style={{ color }} className="text-3xl font-black">
                        {accuracy}%
                    </Text>
                </View>
                <Text style={{ color }} className="font-bold text-base">
                    {getAccuracyLabel(accuracy)}
                </Text>
            </View>

            {/* Word/Image mode result */}
            {(selectedMode === "word" || selectedMode === "words") && (
                <View className="bg-slate-50 rounded-2xl p-5 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-slate-500 text-xs font-bold uppercase">
                            Expected
                        </Text>
                        <Text className="text-slate-500 text-xs font-bold uppercase">Spoken</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-slate-800 font-bold text-lg">
                            {analysis.expectedWord}
                        </Text>
                        <Ionicons
                            name={analysis.correct ? "checkmark-circle" : "close-circle"}
                            size={22}
                            color={analysis.correct ? "#10B981" : "#EF4444"}
                        />
                        <Text className="text-slate-800 font-bold text-lg">
                            {analysis.spokenWord}
                        </Text>
                    </View>
                </View>
            )}

            {/* Sentence mode */}
            {selectedMode === "sentence" && analysis.wordAnalysis && (
                <View className="bg-slate-50 rounded-2xl p-5 mb-4">
                    <Text className="text-slate-500 text-xs font-bold uppercase mb-3">
                        Word Analysis
                    </Text>
                    <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                        {analysis.wordAnalysis.map((w: any, i: number) => (
                            <View
                                key={i}
                                className={`px-3 py-1.5 rounded-xl border ${w.correct
                                    ? "bg-emerald-100 border-emerald-200"
                                    : "bg-red-100 border-red-200"
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-bold ${w.correct ? "text-emerald-800" : "text-red-800"
                                        }`}
                                >
                                    {w.word}
                                </Text>
                            </View>
                        ))}
                    </View>
                    {analysis.wpm > 0 && (
                        <View className="flex-row items-center mt-4 bg-blue-50 rounded-xl p-3">
                            <Ionicons name="speedometer" size={18} color="#3B82F6" />
                            <Text className="text-blue-700 font-bold ml-2">
                                {analysis.wpm} WPM
                            </Text>
                            <Text className="text-blue-500 text-xs ml-2">
                                ({formatDuration(analysis.readingTime)})
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Story mode */}
            {selectedMode === "story" && analysis.sentenceAnalysis && (
                <View className="bg-slate-50 rounded-2xl p-5 mb-4">
                    <Text className="text-slate-500 text-xs font-bold uppercase mb-3">
                        Sentence Breakdown
                    </Text>
                    {analysis.sentenceAnalysis.map((s: any, i: number) => (
                        <View key={i} className="flex-row items-start mb-3">
                            <Ionicons
                                name={s.correct ? "checkmark-circle" : "close-circle"}
                                size={18}
                                color={s.correct ? "#10B981" : "#EF4444"}
                                style={{ marginTop: 2, marginRight: 8 }}
                            />
                            <View className="flex-1">
                                <Text className="text-slate-700 text-sm leading-5">{s.sentence}</Text>
                                <Text
                                    className="text-xs font-bold mt-0.5"
                                    style={{ color: getAccuracyColor(s.accuracy) }}
                                >
                                    {s.accuracy}%
                                </Text>
                            </View>
                        </View>
                    ))}
                    {analysis.wpm > 0 && (
                        <View className="flex-row items-center mt-3 bg-blue-50 rounded-xl p-3">
                            <Ionicons name="speedometer" size={18} color="#3B82F6" />
                            <Text className="text-blue-700 font-bold ml-2">
                                {analysis.wpm} WPM
                            </Text>
                            <Text className="text-blue-500 text-xs ml-2">
                                (Target: {analysis.expectedWPM} WPM)
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Transcript */}
            {transcript ? (
                <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
                    <Text className="text-blue-500 text-[10px] font-bold uppercase mb-1.5">
                        Your Speech
                    </Text>
                    <Text className="text-blue-800 text-sm font-medium leading-5">
                        {transcript}
                    </Text>
                </View>
            ) : null}

            {/* Actions */}
            <View className="flex-row mt-2" style={{ gap: 10 }}>
                <TouchableOpacity
                    onPress={onRetry}
                    className="flex-1 flex-row items-center justify-center py-4 rounded-2xl bg-slate-100 border border-slate-200"
                    activeOpacity={0.8}
                >
                    <Ionicons name="refresh" size={18} color="#475569" />
                    <Text className="text-slate-700 font-bold ml-2">Retry</Text>
                </TouchableOpacity>
                {!isLastQuestion && (
                    <TouchableOpacity
                        onPress={onNext}
                        className="flex-1 flex-row items-center justify-center py-4 rounded-2xl bg-[#9089FC]"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white font-bold mr-2">Next</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );
};

// ─────────────────────────────────────────────────────────────
// Draggable Bottom Sheet for AI Analysis
// ─────────────────────────────────────────────────────────────
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const SNAP_HALF = SCREEN_HEIGHT * 0.55;   // initial open height (~55%)
const SNAP_FULL = SCREEN_HEIGHT * 0.92;   // full-screen height
const DISMISS_THRESHOLD = 120;            // drag down px to close

interface AnalysisBottomSheetProps {
    analysisContent: React.ReactNode;
    onClose: () => void;
}

const AnalysisBottomSheet = ({ analysisContent, onClose }: AnalysisBottomSheetProps) => {
    const sheetHeight = useSharedValue(0);
    const backdropOpacity = useSharedValue(0);
    const startY = useRef(0);
    const currentHeight = useRef(SNAP_HALF);
    const scrollRef = useRef<ScrollView>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(false);

    // Animate open on mount
    useEffect(() => {
        sheetHeight.value = withTiming(SNAP_HALF, { duration: 300 });
        backdropOpacity.value = withTiming(1, { duration: 300 });
        currentHeight.current = SNAP_HALF;
    }, []);

    const closeSheet = useCallback(() => {
        sheetHeight.value = withTiming(0, { duration: 250 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        setTimeout(onClose, 260);
    }, [onClose]);

    // PanResponder for drag handle
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dy) > 5,
            onPanResponderGrant: () => {
                startY.current = currentHeight.current;
            },
            onPanResponderMove: (_, gs) => {
                const newHeight = startY.current - gs.dy;
                // Clamp between 100 and SNAP_FULL
                const clamped = Math.max(100, Math.min(newHeight, SNAP_FULL));
                sheetHeight.value = clamped;
            },
            onPanResponderRelease: (_, gs) => {
                const newHeight = startY.current - gs.dy;

                // Dragged down far enough → close
                if (gs.dy > DISMISS_THRESHOLD || (gs.vy > 0.5 && gs.dy > 50)) {
                    closeSheet();
                    return;
                }

                // Dragged up past midpoint between half and full → snap to full
                const midPoint = (SNAP_HALF + SNAP_FULL) / 2;
                if (newHeight > midPoint || gs.vy < -0.5) {
                    sheetHeight.value = withTiming(SNAP_FULL, { duration: 250 });
                    currentHeight.current = SNAP_FULL;
                    setIsFullScreen(true);
                    setScrollEnabled(true);
                } else {
                    sheetHeight.value = withTiming(SNAP_HALF, { duration: 250 });
                    currentHeight.current = SNAP_HALF;
                    setIsFullScreen(false);
                    setScrollEnabled(false);
                }
            },
        })
    ).current;

    const sheetStyle = useAnimatedStyle(() => ({
        height: sheetHeight.value,
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    return (
        <Modal transparent visible statusBarTranslucent onRequestClose={closeSheet}>
            <View className="flex-1 justify-end">
                {/* Backdrop */}
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: "rgba(0,0,0,0.45)",
                        },
                        backdropStyle,
                    ]}
                >
                    <TouchableOpacity
                        className="flex-1"
                        activeOpacity={1}
                        onPress={closeSheet}
                    />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    style={[
                        {
                            backgroundColor: "white",
                            borderTopLeftRadius: 32,
                            borderTopRightRadius: 32,
                            overflow: "hidden",
                            paddingBottom: Platform.OS === "ios" ? 34 : 20,
                        },
                        sheetStyle,
                    ]}
                >
                    {/* Drag handle area */}
                    <View {...panResponder.panHandlers}>
                        <View className="items-center pt-3 pb-2">
                            <View className="w-10 h-1.5 bg-slate-300 rounded-full" />
                        </View>

                        {/* Header */}
                        <View className="flex-row items-center justify-between px-6 pb-3">
                            <View className="flex-row items-center">
                                <Ionicons name="sparkles" size={20} color="#9089FC" />
                                <Text className="text-slate-800 font-black ml-2 text-base">
                                    AI Analysis
                                </Text>
                                {isFullScreen && (
                                    <View className="ml-2 bg-violet-50 px-2 py-0.5 rounded-full">
                                        <Text className="text-[#9089FC] text-[10px] font-bold">
                                            FULL
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={closeSheet}
                                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
                                activeOpacity={0.7}
                            >
                                <Ionicons name="close" size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Content */}
                    <ScrollView
                        ref={scrollRef}
                        className="px-6 flex-1"
                        showsVerticalScrollIndicator={false}
                        scrollEnabled={scrollEnabled}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        bounces={false}
                    >
                        {analysisContent}
                    </ScrollView>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
interface ReadAloudPracticeProps {
    initialMode: string;
    selectedAge: string;
    selectedCurriculum: string;
    onBack: () => void;
}

export default function ReadAloudPractice({ initialMode, selectedAge, selectedCurriculum, onBack }: ReadAloudPracticeProps) {
    const { width } = useWindowDimensions();
    const isTablet = width >= 768;
    const { user } = useAuthStore();

    // ── State ──
    const [selectedMode, setSelectedMode] = useState(initialMode);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [analysis, setAnalysis] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [readingTime, setReadingTime] = useState<number | null>(null);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [displayContent, setDisplayContent] = useState<any[]>([]);
    const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
    const [showModeDropdown, setShowModeDropdown] = useState(false);
    const [showAgeDropdown, setShowAgeDropdown] = useState(false);

    // ── Mock STT state ──
    const [showMockInput, setShowMockInput] = useState(false);
    const [mockText, setMockText] = useState("");

    // ── Refs ──
    const startTimeRef = useRef<number | null>(null);
    const readingTimeRef = useRef<number>(0);

    // ── Pulse animation for recording ──
    const recordPulse = useSharedValue(1);
    useEffect(() => {
        if (isRecording) {
            recordPulse.value = withRepeat(
                withSequence(
                    withTiming(1.25, { duration: 700 }),
                    withTiming(1, { duration: 700 })
                ),
                -1,
                true
            );
        } else {
            recordPulse.value = withTiming(1, { duration: 200 });
        }
    }, [isRecording]);
    const recordPulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: recordPulse.value }],
    }));

    // ── Auto-open analysis modal on phones ──
    useEffect(() => {
        if (!isTablet && (isAnalyzing || analysis)) {
            setShowAnalysisModal(true);
        }
    }, [isAnalyzing, analysis, isTablet]);

    // ┌──────────────────────────────────────────────────────────────────────┐
    // │  REAL STT — uncomment this block when using a development build     │
    // │  and remove the MOCK STT block below.                               │
    // └──────────────────────────────────────────────────────────────────────┘
    // // ─────────────────────────────────────────────────────────
    // // expo-speech-recognition event handlers
    // // ─────────────────────────────────────────────────────────
    // useSpeechRecognitionEvent("start", () => {
    //     setIsRecording(true);
    //     setTranscript("");
    //     setAnalysis(null);
    //     startTimeRef.current = Date.now();
    // });
    //
    // useSpeechRecognitionEvent("end", () => {
    //     setIsRecording(false);
    //     if (startTimeRef.current) {
    //         const duration = (Date.now() - startTimeRef.current) / 1000;
    //         readingTimeRef.current = duration;
    //         setReadingTime(duration);
    //     }
    // });
    //
    // useSpeechRecognitionEvent("result", (event) => {
    //     const results = event.results;
    //     if (results && results.length > 0) {
    //         const latestResult = results[results.length - 1];
    //         let fullTranscript = "";
    //         for (const result of results) {
    //             if (result.transcript) {
    //                 fullTranscript += result.transcript + " ";
    //             }
    //         }
    //         fullTranscript = fullTranscript.trim();
    //         setTranscript(fullTranscript);
    //         if (latestResult.confidence > 0 || !event.isFinal) {
    //             // analysis triggered on "end" event
    //         }
    //     }
    // });
    //
    // useSpeechRecognitionEvent("error", (event) => {
    //     setIsRecording(false);
    //     console.warn("Speech recognition error:", event.error, event.message);
    //     if (event.error !== "no-speech") {
    //         Alert.alert("Speech Error", event.message || "Please try again.");
    //     }
    // });

    // ─────────────────────────────────────────────────────────
    // Content logic
    // ─────────────────────────────────────────────────────────
    const getContent = useCallback(() => {
        if (!selectedAge || !selectedMode) return [];
        switch (selectedMode) {
            case "word":
                return READ_ALOUD_IMAGES.filter((item) => item.ageGroup === selectedAge);
            case "words":
                return READ_ALOUD_WORDS.filter((item) => item.ageGroup === selectedAge);
            case "sentence":
                return READ_ALOUD_SENTENCES.filter((item) => item.ageGroup === selectedAge);
            case "story":
                return READ_ALOUD_STORIES.filter((item) => item.ageGroup === selectedAge);
            default:
                return [];
        }
    }, [selectedAge, selectedMode]);

    // Determine if mode has content for selected age
    const hasContent = useCallback(
        (mId: string) => {
            switch (mId) {
                case "word":
                    return READ_ALOUD_IMAGES.some((i) => i.ageGroup === selectedAge);
                case "words":
                    return READ_ALOUD_WORDS.some((i) => i.ageGroup === selectedAge);
                case "sentence":
                    return READ_ALOUD_SENTENCES.some((i) => i.ageGroup === selectedAge);
                case "story":
                    return READ_ALOUD_STORIES.some((i) => i.ageGroup === selectedAge);
                default:
                    return false;
            }
        },
        [selectedAge]
    );

    useEffect(() => {
        if (!hasContent(selectedMode)) {
            const firstAvailable = READING_MODES.find((m) => hasContent(m.id));
            if (firstAvailable) {
                setSelectedMode(firstAvailable.id);
                return;
            }
        }
        const baseContent = getContent();
        if (isShuffleEnabled) {
            const currentId = displayContent[currentIndex]?.id;
            setDisplayContent(shuffleArray(baseContent, currentId));
        } else {
            setDisplayContent(baseContent);
        }
        setCurrentIndex(0);
        resetSession();
    }, [selectedAge, selectedMode, isShuffleEnabled, selectedCurriculum]);

    const content = displayContent;
    const currentItem = content[currentIndex];

    // ┌──────────────────────────────────────────────────────────────────────┐
    // │  REAL STT Recording — uncomment when using a development build      │
    // │  and remove the MOCK STT Recording block below.                     │
    // └──────────────────────────────────────────────────────────────────────┘
    // const startRecording = async () => {
    //     const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    //     if (!result.granted) {
    //         Alert.alert(
    //             "Permission Required",
    //             "Microphone permission is needed for speech recognition."
    //         );
    //         return;
    //     }
    //     ExpoSpeechRecognitionModule.start({
    //         lang: "en-US",
    //         interimResults: true,
    //         continuous: true,
    //     });
    // };
    //
    // const stopRecording = () => {
    //     ExpoSpeechRecognitionModule.stop();
    // };

    // ┌──────────────────────────────────────────────────────────────────────┐
    // │  MOCK STT — works in Expo Go. Remove this block when switching      │
    // │  to the real expo-speech-recognition above.                         │
    // └──────────────────────────────────────────────────────────────────────┘
    const startRecording = async () => {
        // Simulate "recording started"
        setIsRecording(true);
        setTranscript("");
        setAnalysis(null);
        setMockText("");
        startTimeRef.current = Date.now();
        // Open text input modal so user can type what they "spoke"
        setShowMockInput(true);
    };

    const stopRecording = () => {
        // Simulate "recording stopped"
        setIsRecording(false);
        setShowMockInput(false);
        if (startTimeRef.current) {
            const duration = (Date.now() - startTimeRef.current) / 1000;
            readingTimeRef.current = duration;
            setReadingTime(duration);
        }
        if (mockText.trim()) {
            setTranscript(mockText.trim());
        }
    };

    // ── Trigger analysis when recording ends ──
    useEffect(() => {
        if (!isRecording && transcript.trim() && startTimeRef.current && !analysis) {
            const timer = setTimeout(() => {
                analyzeReading(transcript);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isRecording, transcript]);

    // ─────────────────────────────────────────────────────────
    // Analysis (ported from web)
    // ─────────────────────────────────────────────────────────
    const analyzeReading = (transcriptText: string) => {
        if (!currentItem || !transcriptText) return;
        setIsAnalyzing(true);

        setTimeout(() => {
            const actualDuration = readingTimeRef.current || 0;
            let result: any = {};

            if (selectedMode === "word") {
                const expectedText = currentItem.word.toLowerCase();
                const spokenText = transcriptText.toLowerCase().trim();
                const isExactMatch = spokenText === expectedText;
                const isPartialMatch =
                    spokenText.includes(expectedText) || expectedText.includes(spokenText);
                const confidence = isExactMatch
                    ? 100
                    : isPartialMatch
                        ? Math.max(60, 75 - Math.abs(spokenText.length - expectedText.length) * 5)
                        : Math.max(0, 40 - Math.abs(spokenText.length - expectedText.length) * 10);

                result = {
                    correct: isExactMatch || isPartialMatch,
                    accuracy: confidence,
                    expectedWord: currentItem.word,
                    spokenWord: transcriptText,
                    feedback: isExactMatch
                        ? "Perfect pronunciation! 🎉"
                        : isPartialMatch
                            ? "Close! Keep practicing."
                            : "Let's try again!",
                };

                submitAttempt({
                    questionId: currentItem.id,
                    transcript: transcriptText,
                    accuracy: confidence,
                    question: currentItem.word,
                    mode: selectedMode,
                    correctAnswer: currentItem.word,
                    sessionTime: actualDuration.toFixed(2),
                });
            } else if (selectedMode === "words") {
                const expectedText = currentItem.text.toLowerCase();
                const spokenText = transcriptText.toLowerCase().trim();
                const isExactMatch = spokenText === expectedText;
                const isPartialMatch =
                    spokenText.includes(expectedText) || expectedText.includes(spokenText);
                const confidence = isExactMatch
                    ? 100
                    : isPartialMatch
                        ? Math.max(60, 75 - Math.abs(spokenText.length - expectedText.length) * 5)
                        : Math.max(0, 40 - Math.abs(spokenText.length - expectedText.length) * 10);

                result = {
                    correct: isExactMatch || isPartialMatch,
                    accuracy: confidence,
                    expectedWord: currentItem.text,
                    spokenWord: transcriptText,
                };

                submitAttempt({
                    questionId: currentItem.id,
                    transcript: transcriptText,
                    accuracy: confidence,
                    question: currentItem.text,
                    mode: selectedMode,
                    correctAnswer: currentItem.text,
                    sessionTime: actualDuration.toFixed(2),
                });
            } else if (selectedMode === "sentence") {
                const expectedWords = currentItem.text.toLowerCase().split(" ");
                const spokenWords = transcriptText.toLowerCase().split(" ");
                const wordAnalysis = expectedWords.map((word: string, index: number) => ({
                    word,
                    correct:
                        spokenWords[index] &&
                        spokenWords[index].includes(word.replace(/[.,!?]/g, "")),
                }));
                const correctWords = wordAnalysis.filter((w: any) => w.correct).length;
                const accuracy = Math.round((correctWords / expectedWords.length) * 100);
                const wpm =
                    actualDuration > 0
                        ? Math.round((expectedWords.length / actualDuration) * 60)
                        : 0;

                result = { accuracy, wordAnalysis, readingTime: actualDuration, wpm };

                submitAttempt({
                    questionId: currentItem.id,
                    transcript: transcriptText,
                    accuracy,
                    question: currentItem.text,
                    mode: selectedMode,
                    correctAnswer: currentItem.text,
                    sessionTime: actualDuration.toFixed(2),
                    word_per_minute: wpm,
                });
            } else if (selectedMode === "story") {
                const fullText = (currentItem.sentences?.join(" ") || "").toLowerCase();
                const expectedWords = fullText.split(" ");
                const spokenWords = transcriptText.toLowerCase().split(" ");

                const sentenceAnalysis = currentItem.sentences?.map(
                    (sentence: string, index: number) => {
                        const sentenceWords = sentence.toLowerCase().split(" ");
                        const sentenceStart =
                            index === 0
                                ? 0
                                : currentItem.sentences.slice(0, index).join(" ").split(" ").length;
                        const sentenceSpoken = spokenWords.slice(
                            sentenceStart,
                            sentenceStart + sentenceWords.length
                        );
                        const correctInSentence = sentenceWords.filter((word: string) =>
                            sentenceSpoken.some(
                                (spoken: string) =>
                                    spoken && spoken.includes(word.replace(/[.,!?]/g, ""))
                            )
                        ).length;
                        return {
                            sentence,
                            accuracy: Math.round((correctInSentence / sentenceWords.length) * 100),
                            correct: correctInSentence >= sentenceWords.length * 0.7,
                        };
                    }
                );

                const correctWords = expectedWords.filter((word: string) =>
                    spokenWords.some(
                        (spoken: string) =>
                            spoken && spoken.includes(word.replace(/[.,!?]/g, ""))
                    )
                ).length;
                const accuracy = Math.round((correctWords / expectedWords.length) * 100);
                const wpm =
                    actualDuration > 0
                        ? Math.round((expectedWords.length / actualDuration) * 60)
                        : 0;

                result = {
                    accuracy,
                    correctWords,
                    totalWords: expectedWords.length,
                    wpm,
                    expectedWPM: currentItem.expectedWPM,
                    readingTime: actualDuration,
                    sentenceAnalysis,
                };

                submitAttempt({
                    questionId: currentItem.id,
                    transcript: transcriptText,
                    accuracy,
                    question: currentItem.title,
                    mode: selectedMode,
                    sessionTime: actualDuration.toFixed(2),
                    correctAnswer: currentItem.sentences?.join(" ") || "",
                    no_of_correct: correctWords,
                    no_of_incorrect: expectedWords.length - correctWords,
                    no_of_total: expectedWords.length,
                    word_per_minute: wpm,
                });
            }

            setAnalysis(result);
            setIsAnalyzing(false);
        }, 1500);
    };

    // ─────────────────────────────────────────────────────────
    // Submit attempt to API
    // ─────────────────────────────────────────────────────────
    const submitAttempt = async (payload: any) => {
        try {
            const userId = user?._id || user?.id;
            if (!userId) return;
            const now = new Date();
            const formattedDate = now
                .toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                })
                .replace(",", "");
            await readAloudAttempts(userId, { ...payload, date: formattedDate });
        } catch (err) {
            console.warn("Attempt upload failed:", err);
        }
    };

    // ─────────────────────────────────────────────────────────
    // Navigation
    // ─────────────────────────────────────────────────────────
    const nextItem = () => {
        if (currentIndex < content.length - 1) {
            setCurrentIndex(currentIndex + 1);
            resetSession();
        }
    };

    const handleSkip = () => {
        nextItem();
    };

    const resetSession = () => {
        setTranscript("");
        setAnalysis(null);
        setReadingTime(null);
        setIsAnalyzing(false);
        setIsRecording(false);
        setShowAnalysisModal(false);
        setShowMockInput(false); // MOCK STT — remove this line when using real STT
        setMockText("");         // MOCK STT — remove this line when using real STT
        startTimeRef.current = null;
        readingTimeRef.current = 0;
        // REAL STT — uncomment when using dev build:
        // try { ExpoSpeechRecognitionModule.stop(); } catch { }
    };

    const retry = () => {
        resetSession();
    };

    const isLastQuestion = currentIndex === content.length - 1;

    // ─────────────────────────────────────────────────────────
    // Badges for current item
    // ─────────────────────────────────────────────────────────
    const getBadges = () => {
        if (!currentItem) return [];
        return currentItem.badges || [];
    };

    // ─────────────────────────────────────────────────────────
    // Question text / content display
    // ─────────────────────────────────────────────────────────
    const getQuestionInstruction = () => {
        switch (selectedMode) {
            case "word":
                return "Look at the image below and say the word clearly";
            case "words":
                return "Read the word below clearly";
            case "sentence":
                return "Read the sentence below clearly and at a good pace";
            case "story":
                return "Read the complete story fluently";
            default:
                return "";
        }
    };

    if (!currentItem) {
        return (
            <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
                <Text className="text-slate-500 font-bold mt-4">
                    No content available for this selection.
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                    Try a different age or mode.
                </Text>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────
    // AI Analysis content (shared between modal & side panel)
    // ─────────────────────────────────────────────────────────
    const analysisContent = (
        <AIAnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            transcript={transcript}
            onRetry={retry}
            onNext={nextItem}
            isLastQuestion={isLastQuestion}
            selectedMode={selectedMode}
        />
    );

    // ─────────────────────────────────────────────────────────
    // Mode dropdown items
    // ─────────────────────────────────────────────────────────
    const modeItems = READING_MODES.filter((m) => hasContent(m.id)).map((m) => ({
        value: m.id,
        label: `${m.icon} ${m.title}`,
    }));

    const ageItems = AGE_GROUPS.map((a) => ({
        value: a.value,
        label: a.label,
    }));

    // ─────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────
    return (
        <View className="flex-1">

            {/* ── Main Content ── */}
            <View className={isTablet ? "flex-row flex-1" : "flex-1"} style={isTablet ? { gap: 16 } : undefined}>
                {/* ── Left: Question Card ── */}
                <View className="flex-1">
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        className="bg-white rounded-[32px] shadow-lg shadow-slate-200 border border-slate-100 flex-1 mb-4 overflow-hidden"
                    >

                        {/* Instruction */}
                        <View className="px-6 pt-4 pb-2">
                            <Text className="text-[#9089FC] text-sm font-semibold leading-5">
                                {getQuestionInstruction()}
                            </Text>
                        </View>

                        <View className="flex-row gap-3 justify-between items-start pb-2 px-5">
                            {/* Badges Row */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row flex-wrap" style={{ gap: 4 }}>
                                    {getBadges().map((badge: string, i: number) => (
                                        <View
                                            key={i}
                                            className="bg-violet-50 border border-violet-100 px-2 py-1 rounded-full"
                                        >
                                            <Text className="text-[#9089FC] text-[8px] font-bold uppercase">
                                                {badge}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>

                            {/* Counter */}
                            <View className="">
                                <Text className="text-slate-400 text-[10px] font-black uppercase tracking-wider">
                                    Q. {currentIndex + 1} / {content.length}
                                </Text>
                            </View>
                        </View>


                        {/* Scrollable Content Area */}
                        <ScrollView
                            className="flex-1 px-4 md:px-6"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 24 }}
                        >
                            {selectedMode === "word" && currentItem.imageUrl && (
                                <View className="items-center">
                                    <View className="bg-slate-50 rounded-3xl p-4 w-full items-center border border-slate-100">
                                        <Image
                                            source={{ uri: currentItem.imageUrl }}
                                            style={{ width: "100%", height: 200, borderRadius: 20 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                </View>
                            )}

                            {selectedMode === "words" && (
                                <View className="items-center py-6">
                                    <View className="bg-gradient-to-br bg-slate-50 rounded-3xl px-10 py-8 border border-slate-100">
                                        <Text className="text-slate-800 text-4xl font-black text-center">
                                            {currentItem.text}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {selectedMode === "sentence" && (
                                <View className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <Text className="text-slate-800 text-xl font-bold leading-8 text-center">
                                        {currentItem.text}
                                    </Text>
                                </View>
                            )}

                            {selectedMode === "story" && (
                                <View className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <Text className="text-[#9089FC] text-lg font-black mb-3">
                                        {currentItem.title}
                                    </Text>
                                    {currentItem.sentences?.map((sentence: string, i: number) => (
                                        <Text
                                            key={i}
                                            className="text-slate-700 text-base leading-7 mb-1"
                                        >
                                            {sentence}
                                        </Text>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    </Animated.View>

                    {/* ── AI Analysis (Tablet inline) ── */}
                    {/* On phone: no inline analysis — it opens in a modal */}
                </View>
                {isTablet && (
                    <View style={{ width: 340 }}>
                        <View className="bg-white rounded-[32px] p-6 shadow-lg shadow-slate-200 border border-slate-100 flex-1">
                            <View className="flex-row items-center mb-4">
                                <Ionicons name="sparkles" size={20} color="#9089FC" />
                                <Text className="text-slate-800 font-black ml-2 text-base">
                                    AI Analysis
                                </Text>
                            </View>
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {analysisContent}
                            </ScrollView>
                        </View>
                    </View>
                )}
            </View>

            {/* ── AI Analysis Draggable Bottom Sheet (Phone only) ── */}
            {!isTablet && showAnalysisModal && (
                <AnalysisBottomSheet
                    analysisContent={analysisContent}
                    onClose={() => setShowAnalysisModal(false)}
                />
            )}

            {/* ── Bottom Action Bar ── */}
            <View
                className="bg-white border-t rounded-2xl overflow-hidden border-slate-100"
                style={{
                    paddingBottom: Platform.OS === "ios" ? 30 : 16,
                    paddingTop: 12,
                    paddingHorizontal: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 10,
                }}
            >
                <View className="flex-row items-center" style={{ gap: 12 }}>
                    {/* Start/Stop Recording Button */}
                    <TouchableOpacity
                        onPress={isRecording ? stopRecording : startRecording}
                        activeOpacity={0.8}
                        className="flex-1"
                        disabled={isAnalyzing}
                    >
                        <Animated.View style={isRecording ? recordPulseStyle : undefined}>
                            <LinearGradient
                                colors={
                                    isRecording
                                        ? ["#EF4444", "#DC2626"]
                                        : ["#EF4444", "#F97316"]
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                className="flex-row items-center justify-center py-4 rounded-2xl overflow-hidden"
                                style={{
                                    opacity: isAnalyzing ? 0.5 : 1,
                                }}
                            >
                                <Ionicons
                                    name={isRecording ? "stop" : "mic"}
                                    size={22}
                                    color="white"
                                />
                                <Text className="text-white font-black ml-2.5 text-base">
                                    {isRecording ? "Stop Recording" : "Start Recording"}
                                </Text>
                            </LinearGradient>
                        </Animated.View>
                    </TouchableOpacity>

                    {/* Skip Button */}
                    <TouchableOpacity
                        onPress={handleSkip}
                        disabled={isRecording || isLastQuestion}
                        activeOpacity={0.7}
                        className={`flex-row items-center justify-center px-6 py-4 rounded-2xl border ${isRecording || isLastQuestion
                            ? "bg-slate-50 border-slate-100 opacity-40"
                            : "bg-slate-50 border-slate-200"
                            }`}
                    >
                        <Ionicons
                            name="play-skip-forward"
                            size={18}
                            color={isRecording || isLastQuestion ? "#94A3B8" : "#475569"}
                        />
                        <Text
                            className={`font-bold ml-1.5 text-sm ${isRecording || isLastQuestion ? "text-slate-300" : "text-slate-600"
                                }`}
                        >
                            Skip
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ┌──────────────────────────────────────────────────────────────────────┐ */}
            {/* │  MOCK STT Input Modal — Comment out this entire block when switching     │ */}
            {/* │  to real expo-speech-recognition.                                    │ */}
            {/* └──────────────────────────────────────────────────────────────────────┘ */}
            <Modal
                visible={showMockInput}
                transparent
                animationType="slide"
                onRequestClose={() => stopRecording()}
                statusBarTranslucent
            >
                <View
                    className="flex-1 justify-end"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <View className="bg-white rounded-t-[32px] p-6" style={{ paddingBottom: Platform.OS === "ios" ? 40 : 24 }}>
                        <View className="flex-row items-center mb-4">
                            <View className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                            <Text className="text-slate-800 font-black text-base">
                                Mock STT — Type your speech
                            </Text>
                        </View>
                        <Text className="text-slate-400 text-xs mb-3">
                            Type what you would say aloud. This simulates speech recognition for testing in Expo Go.
                        </Text>
                        <TextInput
                            value={mockText}
                            onChangeText={setMockText}
                            placeholder="Type the text you want to 'speak'..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            autoFocus
                            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-base min-h-[80px]"
                            style={{ textAlignVertical: "top" }}
                        />
                        <View className="flex-row mt-4" style={{ gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setShowMockInput(false);
                                    setIsRecording(false);
                                    startTimeRef.current = null;
                                }}
                                className="flex-1 py-4 rounded-2xl bg-slate-100 items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-slate-600 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => stopRecording()}
                                className="flex-1 py-4 rounded-2xl bg-[#9089FC] items-center"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-bold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
