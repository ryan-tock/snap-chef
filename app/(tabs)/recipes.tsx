import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TextInput,
  Platform,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Define your interfaces
interface Ingredient {
  name: string;
  have: boolean;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string; // One-line description from Gemini
  ingredients: Ingredient[];
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  nutritionalValues: string; // e.g., "500 kcal, 20g protein, etc."
}

// Custom component for the sort icon (three lines aligned to the left)
const SortIcon = () => (
  <View style={styles.sortIconContainer}>
    <View style={styles.sortLineTop} />
    <View style={styles.sortLineMiddle} />
    <View style={styles.sortLineMid} />
    <View style={styles.sortLineBottom} />
  </View>
);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  // DropDownPicker states for filtering categories
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all'); // Current filter value
  const [items, setItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
  ]);

  // Sort options using a custom dropdown
  const [sortOpen, setSortOpen] = useState(false);
  const [sortValue, setSortValue] = useState('match'); // 'match' or 'time'
  const sortItems = [
    { label: 'Matching Ingredients', value: 'match' },
    { label: 'Total Time', value: 'time' },
  ];

  // Example list of recipes with additional properties
  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Pasta',
      category: 'Dinner',
      description: 'A hearty pasta dish with a rich tomato sauce.',
      ingredients: [
        { name: 'Pasta', have: true },
        { name: 'Tomato Sauce', have: false },
        { name: 'Cheese', have: true },
      ],
      prepTime: 10,
      cookTime: 20,
      nutritionalValues: '500 kcal, 20g protein, 60g carbs',
    },
    {
      id: '2',
      name: 'Pancakes',
      category: 'Breakfast',
      description: 'Fluffy pancakes perfect for a sweet morning treat.',
      ingredients: [
        { name: 'Flour', have: true },
        { name: 'Eggs', have: true },
        { name: 'Milk', have: false },
      ],
      prepTime: 5,
      cookTime: 10,
      nutritionalValues: '350 kcal, 8g protein, 45g carbs',
    },
    {
      id: '3',
      name: 'Salad',
      category: 'Lunch',
      description: 'A fresh salad with crisp vegetables and a tangy dressing.',
      ingredients: [
        { name: 'Lettuce', have: true },
        { name: 'Tomato', have: true },
        { name: 'Cucumber', have: false },
      ],
      prepTime: 8,
      cookTime: 0,
      nutritionalValues: '200 kcal, 5g protein, 10g carbs',
    },
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

  // 3) Sorting
  finalRecipes = finalRecipes.slice().sort((a, b) => {
    // Calculate percentages for matching ingredients
    const aAvailable = a.ingredients.filter((ing) => ing.have).length;
    const bAvailable = b.ingredients.filter((ing) => ing.have).length;
    const aPercent = aAvailable / a.ingredients.length;
    const bPercent = bAvailable / b.ingredients.length;
    // Total time (prep + cook)
    const aTotalTime = a.prepTime + a.cookTime;
    const bTotalTime = b.prepTime + b.cookTime;

    if (sortValue === 'match') {
      // Descending order: higher matching percentage first
      return bPercent - aPercent;
    } else if (sortValue === 'time') {
      // Ascending order: lower total time first
      return aTotalTime - bTotalTime;
    }
    return 0;
  });

  // Component to display each recipe as an attached drop-down tab
  const RecipeTab = ({ recipe }: { recipe: Recipe }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Calculate the percentage of available ingredients
    const availableCount = recipe.ingredients.filter((ing) => ing.have).length;
    const totalCount = recipe.ingredients.length;
    const percentage = Math.round((availableCount / totalCount) * 100);

    // Set a mild background tint based on percentage match
    const bgColor =
      percentage > 75
        ? '#d4efdf' // light green
        : percentage > 50
        ? '#fcf3cf' // light yellow
        : '#f5b7b1'; // light red

    return (
      <View style={styles.recipeContainer}>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <ThemedView style={[styles.recipeTab, { backgroundColor: bgColor }]}>
            <ThemedText style={styles.recipeName}>{recipe.name}</ThemedText>
            <ThemedText style={styles.recipeDescription}>
              {recipe.description}
            </ThemedText>
            <ThemedText style={styles.recipePercentage}>
              {percentage}% matching ingredients
            </ThemedText>
            <ThemedText style={styles.recipeTime}>
              Prep: {recipe.prepTime}m, Cook: {recipe.cookTime}m
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
        {isExpanded && (
          <ThemedView style={styles.recipeDetails}>
            <ThemedText style={styles.detailTitle}>Ingredients:</ThemedText>
            {recipe.ingredients.map((ing, index: number) => (
              <ThemedText key={index.toString()} style={styles.ingredientText}>
                {ing.name}: {ing.have ? 'Available' : 'Missing'}
              </ThemedText>
            ))}
            <ThemedText style={styles.detailTitle}>Instructions:</ThemedText>
            <ThemedText style={styles.instructionText}>
              [Insert step-by-step cooking instructions here...]
            </ThemedText>
            <ThemedText style={styles.detailTitle}>
              Nutritional Values:
            </ThemedText>
            <ThemedText style={styles.nutritionText}>
              {recipe.nutritionalValues}
            </ThemedText>
          </ThemedView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Search and Sort */}
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOpen(!sortOpen)}
        >
          <ThemedText style={styles.sortButtonLabel}>Sort</ThemedText>
          <SortIcon />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
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
      />

      {/* Custom Sort Dropdown */}
      {sortOpen && (
        <View style={styles.sortDropdown}>
          {sortItems.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => {
                setSortValue(item.value);
                setSortOpen(false);
              }}
              style={styles.sortDropdownItem}
            >
              <ThemedText>{item.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <FlatList
        data={finalRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeTab recipe={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Dark background
    padding: 12,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    color: '#fff',
  },
  sortButton: {
    marginLeft: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonLabel: {
    fontSize: 14,
    color: '#fff',
    marginRight: 4, // Small space between label and icon
  },
  // Custom sort icon styles with adjusted dimensions and left alignment
  sortIconContainer: {
    alignItems: 'flex-start', // Align lines to the left
  },
  sortLineTop: {
    width: 18,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  sortLineMiddle: {
    width: 16,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 2,
  },  
  sortLineMid: {
    width: 14,
    height: 2,
    backgroundColor: '#fff',
    marginBottom: 2,
  },
  sortLineBottom: {
    width: 12,
    height: 2,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    marginBottom: 12,
    zIndex: 1000,
  },
  dropdownStyle: {
    backgroundColor: '#111',
    borderColor: '#444',
  },
  dropdownListStyle: {
    backgroundColor: '#222',
    borderColor: '#444',
  },
  dropdownText: {
    color: '#fff',
  },
  sortDropdown: {
    position: 'absolute',
    top: 60, // Adjust based on your header height
    right: 12,
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 8,
    zIndex: 1100,
  },
  sortDropdownItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recipeContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  recipeTab: {
    padding: 12,
  },
  recipeName: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  recipeDescription: {
    color: '#333',
    fontSize: 14,
    marginVertical: 4,
  },
  recipePercentage: {
    color: '#555',
    fontSize: 14,
  },
  recipeTime: {
    color: '#555',
    fontSize: 14,
    marginTop: 4,
  },
  recipeDetails: {
    backgroundColor: '#444',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#555',
  },
  detailTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ingredientText: {
    color: '#ddd',
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  instructionText: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 8,
  },
  nutritionText: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
  },
});
