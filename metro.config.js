// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// your metro modifications
const path = require("path");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix for Zustand v5 import.meta issue on Web
  // Force resolution to CommonJS build to avoid ESM files with import.meta
  if (platform === "web" && moduleName.startsWith("zustand")) {
    const subpath = moduleName.replace(/^zustand/, "").replace(/^\//, "");
    const fileName = subpath ? subpath : "index";
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/zustand",
        `${fileName}.js`,
      ),
      type: "sourceFile",
    };
  }
  // Ensure we delegate back to the default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

// Add support for .lottie files
config.resolver.assetExts = [...config.resolver.assetExts, "lottie", "dotlottie"];
// Ensure .lottie files are not treated as source files
config.resolver.sourceExts = config.resolver.sourceExts.filter(ext => ext !== "lottie" && ext !== "dotlottie");

const finalConfig = withUniwindConfig(config, {
  // relative path to your global.css file (from previous step)
  cssEntryFile: "./global.css",
  // (optional) path where we gonna auto-generate typings
  // defaults to project's root
  dtsFile: path.join(__dirname, "uniwind-types.d.ts"),
});

// Ensure lottie is in assetExts even if the wrapper modified it
if (!finalConfig.resolver.assetExts.includes("lottie")) {
  finalConfig.resolver.assetExts.push("lottie");
}
if (!finalConfig.resolver.assetExts.includes("dotlottie")) {
  finalConfig.resolver.assetExts.push("dotlottie");
}

module.exports = finalConfig;

