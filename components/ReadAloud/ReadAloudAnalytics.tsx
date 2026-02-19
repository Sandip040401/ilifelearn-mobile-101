import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    interpolate,
    Layout,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, Path, Stop, LinearGradient as SvgGradient, Text as SvgText } from "react-native-svg";
import stringSimilarity from "string-similarity-js";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AnalyticsProps {
    user: any;
    analyticsData: any;
    attempts: any[];
    modes: any[];
}

const CollapsibleItem = ({ questionAttempts, isExpanded, onToggle, onReview }: any) => {
    const animation = useSharedValue(0);

    useEffect(() => {
        animation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
    }, [isExpanded]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: animation.value,
            transform: [{ translateY: interpolate(animation.value, [0, 1], [-10, 0]) }],
        };
    });

    const lastAttempt = [...questionAttempts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    // Helper to safely parse numbers
    const safeNum = (val: any) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    const highestAttempt = questionAttempts.reduce((max: any, cur: any) => safeNum(cur.accuracy) > safeNum(max.accuracy) ? cur : max);

    // Robust text selection
    const questionText = lastAttempt.correctAnswer || lastAttempt.correctSentence || lastAttempt.question || "Untitled Question";

    return (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm shadow-slate-200 border border-slate-100">
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={onToggle}
                className="flex-row items-start justify-between"
            >
                <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                        <View className="px-2.5 py-1 rounded-full mr-2" style={{ backgroundColor: 'rgba(144, 137, 252, 0.1)' }}>
                            <Text className="text-[#9089FC] text-[10px] font-bold uppercase">{lastAttempt.mode === 'word' ? 'Image' : lastAttempt.mode}</Text>
                        </View>
                        <Text className="text-[#6B7280] text-[10px]">{questionAttempts.length} attempts</Text>
                    </View>
                    <Text className="text-[#121826] font-bold text-lg mb-1 leading-tight">
                        {questionText}
                    </Text>
                    <Text className="text-[#9CA3AF] text-[10px]">Last Attempt: {new Date(lastAttempt.date).toLocaleDateString()}</Text>
                </View>
                <View className="w-10 h-10 bg-slate-50 items-center justify-center rounded-full">
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
                </View>
            </TouchableOpacity>

            <View className="mt-4">
                <View className="flex-row justify-between mb-1.5">
                    <Text className="text-[#6B7280] text-[10px] font-medium">Progress to Mastery</Text>
                    <Text className="text-[#10B981] font-extrabold text-[10px]">{safeNum(highestAttempt.accuracy).toFixed(1)}%</Text>
                </View>
                <View className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <View style={{ width: `${safeNum(highestAttempt.accuracy)}%` }} className="h-full bg-[#10B981] rounded-full" />
                </View>
            </View>

            {isExpanded && (
                <Animated.View
                    entering={FadeIn.duration(300)}
                    exiting={FadeOut.duration(200)}
                    style={animatedStyle}
                >
                    <View className="pt-5 mt-5 border-t border-slate-50">
                        <View className="flex-row flex-wrap justify-between mb-4">
                            <View style={{ width: '31%' }} className="bg-emerald-50 p-3 rounded-2xl items-center">
                                <Ionicons name="trophy" size={16} color="#059669" />
                                <Text className="text-[#065F46] text-[8px] font-bold uppercase mt-1">Best</Text>
                                <Text className="text-[#065F46] font-bold text-sm">{safeNum(highestAttempt.accuracy).toFixed(1)}%</Text>
                            </View>
                            <View style={{ width: '31%' }} className="bg-blue-50 p-3 rounded-2xl items-center">
                                <Ionicons name="time" size={16} color="#2563EB" />
                                <Text className="text-[#1E40AF] text-[8px] font-bold uppercase mt-1">Recent</Text>
                                <Text className="text-[#1E40AF] font-bold text-sm">{safeNum(lastAttempt.accuracy).toFixed(1)}%</Text>
                            </View>
                            <View style={{ width: '31%' }} className="bg-purple-50 p-3 rounded-2xl items-center">
                                <Ionicons name="repeat" size={16} color="#7C3AED" />
                                <Text className="text-[#5B21B6] text-[8px] font-bold uppercase mt-1">Tries</Text>
                                <Text className="text-[#5B21B6] font-bold text-sm">{questionAttempts.length}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => onReview(questionAttempts)}
                            activeOpacity={0.8}
                            className="bg-[#3B82F6] flex-row items-center justify-center py-4 rounded-2xl shadow-lg shadow-blue-200"
                        >
                            <Ionicons name="eye" size={18} color="white" />
                            <Text className="text-white font-bold ml-2">Review All Attempts</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const ReadAloudAnalytics = ({ user, analyticsData, attempts, modes }: AnalyticsProps) => {
    const insets = useSafeAreaInsets();
    const [filter, setFilter] = useState("all");
    const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reviewAttempts, setReviewAttempts] = useState<any[]>([]);
    const [reviewIndex, setReviewIndex] = useState(0);

    const safeNum = (val: any) => {
        const n = parseFloat(val);
        return isNaN(n) ? 0 : n;
    };

    // ── Text Highlighting Logic (ported from web app) ──
    const getHighlightedText = (targetText: string, spokenText: string) => {
        if (!targetText || !spokenText) return null;

        const targetWords = targetText.split(" ");
        const spokenWords = spokenText.split(" ");
        const usedIndices = new Set<number>();

        const normalize = (word: string) =>
            word.trim().toLowerCase().replace(/[^a-z0-9]/gi, "");

        const isMatch = (a: string, b: string) => {
            if (a.length <= 2 || b.length <= 2) return a === b;
            const similarity = stringSimilarity(a, b, 1);
            return similarity >= 0.65;
        };

        // Map target words to their match status
        const targetHighlights = targetWords.map((word, index) => {
            const cleanWord = normalize(word);
            let matched = false;
            let matchedIndex = -1;

            // Try exact position match first
            const spokenAtSameIndex = spokenWords[index];
            if (spokenAtSameIndex && isMatch(cleanWord, normalize(spokenAtSameIndex))) {
                matched = true;
                matchedIndex = index;
                usedIndices.add(index);
            } else {
                // Find best unused match elsewhere
                for (let i = 0; i < spokenWords.length; i++) {
                    if (usedIndices.has(i)) continue;
                    if (isMatch(cleanWord, normalize(spokenWords[i]))) {
                        matched = true;
                        matchedIndex = i;
                        usedIndices.add(i);
                        break;
                    }
                }
            }

            return { word, matched, matchedIndex };
        });

        // Collect extra spoken words not matched to any target
        const extraSpoken = spokenWords
            .map((word, i) => (!usedIndices.has(i) ? { word, index: i } : null))
            .filter(Boolean) as { word: string; index: number }[];

        return { targetHighlights, extraSpoken, spokenWords };
    };

    const contentSlide = useSharedValue(0);
    const contentOpacity = useSharedValue(1);

    const toggleExpand = (key: string) => {
        setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const openReview = (attempts: any[]) => {
        setReviewAttempts(attempts);
        setReviewIndex(0);
        contentSlide.value = 0;
        contentOpacity.value = 1;
        setIsModalOpen(true);
    };

    const navigateReview = (direction: 'next' | 'prev') => {
        const nextIndex = direction === 'next' ? reviewIndex + 1 : reviewIndex - 1;
        if (nextIndex < 0 || nextIndex >= reviewAttempts.length) return;

        const slideOutTo = direction === 'next' ? -SCREEN_WIDTH : SCREEN_WIDTH;

        contentOpacity.value = withTiming(0, { duration: 150 });
        contentSlide.value = withTiming(slideOutTo, { duration: 200 }, () => {
            runOnJS(setReviewIndex)(nextIndex);
            contentSlide.value = direction === 'next' ? SCREEN_WIDTH : -SCREEN_WIDTH;
            contentOpacity.value = withTiming(1, { duration: 250 });
            contentSlide.value = withSpring(0, { damping: 20, stiffness: 70 });
        });
    };

    const animatedReviewStyle = useAnimatedStyle(() => {
        return {
            opacity: contentOpacity.value,
            transform: [{ translateX: contentSlide.value }],
        };
    });

    const renderKpiCard = (title: string, value: string | number, icon: any, color: string) => (
        <View
            style={{ width: "48%" }}
            className="bg-white rounded-3xl p-5 mb-4 shadow-md shadow-slate-100 border border-slate-100"
        >
            <View style={{ backgroundColor: `${color}15` }} className="w-12 h-12 rounded-2xl items-center justify-center mb-3">
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text className="text-2xl font-bold text-[#121826]">{value}</Text>
            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-wider">{title}</Text>
        </View>
    );

    const renderModePerformance = (mode: any) => {
        const perf = analyticsData?.performanceByMode?.[mode.key] || {};
        console.log(`[Debug] Mode: ${mode.title}, Raw Perf:`, perf);

        const accuracy = safeNum(perf.accuracy || 0);
        const sessions = perf.sessions || 0;
        const timeSpent = perf.timeSpent || "0m";

        // Safe speed parsing
        const rawSpeed = perf.speed || "-";
        const speedVal = safeNum(rawSpeed);
        const displaySpeed = rawSpeed === "-" || speedVal === 0 ? "-" : `${speedVal} WPM`;

        const comprehension = safeNum(perf.comprehension || 0);

        return (
            <View
                key={mode.id}
                className="rounded-[32px] p-6 mr-4 shadow-md overflow-hidden bg-white border"
                style={{
                    width: 280,
                    borderColor: `${mode.color}20`,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                }}
            >
                <View className="flex-row items-center mb-8">
                    <View
                        style={{
                            backgroundColor: mode.color,
                            shadowColor: mode.color,
                            shadowOffset: { width: 0, height: 8 },
                            shadowOpacity: 0.3,
                            shadowRadius: 12,
                            elevation: 8
                        }}
                        className="w-16 h-16 rounded-[22px] items-center justify-center mr-4"
                    >
                        <Ionicons name={mode.icon as any} size={32} color="white" />
                    </View>
                    <View>
                        <Text className="text-[#121826] font-bold text-xl leading-tight">{mode.title}</Text>
                        <View className="flex-row items-center mt-1.5">
                            <View style={{ backgroundColor: mode.color }} className="w-2.5 h-2.5 rounded-full mr-2" />
                            <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-widest">{sessions} SESSIONS</Text>
                        </View>
                    </View>
                </View>

                {/* Primary Metric: Accuracy */}
                <View className="mb-6">
                    <View className="flex-row justify-between items-center mb-2.5">
                        <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Accuracy</Text>
                        <Text className="text-[#121826] font-bold text-base">{accuracy.toFixed(1)} %</Text>
                    </View>
                    <View className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                        <View
                            style={{ width: `${accuracy}%`, backgroundColor: mode.color }}
                            className="h-full rounded-full shadow-sm"
                        />
                    </View>
                </View>

                {/* Optional Metrics for specific modes */}
                {mode.key === 'sentence' && (
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-2.5">
                            <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Speed</Text>
                            <Text className="text-[#121826] font-bold text-base">{displaySpeed}</Text>
                        </View>
                        <View className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                            <View
                                style={{ width: safeNum(displaySpeed), backgroundColor: mode.color }}
                                className="h-full rounded-full shadow-sm"
                            />
                        </View>
                    </View>
                )}

                {mode.key === 'story' && (
                    <View className="mb-6">
                        <View className="flex-row justify-between items-center mb-2.5">
                            <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Comprehension</Text>
                            <Text className="text-[#121826] font-bold text-base">{comprehension.toFixed(1)} %</Text>
                        </View>
                        <View className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                            <View
                                style={{ width: `${comprehension}%`, backgroundColor: mode.color }}
                                className="h-full rounded-full shadow-sm"
                            />
                        </View>
                    </View>
                )}

                <View className="flex-row justify-between items-center pt-5 border-t border-slate-50">
                    <Text className="text-[#94A3B8] text-[11px] font-bold uppercase tracking-widest">Time Spent</Text>
                    <Text className="text-[#121826] font-bold text-base">{timeSpent}</Text>
                </View>
            </View>
        );
    };

    const renderLineChart = () => {
        const data = analyticsData?.progressOverTime || [
            { label: "W1", accuracy: 60 }, { label: "W2", accuracy: 78 },
            { label: "W3", accuracy: 95 }, { label: "W4", accuracy: 80 },
            { label: "W5", accuracy: 92 }, { label: "W6", accuracy: 65 },
            { label: "W7", accuracy: 85 },
        ];

        const chartWidth = SCREEN_WIDTH - 88;
        const chartHeight = 220; // Increased height for better label clearance
        const paddingX = 35;
        const paddingBottom = 40; // Dedicated space for X-axis labels
        const paddingTop = 30;    // Space for top labels
        const graphHeight = chartHeight - paddingBottom - paddingTop;

        const pts = data.map((d: any, i: number) => ({
            x: paddingX + (i * (chartWidth - 2 * paddingX)) / (data.length - 1),
            y: paddingTop + graphHeight - (safeNum(d.accuracy || d.avgAccuracy || 0) / 100) * graphHeight,
            val: safeNum(d.accuracy || d.avgAccuracy || 0)
        }));

        let path = `M ${pts[0].x} ${pts[0].y}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const ctrlX = (pts[i].x + pts[i + 1].x) / 2;
            path += ` C ${ctrlX} ${pts[i].y}, ${ctrlX} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
        }

        return (
            <View className="bg-white rounded-3xl p-6 mb-8 shadow-md shadow-slate-100 border border-slate-100">
                <View className="flex-row items-center mb-6">
                    <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="analytics" size={20} color="#10B981" />
                    </View>
                    <Text className="text-[#121826] font-bold text-lg">Performance Trend</Text>
                </View>

                <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    <Defs>
                        <SvgGradient id="g" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="#10B981" />
                            <Stop offset="1" stopColor="#34D399" />
                        </SvgGradient>
                    </Defs>
                    {[0, 25, 50, 75, 100].map(v => {
                        const y = paddingTop + graphHeight - (v / 100) * graphHeight;
                        return <Path key={v} d={`M ${paddingX} ${y} L ${chartWidth - paddingX} ${y}`} stroke="#F1F5F9" strokeWidth="1" />;
                    })}
                    <Path d={path} fill="none" stroke="url(#g)" strokeWidth="4" strokeLinecap="round" />
                    {pts.map((p: any, i: number) => (
                        <React.Fragment key={i}>
                            <Circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#10B981" strokeWidth="2" />
                            {i % 2 === 0 && (
                                <SvgText
                                    x={p.x}
                                    y={p.y - 12}
                                    fontSize="10"
                                    fontWeight="bold"
                                    fill="#10B981"
                                    textAnchor="middle"
                                >
                                    {p.val.toFixed(0)}%
                                </SvgText>
                            )}
                            {/* X-Axis Labels - Now with a safe 20px gap from the bottom edge */}
                            <SvgText
                                x={p.x}
                                y={chartHeight - 15}
                                fontSize="9"
                                fontWeight="bold"
                                fill="#9CA3AF"
                                textAnchor="middle"
                            >
                                {data[i].label?.toUpperCase()}
                            </SvgText>
                        </React.Fragment>
                    ))}
                </Svg>
            </View>
        );
    };

    const renderQuestionsList = () => {
        const grouped: Record<string, any[]> = {};
        attempts.forEach(a => {
            if (!grouped[a.questionId]) grouped[a.questionId] = [];
            grouped[a.questionId].push(a);
        });

        const keys = Object.keys(grouped).filter(k => filter === 'all' || grouped[k][0].mode === filter);

        return (
            <Animated.View className="my-6" layout={Layout.springify()}>
                <Text className="text-white text-2xl font-bold mb-6 px-1">Practice History</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4" contentContainerStyle={{ paddingHorizontal: 10 }}>
                    {['all', 'word', 'words', 'sentence', 'story'].map(id => (
                        <TouchableOpacity
                            key={id}
                            onPress={() => setFilter(id)}
                            className={`px-6 py-3 rounded-2xl mr-3 border ${filter === id ? 'bg-white border-white shadow-lg' : 'bg-white/10 border-white/20'}`}
                        >
                            <Text className={`text-xs font-bold uppercase tracking-widest ${filter === id ? 'text-[#9089FC]' : 'text-white'}`}>
                                {id === 'word' ? 'Image' : id}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {keys.length === 0 ? (
                    <View className="bg-white/10 rounded-3xl p-16 items-center border border-dashed border-white/20">
                        <Ionicons name="folder-open-outline" size={48} color="white" className="opacity-40 mb-4" />
                        <Text className="text-white/60 font-medium">No activity in this category yet.</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={{ maxHeight: 600 }}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                    >
                        {keys.map(k => (
                            <CollapsibleItem
                                key={k}
                                questionAttempts={grouped[k]}
                                isExpanded={expandedKeys[k]}
                                onToggle={() => toggleExpand(k)}
                                onReview={openReview}
                            />
                        ))}
                    </ScrollView>
                )}
            </Animated.View>
        );
    };

    return (
        <View>
            {/* Persona card with bold text */}
            <View className="bg-white rounded-3xl p-6 mb-8 shadow-md shadow-slate-100 border border-slate-100 flex-row items-center justify-between">
                <View className="flex-row items-center flex-1 mr-4">
                    <View className="w-16 h-16 bg-[#FF80B5] rounded-2xl items-center justify-center mr-4 rotate-2 shadow-sm">
                        <Text className="text-white text-2xl font-bold">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "S"}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#121826] text-xl font-bold" numberOfLines={1} ellipsizeMode="tail">
                            {user?.name || user?.email?.split('@')[0] || "Scholar"}
                        </Text>
                        <Text className="text-[#6B7280] text-[10px] font-bold uppercase opacity-60">
                            Active: {analyticsData?.lastActive || "Just now"}
                        </Text>
                    </View>
                </View>
                <View className="items-end shrink-0">
                    <Text className="text-[#9089FC] text-4xl font-bold">
                        {parseFloat(analyticsData?.overallAccuracy || 0).toFixed(0)}%
                    </Text>
                    <Text className="text-[#6B7280] text-[10px] font-bold uppercase tracking-tighter">Overall Score</Text>
                </View>
            </View>

            <View className="flex-row flex-wrap justify-between">
                {renderKpiCard("Sessions", analyticsData?.totalSessions || 0, "book", "#3B82F6")}
                {renderKpiCard("Accuracy", `${parseFloat(analyticsData?.overallAccuracy || 0).toFixed(1)}%`, "disc", "#F59E0B")}
                {renderKpiCard("Reading Pace", `${analyticsData?.avgWPM || 0} WPM`, "flash", "#10B981")}
                {renderKpiCard("Practice", analyticsData?.totalTime || "0m", "time", "#EF4444")}
            </View>

            {renderLineChart()}

            <View className="mt-2 mb-8">
                <Text className="text-white text-xl font-bold mb-4 px-1">Performance by Reading Mode</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20, paddingBottom: 10 }}
                >
                    {modes.map(renderModePerformance)}
                </ScrollView>
            </View>

            {renderQuestionsList()}

            <Modal visible={isModalOpen} animationType="slide" presentationStyle="fullScreen" statusBarTranslucent={true}>
                <View style={{ paddingTop: insets.top }} className="flex-1 bg-white">
                    <View className="flex-row items-center justify-between px-6 pb-6 pt-4 border-b border-slate-50">
                        <View>
                            <Text className="text-[#121826] font-bold text-2xl">Attempt Review</Text>
                            <View className="bg-slate-100 self-start px-2 py-0.5 rounded-md mt-1">
                                <Text className="text-[#6B7280] text-[10px] font-bold uppercase">Record {reviewIndex + 1} / {reviewAttempts.length}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 items-center justify-center rounded-2xl">
                            <Ionicons name="close" size={28} color="#121826" />
                        </TouchableOpacity>
                    </View>

                    {reviewAttempts.length > 0 && (
                        <View className="flex-1">
                            <ScrollView className="flex-1 px-6 pt-8">
                                <Animated.View style={animatedReviewStyle}>
                                    {(() => {
                                        const attempt = reviewAttempts[reviewIndex];
                                        const mode = attempt.mode;
                                        const targetText = attempt.correctAnswer || attempt.correctSentence || attempt.question || "";
                                        const spokenText = attempt.transcript || "";
                                        const showHighlighting = (mode === 'sentence' || mode === 'story') && targetText && spokenText;
                                        const highlighted = showHighlighting ? getHighlightedText(targetText, spokenText) : null;

                                        return (
                                            <>
                                                {/* Correction Key Section */}
                                                <View className="bg-emerald-50 rounded-[32px] p-8 mb-6 border border-emerald-100 shadow-sm">
                                                    <View className="flex-row items-center mb-4">
                                                        <View className="w-8 h-8 bg-emerald-100 rounded-lg items-center justify-center">
                                                            <Ionicons name="checkmark" size={18} color="#059669" />
                                                        </View>
                                                        <Text className="text-[#065F46] font-black ml-3 uppercase text-xs">Correction Key</Text>
                                                    </View>
                                                    <Text className="text-[#065F46] text-xl font-bold leading-tight">
                                                        {targetText}
                                                    </Text>
                                                </View>

                                                {/* Audio Transcript Section */}
                                                <View className="bg-blue-50 rounded-[32px] p-8 mb-8 border border-blue-100 shadow-sm">
                                                    <View className="flex-row items-center mb-4">
                                                        <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center">
                                                            <Ionicons name="mic" size={18} color="#2563EB" />
                                                        </View>
                                                        <Text className="text-[#1E40AF] font-black ml-3 uppercase text-xs">Audio Transcript</Text>
                                                    </View>
                                                    {highlighted ? (
                                                        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                                                            {highlighted.targetHighlights.map((item, idx) => (
                                                                <View
                                                                    key={`target-${idx}`}
                                                                    className={`items-center px-2.5 py-1.5 rounded-xl border ${item.matched
                                                                        ? 'bg-emerald-200 border-emerald-300'
                                                                        : 'bg-red-200 border-red-300'
                                                                        }`}
                                                                >
                                                                    <Text className={`text-[11px] font-semibold ${item.matched ? 'text-emerald-800' : 'text-red-800'
                                                                        }`}>
                                                                        {item.word}
                                                                    </Text>
                                                                    <Text className={`text-[15px] font-bold ${item.matched ? 'text-emerald-900' : 'text-red-900'
                                                                        }`}>
                                                                        {item.matchedIndex !== -1 ? highlighted.spokenWords[item.matchedIndex] : "-"}
                                                                    </Text>
                                                                </View>
                                                            ))}
                                                            {highlighted.extraSpoken.map((extra, idx) => (
                                                                <View
                                                                    key={`extra-${idx}`}
                                                                    className="items-center px-2.5 py-1.5 rounded-xl border bg-yellow-200 border-yellow-300"
                                                                >
                                                                    <Text className="text-[11px] font-semibold text-yellow-800">Extra</Text>
                                                                    <Text className="text-[15px] font-bold text-yellow-900">{extra.word}</Text>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    ) : (
                                                        <Text className="text-[#1E40AF] text-xl font-bold leading-tight">
                                                            {spokenText || "No speech detected"}
                                                        </Text>
                                                    )}
                                                </View>
                                            </>
                                        );
                                    })()}

                                    <View className="flex-row justify-between mb-16">
                                        <View className="bg-slate-50 p-6 rounded-[24px] flex-1 mr-3 items-center border border-slate-100">
                                            <Text className="text-[#6B7280] text-[10px] font-black uppercase mb-1">Accuracy</Text>
                                            <Text className="text-[#121826] font-black text-2xl">{parseFloat(reviewAttempts[reviewIndex].accuracy).toFixed(1)}%</Text>
                                        </View>
                                        <View className="bg-slate-50 p-6 rounded-[24px] flex-1 ml-3 items-center border border-slate-100">
                                            <Text className="text-[#6B7280] text-[10px] font-black uppercase mb-1">Date</Text>
                                            <Text className="text-[#121826] font-bold text-sm">{new Date(reviewAttempts[reviewIndex].date).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                </Animated.View>
                            </ScrollView>

                            <View className="px-8 py-8 border-t border-slate-50 flex-row justify-between items-center bg-white shadow-2xl">
                                <TouchableOpacity
                                    onPress={() => navigateReview('prev')}
                                    disabled={reviewIndex === 0}
                                    className={`flex-row items-center px-8 py-4 rounded-2xl ${reviewIndex === 0 ? 'opacity-20' : 'bg-slate-50 border border-slate-200'}`}
                                >
                                    <Ionicons name="chevron-back" size={20} color="#121826" />
                                    <Text className="text-[#121826] font-black ml-2 uppercase text-xs">Back</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => navigateReview('next')}
                                    disabled={reviewIndex === reviewAttempts.length - 1}
                                    className={`flex-row items-center px-8 py-4 rounded-2xl ${reviewIndex === reviewAttempts.length - 1 ? 'opacity-20' : 'bg-[#121826]'}`}
                                >
                                    <Text className="text-white font-black mr-2 uppercase text-xs">Next</Text>
                                    <Ionicons name="chevron-forward" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default ReadAloudAnalytics;
