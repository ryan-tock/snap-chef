import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// All possible dietary restrictions and allergies
const dietaryRestrictionsList = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Halal',
  'Kosher',
  'Pescatarian',
  'Low-Carb',
  'Low-Fat',
  'Paleo',
  'Keto',
];

const allergiesList = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
];

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState<'Dietary' | 'DarkMode' | 'Account'>('Dietary');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDietaryRestriction = (item: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleAllergy = (item: string) => {
    setAllergies((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabHeaderContainer}>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'Dietary' && styles.activeTab]}
          onPress={() => setActiveTab('Dietary')}
        >
          <ThemedText style={styles.tabHeaderText}>Dietary</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'DarkMode' && styles.activeTab]}
          onPress={() => setActiveTab('DarkMode')}
        >
          <ThemedText style={styles.tabHeaderText}>Dark Mode</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'Account' && styles.activeTab]}
          onPress={() => setActiveTab('Account')}
        >
          <ThemedText style={styles.tabHeaderText}>Account</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'Dietary' && (
          <View>
            <ThemedText style={styles.sectionHeader}>Dietary Restrictions</ThemedText>
            {dietaryRestrictionsList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxContainer}
                onPress={() => toggleDietaryRestriction(item)}
              >
                <View style={[styles.checkbox, dietaryRestrictions.includes(item) && styles.checkboxChecked]} />
                <ThemedText style={styles.checkboxLabel}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
            <ThemedText style={styles.sectionHeader}>Allergies</ThemedText>
            {allergiesList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxContainer}
                onPress={() => toggleAllergy(item)}
              >
                <View style={[styles.checkbox, allergies.includes(item) && styles.checkboxChecked]} />
                <ThemedText style={styles.checkboxLabel}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'DarkMode' && (
          <View style={styles.darkModeContainer}>
            <ThemedText style={styles.sectionHeader}>Dark Mode</ThemedText>
            <View style={styles.switchContainer}>
              <ThemedText style={styles.switchLabel}>{darkMode ? 'On' : 'Off'}</ThemedText>
              <Switch value={darkMode} onValueChange={setDarkMode} />
            </View>
          </View>
        )}

        {activeTab === 'Account' && (
          <View>
            <ThemedText style={styles.sectionHeader}>Account Settings</ThemedText>
            {/* Replace these placeholders with your actual account details */}
            <ThemedText style={styles.accountText}>Username: user123</ThemedText>
            <ThemedText style={styles.accountText}>Email: user@example.com</ThemedText>
            <TouchableOpacity style={styles.logoutButton}>
              <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default UserSettings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  tabHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabHeaderText: {
    color: '#fff',
    fontSize: 16,
  },
  contentContainer: {
    padding: 12,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#fff',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#0070f3',
  },
  checkboxLabel: {
    color: '#fff',
    fontSize: 16,
  },
  darkModeContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  switchLabel: {
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
  },
  accountText: {
    color: '#fff',
    fontSize: 16,
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#0070f3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
