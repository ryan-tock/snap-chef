import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  // Search query state
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown (sorting/filter) state
  const [filterOption, setFilterOption] = useState('all');

  // Imagine you have a list of recipes like this
  const recipes = [
    { id: '1', name: 'Pasta', category: 'Dinner' },
    { id: '2', name: 'Pancakes', category: 'Breakfast' },
    { id: '3', name: 'Salad', category: 'Lunch' },
  ];

  // Filter by name based on `searchQuery`
  const filteredBySearch = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter (or sort) by drop-down selection
  let finalRecipes = filteredBySearch;
  if (filterOption !== 'all') {
    finalRecipes = filteredBySearch.filter(
      (recipe) => recipe.category.toLowerCase() === filterOption.toLowerCase()
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollMenu}>
        {/* Title */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Recipes</ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </ThemedView>

        {/* Dropdown Menu (Filter / Sort) */}
        <ThemedView style={styles.pickerContainer}>
          <Picker
            selectedValue={filterOption}
            onValueChange={(itemValue) => setFilterOption(itemValue)}
          >
            <Picker.Item label="All" value="all" />
            <Picker.Item label="Breakfast" value="Breakfast" />
            <Picker.Item label="Lunch" value="Lunch" />
            <Picker.Item label="Dinner" value="Dinner" />
          </Picker>
        </ThemedView>

        {/* Display the filtered recipes */}
        {finalRecipes.map((recipe) => (
          <ThemedView key={recipe.id} style={styles.recipeItem}>
            <ThemedText>{recipe.name}</ThemedText>
            <ThemedText type="secondary">{recipe.category}</ThemedText>
          </ThemedView>
        ))}

        {/* 
          You can also switch to a FlatList if you have a long list of recipes:

          <FlatList
            data={finalRecipes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.recipeItem}>
                <ThemedText>{item.name}</ThemedText>
                <ThemedText type="secondary">{item.category}</ThemedText>
              </ThemedView>
            )}
          />
        */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollMenu: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeItem: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
});
