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
}

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

  // Example list of recipes with a description from Gemini
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

  // Component to display each recipe as an attached drop-down tab
  const RecipeTab = ({ recipe }: { recipe: Recipe }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    // Calculate the percentage of available ingredients
    const availableCount = recipe.ingredients.filter((ing) => ing.have).length;
    const totalCount = recipe.ingredients.length;
    const percentage = Math.round((availableCount / totalCount) * 100);

    return (
      <View style={styles.recipeContainer}>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <ThemedView style={styles.recipeTab}>
            <ThemedText style={styles.recipeName}>{recipe.name}</ThemedText>
            <ThemedText style={styles.recipeDescription}>
              {recipe.description}
            </ThemedText>
            <ThemedText style={styles.recipePercentage}>
              {percentage}% available
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
          </ThemedView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.titleText}>
          Recipes
        </ThemedText>
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
      />

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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleText: {
    color: '#fff', // Title color on dark background
    fontSize: 24,
    fontWeight: 'bold',
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
    color: '#fff',
  },
  dropdownContainer: {
    marginBottom: 12,
    zIndex: 1000, // Ensure dropdown appears above other elements
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
  recipeContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden', // Ensures the expanded content is clipped to the container edges
  },
  recipeTab: {
    backgroundColor: '#333',
    padding: 12,
  },
  recipeName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  recipeDescription: {
    color: '#ddd',
    fontSize: 14,
    marginVertical: 4,
  },
  recipePercentage: {
    color: '#ccc',
    fontSize: 14,
  },
  recipeDetails: {
    backgroundColor: '#444',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#555', // a border to visually separate header and details
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
});
