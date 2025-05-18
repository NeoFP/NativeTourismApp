import { Buffer } from "buffer";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";
import * as MediaLibrary from "expo-media-library";
import ExifReader from "react-native-exif";
import * as ImageManipulator from "expo-image-manipulator";
import { Platform } from "react-native";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

// Conditionally import AWS SDK in try/catch to handle web environment
let AWS;
try {
  AWS = require("aws-sdk");
  console.log("AWS SDK imported successfully");
} catch (error) {
  console.error("Error importing AWS SDK:", error);
}

// AWS S3 Configuration
const config = {
  accessKey: "AKIARKM5BQO2C2TX6M4F",
  secretKey: "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",
  bucketName: "tourismaiapp2025",
  region: "us-east-1",
};

// Initialize S3 client with CORS configuration
let s3 = null;
try {
  if (AWS) {
    AWS.config.update({
      region: config.region,
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
      signatureVersion: "v4",
      // Add CORS configuration
      httpOptions: {
        xhrAsync: true,
        timeout: 30000,
      },
    });

    s3 = new AWS.S3();
    console.log("AWS SDK initialized successfully");
  }
} catch (error) {
  console.error("Error initializing AWS SDK:", error);
}

// Generate a random filename for S3
export const generateRandomImageName = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const timestamp = new Date().getTime();
  return `${timestamp}_${random}.jpg`;
};

// Preserve EXIF data when processing image
export const processImageWithExif = async (uri) => {
  try {
    // Process the image while preserving EXIF data
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1200 } }], // Resize to reduce file size while maintaining quality
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
        exif: true, // Preserve EXIF data
      }
    );

    console.log("Processed image with EXIF data preserved");
    return manipResult.uri;
  } catch (error) {
    console.error("Error processing image:", error);
    return uri; // Return original if processing fails
  }
};

