import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { useTheme } from "../../utils/ThemeContext";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import LottieView from "lottie-react-native";
import { useState, useEffect, useRef } from "react";
import Slider from "@react-native-community/slider";
import { SelectList } from "react-native-dropdown-select-list";
import axios from "axios";
import Markdown from "react-native-markdown-display";
import { getUserId } from "../../utils/mongodb";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";

const API_URL = "http://ec2-16-171-47-60.eu-north-1.compute.amazonaws.com:5001";

export default function Budget() {
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [budget, setBudget] = useState(500);
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [rooms, setRooms] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [travelPlan, setTravelPlan] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const destinations = [
    { key: "1", value: "Colombo" },
    { key: "2", value: "Kandy" },
    { key: "3", value: "Galle" },
    { key: "4", value: "Sigiriya" },
    { key: "5", value: "Ella" },
    { key: "6", value: "Nuwara Eliya" },
  ];

  const durations = [
    { key: "1", value: "1 Day" },
    { key: "2", value: "2 Days" },
    { key: "3", value: "3 Days" },
    { key: "4", value: "4 Days" },
    { key: "5", value: "5 Days" },
    { key: "7", value: "1 Week" },
  ];

  const roomOptions = [
    { key: "1", value: "1 Room" },
    { key: "2", value: "2 Rooms" },
    { key: "3", value: "3 Rooms" },
    { key: "4", value: "4 Rooms" },
    { key: "5", value: "5 Rooms" },
  ];

  // Function to search for locations in Sri Lanka
  const searchLocations = async (query) => {
    if (!query || query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      // Using Google Maps Geocoding API which is more reliable
      // Note: In production, you should secure this API key with restrictions
      // Get API key from environment variables or a secure config
      // For development purposes, we're using a direct key, but this should be secured in production
      const googleMapsApiKey = "AIzaSyC4JRnkYeIb6Bcrn6pAMYLtPVNGScCy2ak";

      // Add a console warning about securing the API key in production
      if (__DEV__) {
        console.warn(
          "Warning: API key is exposed in code. In production, use environment variables or a secure config service."
        );
      }

      // Restrict search to Sri Lanka
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query
        )}&components=country:LK&key=${googleMapsApiKey}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      // Log API response status for debugging
      console.log("Google Maps API response status:", response.data.status);

      if (response.data.status === "OK" && response.data.results.length > 0) {
        // Format Google Maps API results
        const suggestions = response.data.results.map((result) => ({
          name: result.formatted_address,
          lat: result.geometry.location.lat,
          lon: result.geometry.location.lng,
          description: getLocationTypeDescription(result.types),
        }));

        setLocationSuggestions(suggestions.slice(0, 5)); // Limit to 5 results
      } else {
        // Log when falling back to local database
        console.log(
          "No results from Google Maps API, using fallback locations"
        );
        // Fall back to our local database if no results from Google
        useFallbackLocations(query);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      // Fall back to our local database if API fails
      useFallbackLocations(query);
    }
  };

  // Helper function to get a description based on location types from Google Maps API
  const getLocationTypeDescription = (types) => {
    if (types.includes("locality")) return "City";
    if (types.includes("administrative_area_level_1")) return "Province";
    if (types.includes("administrative_area_level_2")) return "District";
    if (types.includes("sublocality")) return "Neighborhood";
    if (types.includes("natural_feature")) return "Natural feature";
    if (types.includes("point_of_interest")) return "Point of interest";
    if (types.includes("establishment")) return "Establishment";
    return "Location";
  };

  // Fallback function to use our local database of Sri Lankan locations
  const useFallbackLocations = (query) => {
    // Our comprehensive list of Sri Lankan locations
    const sriLankaLocations = [
      {
        name: "Colombo, Sri Lanka",
        lat: 6.9271,
        lon: 79.8612,
        description: "Capital city",
      },
      {
        name: "Kandy, Sri Lanka",
        lat: 7.2906,
        lon: 80.6337,
        description: "Cultural capital",
      },
      {
        name: "Galle, Sri Lanka",
        lat: 6.0535,
        lon: 80.221,
        description: "Southern coastal city",
      },
      {
        name: "Jaffna, Sri Lanka",
        lat: 9.6615,
        lon: 80.0255,
        description: "Northern city",
      },
      {
        name: "Anuradhapura, Sri Lanka",
        lat: 8.3114,
        lon: 80.4037,
        description: "Ancient capital",
      },
      {
        name: "Nuwara Eliya, Sri Lanka",
        lat: 6.9497,
        lon: 80.7891,
        description: "Hill country",
      },
      {
        name: "Trincomalee, Sri Lanka",
        lat: 8.5874,
        lon: 81.2152,
        description: "Eastern port city",
      },
      {
        name: "Batticaloa, Sri Lanka",
        lat: 7.7102,
        lon: 81.7,
        description: "Eastern coastal city",
      },
      {
        name: "Negombo, Sri Lanka",
        lat: 7.2083,
        lon: 79.8358,
        description: "Western coastal city",
      },
      {
        name: "Matara, Sri Lanka",
        lat: 5.9485,
        lon: 80.5353,
        description: "Southern coastal city",
      },
      {
        name: "Kurunegala, Sri Lanka",
        lat: 7.4867,
        lon: 80.3647,
        description: "North Western city",
      },
      {
        name: "Ratnapura, Sri Lanka",
        lat: 6.698,
        lon: 80.3984,
        description: "Gem mining city",
      },
      {
        name: "Badulla, Sri Lanka",
        lat: 6.9934,
        lon: 81.055,
        description: "Uva province capital",
      },
      {
        name: "Hambantota, Sri Lanka",
        lat: 6.1429,
        lon: 81.1212,
        description: "Southern port city",
      },
      {
        name: "Matale, Sri Lanka",
        lat: 7.4675,
        lon: 80.6234,
        description: "Central province city",
      },
      {
        name: "Polonnaruwa, Sri Lanka",
        lat: 7.9403,
        lon: 81.0188,
        description: "Ancient capital",
      },
      {
        name: "Dambulla, Sri Lanka",
        lat: 7.8675,
        lon: 80.6491,
        description: "Cave temple city",
      },
      {
        name: "Ella, Sri Lanka",
        lat: 6.8667,
        lon: 81.0466,
        description: "Hill country town",
      },
      {
        name: "Sigiriya, Sri Lanka",
        lat: 7.957,
        lon: 80.7603,
        description: "Ancient rock fortress",
      },
      {
        name: "Mirissa, Sri Lanka",
        lat: 5.9483,
        lon: 80.4716,
        description: "Southern beach town",
      },
      {
        name: "Bentota, Sri Lanka",
        lat: 6.4213,
        lon: 79.9989,
        description: "Western beach town",
      },
      {
        name: "Hikkaduwa, Sri Lanka",
        lat: 6.1395,
        lon: 80.1063,
        description: "Southern beach town",
      },
      {
        name: "Arugam Bay, Sri Lanka",
        lat: 6.8391,
        lon: 81.8338,
        description: "Eastern surf spot",
      },
      {
        name: "Unawatuna, Sri Lanka",
        lat: 6.0169,
        lon: 80.2496,
        description: "Southern beach town",
      },
      {
        name: "Tangalle, Sri Lanka",
        lat: 6.0242,
        lon: 80.797,
        description: "Southern coastal town",
      },
      {
        name: "Kalpitiya, Sri Lanka",
        lat: 8.2333,
        lon: 79.7667,
        description: "Northwestern peninsula",
      },
      {
        name: "Haputale, Sri Lanka",
        lat: 6.7667,
        lon: 80.9667,
        description: "Hill country town",
      },
      {
        name: "Weligama, Sri Lanka",
        lat: 5.9745,
        lon: 80.4295,
        description: "Southern surf town",
      },
      {
        name: "Yala, Sri Lanka",
        lat: 6.3735,
        lon: 81.5089,
        description: "National park",
      },
      {
        name: "Wilpattu, Sri Lanka",
        lat: 8.4567,
        lon: 80.0139,
        description: "National park",
      },
    ];

    // Filter locations based on query
    const filteredLocations = sriLankaLocations.filter((location) =>
      location.name.toLowerCase().includes(query.toLowerCase())
    );

    // If no matches, add a custom location with the query
    if (filteredLocations.length === 0) {
      filteredLocations.push({
        name: query + ", Sri Lanka",
        lat: 7.8731, // Center of Sri Lanka (approximate)
        lon: 80.7718,
        description: "Custom location",
      });
    }

    setLocationSuggestions(filteredLocations.slice(0, 5)); // Limit to 5 results
  };

  // Debounce function for location search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationInput) {
        searchLocations(locationInput);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [locationInput]);

  const selectLocationSuggestion = (location) => {
    setSelectedLocation(location);
    setLocationInput(location.name);
    setLocationSuggestions([]);
  };

  const getDurationInDays = (durationString) => {
    if (!durationString) return 1;

    if (durationString.includes("Week")) {
      return 7;
    }

    const days = parseInt(durationString.split(" ")[0]);
    return isNaN(days) ? 1 : days;
  };

  const getRoomsCount = (roomsString) => {
    if (!roomsString) return 1;

    const rooms = parseInt(roomsString.split(" ")[0]);
    return isNaN(rooms) ? 1 : rooms;
  };

  const handleCreatePlan = async () => {
    if (!selectedLocation) {
      Alert.alert(
        "Missing Information",
        "Please select a location from the suggestions"
      );
      return;
    }

    if (!duration) {
      Alert.alert("Missing Information", "Please select trip duration");
      return;
    }

    if (!rooms) {
      Alert.alert("Missing Information", "Please select number of rooms");
      return;
    }

    setLoading(true);

    try {
      // Get the user ID (email) from AsyncStorage directly
      const userEmail = await AsyncStorage.getItem("userEmail");
      if (!userEmail) {
        Alert.alert(
          "Error",
          "You need to be logged in to generate a plan. Please log in and try again."
        );
        setLoading(false);
        return;
      }

      // Create payload
      const payload = {
        n_rooms: getRoomsCount(rooms),
        location: [selectedLocation.lon, selectedLocation.lat], // [longitude, latitude]
        budget: budget * 320, // Convert USD to LKR (approximate conversion)
        n_days: getDurationInDays(duration),
        _id: userEmail, // Use email as the user identifier
      };

      console.log("Sending payload:", payload);

      try {
        // Make a single fetch request to the API
        const response = await fetch(API_URL + "/generate_travel_plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            // Add CORS headers to help with the request
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        // Parse the response as JSON
        const data = await response.json();
        console.log("Travel plan data:", data);

        // Set the travel plan and show results
        setTravelPlan(data);
        setShowResults(true);
      } catch (fetchError) {
        console.error("Network error:", fetchError);

        // If we have CORS issues, use mock data for development testing
        if (
          fetchError.message.includes("Failed to fetch") ||
          fetchError.message.includes("Network request failed") ||
          fetchError.message.includes("CORS")
        ) {
          console.log("Using mock data due to network error");

          // Create dummy data structure for development
          const mockData = {
            plans: [
              {
                hotel: {
                  name: "Test Hotel 1",
                  type: "Tourist Hotels",
                  district: selectedLocation.name.split(",")[0],
                  distance: 0.5,
                },
                stay: {
                  num_days: getDurationInDays(duration),
                  num_rooms: getRoomsCount(rooms),
                  total_people: getRoomsCount(rooms) * 2,
                },
                costs: {
                  accommodation_cost: budget * 100,
                  travel_cost: budget * 20,
                  food_cost: budget * 50,
                  total_cost: budget * 170,
                },
                recommendations: [
                  "Visit local attractions",
                  "Try local cuisine",
                ],
              },
              {
                hotel: {
                  name: "Test Hotel 2",
                  type: "Boutique Hotel",
                  district: selectedLocation.name.split(",")[0],
                  distance: 1.2,
                },
                stay: {
                  num_days: getDurationInDays(duration),
                  num_rooms: getRoomsCount(rooms),
                  total_people: getRoomsCount(rooms) * 2,
                },
                costs: {
                  accommodation_cost: budget * 80,
                  travel_cost: budget * 30,
                  food_cost: budget * 40,
                  total_cost: budget * 150,
                },
                recommendations: [
                  "Relax at the hotel spa",
                  "Take a guided tour",
                ],
              },
            ],
          };

          setTravelPlan(mockData);
          setShowResults(true);

          Alert.alert(
            "Development Mode",
            "Using mock data due to network connectivity issues. In production, this will use real data from the server."
          );
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error("Error generating travel plan:", error);

      // More detailed error message
      let errorMessage =
        "Failed to generate travel plan. Please try again later.";

      if (error.message) {
        errorMessage = `Error: ${error.message}`;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTravelPlanResults = () => {
    if (!travelPlan || !travelPlan.plans) {
      return null;
    }

    // Get the travel plan array
    const travelPlans = travelPlan.plans;

    // Log the full response for debugging
    console.log("Travel plans response:", travelPlans);

    return (
      <Animated.ScrollView
        entering={FadeInDown.springify()}
        style={styles.scrollView}
        contentContainerStyle={styles.resultsContent}
      >
        <Text style={[styles.title, { color: theme.text }]}>
          Your Travel Plans
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          We've generated {travelPlans.length} options based on your preferences
        </Text>

        {travelPlans.map((plan, index) => (
          <Animated.View
            key={index}
            entering={FadeIn.delay(index * 300)}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.text,
              },
            ]}
          >
            <View
              style={[styles.planHeader, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.planHeaderText}>Option {index + 1}</Text>
            </View>

            <View style={styles.planContent}>
              <View style={styles.hotelSection}>
                <Text style={[styles.hotelName, { color: theme.text }]}>
                  {plan.hotel.name}
                </Text>
                <Text
                  style={[styles.hotelType, { color: theme.textSecondary }]}
                >
                  {plan.hotel.type} • {plan.hotel.district}
                </Text>

                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Feather name="users" size={16} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                      {plan.stay.num_rooms} Rooms
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Feather name="calendar" size={16} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                      {plan.stay.num_days} Days
                    </Text>
                  </View>

                  <View style={styles.statItem}>
                    <Feather name="map-pin" size={16} color={theme.primary} />
                    <Text style={[styles.statText, { color: theme.text }]}>
                      {plan.hotel.distance.toFixed(1)} km
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.costSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Cost Breakdown
                </Text>

                <View style={styles.costItem}>
                  <Text
                    style={[styles.costLabel, { color: theme.textSecondary }]}
                  >
                    Accommodation
                  </Text>
                  <Text style={[styles.costValue, { color: theme.text }]}>
                    LKR {plan.costs.accommodation_cost.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.costItem}>
                  <Text
                    style={[styles.costLabel, { color: theme.textSecondary }]}
                  >
                    Food
                  </Text>
                  <Text style={[styles.costValue, { color: theme.text }]}>
                    LKR {plan.costs.food_cost.toLocaleString()}
                  </Text>
                </View>

                <View style={styles.costItem}>
                  <Text
                    style={[styles.costLabel, { color: theme.textSecondary }]}
                  >
                    Travel
                  </Text>
                  <Text style={[styles.costValue, { color: theme.text }]}>
                    LKR {plan.costs.travel_cost.toLocaleString()}
                  </Text>
                </View>

                <View style={[styles.costItem, styles.totalCostItem]}>
                  <Text
                    style={[
                      styles.costLabel,
                      { color: theme.text, fontWeight: "bold" },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[styles.totalCostValue, { color: theme.primary }]}
                  >
                    LKR {plan.costs.total_cost.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.recommendationsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Recommendations
                </Text>

                {plan.recommendations.map((recommendation, i) => (
                  <View key={i} style={styles.recommendationItem}>
                    <Feather
                      name="check-circle"
                      size={16}
                      color={theme.primary}
                    />
                    <Text
                      style={[styles.recommendationText, { color: theme.text }]}
                    >
                      {recommendation}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[styles.buttonContainer, { backgroundColor: theme.primary }]}
          onPress={() => setShowResults(false)}
        >
          <Text style={styles.buttonText}>Create Another Plan</Text>
        </TouchableOpacity>
      </Animated.ScrollView>
    );
  };

  if (showResults && travelPlan) {
    return renderTravelPlanResults();
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!showForm ? (
        <Animated.View entering={FadeInDown.springify()} style={styles.content}>
          <View style={styles.lottieContainer}>
            <LottieView
              source={require("../../assets/animations/budget-animation.json")}
              autoPlay
              loop
              style={styles.animation}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Take Control of Your Budget
            </Text>

            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Plan your trip details, and we'll create a personalized budget
              plan to help you save and manage your travel expenses effectively.
            </Text>

            <TouchableOpacity
              style={[
                styles.buttonContainer,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <Text style={styles.buttonArrow}>→</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      ) : (
        <Animated.ScrollView
          entering={FadeInDown.springify()}
          style={styles.scrollView}
          contentContainerStyle={styles.formContent}
        >
          <View style={styles.formContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              Add Your Budget
            </Text>

            <Text style={[styles.budgetValue, { color: theme.text }]}>
              ${budget}
            </Text>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1000}
              value={budget}
              onValueChange={setBudget}
              step={50}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Enter Location in Sri Lanka
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    color: theme.text,
                  },
                ]}
                placeholder="Search for a location..."
                placeholderTextColor={theme.textSecondary}
                value={locationInput}
                onChangeText={setLocationInput}
              />

              {locationSuggestions.length > 0 && (
                <View
                  style={[
                    styles.suggestionsContainer,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  {locationSuggestions.map((location, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.suggestionItem,
                        index < locationSuggestions.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        },
                      ]}
                      onPress={() => selectLocationSuggestion(location)}
                    >
                      <Text
                        style={[styles.suggestionText, { color: theme.text }]}
                      >
                        {location.name}
                      </Text>
                      {location.description && (
                        <Text
                          style={[
                            styles.suggestionDescription,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {location.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {selectedLocation && (
                <View
                  style={[
                    styles.selectedLocationContainer,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.selectedLocationText, { color: theme.text }]}
                  >
                    Selected: {selectedLocation.name.split(",")[0]}
                  </Text>
                  <Text
                    style={[
                      styles.coordinatesText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lon.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Trip Duration
              </Text>
              <SelectList
                setSelected={setDuration}
                data={durations}
                save="value"
                placeholder="Select option"
                boxStyles={[
                  styles.select,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                inputStyles={[styles.selectText, { color: theme.text }]}
                dropdownStyles={[
                  styles.dropdown,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                dropdownTextStyles={[styles.selectText, { color: theme.text }]}
                search={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>
                Rooms Needed
              </Text>
              <SelectList
                setSelected={setRooms}
                data={roomOptions}
                save="value"
                placeholder="Select option"
                boxStyles={[
                  styles.select,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                inputStyles={[styles.selectText, { color: theme.text }]}
                dropdownStyles={[
                  styles.dropdown,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                dropdownTextStyles={[styles.selectText, { color: theme.text }]}
                search={false}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.buttonContainer,
                { backgroundColor: theme.primary },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleCreatePlan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create My Plan</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  resultsContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  lottieContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  animation: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    color: "#666",
    paddingHorizontal: 20,
  },
  budgetValue: {
    fontSize: 40,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 16,
  },
  suggestionsContainer: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 8,
    maxHeight: 200,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  suggestionText: {
    fontSize: 16,
  },
  selectedLocationContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: "600",
  },
  coordinatesText: {
    fontSize: 14,
    marginTop: 4,
  },
  select: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  selectText: {
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonArrow: {
    color: "white",
    fontSize: 20,
    marginLeft: 8,
  },
  optionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
  },
  optionHeader: {
    padding: 16,
  },
  optionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  optionContent: {
    padding: 16,
  },
  suggestionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  planCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  planHeader: {
    padding: 16,
  },
  planHeaderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  planContent: {
    padding: 16,
  },
  hotelSection: {
    marginBottom: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  hotelType: {
    fontSize: 16,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 16,
  },
  costSection: {
    marginBottom: 16,
  },
  costItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  costValue: {
    fontSize: 16,
  },
  totalCostItem: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
    marginTop: 8,
  },
  totalCostValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  recommendationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
});
