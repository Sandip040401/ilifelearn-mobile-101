import { getAudioStreamUrlById } from '@/services/arService';
import { NativeModules } from "react-native";

export interface NativeARAudio {
    gridfsId: string;
    language: string;
    level: string;
    audioUrl: string;   // pre-computed, so Kotlin never needs the API base URL
}

/**
 * Launch the native Android AR activity.
 * @param modelPath  Local file:// or http URL to the .glb model
 * @param modelName  Display name shown in AR top bar
 * @param audios     All available audio items (native activity builds lang/level picker)
 * @param animations Animation names from the WebView (fallback if Sceneform reports 0)
 */
export const openNativeAR = (
    modelPath: string,
    modelName?: string | null,
    audios?: Array<{ gridfsId: string; language: string; level: string }>,
    animations?: string[],
) => {
    if (!NativeModules.ARNativeModule) {
        console.error("ARNativeModule is strictly null or undefined");
        return;
    }

    // Attach pre-computed audio stream URLs so Kotlin doesn't need the base URL
    const audiosWithUrl: NativeARAudio[] | undefined = audios?.map(a => ({
        ...a,
        audioUrl: getAudioStreamUrlById(a.gridfsId),
    }));

    NativeModules.ARNativeModule.openAR(
        modelPath,
        modelName ?? null,
        audiosWithUrl ? JSON.stringify(audiosWithUrl) : null,
        animations ? JSON.stringify(animations) : null,
    );
};
