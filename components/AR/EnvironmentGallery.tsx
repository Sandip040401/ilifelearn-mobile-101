import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Gradient color mapping from environment gradient strings
const GRADIENT_MAP = {
    'from-coral to-coral/70': ['#FF6B6B', '#FF8E8E'] as const,
    'from-secondary to-secondary/70': ['#6C4CFF', '#8B72FF'] as const,
    'from-orchid to-orchid/70': ['#DA70D6', '#E890E8'] as const,
    'from-teal to-teal/70': ['#0EA5A4', '#3CBFBE'] as const,
    'from-accent to-accent/70': ['#FF9F43', '#FFB56D'] as const,
    'from-gray-300 to-gray-100': ['#9CA3AF', '#D1D5DB'] as const,
};

const getGradientColors = (gradient: string): readonly [string, string, ...string[]] => {
    const mapped = GRADIENT_MAP[gradient as keyof typeof GRADIENT_MAP];
    if (mapped) return mapped;
    return ['#6C4CFF', '#8B72FF'] as const;
};

interface Environment {
    _id: string;
    folderName: string;
    name: string;
    description: string;
    imgURL: string;
    gradient: string;
    __key?: string;
}

interface Model {
    id?: string;
    _id?: string;
    name: string;
    tags?: string[];
}

interface Props {
    environments: Environment[];
    models: Model[];
    onEnvironmentSelect: (env: Environment) => void;
    loading?: boolean;
}

// Helper function to count models for each environment based on tags
const getModelCount = (environment: Environment, models: Model[]): number => {
    if (!models || models.length === 0) return 0;

    const envName = environment.name || environment.folderName;
    return models.filter((model) => {
        if (!model.tags) return false;
        return model.tags.some((tag) => {
            const normalizedTag = tag.toLowerCase().trim();
            const normalizedEnv = envName.toLowerCase().trim();

            if (normalizedTag === normalizedEnv) return true;
            if (normalizedTag === "wild animals" && (normalizedEnv === "wild animals" || normalizedEnv.includes("wild animals"))) return true;
            if (normalizedTag === "farm animals" && (normalizedEnv === "farm animals" || normalizedEnv.includes("farm animals"))) return true;
            if (normalizedTag === "extinct animals" && (normalizedEnv === "extinct animals" || normalizedEnv.includes("extinct animals"))) return true;
            if (normalizedTag === "fruits & vegetables" && normalizedEnv.includes("fruit") && normalizedEnv.includes("vegetable")) return true;
            if (normalizedTag === "transportation" && normalizedEnv.includes("transport")) return true;
            if (normalizedTag === "space adventure" && normalizedEnv.includes("space")) return true;
            if (normalizedTag === "underwater world" && normalizedEnv.includes("underwater")) return true;
            if (normalizedTag === "phonics fun" && normalizedEnv.includes("phonics")) return true;
            if (normalizedTag === "amphibians" && normalizedEnv.includes("amphibian")) return true;
            if (normalizedTag === "my body" && normalizedEnv.includes("body")) return true;
            if (normalizedTag === "numbers" && normalizedEnv.includes("number")) return true;

            return false;
        });
    }).length;
};

// Environment emoji mapping
const ENV_EMOJI_MAP: Record<string, string> = {
    'phonics': '🔤',
    'numbers': '🔢',
    'my body': '🧍',
    'underwater': '🐠',
    'fruits': '🍎',
    'wild animals': '🦁',
    'amphibians': '🐸',
    'farm animals': '🐄',
    'transportation': '🚗',
    'transport': '🚗',
    'space': '🚀',
    'extinct': '🦕',
};

const getEnvEmoji = (name: string): string => {
    const lower = name.toLowerCase();
    for (const [key, emoji] of Object.entries(ENV_EMOJI_MAP)) {
        if (lower.includes(key)) return emoji;
    }
    return '📦';
};

export default function EnvironmentGallery({ environments, models, onEnvironmentSelect, loading }: Props) {
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#6C4CFF" />
                <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: '#121826' }}>
                    Loading 3D Worlds...
                </Text>
                <Text style={{ marginTop: 6, fontSize: 14, color: '#6B7280' }}>
                    Preparing your adventure ✨
                </Text>
            </View>
        );
    }

    if (!environments || environments.length === 0) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
                <Text style={{ marginTop: 16, fontSize: 20, fontWeight: '700', color: '#121826' }}>
                    No Environments Available
                </Text>
                <Text style={{ marginTop: 8, fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                    No learning environments found. Check back later!
                </Text>
            </View>
        );
    }

    // Filter environments to only show those with assets
    const environmentsWithAssets = environments.filter(
        (environment) => getModelCount(environment, models) > 0
    );

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Premium Header */}
            <LinearGradient
                colors={['#FF6B6B', '#FF9F43', '#0EA5A4'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    marginHorizontal: 16,
                    marginTop: 16,
                    borderRadius: 20,
                    padding: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <View style={{
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        justifyContent: 'center', alignItems: 'center',
                    }}>
                        <Ionicons name="cube" size={24} color="#fff" />
                    </View>
                    <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff' }}>
                        AR Worlds
                    </Text>
                </View>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
                    Explore 3D models in augmented reality! 📱✨
                </Text>
            </LinearGradient>

            {/* Grid */}
            <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: 16,
                marginTop: 20,
                gap: 12,
            }}>
                {environmentsWithAssets.map((environment) => {
                    const modelCount = getModelCount(environment, models);
                    const gradientColors = getGradientColors(environment.gradient);
                    const emoji = getEnvEmoji(environment.name || environment.folderName);

                    return (
                        <TouchableOpacity
                            key={environment._id}
                            activeOpacity={0.85}
                            onPress={() => onEnvironmentSelect(environment)}
                            style={{
                                width: CARD_WIDTH,
                                height: 215,
                                borderRadius: 20,
                                overflow: 'hidden',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 3 },
                                shadowOpacity: 0.15,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <LinearGradient
                                colors={gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ flex: 1, padding: 16 }}
                            >
                                {/* Model Count Badge */}
                                <View style={{
                                    position: 'absolute', top: 10, right: 10,
                                    backgroundColor: 'rgba(255,255,255,0.3)',
                                    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
                                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>
                                        📦 {modelCount}
                                    </Text>
                                </View>

                                {/* Emoji Icon */}
                                <View style={{
                                    width: 64, height: 64, borderRadius: 20,
                                    backgroundColor: 'rgba(255,255,255,0.25)',
                                    justifyContent: 'center', alignItems: 'center',
                                    alignSelf: 'center',
                                    marginTop: 20,
                                    marginBottom: 16,
                                }}>
                                    <Text style={{ fontSize: 32 }}>{emoji}</Text>
                                </View>

                                {/* Name */}
                                <Text style={{
                                    fontSize: 16, fontWeight: '700', color: '#fff',
                                    textAlign: 'center', marginBottom: 4,
                                }}>
                                    {environment.name || environment.folderName}
                                </Text>

                                {/* Description */}
                                <Text style={{
                                    fontSize: 11, color: 'rgba(255,255,255,0.85)',
                                    textAlign: 'center', lineHeight: 15,
                                }} numberOfLines={2}>
                                    {environment.description || `Explore ${modelCount} amazing 3D models`}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </ScrollView>
    );
}