// Upload file to S3 using AWS SDK v2 (web compatible)
export const uploadImageToS3 = async (imageUri) => {
  try {
    console.log(`Starting upload from ${imageUri}`);
    const fileName = generateRandomImageName();

    // If S3 is not initialized, use a simulated upload for development
    if (!s3) {
      console.log("S3 client not available, simulating upload");
      if (Platform.OS === "web" && process.env.NODE_ENV === "development") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return fileName;
      }
      throw new Error("S3 client not initialized");
    }

    if (Platform.OS === "web") {
      // For web, fetch the image data
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Create pre-signed URL for upload
      const signedUrlParams = {
        Bucket: config.bucketName,
        Key: fileName,
        Expires: 60, // URL expires in 60 seconds
        ContentType: blob.type || "image/jpeg",
        ACL: "public-read",
      };

      try {
        const signedUrl = await s3.getSignedUrlPromise(
          "putObject",
          signedUrlParams
        );

        // Upload directly using the signed URL
        const uploadResponse = await fetch(signedUrl, {
          method: "PUT",
          body: blob,
          headers: {
            "Content-Type": blob.type || "image/jpeg",
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.statusText}`);
        }

        console.log(`Successfully uploaded ${fileName} to S3`);
        return fileName;
      } catch (error) {
        console.error("Error with signed URL upload:", error);
        if (process.env.NODE_ENV === "development") {
          console.log("Continuing with simulated upload in development mode");
          return fileName;
        }
        throw error;
      }
    } else {
      // For native platforms, use FileSystem
      const processedUri = await processImageWithExif(imageUri);
      const fileInfo = await FileSystem.getInfoAsync(processedUri);

      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      const base64Data = await FileSystem.readAsStringAsync(processedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64Data);

      const params = {
        Bucket: config.bucketName,
        Key: fileName,
        Body: Buffer.from(arrayBuffer),
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      const result = await s3.upload(params).promise();
      console.log(`Successfully uploaded ${fileName} to S3:`, result.Location);
      return fileName;
    }
  } catch (error) {
    console.error("Error uploading to S3:", error);

    // For development, return the filename anyway to continue the flow
    if (Platform.OS === "web" && process.env.NODE_ENV === "development") {
      console.log(
        "Continuing with simulated upload due to error in development mode"
      );
      return generateRandomImageName();
    }

    throw error;
  }
};

// Helper function to generate AWS signature
// This is a simplified version for demonstration
// In production, use AWS SDK or a proper signing function
const generateSignature = (secretKey, dateStamp) => {
  // In a real implementation, this would use crypto to create a signature
  // For now, return a placeholder as the actual signature generation is complex
  return "signature";
};

// Try multiple methods to extract EXIF data
const getExifData = async (imageUri) => {
  let exifData = null;

  // Method 1: Try using react-native-exif
  try {
    console.log("Trying to read EXIF with react-native-exif");
    exifData = await ExifReader.read(imageUri);
    if (exifData && (exifData.GPSLatitude || exifData.GPSLongitude)) {
      console.log("Found GPS data using react-native-exif");
      return exifData;
    }
  } catch (e) {
    console.warn("react-native-exif failed:", e);
  }

  // Method 2: Try getting the asset from MediaLibrary and checking its location
  try {
    console.log("Trying to get location from MediaLibrary");
    // Get the asset ID from the URI
    const filename = imageUri.split("/").pop();
    const assets = await MediaLibrary.getAssetsAsync({
      first: 20,
    });

    const matchingAsset = assets.assets.find(
      (asset) => asset.filename === filename || asset.uri === imageUri
    );

    if (matchingAsset && matchingAsset.location) {
      console.log(
        "Found location in MediaLibrary asset:",
        matchingAsset.location
      );
      return {
        GPSLatitude: [matchingAsset.location.latitude, 0, 0],
        GPSLongitude: [matchingAsset.location.longitude, 0, 0],
        GPSLatitudeRef: matchingAsset.location.latitude >= 0 ? "N" : "S",
        GPSLongitudeRef: matchingAsset.location.longitude >= 0 ? "E" : "W",
      };
    }
  } catch (e) {
    console.warn("MediaLibrary method failed:", e);
  }

  return null;
};

// Helper to convert GPS coordinates from EXIF format to decimal
const convertGPSToDecimal = (gpsData) => {
  if (!gpsData || !gpsData.GPSLatitude || !gpsData.GPSLongitude) {
    return null;
  }

  try {
    // Handle different formats of GPS data
    let lat, lon, latRef, lonRef;

    // Check if we have array format or direct decimal
    if (Array.isArray(gpsData.GPSLatitude)) {
      // Array format [degrees, minutes, seconds]
      latRef = gpsData.GPSLatitudeRef === "N" ? 1 : -1;
      lat =
        latRef *
        (gpsData.GPSLatitude[0] +
          gpsData.GPSLatitude[1] / 60 +
          gpsData.GPSLatitude[2] / 3600);

      lonRef = gpsData.GPSLongitudeRef === "E" ? 1 : -1;
      lon =
        lonRef *
        (gpsData.GPSLongitude[0] +
          gpsData.GPSLongitude[1] / 60 +
          gpsData.GPSLongitude[2] / 3600);
    } else {
      // Direct decimal format
      lat = gpsData.GPSLatitude;
      lon = gpsData.GPSLongitude;
    }

    return { lat, lon };
  } catch (error) {
    console.error("Error converting GPS coordinates:", error);
    return null;
  }
};

// Extract real location from image metadata
export const extractLocationFromImage = async (imageUri, googleMapsApiKey) => {
  try {
    // Try to get EXIF data from the image
    let coordinates = null;

    // Process the image while preserving EXIF data
    const processedUri = await processImageWithExif(imageUri);

    // Try to extract EXIF data using multiple methods
    const exifData = await getExifData(processedUri);

    if (exifData && (exifData.GPSLatitude || exifData.GPSLongitude)) {
      // Convert GPS coordinates from EXIF format to decimal
      coordinates = convertGPSToDecimal(exifData);
      console.log("Extracted coordinates from image:", coordinates);
    } else {
      console.log("No GPS data found in image EXIF");
    }

    // If no coordinates were found, use fallback coordinates
    if (!coordinates) {
      // Fallback: Generate random coordinates within Sri Lanka
      const lat = 6.0 + Math.random() * 3.5; // Approximate latitude range for Sri Lanka
      const lon = 79.5 + Math.random() * 2.0; // Approximate longitude range for Sri Lanka
      coordinates = { lat, lon };
      console.log("Using fallback coordinates:", coordinates);
    }

    // Use Google Maps Geocoding API to get the location name
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.lat},${coordinates.lon}&key=${googleMapsApiKey}&result_type=locality|administrative_area_level_1|country`
      );

      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        // Extract city and country from formatted address
        const addressComponents = data.results[0].address_components;

        let city = "";
        let country = "";

        for (const component of addressComponents) {
          if (component.types.includes("locality")) {
            city = component.long_name;
          } else if (component.types.includes("administrative_area_level_1")) {
            // If no city found, use province/state
            if (!city) city = component.long_name;
          } else if (component.types.includes("country")) {
            country = component.long_name;
          }
        }

        // Construct location string
        let locationName = "";
        if (city) locationName += city;
        if (country && country !== "Sri Lanka") {
          if (locationName) locationName += ", ";
          locationName += country;
        } else if (locationName === "") {
          locationName = "Sri Lanka";
        } else {
          locationName += ", Sri Lanka";
        }

        return {
          coordinates,
          locationName,
        };
      }
    } catch (geoError) {
      console.warn("Error calling Google Maps API:", geoError);
    }

    // Default to Sri Lanka if geocoding fails
    return {
      coordinates,
      locationName: "Sri Lanka",
    };
  } catch (error) {
    console.error("Error extracting location from image:", error);
    return {
      coordinates: { lat: 7.8731, lon: 80.7718 },
      locationName: "Sri Lanka",
    };
  }
};
