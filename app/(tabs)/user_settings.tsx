// user_settings.tsx
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
import { useThemeToggle } from '@/components/ThemeToggleContext';
import { Colors } from '@/constants/Colors';

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
  const { isDark, toggleDarkMode } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';

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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      <View style={[styles.tabHeaderContainer, { backgroundColor: Colors[currentColorScheme].tabHeaderBackground }]}>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'Dietary' && { borderBottomColor: Colors[currentColorScheme].activeTabBorder, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('Dietary')}
        >
          <ThemedText style={[styles.tabHeaderText, { color: Colors[currentColorScheme].text }]}>Dietary</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'DarkMode' && { borderBottomColor: Colors[currentColorScheme].activeTabBorder, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('DarkMode')}
        >
          <ThemedText style={[styles.tabHeaderText, { color: Colors[currentColorScheme].text }]}>Dark Mode</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabHeader, activeTab === 'Account' && { borderBottomColor: Colors[currentColorScheme].activeTabBorder, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('Account')}
        >
          <ThemedText style={[styles.tabHeaderText, { color: Colors[currentColorScheme].text }]}>Account</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'Dietary' && (
          <View>
            <ThemedText style={[styles.sectionHeader, { color: Colors[currentColorScheme].text }]}>Dietary Restrictions</ThemedText>
            {dietaryRestrictionsList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxContainer}
                onPress={() => toggleDietaryRestriction(item)}
              >
                <View style={[
                  styles.checkbox, 
                  dietaryRestrictions.includes(item) && { backgroundColor: Colors[currentColorScheme].tint, borderColor: Colors[currentColorScheme].tint }
                ]} />
                <ThemedText style={[styles.checkboxLabel, { color: Colors[currentColorScheme].text }]}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
            <ThemedText style={[styles.sectionHeader, { color: Colors[currentColorScheme].text }]}>Allergies</ThemedText>
            {allergiesList.map((item) => (
              <TouchableOpacity
                key={item}
                style={styles.checkboxContainer}
                onPress={() => toggleAllergy(item)}
              >
                <View style={[
                  styles.checkbox, 
                  allergies.includes(item) && { backgroundColor: Colors[currentColorScheme].tint, borderColor: Colors[currentColorScheme].tint }
                ]} />
                <ThemedText style={[styles.checkboxLabel, { color: Colors[currentColorScheme].text }]}>{item}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'DarkMode' && (
          <View style={styles.darkModeContainer}>
            <ThemedText style={[styles.sectionHeader, { color: Colors[currentColorScheme].text }]}>Dark Mode</ThemedText>
            <View style={styles.switchContainer}>
              <ThemedText style={[styles.switchLabel, { color: Colors[currentColorScheme].text }]}>{isDark ? 'On' : 'Off'}</ThemedText>
              <Switch value={isDark} onValueChange={toggleDarkMode} />
            </View>
          </View>
        )}

        {activeTab === 'Account' && (
          <View>
            <ThemedText style={[styles.sectionHeader, { color: Colors[currentColorScheme].text }]}>Account Settings</ThemedText>
            <ThemedText style={[styles.accountText, { color: Colors[currentColorScheme].text }]}>Username: user123</ThemedText>
            <ThemedText style={[styles.accountText, { color: Colors[currentColorScheme].text }]}>Email: user@example.com</ThemedText>
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
  },
  tabHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  tabHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  tabHeaderText: {
    fontSize: 16,
  },
  contentContainer: {
    padding: 12,
  },
  sectionHeader: {
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
    marginRight: 8,
  },
  checkboxLabel: {
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
    fontSize: 16,
    marginRight: 12,
  },
  accountText: {
    fontSize: 16,
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#0070f3', // You can also choose to theme this button color if desired.
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
