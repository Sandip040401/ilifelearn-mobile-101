import { getPreviewImageUrl } from '@/services/arService';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Gradient color mapping from environment gradient strings
const GRADIENT_MAP: Record<string, readonly [string, string, ...string[]]> = {
    'from-coral to-coral/70': ['#FF6B6B', '#FF8E8E'],
    'from-secondary to-secondary/70': ['#6C4CFF', '#8B72FF'],
    'from-orchid to-orchid/70': ['#DA70D6', '#E890E8'],
    'from-teal to-teal/70': ['#0EA5A4', '#3CBFBE'],
    'from-accent to-accent/70': ['#FF9F43', '#FFB56D'],
    'from-gray-300 to-gray-100': ['#9CA3AF', '#D1D5DB'],
};

const getGradientColors = (gradient: string): readonly [string, string, ...string[]] => {
    const mapped = GRADIENT_MAP[gradient];
    if (mapped) return mapped;
    return ['#DA70D6', '#E890E8'] as const;
};

interface Environment {
    _id: string;
    folderName: string;
    name: string;
    description: string;
    gradient: string;
}

interface Model {
    id?: string;
    _id?: string;
    name: string;
    tags?: string[];
    previewImage?: string;
    icon?: string;
    level?: string | number;
    difficulty?: string | number;
}

interface Props {
    models: Model[];
    onModelSelect: (model: Model, opts?: { openPainter?: boolean; mode?: string }) => void;
    environments: Environment[];
    onEnvironmentSelect: (env: Environment) => void;
    selectedEnvironment: Environment | null;
    onBackToEnvironments: () => void;
}

const levelMap: Record<string, number> = {
    basic: 1,
    beginner: 1,
    intermediate: 2,
    medium: 2,
    advanced: 3,
    hard: 3,
};

const getLevel = (model: Model): number => {
    const rawLevel = model.level || model.difficulty;
    if (typeof rawLevel === 'string') return levelMap[rawLevel.toLowerCase()] || 1;
    return Number(rawLevel) || 1;
};

const getStars = (level: number): string => '⭐'.repeat(level);

export default function ModelGallery({
    models,
    onModelSelect,
    environments,
    onEnvironmentSelect,
    selectedEnvironment,
    onBackToEnvironments,
}: Props) {
    const gradientColors = selectedEnvironment?.gradient
        ? getGradientColors(selectedEnvironment.gradient)
        : (['#DA70D6', '#6C4CFF'] as const);

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <LinearGradient
                colors={['#DA70D6', '#6C4CFF', '#4A90D9'] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    marginHorizontal: 16,
                    marginTop: 16,
                    borderRadius: 20,
                    padding: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 12,
                    elevation: 8,
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={onBackToEnvironments}
                            activeOpacity={0.7}
                            style={{
                                width: 40, height: 40, borderRadius: 12,
                                backgroundColor: 'rgba(255,255,255,0.25)',
                                justifyContent: 'center', alignItems: 'center',
                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                            }}
                        >
                            <Ionicons name="chevron-back" size={22} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="cube-outline" size={22} color="#fff" />
                                <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }} numberOfLines={1}>
                                    3D Models
                                </Text>
                            </View>
                            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                                {selectedEnvironment?.name || 'All Models'} • {models.length} models 🎨✨
                            </Text>
                        </View>
                    </View>

                    {/* Environment Picker */}
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
                            borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                            flexDirection: 'row', alignItems: 'center', gap: 6,
                        }}
                        onPress={onBackToEnvironments}
                    >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
                            🌍 Worlds
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Models Grid */}
            {(!models || models.length === 0) ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
                    <View style={{
                        width: 80, height: 80, borderRadius: 40,
                        backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center',
                        marginBottom: 16,
                    }}>
                        <Ionicons name="cube-outline" size={40} color="#94A3B8" />
                    </View>
                    <Text style={{ fontSize: 22, fontWeight: '700', color: '#121826', marginBottom: 8 }}>
                        No Models Available
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
                        {selectedEnvironment
                            ? `No 3D models found for ${selectedEnvironment.name || selectedEnvironment.folderName}.`
                            : 'No 3D models found in the gallery.'}
                    </Text>
                    <TouchableOpacity
                        onPress={onBackToEnvironments}
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row', alignItems: 'center', gap: 8,
                            paddingHorizontal: 20, paddingVertical: 12,
                            borderRadius: 14,
                            overflow: 'hidden',
                        }}
                    >
                        <LinearGradient
                            colors={['#DA70D6', '#6C4CFF'] as const}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            }}
                        />
                        <Ionicons name="chevron-back" size={18} color="#fff" />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                            Back to Environments
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16, paddingTop: 16 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Model count */}
                    <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>
                        <Text style={{ fontWeight: '700', color: '#121826' }}>{models.length}</Text> models available
                    </Text>

                    {/* Grid */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {models.map((model, index) => {
                            const level = getLevel(model);
                            const stars = getStars(level);
                            const cardGradient = getGradientColors(selectedEnvironment?.gradient || '');

                            return (
                                <View
                                    key={model.id || model._id || index}
                                    style={{
                                        width: CARD_WIDTH,
                                        borderRadius: 20,
                                        overflow: 'hidden',
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 3 },
                                        shadowOpacity: 0.15,
                                        shadowRadius: 8,
                                        elevation: 5,
                                        backgroundColor: '#fff',
                                    }}
                                >
                                    <LinearGradient
                                        colors={cardGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{ padding: 12 }}
                                    >
                                        {/* Preview Image */}
                                        <View style={{
                                            backgroundColor: 'rgba(255,255,255,0.25)',
                                            borderRadius: 16, overflow: 'hidden',
                                            height: 100, justifyContent: 'center', alignItems: 'center',
                                            marginBottom: 10,
                                        }}>
                                            {model.previewImage ? (
                                                <Image
                                                    source={{ uri: getPreviewImageUrl(model.previewImage) }}
                                                    style={{ width: '100%', height: '100%' }}
                                                    contentFit="contain"
                                                    transition={300}
                                                />
                                            ) : (
                                                <Text style={{ fontSize: 40 }}>{model.icon || '🎨'}</Text>
                                            )}
                                        </View>

                                        {/* Model Name + Level */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{
                                                fontSize: 14, fontWeight: '700', color: '#fff', flex: 1,
                                            }} numberOfLines={1}>
                                                {model.name}
                                            </Text>
                                            <View style={{
                                                backgroundColor: 'rgba(255,255,255,0.2)',
                                                borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
                                                borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                                            }}>
                                                <Text style={{ fontSize: 10, color: '#fff' }}>{stars}</Text>
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View style={{ flexDirection: 'row', gap: 6 }}>
                                            {/* View 3D */}
                                            <TouchableOpacity
                                                onPress={() => onModelSelect(model)}
                                                activeOpacity={0.85}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: '#fff',
                                                    borderRadius: 12, paddingVertical: 9,
                                                    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4,
                                                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
                                                }}
                                            >
                                                <Ionicons name="cube" size={14} color="#121826" />
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#121826' }}>3D</Text>
                                            </TouchableOpacity>

                                            {/* Coloring Sheet */}
                                            <TouchableOpacity
                                                onPress={() => onModelSelect(model, { openPainter: true, mode: 'target' })}
                                                activeOpacity={0.85}
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                                    borderRadius: 12, paddingVertical: 9,
                                                    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4,
                                                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
                                                }}
                                            >
                                                <Ionicons name="image" size={14} color="#fff" />
                                                <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Sheet</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </LinearGradient>
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            )}
        </View>
    );
}
