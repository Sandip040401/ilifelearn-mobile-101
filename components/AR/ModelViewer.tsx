import {
    fetchModalAudios,
    getAudioStreamUrlById,
    getModelFileUrl,
    getPreviewImageUrl,
} from '@/services/arService';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    NativeEventEmitter,
    NativeModules,
    Platform,
    Image as RNImage,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { openNativeAR } from './nativeAR';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TARGET_ASSETS: Record<string, any> = {
    'Bear': require('../../assets/targets/Bear.jpeg'),
    'Dog': require('../../assets/targets/Dog.jpg'),
    'Dolphin': require('../../assets/targets/Dolphin.jpg'),
    'Elephant': require('../../assets/targets/Elephant.jpg'),
    'Wolf': require('../../assets/targets/Wolf.jpg'),
};

// Language & difficulty ordering
const LANGUAGE_ORDER = [
    "English (India)", "English (US)", "English (UK)",
    "Hindi", "Marathi", "Malayalam", "Punjabi",
    "Guajarati", "Telegu", "Kannada", "Tamil", "Odia", "Bengali",
];
const DIFFICULTY_ORDER = ["basic", "intermediate", "advance", "advanced"];

const sortByOrder = (items: string[], orderArray: string[]) => {
    return [...items].sort((a, b) => {
        const indexA = orderArray.findIndex(o => o.toLowerCase() === a.toLowerCase());
        const indexB = orderArray.findIndex(o => o.toLowerCase() === b.toLowerCase());
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};

// Lighting configs
const LIGHTING_OPTIONS = [
    { name: "sunset", label: "🌅 Sunset", bgColors: ['#1a0a2e', '#4a1c5c', '#d4576b', '#f4a460'] as const },
    { name: "dawn", label: "🌄 Dawn", bgColors: ['#0d1b2a', '#1b263b', '#e63946', '#ffbe0b'] as const },
    { name: "night", label: "🌙 Night", bgColors: ['#0b1226', '#07102a', '#0a0e1a', '#0b1226'] as const },
    { name: "warehouse", label: "🏢 Studio", bgColors: ['#2d3436', '#4a4a4a', '#636e72', '#2d3436'] as const },
    { name: "forest", label: "🌲 Forest", bgColors: ['#0a1d10', '#1a3c28', '#2d5a3d', '#4a7c59'] as const },
    { name: "apartment", label: "🏠 Room", bgColors: ['#f5f5dc', '#d4c4a8', '#c9b896', '#f5f5dc'] as const },
];

// Paint brush color swatches
const COLOR_SWATCHES = ['#ff0000', '#00b894', '#0984e3', '#fdcb6e', '#6c5ce7', '#e17055', '#00cec9', '#fd79a8'];

interface AudioItem {
    _id: string;
    gridfsId: string;
    language: string;
    level: string;
    filename?: string;
    audioName?: string;
}

interface Model {
    id?: string;
    _id?: string;
    name: string;
    file?: string;
    previewImage?: string;
    tags?: string[];
    level?: string | number;
    difficulty?: string | number;
}

interface Environment {
    _id: string;
    folderName: string;
    name: string;
    gradient: string;
}

interface Props {
    model: Model;
    environmentContext: Environment | null;
    onBack: () => void;
    environments: Environment[];
    onEnvironmentSelect: (env: Environment) => void;
    modelList: Model[];
    onModelSelect: (model: Model, opts?: any) => void;
    openPainter?: boolean;
    initialPaintMode?: string;
}

export default function ModelViewer({
    model,
    environmentContext,
    onBack,
    environments,
    onEnvironmentSelect,
    modelList,
    onModelSelect,
    openPainter = false,
    initialPaintMode = 'model',
}: Props) {
    const insets = useSafeAreaInsets();
    const [loadingModel, setLoadingModel] = useState(true);
    const [environment, setEnvironment] = useState("sunset");
    const [autoRotate, setAutoRotate] = useState(true);
    const [wireframe, setWireframe] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    // Panel states
    const [showLeftMenu, setShowLeftMenu] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(false);

    // Paint states
    const [paintMode, setPaintMode] = useState<'model' | 'target'>('model');
    const [paintingEnabled, setPaintingEnabled] = useState(false);
    const [brushColor, setBrushColor] = useState('#ff0000');
    const [brushSize, setBrushSize] = useState(12);
    const [showBrushControls, setShowBrushControls] = useState(false);
    const [textureDisplayMode, setTextureDisplayMode] = useState<'original' | 'model-paint' | 'target-paint'>('original');
    const [showTargetPainter, setShowTargetPainter] = useState(false);
    const [animations, setAnimations] = useState<string[]>([]);
    const [selectedAnimation, setSelectedAnimation] = useState<string | null>(null);
    // Index-keyed native AR animation (Android only)
    const [selectedAnimationIndex, setSelectedAnimationIndex] = useState(0);

    const [isExporting, setIsExporting] = useState(false);
    const [exportStatusText, setExportStatusText] = useState('');

    const sheetWebViewRef = useRef<WebView>(null);

    // Audio states
    const [availableAudios, setAvailableAudios] = useState<AudioItem[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [selectedAudio, setSelectedAudio] = useState<AudioItem | null>(null);
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    // Assets search
    const [assetSearchTerm, setAssetSearchTerm] = useState('');

    const webViewRef = useRef<WebView>(null);

    const audioUrl = useMemo(() => {
        return selectedAudio ? getAudioStreamUrlById(selectedAudio.gridfsId) : null;
    }, [selectedAudio]);

    const audioPlayer = useAudioPlayer(audioUrl);

    const audioStatus = useAudioPlayerStatus(audioPlayer);

    useEffect(() => {
        setAudioPlaying(audioStatus.playing);
    }, [audioStatus.playing]);

    useEffect(() => {
        audioPlayer.volume = volume / 100;
    }, [volume]);

    // ── Native AR animation bridge (Android) ────────────────────────────────
    // The Kotlin ARActivity emits "onARAnimations" with the list of animation
    // names as soon as a model is placed in AR.
    useEffect(() => {
        if (Platform.OS !== 'android') return;
        const arModule = NativeModules.ARNativeModule;
        if (!arModule) return;
        const emitter = new NativeEventEmitter(arModule);
        const sub = emitter.addListener('onARAnimations', (list: string[]) => {
            setAnimations(list);
            if (list.length > 0) {
                setSelectedAnimation(list[0]);
                setSelectedAnimationIndex(0);
            }
        });
        return () => sub.remove();
    }, []);

    const modelId = model?.id || model?._id || '';
    const modelFileUrl = getModelFileUrl(modelId);

    // Current lighting config
    const currentLighting = LIGHTING_OPTIONS.find(l => l.name === environment) || LIGHTING_OPTIONS[0];

    // Get models for current environment
    const getModelsForEnvironment = useCallback((env: Environment | null) => {
        if (!env || !modelList.length) return [];
        const envName = env.name || env.folderName;
        return modelList.filter((m) => {
            if (!m.tags) return false;
            return m.tags.some((tag) => {
                const normalizedTag = tag.toLowerCase().trim();
                const normalizedEnv = envName.toLowerCase().trim();
                if (normalizedTag === normalizedEnv) return true;
                if (normalizedTag === "wild animals" && normalizedEnv.includes("wild animals")) return true;
                if (normalizedTag === "farm animals" && normalizedEnv.includes("farm animals")) return true;
                if (normalizedTag === "extinct animals" && normalizedEnv.includes("extinct animals")) return true;
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
    }, [modelList]);

    // Filter environments that have at least one model
    const environmentsWithAssets = environments.filter(
        (env) => getModelsForEnvironment(env).length > 0
    );

    const currentEnvModels = getModelsForEnvironment(environmentContext);

    // Filter assets by search
    const filteredEnvModels = assetSearchTerm
        ? currentEnvModels.filter(m => m.name?.toLowerCase().includes(assetSearchTerm.toLowerCase()))
        : currentEnvModels;

    // Load audios on model change
    useEffect(() => {
        let cancelled = false;
        const loadAudios = async () => {
            try {
                if (!modelId) return;
                const data = await fetchModalAudios(modelId);
                if (cancelled) return;
                if (data && data.success) {
                    const audios: AudioItem[] = data.audios || [];
                    setAvailableAudios(audios);
                    const languages = sortByOrder([...new Set(audios.map(a => a.language))], LANGUAGE_ORDER);
                    if (languages.length > 0) {
                        const defaultLang = languages[0];
                        setSelectedLanguage(defaultLang);
                        const audiosInLang = audios.filter(a => a.language === defaultLang);
                        const levels = sortByOrder([...new Set(audiosInLang.map(a => a.level))], DIFFICULTY_ORDER);
                        if (levels.length > 0) {
                            setSelectedLevel(levels[0]);
                            const audiosInLevel = audiosInLang.filter(a => a.level === levels[0]);
                            setSelectedAudio(audiosInLevel.length > 0 ? audiosInLevel[0] : null);
                        }
                    }
                } else {
                    setAvailableAudios([]);
                }
            } catch (err) {
                console.warn("Failed to load audios:", err);
            }
        };
        loadAudios();
        return () => { cancelled = true; };
    }, [modelId]);


    // Reset paint states on model change
    useEffect(() => {
        setPaintingEnabled(false);
        setTextureDisplayMode('original');
        setShowTargetPainter(false);
        setBrushColor('#ff0000');
        setBrushSize(12);
        // If opened from gallery with 'Sheet' button
        if (openPainter && initialPaintMode === 'target') {
            setPaintMode('target');
            setShowTargetPainter(true);
        }
    }, [modelId]);

    // Open painter if requested
    useEffect(() => {
        if (openPainter) {
            setPaintMode(initialPaintMode === 'target' ? 'target' : 'model');
            if (initialPaintMode === 'target') setShowTargetPainter(true);
        }
    }, [openPainter, initialPaintMode]);

    // Play/Pause audio
    const toggleAudio = async () => {
        try {
            if (audioPlayer.playing) {
                audioPlayer.pause();
            } else if (selectedAudio) {
                audioPlayer.play();
            }
        } catch (err) {
            console.warn("Audio playback error:", err);
            setAudioPlaying(false);
        }
    };

    // Language / level helpers
    const uniqueLanguages = sortByOrder([...new Set(availableAudios.map(a => a.language))], LANGUAGE_ORDER);
    const uniqueLevels = selectedLanguage
        ? sortByOrder([...new Set(availableAudios.filter(a => a.language === selectedLanguage).map(a => a.level))], DIFFICULTY_ORDER)
        : [];

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
        const audiosInLang = availableAudios.filter(a => a.language === language);
        const levels = sortByOrder([...new Set(audiosInLang.map(a => a.level))], DIFFICULTY_ORDER);
        if (levels.length > 0) {
            setSelectedLevel(levels[0]);
            const audiosInLevel = audiosInLang.filter(a => a.level === levels[0]);
            setSelectedAudio(audiosInLevel.length > 0 ? audiosInLevel[0] : null);
        }
    };

    const handleLevelChange = (level: string) => {
        setSelectedLevel(level);
        const filtered = availableAudios.filter(a => a.language === selectedLanguage && a.level === level);
        setSelectedAudio(filtered.length > 0 ? filtered[0] : null);
    };

    // AR launch via system
    const handleOpenAR = () => {
        if (textureDisplayMode !== 'original') {
            setIsExporting(true);
            setExportStatusText('Preparing Custom AR Model...');
            webViewRef.current?.postMessage(JSON.stringify({ type: 'exportGLB' }));
            return;
        }
        launchARWithUrl(modelFileUrl);
    };

    const launchARWithUrl = async (url: string) => {
        if (Platform.OS === 'android') {
            openNativeAR(url, model.name, availableAudios, animations);
        } else {
            // iOS - use USDZ Quick Look if available, or model-viewer's AR
            const quickLookUrl = url;
            Linking.openURL(quickLookUrl).catch(() => {
                console.warn('Could not open AR on iOS');
            });
        }
    };

    const handleExportedGLB = async (base64: string) => {
        const tempPath = FileSystem.cacheDirectory + 'custom_model.glb';
        try {
            setExportStatusText('Saving file for AR...');

            // Clean up any old export first
            await FileSystem.deleteAsync(tempPath, { idempotent: true });
            await FileSystem.writeAsStringAsync(tempPath, base64, { encoding: FileSystem.EncodingType.Base64 });

            if (Platform.OS === 'android') {
                setIsExporting(false);
                // tempPath from FileSystem.cacheDirectory already includes "file://"
                // e.g. "file:///data/user/0/.../cache/custom_model.glb"
                // Do NOT prepend "file://" again — it would produce a broken URI.
                openNativeAR(tempPath, model.name, availableAudios, animations);
            } else {
                setIsExporting(false);
                Linking.openURL(tempPath).catch(() => console.warn('QuickLook failed'));
            }
        } catch (err) {
            setIsExporting(false);
            console.warn('Export save failed:', err);
            FileSystem.deleteAsync(tempPath, { idempotent: true }).catch(() => { });
        }
    };

    // Send paint commands to main Model WebView
    const sendToWebView = (msg: any) => {
        webViewRef.current?.postMessage(JSON.stringify(msg));
    };

    // Send paint commands to 2D Coloring Sheet WebView
    const sendToSheetWebView = (msg: any) => {
        sheetWebViewRef.current?.postMessage(JSON.stringify(msg));
    };

    // Sync brush settings to WebViews
    useEffect(() => {
        sendToWebView({ type: 'setBrushColor', value: brushColor });
        sendToSheetWebView({ type: 'setBrushColor', value: brushColor });
    }, [brushColor]);

    useEffect(() => {
        sendToWebView({ type: 'setBrushSize', value: brushSize });
        sendToSheetWebView({ type: 'setBrushSize', value: brushSize });
    }, [brushSize]);

    // Generate the WebView HTML - Full Three.js scene with painting
    const modelViewerHTML = useMemo(() => {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>3D Viewer</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; touch-action: none; }
        canvas { display: block; width: 100%; height: 100%; touch-action: none; }
        #status {
            position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
            color: white; font-family: system-ui; font-size: 12px; font-weight: 600;
            background: rgba(0,0,0,0.5); padding: 6px 14px; border-radius: 20px; z-index: 10;
            transition: opacity 0.5s;
        }
        #status.hidden { opacity: 0; pointer-events: none; }
        #paintIndicator {
            position: absolute; top: 8px; left: 50%; transform: translateX(-50%);
            color: white; font-family: system-ui; font-size: 11px; font-weight: 600;
            background: rgba(108,76,255,0.8); padding: 4px 12px; border-radius: 12px;
            z-index: 10; transition: opacity 0.3s; opacity: 0; pointer-events: none;
        }
        #paintIndicator.visible { opacity: 1; }
    </style>
</head>
<body>
    <div id="status">Loading model...</div>
    <div id="paintIndicator">🖌️ Paint Mode</div>
    <script type="importmap">
    { "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/"
    }}
    </script>
    <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

    function arrayBufferToBase64(buffer) {
        return new Promise((resolve) => {
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result.split(',')[1]);
            };
            reader.readAsDataURL(blob);
        });
    }

    const status = document.getElementById('status');
    const paintIndicator = document.getElementById('paintIndicator');
    function postMsg(obj) { try { window.ReactNativeWebView.postMessage(JSON.stringify(obj)); } catch(e) {} }

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2, 2, 5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    document.body.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true; // Synced via WebView messaging
    controls.autoRotateSpeed = 1.5;
    controls.minDistance = 1;
    controls.maxDistance = 20;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
    dirLight.position.set(10, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(-10, -10, -10);
    scene.add(pointLight);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.4;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x0ea5a4, 0x063047);
    grid.position.y = -1.4;
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    scene.add(grid);

    // State
    let loadedModel = null;
    let mixer = null;
    let paintingEnabled = false;
    let brushColor = '#ff0000'; // Default, synced via messaging
    let brushSize = 12; // Default, synced via messaging
    let pointerDown = false;
    let isPlaying = true;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const lastPoints = new Map();
    const PAINT_TEX_SIZE = 1024;

    // Load model
    const loader = new GLTFLoader();
    loader.load(
        '${modelFileUrl}',
        (gltf) => {
            loadedModel = gltf.scene;
            scene.add(loadedModel);

            // Auto-center and scale
            const box = new THREE.Box3().setFromObject(loadedModel);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 2.5 / maxDim;
            loadedModel.scale.setScalar(scale);
            loadedModel.position.sub(center.multiplyScalar(scale));
            loadedModel.position.y -= (box.min.y * scale);

            // Enable shadows and setup paint canvases
            loadedModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Create paint canvas for this mesh
                    setupPaintCanvas(child);
                }
            });

            // Animations
            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(loadedModel);
                window._gltfAnimations = gltf.animations;
                const names = gltf.animations.map(a => a.name || 'Action');
                postMsg({ type: 'animations', list: names });
                window._currentAnimation = gltf.animations[0];
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
            }

            status.classList.add('hidden');
            postMsg({ type: 'loaded' });
        },
        (progress) => {
            if (progress.total > 0) {
                const pct = Math.round((progress.loaded / progress.total) * 100);
                status.textContent = 'Loading... ' + pct + '%';
                postMsg({ type: 'progress', percent: pct });
            }
        },
        (error) => {
            status.textContent = 'Failed to load model';
            postMsg({ type: 'error', message: error.message || 'Load error' });
        }
    );

    // Paint canvas setup per mesh
    function setupPaintCanvas(mesh) {
        if (!mesh.geometry || !mesh.geometry.attributes.uv) return;
        const canvas = document.createElement('canvas');
        canvas.width = PAINT_TEX_SIZE;
        canvas.height = PAINT_TEX_SIZE;
        const ctx = canvas.getContext('2d');
        // Initialize paint canvas with pure white background, so when '3D Paint' mode is toggled, the model turns white ready for painting
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, PAINT_TEX_SIZE, PAINT_TEX_SIZE);
        const tex = new THREE.CanvasTexture(canvas);
        tex.flipY = true;
        tex.colorSpace = THREE.SRGBColorSpace;
        const origMap = (mesh.material && mesh.material.map) ? mesh.material.map : null;
        const mat = mesh.material.clone();
        mat.map = origMap || tex;
        mat.needsUpdate = true;
        mesh.material = mat;
        mesh.userData.paint = { canvas, ctx, tex, origMap, size: PAINT_TEX_SIZE };
    }

    // Paint at intersection
    function paintAt(intersect) {
        if (!intersect) return;
        const uv = intersect.uv;
        const mesh = intersect.object;
        if (!mesh || !mesh.userData.paint || !uv) return;
        const { ctx, tex, size } = mesh.userData.paint;
        const px = Math.floor(Math.max(0, Math.min(1, uv.x)) * size);
        const py = Math.floor((1 - Math.max(0, Math.min(1, uv.y))) * size);
        ctx.fillStyle = brushColor;
        ctx.beginPath();
        ctx.arc(px, py, brushSize, 0, Math.PI * 2);
        ctx.fill();
        // Line from last point
        const key = mesh.uuid;
        const prev = lastPoints.get(key);
        if (prev) {
            ctx.strokeStyle = brushColor;
            ctx.lineWidth = brushSize * 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(px, py);
            ctx.stroke();
        }
        lastPoints.set(key, { x: px, y: py });
        tex.needsUpdate = true;
    }

    // Pointer handlers for painting
    function getPointer(e) {
        const rect = renderer.domElement.getBoundingClientRect();
        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        pointer.x = ((cx - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((cy - rect.top) / rect.height) * 2 + 1;
    }

    renderer.domElement.addEventListener('pointerdown', (e) => {
        if (!paintingEnabled) return;
        pointerDown = true;
        getPointer(e);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(scene, true);
        if (hits.length > 0) paintAt(hits[0]);
    });
    renderer.domElement.addEventListener('pointermove', (e) => {
        if (!paintingEnabled || !pointerDown) return;
        getPointer(e);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(scene, true);
        if (hits.length > 0) paintAt(hits[0]);
    });
    window.addEventListener('pointerup', () => {
        pointerDown = false;
        lastPoints.clear();
    });

    // Message handler from React Native
    function handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'toggleRotate') controls.autoRotate = data.value;
            if (data.type === 'togglePlay') {
                isPlaying = data.value;
                if (mixer) {
                    mixer.timeScale = isPlaying ? 1 : 0;
                }
            }
            if (data.type === 'setAnimation') {
                if (mixer && window._gltfAnimations) {
                    mixer.stopAllAction();
                    const clip = window._gltfAnimations.find(a => (a.name || 'Action') === data.value);
                    if (clip) {
                        window._currentAnimation = clip;
                        const action = mixer.clipAction(clip);
                        action.play();
                        mixer.timeScale = isPlaying ? 1 : 0;
                    }
                }
            }
            if (data.type === 'toggleWireframe') {
                if (loadedModel) {
                    loadedModel.traverse(c => {
                        if (c.isMesh) { c.material.wireframe = data.value; c.material.needsUpdate = true; }
                    });
                }
            }
            if (data.type === 'enablePaint') {
                paintingEnabled = data.value;
                controls.enabled = !data.value;
                paintIndicator.classList.toggle('visible', data.value);
            }
            if (data.type === 'setBrushColor') brushColor = data.value;
            if (data.type === 'setBrushSize') brushSize = data.value;
            if (data.type === 'clearPaint') {
                if (loadedModel) {
                    loadedModel.traverse(c => {
                        if (c.isMesh && c.userData.paint) {
                            const p = c.userData.paint;
                            p.ctx.fillStyle = '#ffffff';
                            p.ctx.fillRect(0, 0, p.size, p.size);
                            p.tex.needsUpdate = true;
                        }
                    });
                }
            }
            if (data.type === 'showPaintTexture') {
                if (loadedModel) {
                    loadedModel.traverse(c => {
                        if (c.isMesh && c.userData.paint) {
                            c.material.map = c.userData.paint.tex;
                            c.material.needsUpdate = true;
                        }
                    });
                }
            }
            if (data.type === 'showOriginalTexture') {
                if (loadedModel) {
                    loadedModel.traverse(c => {
                        if (c.isMesh && c.userData.paint && c.userData.paint.origMap) {
                            c.material.map = c.userData.paint.origMap;
                            c.material.needsUpdate = true;
                        }
                    });
                }
            }
            if (data.type === 'applyTargetTexture' && data.dataUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    if (loadedModel) {
                        loadedModel.traverse(c => {
                            if (c.isMesh && c.geometry && c.geometry.attributes.uv) {
                                const tex = new THREE.CanvasTexture(img);
                                tex.flipY = false;
                                tex.colorSpace = THREE.SRGBColorSpace;
                                tex.channel = 1; // apply to second UV if mapped there
                                c.material.map = tex;
                                c.material.needsUpdate = true;
                            }
                        });
                    }
                };
                img.src = data.dataUrl;
            }
            if (data.type === 'exportGLB') {
                if (!loadedModel) return;
                postMsg({ type: 'exportStatus', status: 'Exporting 3D scene... (this may take a moment)' });

                // ── Flush textures and FIX UVs for AR before export ───────────
                // AR Viewers (like Android Sceneform) often ignore TEXCOORD_1 for base color.
                // The Target Sheet uses uv1 (channel 1). We must temporarily swap uv and uv1
                // and set the channel back to 0 so the exported GLB uses TEXCOORD_0 for the paint.
                const restoreStates = [];

                loadedModel.traverse(c => {
                    if (c.isMesh && c.material && c.material.map) {
                        c.material.map.needsUpdate = true;
                        if (c.material.map.channel === 1 && c.geometry && c.geometry.attributes.uv1) {
                            // Store original state
                            restoreStates.push({
                                mat: c.material,
                                map: c.material.map,
                                origUv: c.geometry.attributes.uv,
                                geom: c.geometry
                            });
                            // Swap UV channels for export
                            c.geometry.setAttribute('uv', c.geometry.attributes.uv1);
                            c.material.map.channel = 0;
                        }
                    }
                });

                // Force one extra render so the flushed texture is GPU-resident
                renderer.render(scene, camera);

                const exporter = new GLTFExporter();
                // Export ALL original animations to ensure Sceneform's bone mapping doesn't detach or fail
                const exportAnims = window._gltfAnimations || [];

                const cleanupAndRestore = () => {
                    restoreStates.forEach(s => {
                        s.geom.setAttribute('uv', s.origUv);
                        s.map.channel = 1;
                    });
                };

                exporter.parse(
                    loadedModel,
                    async function(gltf) {
                        cleanupAndRestore();
                        postMsg({ type: 'exportStatus', status: 'Converting file format...' });
                        try {
                            const base64 = await arrayBufferToBase64(gltf);
                            postMsg({ type: 'glbData', base64: base64 });
                        } catch (e) {
                            postMsg({ type: 'error', message: 'Base64 conversion failed: ' + e.message });
                        }
                    },
                    function(error) {
                        cleanupAndRestore();
                        postMsg({ type: 'error', message: 'Export failed: ' + error });
                    },
                    { binary: true, animations: exportAnims }
                );
            }

        } catch (e) {}
    }
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage);

    // Render loop
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    </script>
</body>
</html>`;
    }, [modelFileUrl]);

    const targetUrl = useMemo(() => {
        const modelName = model?.name || '';
        let asset = TARGET_ASSETS[modelName];
        if (!asset) {
            const foundKey = Object.keys(TARGET_ASSETS).find(
                key => key.toLowerCase() === modelName.toLowerCase()
            );
            if (foundKey) asset = TARGET_ASSETS[foundKey];
        }
        if (!asset) asset = Object.values(TARGET_ASSETS)[0];

        const assetSource = RNImage.resolveAssetSource(asset);
        return assetSource?.uri || '';
    }, [model?.name]);

    // Generate coloring sheet WebView HTML
    const colorSheetHTML = useMemo(() => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { width: 100%; height: 100%; overflow: hidden; background: #f0f0f0; touch-action: none; display: flex; align-items: center; justify-content: center; }
        #wrapper { position: relative; display: inline-block; }
        canvas { display: block; touch-action: none; }
        #bgCanvas { position: absolute; top: 0; left: 0; pointer-events: none; }
        #drawCanvas { position: absolute; top: 0; left: 0; cursor: crosshair; }
        #loading {
            position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
            color: #666; font-family: system-ui; pointer-events: none; user-select: none; -webkit-user-select: none;
        }
    </style>
</head>
<body>
    <div id="wrapper">
        <canvas id="bgCanvas"></canvas>
        <canvas id="drawCanvas"></canvas>
        <div id="loading">Loading image...</div>
    </div>
    <canvas id="maskCanvas" style="display:none"></canvas>
    <script>
    var bgCanvas = document.getElementById('bgCanvas');
    var drawCanvas = document.getElementById('drawCanvas');
    var maskCanvas = document.getElementById('maskCanvas');
    var wrapper = document.getElementById('wrapper');
    var loadingEl = document.getElementById('loading');
    var isDrawing = false, lastPos = null;
    var bColor = '#ff0000', bSize = 12; // Defaults, synced via messages
    function postMsg(o) { try { window.ReactNativeWebView.postMessage(JSON.stringify(o)); } catch(e) {} }

    var img = new Image();
    var canUseMask = true;
    function setupImageHandlers() {
        img.onload = function() {
            var maxW = window.innerWidth - 16;
            var maxH = window.innerHeight - 16;
            var sc = Math.min(1, maxW / img.width, maxH / img.height);
            var w = Math.floor(img.width * sc);
            var h = Math.floor(img.height * sc);
            if(w <= 0 || h <= 0) return;
            bgCanvas.width = w; bgCanvas.height = h;
            drawCanvas.width = w; drawCanvas.height = h;
            maskCanvas.width = w; maskCanvas.height = h;
            wrapper.style.width = w + 'px';
            wrapper.style.height = h + 'px';
            bgCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
            
            try {
                var mCtx = maskCanvas.getContext('2d');
                mCtx.drawImage(img, 0, 0, w, h);
                var id = mCtx.getImageData(0, 0, w, h);
                for (var i = 0; i < id.data.length; i += 4) {
                    if (id.data[i] > 230 && id.data[i+1] > 230 && id.data[i+2] > 230) {
                        id.data[i] = 255; id.data[i+1] = 255; id.data[i+2] = 255; id.data[i+3] = 255;
                    } else {
                        id.data[i] = 0; id.data[i+1] = 0; id.data[i+2] = 0; id.data[i+3] = 0;
                    }
                }
                mCtx.putImageData(id, 0, 0);
            } catch (e) {
                console.warn("Mask generation failed:", e);
                canUseMask = false;
            }
            
            loadingEl.style.display = 'none';
            postMsg({ type: 'sheetLoaded' });
        };
    }

    function tryLoadImage() {
        var tUrl = ${JSON.stringify(targetUrl)};
        if (!tUrl) {
            loadingEl.textContent = 'Target image not found locally';
            return;
        }
        setupImageHandlers();
        img.crossOrigin = 'anonymous';
        img.onerror = function() {
            if (img.crossOrigin) {
                console.log('Retrying without crossOrigin');
                img.crossOrigin = null;
                img.src = tUrl;
            } else {
                loadingEl.textContent = 'Failed to load local image';
                postMsg({ type: 'error', message: 'Failed to load target Url: ' + tUrl });
            }
        };
        img.src = tUrl;
    }
    
    // Start loading target
    tryLoadImage();

    function inMask(x, y) {
        if (!canUseMask) return true;
        try {
            var p = maskCanvas.getContext('2d').getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return p[3] > 0;
        } catch (e) { return true; }
    }
    function paintAt(x, y) {
        if (!inMask(x, y)) return;
        var ctx = drawCanvas.getContext('2d');
        ctx.fillStyle = bColor;
        ctx.beginPath();
        ctx.arc(x, y, bSize, 0, Math.PI * 2);
        ctx.fill();
    }
    function drawLine(x1, y1, x2, y2) {
        var d = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
        var steps = Math.max(1, Math.floor(d / (bSize / 2)));
        for (var i = 0; i <= steps; i++) {
            var t = i / steps;
            paintAt(x1 + (x2-x1)*t, y1 + (y2-y1)*t);
        }
    }
    function getPos(e) {
        var r = drawCanvas.getBoundingClientRect();
        var cx = e.touches ? e.touches[0].clientX : e.clientX;
        var cy = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (cx - r.left) * (drawCanvas.width / r.width), y: (cy - r.top) * (drawCanvas.height / r.height) };
    }
    drawCanvas.addEventListener('pointerdown', function(e) { e.preventDefault(); isDrawing = true; var p = getPos(e); lastPos = p; paintAt(p.x, p.y); });
    drawCanvas.addEventListener('pointermove', function(e) { if (!isDrawing) return; e.preventDefault(); var p = getPos(e); if (lastPos) drawLine(lastPos.x, lastPos.y, p.x, p.y); lastPos = p; });
    window.addEventListener('pointerup', function() { isDrawing = false; lastPos = null; });

    function handleMsg(event) {
        try {
            var data = JSON.parse(event.data);
            if (data.type === 'setBrushColor') bColor = data.value;
            if (data.type === 'setBrushSize') bSize = data.value;
            if (data.type === 'clear') {
                drawCanvas.getContext('2d').clearRect(0, 0, drawCanvas.width, drawCanvas.height);
            }
            if (data.type === 'export') {
                try {
                    var out = document.createElement('canvas');
                    out.width = drawCanvas.width; out.height = drawCanvas.height;
                    var ctx = out.getContext('2d');
                    ctx.drawImage(bgCanvas, 0, 0);
                    ctx.drawImage(drawCanvas, 0, 0);
                    postMsg({ type: 'textureReady', dataUrl: out.toDataURL('image/png') });
                } catch(e) {
                    try {
                        // Fallback: If bgCanvas is tainted, export only the user's paint strokes
                        postMsg({ type: 'textureReady', dataUrl: drawCanvas.toDataURL('image/png') });
                    } catch (e2) {
                        postMsg({ type: 'error', message: 'Export failed: ' + e.name + ' - ' + e.message });
                    }
                }
            }
        } catch(e) {}
    }
    window.addEventListener('message', handleMsg);
    document.addEventListener('message', handleMsg);
    </script>
</body>
</html>`;
    }, [targetUrl]);

    const topBarTop = insets.top + 4;
    const topBarHeight = 44;
    const webViewTop = topBarTop + topBarHeight + 4;

    // ─── SECTION COMPONENTS ───────────────────────────────

    // Left menu panel section builder
    const renderSection = (title: string, icon: string, children: React.ReactNode) => (
        <View style={{
            padding: 12, borderRadius: 14, marginBottom: 10,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                {icon} {title}
            </Text>
            {children}
        </View>
    );

    // Pill button helper
    const PillButton = ({ label, active, onPress, color = '#6C4CFF' }: { label: string; active: boolean; onPress: () => void; color?: string }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={{
                flex: 1, paddingVertical: 8, borderRadius: 10,
                backgroundColor: active ? color : 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                borderColor: active ? color : 'rgba(255,255,255,0.15)',
                alignItems: 'center',
            }}
        >
            <Text style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: '#fff' }}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: '#0b1226' }}>
            {/* Background Gradient */}
            <LinearGradient
                colors={currentLighting.bgColors}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />

            {/* ─── TOP BAR ─── */}
            <View style={{
                position: 'absolute', top: topBarTop, left: 8, right: 8, zIndex: 30,
                height: topBarHeight,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(20,20,40,0.85)', borderRadius: 16,
                paddingHorizontal: 10,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            }}>
                {/* Back */}
                <TouchableOpacity
                    onPress={() => {
                        if (audioPlayer.playing) audioPlayer.pause();
                        onBack();
                    }}
                    activeOpacity={0.7}
                    style={{ backgroundColor: '#6C4CFF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 3 }}
                >
                    <Ionicons name="chevron-back" size={16} color="#fff" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Back</Text>
                </TouchableOpacity>

                {/* Model Name */}
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff', flex: 1, textAlign: 'center', marginHorizontal: 6 }} numberOfLines={1}>
                    {model?.name || '3D Model'}
                </Text>

                {/* Toggle Controls */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {/* Wireframe */}
                    <TouchableOpacity
                        onPress={() => { setWireframe(!wireframe); sendToWebView({ type: 'toggleWireframe', value: !wireframe }); }}
                        style={{ backgroundColor: wireframe ? 'rgba(108,76,255,0.6)' : 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 5 }}
                    >
                        <Ionicons name="grid-outline" size={15} color="#fff" />
                    </TouchableOpacity>
                    {/* Auto Rotate */}
                    <TouchableOpacity
                        onPress={() => { const v = !autoRotate; setAutoRotate(v); sendToWebView({ type: 'toggleRotate', value: v }); }}
                        style={{ backgroundColor: autoRotate ? 'rgba(108,76,255,0.6)' : 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 5 }}
                    >
                        <Ionicons name="sync" size={15} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── 3D Model WebView ─── */}
            <View style={{ flex: 1, marginTop: webViewTop }}>
                <WebView
                    ref={webViewRef}
                    source={{ html: modelViewerHTML, baseUrl: 'https://learn-api.eduzon.ai' }}
                    style={{ flex: 1, backgroundColor: 'transparent' }}
                    originWhitelist={['*']}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo={true}
                    mixedContentMode="always"
                    allowFileAccess={true}
                    allowUniversalAccessFromFileURLs={true}
                    scalesPageToFit={Platform.OS !== 'ios'}
                    startInLoadingState={false}
                    cacheEnabled={true}
                    onShouldStartLoadWithRequest={(request) => {
                        const { url } = request;
                        if (url.startsWith('http') || url.startsWith('about:') || url.startsWith('data:')) return true;
                        return false;
                    }}
                    onMessage={(event) => {
                        try {
                            const data = JSON.parse(event.nativeEvent.data);
                            if (data.type === 'loaded') setLoadingModel(false);
                            else if (data.type === 'error') {
                                console.warn('Model error:', data.message);
                                setLoadingModel(false);
                                setIsExporting(false);
                            }
                            else if (data.type === 'animations') {
                                setAnimations(data.list || []);
                                if (data.list && data.list.length > 0) setSelectedAnimation(data.list[0]);
                            }
                            else if (data.type === 'exportStatus') {
                                setExportStatusText(data.status);
                            }
                            else if (data.type === 'glbData') {
                                handleExportedGLB(data.base64);
                            }
                        } catch (e) { }
                    }}
                    onLoadEnd={() => { setTimeout(() => setLoadingModel(false), 10000); }}
                    onError={() => setLoadingModel(false)}
                />

                {/* Loading Overlay */}
                {loadingModel && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(11,18,38,0.7)' }}>
                        <ActivityIndicator size="large" color="#6C4CFF" />
                        <Text style={{ marginTop: 12, color: '#fff', fontSize: 14, fontWeight: '600' }}>Loading 3D Model...</Text>
                    </View>
                )}

                {/* Exporting Overlay */}
                {isExporting && (
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(11,18,38,0.85)', zIndex: 100 }}>
                        <ActivityIndicator size="large" color="#DA70D6" />
                        <Text style={{ marginTop: 12, color: '#fff', fontSize: 16, fontWeight: '700' }}>{exportStatusText || 'Preparing AR...'}</Text>
                        <Text style={{ marginTop: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Please keep the app open</Text>
                    </View>
                )}
            </View>

            {/* ─── FLOATING ACTION BUTTONS (Left + Right side) ─── */}
            {/* Left: Menu toggle */}
            {!showLeftMenu && (
                <TouchableOpacity
                    onPress={() => { setShowLeftMenu(true); setShowRightPanel(false); }}
                    activeOpacity={0.8}
                    style={{
                        position: 'absolute', left: 10, top: '45%', zIndex: 25,
                        backgroundColor: 'rgba(20,20,40,0.9)', borderRadius: 14,
                        paddingVertical: 12, paddingHorizontal: 8,
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                        alignItems: 'center', gap: 6,
                    }}
                >
                    <Ionicons name="menu" size={18} color="#fff" />
                    <Text style={{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>Menu</Text>
                </TouchableOpacity>
            )}

            {/* Right: Controls toggle */}
            {!showRightPanel && (
                <TouchableOpacity
                    onPress={() => { setShowRightPanel(true); setShowLeftMenu(false); }}
                    activeOpacity={0.8}
                    style={{
                        position: 'absolute', right: 10, top: '45%', zIndex: 25,
                        backgroundColor: 'rgba(20,20,40,0.9)', borderRadius: 14,
                        paddingVertical: 12, paddingHorizontal: 8,
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                        alignItems: 'center', gap: 6,
                    }}
                >
                    <Ionicons name="settings-outline" size={18} color="#fff" />
                    <Text style={{ fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>Controls</Text>
                </TouchableOpacity>
            )}

            {/* ─── LEFT MENU PANEL ─── */}
            {showLeftMenu && (
                <View style={{
                    position: 'absolute', left: 8, top: webViewTop, bottom: 8, zIndex: 40,
                    width: SCREEN_WIDTH * 0.72, maxWidth: 280,
                    backgroundColor: 'rgba(20,20,40,0.95)', borderRadius: 20,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(108,76,255,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="cube" size={16} color="#6C4CFF" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Menu</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowLeftMenu(false)}>
                            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1, padding: 12 }} showsVerticalScrollIndicator={false}>
                        {/* Paint Mode */}
                        {renderSection('Paint Mode', '🎨', (
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <PillButton
                                    label="🎲 3D Paint"
                                    active={paintMode === 'model'}
                                    onPress={() => {
                                        setPaintMode('model');
                                        setPaintingEnabled(true);
                                        setTextureDisplayMode('model-paint');
                                        setBrushColor(COLOR_SWATCHES[0] || '#ff0000');
                                        sendToWebView({ type: 'enablePaint', value: true });
                                        sendToWebView({ type: 'showPaintTexture' });
                                    }}
                                    color="#6C4CFF"
                                />
                                <PillButton
                                    label="🖼️ Sheet"
                                    active={paintMode === 'target'}
                                    onPress={() => {
                                        setPaintMode('target');
                                        setPaintingEnabled(false);
                                        setBrushColor(COLOR_SWATCHES[0] || '#ff0000');
                                        sendToWebView({ type: 'enablePaint', value: false });
                                        setShowTargetPainter(true);
                                    }}
                                    color="#DA70D6"
                                />
                            </View>
                        ))}

                        {/* World Selection */}
                        {environmentsWithAssets.length > 0 && renderSection('World', '🌍', (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {environmentsWithAssets.map((env) => {
                                    const isSelected = env._id === environmentContext?._id;
                                    return (
                                        <TouchableOpacity
                                            key={env._id}
                                            onPress={() => {
                                                onEnvironmentSelect(env);
                                                const envModels = getModelsForEnvironment(env);
                                                if (envModels.length > 0) onModelSelect(envModels[0]);
                                            }}
                                            activeOpacity={0.7}
                                            style={{
                                                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, marginRight: 6,
                                                backgroundColor: isSelected ? '#6C4CFF' : 'rgba(255,255,255,0.1)',
                                                borderWidth: 1, borderColor: isSelected ? '#6C4CFF' : 'rgba(255,255,255,0.12)',
                                            }}
                                        >
                                            <Text style={{ fontSize: 12, fontWeight: isSelected ? '700' : '500', color: '#fff' }}>
                                                {env.name || env.folderName}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        ))}

                        {/* Assets */}
                        {environmentContext && renderSection(`Assets(${filteredEnvModels.length})`, '📦', (
                            <View>
                                {/* Search */}
                                <View style={{
                                    flexDirection: 'row', alignItems: 'center', gap: 6,
                                    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
                                    paddingHorizontal: 10, paddingVertical: 6, marginBottom: 8,
                                }}>
                                    <Ionicons name="search" size={14} color="rgba(255,255,255,0.4)" />
                                    <TextInput
                                        value={assetSearchTerm}
                                        onChangeText={setAssetSearchTerm}
                                        placeholder="Search assets..."
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        style={{ flex: 1, fontSize: 12, color: '#fff', padding: 0 }}
                                    />
                                </View>

                                {/* Assets list */}
                                {filteredEnvModels.map((m) => {
                                    const isSelected = (m.id || m._id) === modelId;
                                    return (
                                        <TouchableOpacity
                                            key={m.id || m._id}
                                            onPress={() => {
                                                if (!isSelected) {
                                                    setAudioPlaying(false);
                                                    setLoadingModel(true);
                                                    onModelSelect(m);
                                                }
                                            }}
                                            activeOpacity={0.7}
                                            style={{
                                                flexDirection: 'row', alignItems: 'center', gap: 10,
                                                padding: 8, borderRadius: 10, marginBottom: 4,
                                                backgroundColor: isSelected ? 'rgba(108,76,255,0.3)' : 'rgba(255,255,255,0.04)',
                                                borderWidth: 1, borderColor: isSelected ? 'rgba(108,76,255,0.5)' : 'transparent',
                                            }}
                                        >
                                            <View style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                backgroundColor: isSelected ? 'rgba(108,76,255,0.2)' : 'rgba(255,255,255,0.1)',
                                                justifyContent: 'center', alignItems: 'center',
                                            }}>
                                                {m.previewImage ? (
                                                    <Image source={{ uri: getPreviewImageUrl(m.previewImage) }} style={{ width: 28, height: 28 }} contentFit="contain" />
                                                ) : (
                                                    <Text style={{ fontSize: 16 }}>🎨</Text>
                                                )}
                                            </View>
                                            <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : 'rgba(255,255,255,0.8)', flex: 1 }} numberOfLines={1}>
                                                {m.name}
                                            </Text>
                                            {isSelected && <Ionicons name="checkmark-circle" size={16} color="#6C4CFF" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* ─── RIGHT CONTROLS PANEL ─── */}
            {showRightPanel && (
                <View style={{
                    position: 'absolute', right: 8, top: webViewTop, bottom: 8, zIndex: 40,
                    width: SCREEN_WIDTH * 0.72, maxWidth: 280,
                    backgroundColor: 'rgba(20,20,40,0.95)', borderRadius: 20,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                }}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(218,112,214,0.3)', justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="settings" size={16} color="#DA70D6" />
                            </View>
                            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Controls</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowRightPanel(false)}>
                            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ flex: 1, padding: 12 }} showsVerticalScrollIndicator={false}>
                        {renderSection('Display Texture', '🎨', (
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                <PillButton label="Original" active={textureDisplayMode === 'original'} onPress={() => {
                                    setTextureDisplayMode('original');
                                    setPaintingEnabled(false);
                                    sendToWebView({ type: 'enablePaint', value: false });
                                    sendToWebView({ type: 'showOriginalTexture' });
                                }} color="#555" />
                                {paintMode === 'model' && (
                                    <PillButton label="3D Paint" active={textureDisplayMode === 'model-paint'} onPress={() => {
                                        setTextureDisplayMode('model-paint');
                                        setPaintingEnabled(true);
                                        sendToWebView({ type: 'enablePaint', value: true });
                                        sendToWebView({ type: 'showPaintTexture' });
                                    }} color="#FF9F43" />
                                )}
                                {paintMode === 'target' && (
                                    <PillButton label="Sheet" active={textureDisplayMode === 'target-paint'} onPress={() => { setTextureDisplayMode('target-paint'); setShowTargetPainter(true); }} color="#DA70D6" />
                                )}
                            </View>
                        ))}

                        {/* Audio Controls */}
                        {renderSection('Audio', '🔊', (
                            <View>
                                {/* Current audio info */}
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 8, marginBottom: 10 }}>
                                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }} numberOfLines={1}>
                                        {selectedAudio ? (selectedAudio.audioName || selectedAudio.filename || selectedAudio.gridfsId) : 'No audio available'}
                                    </Text>
                                </View>

                                {/* Language */}
                                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase' }}>Language</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                    {uniqueLanguages.map(lang => (
                                        <TouchableOpacity key={lang} onPress={() => handleLanguageChange(lang)} style={{
                                            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 6,
                                            backgroundColor: selectedLanguage === lang ? '#0EA5A4' : 'rgba(255,255,255,0.08)',
                                        }}>
                                            <Text style={{ fontSize: 11, fontWeight: selectedLanguage === lang ? '700' : '400', color: '#fff' }}>{lang}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                {/* Level */}
                                {uniqueLevels.length > 0 && (
                                    <>
                                        <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 4, textTransform: 'uppercase' }}>Level</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                            {uniqueLevels.map(level => (
                                                <TouchableOpacity key={level} onPress={() => handleLevelChange(level)} style={{
                                                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 6,
                                                    backgroundColor: selectedLevel === level ? '#DA70D6' : 'rgba(255,255,255,0.08)',
                                                }}>
                                                    <Text style={{ fontSize: 11, fontWeight: selectedLevel === level ? '700' : '400', color: '#fff', textTransform: 'capitalize' }}>{level}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </>
                                )}

                                {/* Play/Pause + Volume */}
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <TouchableOpacity onPress={toggleAudio} style={{
                                        backgroundColor: audioPlaying ? '#0EA5A4' : 'rgba(255,255,255,0.15)',
                                        borderRadius: 10, padding: 8,
                                    }}>
                                        <Ionicons name={audioPlaying ? "pause" : "play"} size={18} color="#fff" />
                                    </TouchableOpacity>
                                    <Ionicons name={volume === 0 ? "volume-mute" : volume < 50 ? "volume-low" : "volume-high"} size={16} color="rgba(255,255,255,0.5)" />
                                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{volume}%</Text>
                                </View>
                            </View>
                        ))}

                        {/* Animation Controls */}
                        {renderSection('Animation', '🎬', (
                            <View>
                                {animations.length > 0 && (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                                        {animations.map((anim, idx) => (
                                            <TouchableOpacity
                                                key={anim + idx}
                                                onPress={() => {
                                                    setSelectedAnimation(anim);
                                                    setSelectedAnimationIndex(idx);
                                                    // WebView 3D viewer (in-app)
                                                    sendToWebView({ type: 'setAnimation', value: anim });
                                                    // Native AR session (Android Sceneform)
                                                    if (Platform.OS === 'android' && NativeModules.ARNativeModule) {
                                                        NativeModules.ARNativeModule.setAnimation(idx);
                                                    }
                                                }}
                                                style={{
                                                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 6,
                                                    backgroundColor: selectedAnimation === anim ? '#DA70D6' : 'rgba(255,255,255,0.08)',
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: selectedAnimation === anim ? '700' : '400', color: '#fff', textTransform: 'capitalize' }}>{anim}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => { const v = !isPlaying; setIsPlaying(v); sendToWebView({ type: 'togglePlay', value: v }); }}
                                        style={{
                                            flex: 1, paddingVertical: 8, borderRadius: 10,
                                            backgroundColor: isPlaying ? '#DA70D6' : 'rgba(255,255,255,0.1)',
                                            alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4,
                                        }}
                                    >
                                        <Ionicons name={isPlaying ? "pause" : "play"} size={14} color="#fff" />
                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>{isPlaying ? 'Pause' : 'Play'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Lighting Controls */}
                        {renderSection('Lighting', '💡', (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {LIGHTING_OPTIONS.map((light) => (
                                    <TouchableOpacity
                                        key={light.name}
                                        onPress={() => setEnvironment(light.name)}
                                        activeOpacity={0.7}
                                        style={{
                                            flexDirection: 'row', alignItems: 'center', gap: 6,
                                            paddingVertical: 6, paddingHorizontal: 8, borderRadius: 10,
                                            backgroundColor: environment === light.name ? 'rgba(108,76,255,0.4)' : 'rgba(255,255,255,0.06)',
                                            borderWidth: 1, borderColor: environment === light.name ? 'rgba(108,76,255,0.5)' : 'transparent',
                                        }}
                                    >
                                        <LinearGradient
                                            colors={light.bgColors}
                                            style={{ width: 22, height: 22, borderRadius: 6 }}
                                        />
                                        <Text style={{ fontSize: 11, color: '#fff', fontWeight: environment === light.name ? '700' : '400' }}>
                                            {light.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* ─── BOTTOM BAR ─── */}
            <View style={{
                paddingHorizontal: 12, paddingVertical: 8, paddingBottom: insets.bottom + 8,
                backgroundColor: 'rgba(20,20,40,0.9)',
                borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
            }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Audio Play */}
                    {availableAudios.length > 0 && (
                        <TouchableOpacity onPress={toggleAudio} style={{
                            backgroundColor: audioPlaying ? '#6C4CFF' : 'rgba(255,255,255,0.15)',
                            borderRadius: 12, padding: 10,
                        }}>
                            <Ionicons name={audioPlaying ? "pause" : "play"} size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Audio info */}
                    {selectedAudio && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }} numberOfLines={1}>
                                {selectedLanguage} • {selectedLevel}
                            </Text>
                        </View>
                    )}

                    {/* Brush / Paint toggle */}
                    {paintingEnabled && (
                        <TouchableOpacity
                            onPress={() => setShowBrushControls(!showBrushControls)}
                            style={{
                                backgroundColor: showBrushControls ? 'rgba(108,76,255,0.5)' : 'rgba(255,255,255,0.15)',
                                borderRadius: 12, padding: 10,
                            }}
                        >
                            <Ionicons name="brush" size={18} color="#fff" />
                        </TouchableOpacity>
                    )}

                    {/* Coloring Sheet */}
                    <TouchableOpacity
                        onPress={() => { setPaintMode('target'); setShowTargetPainter(true); }}
                        style={{
                            backgroundColor: 'rgba(218,112,214,0.4)', borderRadius: 12, padding: 10,
                            borderWidth: 1, borderColor: 'rgba(218,112,214,0.3)',
                        }}
                    >
                        <Ionicons name="image" size={18} color="#fff" />
                    </TouchableOpacity>

                    {/* AR Button */}
                    <TouchableOpacity
                        onPress={handleOpenAR}
                        style={{
                            backgroundColor: 'rgba(14,165,164,0.5)', borderRadius: 12,
                            paddingHorizontal: 14, paddingVertical: 10,
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            borderWidth: 1, borderColor: 'rgba(14,165,164,0.3)',
                        }}
                    >
                        <Ionicons name="cube-outline" size={18} color="#fff" />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>AR</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ─── BRUSH CONTROLS POPUP ─── */}
            {showBrushControls && (
                <View style={{
                    position: 'absolute', bottom: 80 + insets.bottom, left: 8, right: 8, zIndex: 45,
                    backgroundColor: 'rgba(20,20,40,0.95)', borderRadius: 20,
                    padding: 16,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>🖌️ Brush Settings</Text>
                        <TouchableOpacity onPress={() => setShowBrushControls(false)}>
                            <Ionicons name="close" size={20} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    </View>

                    {/* Color Swatches */}
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Color</Text>
                    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        {COLOR_SWATCHES.map((c) => (
                            <TouchableOpacity
                                key={c}
                                onPress={() => setBrushColor(c)}
                                style={{
                                    width: 32, height: 32, borderRadius: 16, backgroundColor: c,
                                    borderWidth: brushColor === c ? 3 : 1,
                                    borderColor: brushColor === c ? '#fff' : 'rgba(255,255,255,0.2)',
                                }}
                            />
                        ))}
                    </View>

                    {/* Brush Size */}
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 6, textTransform: 'uppercase' }}>Size: {brushSize}px</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <TouchableOpacity onPress={() => setBrushSize(Math.max(1, brushSize - 4))} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 6 }}>
                            <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${(brushSize / 128) * 100}%`, backgroundColor: brushColor, borderRadius: 3 }} />
                        </View>
                        <TouchableOpacity onPress={() => setBrushSize(Math.min(128, brushSize + 4))} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 6 }}>
                            <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={() => sendToWebView({ type: 'clearPaint' })} style={{ flex: 1, backgroundColor: 'rgba(239,68,68,0.3)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>🗑️ Clear</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { sendToWebView({ type: 'showOriginalTexture' }); setTextureDisplayMode('original'); setPaintingEnabled(false); sendToWebView({ type: 'enablePaint', value: false }); }} style={{ flex: 1, backgroundColor: 'rgba(59,130,246,0.3)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>🎨 Original</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ─── TARGET PAINTER (Coloring Sheet) OVERLAY ─── */}
            {showTargetPainter && (
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
                    backgroundColor: 'rgba(11,18,38,0.97)',
                }}>
                    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, flex: 1 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>🖼️ Coloring Sheet</Text>
                            <TouchableOpacity
                                onPress={() => setShowTargetPainter(false)}
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 8 }}
                            >
                                <Ionicons name="close" size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* WebView Canvas Painter */}
                        <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 8 }}>
                            <WebView
                                ref={sheetWebViewRef}
                                source={{ html: colorSheetHTML, baseUrl: targetUrl }}
                                style={{ flex: 1, backgroundColor: '#f0f0f0' }}
                                originWhitelist={['*']}
                                javaScriptEnabled={true}
                                domStorageEnabled={true}
                                allowFileAccess={true}
                                allowUniversalAccessFromFileURLs={true}
                                onMessage={(event) => {
                                    try {
                                        const data = JSON.parse(event.nativeEvent.data);
                                        if (data.type === 'textureReady') {
                                            sendToWebView({ type: 'applyTargetTexture', dataUrl: data.dataUrl });
                                            setTextureDisplayMode('target-paint');
                                            setShowTargetPainter(false);
                                        } else if (data.type === 'error') {
                                            console.warn("Coloring sheet error:", data.message);
                                            // Fallback: If export fails, close painter anyway to unblock user
                                            if (data.message.includes('Export failed')) {
                                                setShowTargetPainter(false);
                                            }
                                        }
                                    } catch (e) { }
                                }}
                            />
                        </View>

                        {/* Color swatches */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                                {COLOR_SWATCHES.map((c) => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setBrushColor(c)}
                                        style={{
                                            width: 36, height: 36, borderRadius: 18, backgroundColor: c,
                                            borderWidth: brushColor === c ? 3 : 1,
                                            borderColor: brushColor === c ? '#fff' : 'rgba(255,255,255,0.3)',
                                        }}
                                    />
                                ))}
                            </View>
                        </ScrollView>

                        {/* Actions */}
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: insets.bottom + 8 }}>
                            <TouchableOpacity
                                onPress={() => setShowTargetPainter(false)}
                                style={{
                                    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
                                    padding: 14, alignItems: 'center',
                                }}
                            >
                                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    sheetWebViewRef.current?.postMessage(JSON.stringify({ type: 'export' }));
                                }}
                                style={{
                                    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <LinearGradient
                                    colors={['#DA70D6', '#6C4CFF'] as const}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                                />
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Apply to Model</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
