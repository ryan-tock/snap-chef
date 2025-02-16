import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, Platform, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // DropDownPicker states
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all'); // Current filter value
  const [items, setItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
  ]);

  // Example list of recipes
  const recipes = [
    { id: '1', name: 'Pasta', category: 'Dinner' },
    { id: '2', name: 'Pancakes', category: 'Breakfast' },
    { id: '3', name: 'Salad', category: 'Lunch' },
  ];

  // 1) Filter by search text
  const filteredBySearch = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2) Filter by category drop-down (unless "all" is selected)
  let finalRecipes = filteredBySearch;
  if (value !== 'all') {
    finalRecipes = filteredBySearch.filter(
      (recipe) => recipe.category.toLowerCase() === value.toLowerCase()
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>Recipes</ThemedText>
      </ThemedView>

      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Select a category"
        style={styles.dropdownStyle}
        containerStyle={styles.dropdownContainer}
        dropDownContainerStyle={styles.dropdownListStyle}
        textStyle={styles.dropdownText}
        // Optional theme setting for DropDownPicker
        // theme="DARK" 
      />

      <FlatList
        data={finalRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ThemedView style={styles.recipeItem}>
            <ThemedText style={styles.recipeName}>{item.name}</ThemedText>
            <ThemedText style={styles.recipeCategory}>{item.category}</ThemedText>
          </ThemedView>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background
  },
  scrollMenu: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    color: '#fff', // Title color on dark background
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#fff', // Text color inside search bar
  },
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownStyle: {
    backgroundColor: '#111', // Background color of closed dropdown
    borderColor: '#444',
  },
  dropdownListStyle: {
    backgroundColor: '#222', // Background color of the opened dropdown list
    borderColor: '#444',
  },
  dropdownText: {
    color: '#fff', // Text color for dropdown items
  },
  recipeItem: {
    backgroundColor: '#f5f5f5', // Light card color
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  recipeName: {
    color: '#000', // If you want the recipe name black on a light card
    fontSize: 16,
    fontWeight: '600',
  },
  recipeCategory: {
    color: '#666', // Slightly lighter text for the category
    fontSize: 14,
  },
});
