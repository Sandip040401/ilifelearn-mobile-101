import EnvironmentGallery from '@/components/AR/EnvironmentGallery';
import ModelGallery from '@/components/AR/ModelGallery';
import ModelViewer from '@/components/AR/ModelViewer';
import SafeAreaView from '@/components/SafeAreaView';
import { fetchAllModals, getARFolders } from '@/services/arService';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, StatusBar, Text, TouchableOpacity, View } from 'react-native';

// Predefined environment metadata
const predefinedEnvironments = [
  { name: "Phonics Fun", gradient: "from-coral to-coral/70", description: "Learn sounds and letters with playful words" },
  { name: "Numbers", gradient: "from-secondary to-secondary/70", description: "Count and play with numbers" },
  { name: "My Body", gradient: "from-orchid to-orchid/70", description: "Discover your amazing body parts" },
  { name: "Underwater World", gradient: "from-teal to-teal/70", description: "Dive into the ocean depths" },
  { name: "Fruits & Vegetables", gradient: "from-teal to-teal/70", description: "Healthy and colorful treats" },
  { name: "Wild Animals", gradient: "from-accent to-accent/70", description: "Meet amazing creatures of the wild" },
  { name: "Amphibians", gradient: "from-coral to-coral/70", description: "Learn about frogs, toads, and more" },
  { name: "Farm Animals", gradient: "from-secondary to-secondary/70", description: "Discover life on the farm" },
  { name: "Transportation", gradient: "from-orchid to-orchid/70", description: "Cars, planes, and everything that moves!" },
  { name: "Space Adventure", gradient: "from-accent to-accent/70", description: "Planets, stars, and astronauts" },
  { name: "Extinct Animals", gradient: "from-coral to-coral/70", description: "Discover animals from the past" },
];

// Canonical ordering
const ORDER = [
  "Phonics", "Numbers", "Stories", "My Body", "Underwater", "Wild Animals",
  "Farm Animals", "Fruits and Vegetables", "Amphibians", "Transport", "Space", "Extinct Animal",
];

const RANK = ORDER.reduce<Record<string, number>>((acc, name, idx) => {
  acc[name] = idx;
  return acc;
}, {});

const normalizeName = (raw: string): string => {
  const s = (raw || "").trim().toLowerCase();
  if (s === "phonics" || s === "phonics fun") return "Phonics";
  if (s === "numbers") return "Numbers";
  if (s === "stories") return "Stories";
  if (s === "my body") return "My Body";
  if (s === "underwater" || s === "underwater world") return "Underwater";
  if (s === "wild animals") return "Wild Animals";
  if (s === "farm animals") return "Farm Animals";
  if (s === "fruits and vegetables" || s === "fruits & vegetables") return "Fruits and Vegetables";
  if (s === "amphibians") return "Amphibians";
  if (s === "transport" || s === "transportation") return "Transport";
  if (s === "space" || s === "space adventure") return "Space";
  if (s === "extinct animal" || s === "extinct animals") return "Extinct Animal";
  return raw;
};

// Tag-based model filter (same logic as WebAR_v2.jsx)
const getFilteredModels = (selectedEnvironment: any, models: any[]): any[] => {
  if (!selectedEnvironment || !models.length) return [];

  const envName = selectedEnvironment.name || selectedEnvironment.folderName;
  return models.filter((model: any) => {
    if (!model.tags) return false;
    return model.tags.some((tag: string) => {
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
  });
};

export default function AR() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<any[]>([]);
  const [modelOpts, setModelOpts] = useState<any>({});

  useEffect(() => {
    loadModels();
    fetchEnvironments();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await fetchAllModals();
      setModels(data.modals || []);
      setError(null);
    } catch (err: any) {
      setError("Failed to load models: " + err.message);
      console.error("Error loading models:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironments = async () => {
    try {
      const response = await getARFolders();
      const folders = response?.data?.data || [];

      // Exclude test folder
      const validFolders = folders.filter(
        (folder: any) => folder.folderName?.toLowerCase() !== "test"
      );

      // Merge with predefined metadata
      const merged = validFolders.map((folder: any) => {
        const canonical = normalizeName(folder.folderName);
        const match = predefinedEnvironments.find(
          (env) => normalizeName(env.name) === canonical
        );

        return {
          _id: folder._id,
          folderName: folder.folderName,
          name: match ? match.name : canonical,
          description: match ? match.description : "",
          imgURL: "",
          gradient: match ? match.gradient : "from-gray-300 to-gray-100",
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          __key: canonical,
        };
      });

      // Sort by custom order
      const sorted = [...merged].sort((a: any, b: any) => {
        const ra = Object.prototype.hasOwnProperty.call(RANK, a.__key)
          ? RANK[a.__key]
          : Number.POSITIVE_INFINITY;
        const rb = Object.prototype.hasOwnProperty.call(RANK, b.__key)
          ? RANK[b.__key]
          : Number.POSITIVE_INFINITY;
        if (ra === rb) return 0;
        return ra < rb ? -1 : 1;
      });

      setEnvironments(sorted);
    } catch (err) {
      console.error("Error fetching folders:", err);
      setEnvironments([]);
    }
  };

  const handleModelSelect = useCallback((model: any, opts: any = {}) => {
    setSelectedModel(model);
    setModelOpts(opts);
  }, []);

  const handleBackToGallery = useCallback(() => {
    setSelectedModel(null);
    setModelOpts({});
  }, []);

  const handleEnvironmentSelect = useCallback((environment: any) => {
    setSelectedEnvironment(environment);
  }, []);

  const handleBackToEnvironments = useCallback(() => {
    setSelectedEnvironment(null);
    setSelectedModel(null);
  }, []);

  // Error State
  if (error && !loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
            marginBottom: 16,
          }}>
            <Ionicons name="alert-circle" size={40} color="#EF4444" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#121826', marginBottom: 8 }}>
            Oops! Something went wrong
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              loadModels();
              fetchEnvironments();
            }}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#6C4CFF', borderRadius: 14,
              paddingHorizontal: 24, paddingVertical: 14,
              flexDirection: 'row', alignItems: 'center', gap: 8,
              shadowColor: '#6C4CFF', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
            }}
          >
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main content (Environment Gallery or Model Gallery)
  const mainContent = selectedEnvironment ? (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FF' }}>
      <ModelGallery
        models={getFilteredModels(selectedEnvironment, models)}
        onModelSelect={handleModelSelect}
        environments={environments}
        onEnvironmentSelect={handleEnvironmentSelect}
        selectedEnvironment={selectedEnvironment}
        onBackToEnvironments={handleBackToEnvironments}
      />
    </SafeAreaView>
  ) : (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F7FF' }}>
      <EnvironmentGallery
        environments={environments}
        models={models}
        onEnvironmentSelect={handleEnvironmentSelect}
        loading={loading}
      />
    </SafeAreaView>
  );

  return (
    <>
      {mainContent}

      {/* Fullscreen Modal for ModelViewer - hides tabs completely */}
      <Modal
        visible={!!selectedModel}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={handleBackToGallery}
      >
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        {selectedModel && (
          <ModelViewer
            model={selectedModel}
            environmentContext={selectedEnvironment}
            onBack={handleBackToGallery}
            environments={environments}
            onEnvironmentSelect={handleEnvironmentSelect}
            modelList={models}
            onModelSelect={handleModelSelect}
            openPainter={modelOpts?.openPainter || false}
            initialPaintMode={modelOpts?.mode || 'model'}
          />
        )}
      </Modal>
    </>
  );
}
