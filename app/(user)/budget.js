import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from "../../utils/ThemeContext";
import Animated, { FadeInDown } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import Slider from '@react-native-community/slider';
import { SelectList } from 'react-native-dropdown-select-list';

export default function Budget() {
  const { theme } = useTheme();
  const [showForm, setShowForm] = useState(false);
  const [budget, setBudget] = useState(500);
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState('');
  const [rooms, setRooms] = useState('');

  const destinations = [
    { key: '1', value: 'Colombo' },
    { key: '2', value: 'Kandy' },
    { key: '3', value: 'Galle' },
    { key: '4', value: 'Sigiriya' },
    { key: '5', value: 'Ella' },
    { key: '6', value: 'Nuwara Eliya' },
  ];

  const durations = [
    { key: '1', value: '1 Day' },
    { key: '2', value: '2 Days' },
    { key: '3', value: '3 Days' },
    { key: '4', value: '4 Days' },
    { key: '5', value: '5 Days' },
    { key: '7', value: '1 Week' },
  ];

  const roomOptions = [
    { key: '1', value: '1 Room' },
    { key: '2', value: '2 Rooms' },
    { key: '3', value: '3 Rooms' },
    { key: '4', value: '4 Rooms' },
    { key: '5', value: '5 Rooms' },
  ];

  const handleCreatePlan = () => {
    // Handle plan creation logic here
    console.log({ budget, destination, duration, rooms });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!showForm ? (
        <Animated.View 
          entering={FadeInDown.springify()}
          style={styles.content}
        >
          <View style={styles.lottieContainer}>
            <LottieView
              source={require('../../assets/animations/budget-animation.json')}
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
              Plan your trip details, and we'll create a personalized budget plan to help you save and manage your travel expenses effectively.
            </Text>

            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: theme.primary }]}
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
              <Text style={[styles.label, { color: theme.text }]}>Choose Your Destination</Text>
              <SelectList
                setSelected={setDestination}
                data={destinations}
                save="value"
                placeholder="Select option"
                boxStyles={[styles.select, { backgroundColor: theme.card, borderColor: theme.border }]}
                inputStyles={[styles.selectText, { color: theme.text }]}
                dropdownStyles={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
                dropdownTextStyles={[styles.selectText, { color: theme.text }]}
                search={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Trip Duration</Text>
              <SelectList
                setSelected={setDuration}
                data={durations}
                save="value"
                placeholder="Select option"
                boxStyles={[styles.select, { backgroundColor: theme.card, borderColor: theme.border }]}
                inputStyles={[styles.selectText, { color: theme.text }]}
                dropdownStyles={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
                dropdownTextStyles={[styles.selectText, { color: theme.text }]}
                search={false}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.text }]}>Rooms Needed</Text>
              <SelectList
                setSelected={setRooms}
                data={roomOptions}
                save="value"
                placeholder="Select option"
                boxStyles={[styles.select, { backgroundColor: theme.card, borderColor: theme.border }]}
                inputStyles={[styles.selectText, { color: theme.text }]}
                dropdownStyles={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}
                dropdownTextStyles={[styles.selectText, { color: theme.text }]}
                search={false}
              />
            </View>

            <TouchableOpacity 
              style={[styles.buttonContainer, { backgroundColor: theme.primary }]}
              onPress={handleCreatePlan}
            >
              <Text style={styles.buttonText}>Create My Plan</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  formContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  lottieContainer: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    color: '#666',
    paddingHorizontal: 20,
  },
  budgetValue: {
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 40,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonArrow: {
    color: 'white',
    fontSize: 20,
    marginLeft: 8,
  },
});
