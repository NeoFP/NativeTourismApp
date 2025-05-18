export default {
  expo: {
    name: "NativeTourismApp",
    slug: "NativeTourismApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
      AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
      BUCKET_NAME: process.env.BUCKET_NAME,
      BUCKET_REGION: process.env.BUCKET_REGION,
      MONGODB_URI: process.env.MONGODB_URI,
      MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    },
  },
};
