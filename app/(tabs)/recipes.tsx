// recipes.tsx
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
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

// Define your interfaces
interface Ingredient {
  name: string;
  have: boolean;
}

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: Ingredient[];
  prepTime: number;
  cookTime: number;
  nutritionalValues: string;
}

export default function HomeScreen() {
  const { isDark } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';

  const [searchQuery, setSearchQuery] = useState('');

  // DropDownPicker states for filtering categories
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('all');
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

  // Example list of recipes
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

  // Filter by search text
  const filteredBySearch = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter by category drop-down (unless "all" is selected)
  let finalRecipes = filteredBySearch;
  if (value !== 'all') {
    finalRecipes = filteredBySearch.filter(
      (recipe) => recipe.category.toLowerCase() === value.toLowerCase()
    );
  }

  // Sorting
  finalRecipes = finalRecipes.slice().sort((a, b) => {
    const aAvailable = a.ingredients.filter((ing) => ing.have).length;
    const bAvailable = b.ingredients.filter((ing) => ing.have).length;
    const aPercent = aAvailable / a.ingredients.length;
    const bPercent = bAvailable / b.ingredients.length;
    const aTotalTime = a.prepTime + a.cookTime;
    const bTotalTime = b.prepTime + b.cookTime;

    if (sortValue === 'match') {
      return bPercent - aPercent;
    } else if (sortValue === 'time') {
      return aTotalTime - bTotalTime;
    }
    return 0;
  });

  // Component to display each recipe as an expandable tab
  const RecipeTab = ({ recipe }: { recipe: Recipe }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const availableCount = recipe.ingredients.filter((ing) => ing.have).length;
    const totalCount = recipe.ingredients.length;
    const percentage = Math.round((availableCount / totalCount) * 100);

    return (
      <View style={styles.recipeContainer}>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <ThemedView
            style={[
              styles.recipeTab,
              { backgroundColor: Colors[currentColorScheme].cardBackground },
            ]}
          >
            <ThemedText style={[styles.recipeName, { color: Colors[currentColorScheme].text }]}>
              {recipe.name}
            </ThemedText>
            <ThemedText style={[styles.recipeDescription, { color: Colors[currentColorScheme].secondaryText }]}>
              {recipe.description}
            </ThemedText>
            <ThemedText style={[styles.recipePercentage, { color: Colors[currentColorScheme].text }]}>
              {percentage}% matching ingredients
            </ThemedText>
            <ThemedText style={[styles.recipeTime, { color: Colors[currentColorScheme].text }]}>
              Prep: {recipe.prepTime}m, Cook: {recipe.cookTime}m
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
        {isExpanded && (
          <ThemedView
            style={[
              styles.recipeDetails,
              { backgroundColor: Colors[currentColorScheme].cardBackground },
            ]}
          >
            <ThemedText style={[styles.detailTitle, { color: Colors[currentColorScheme].text }]}>
              Ingredients:
            </ThemedText>
            {recipe.ingredients.map((ing, index: number) => (
              <ThemedText
                key={index.toString()}
                style={[styles.ingredientText, { color: Colors[currentColorScheme].secondaryText }]}
              >
                {ing.name}: {ing.have ? 'Available' : 'Missing'}
              </ThemedText>
            ))}
            <ThemedText style={[styles.detailTitle, { color: Colors[currentColorScheme].text }]}>
              Instructions:
            </ThemedText>
            <ThemedText style={[styles.instructionText, { color: Colors[currentColorScheme].secondaryText }]}>
              [Insert step-by-step cooking instructions here...]
            </ThemedText>
            <ThemedText style={[styles.detailTitle, { color: Colors[currentColorScheme].text }]}>
              Nutritional Values:
            </ThemedText>
            <ThemedText style={[styles.nutritionText, { color: Colors[currentColorScheme].secondaryText }]}>
              {recipe.nutritionalValues}
            </ThemedText>
          </ThemedView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      {/* Header: Search and Sort */}
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder },
            ]}
            placeholder="Search recipes..."
            placeholderTextColor={Colors[currentColorScheme].secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortOpen(!sortOpen)}
        >
          <ThemedText style={[styles.sortButtonLabel, { color: Colors[currentColorScheme].text }]}>
            Sort
          </ThemedText>
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
              <ThemedText style={{ color: Colors[currentColorScheme].text }}>
                {item.label}
              </ThemedText>
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

// Move the SortIcon component declaration here, after styles is defined.
const SortIcon = () => (
  <View style={styles.sortIconContainer}>
    <View style={styles.sortLineTop} />
    <View style={styles.sortLineMiddle} />
    <View style={styles.sortLineMid} />
    <View style={styles.sortLineBottom} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
  },
  sortButton: {
    marginLeft: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  sortIconContainer: {
    alignItems: 'flex-start',
  },
  sortLineTop: {
    width: 18,
    height: 2,
    backgroundColor: Colors.dark.text,
    marginBottom: 2,
  },
  sortLineMiddle: {
    width: 16,
    height: 2,
    backgroundColor: Colors.dark.text,
    marginBottom: 2,
  },
  sortLineMid: {
    width: 14,
    height: 2,
    backgroundColor: Colors.dark.text,
    marginBottom: 2,
  },
  sortLineBottom: {
    width: 12,
    height: 2,
    backgroundColor: Colors.dark.text,
  },
  dropdownContainer: {
    marginBottom: 12,
    zIndex: 1000,
  },
  dropdownStyle: {
    borderColor: Colors.dark.activeTabBorder,
    backgroundColor: Colors.dark.cardBackground,
  },
  dropdownListStyle: {
    borderColor: Colors.dark.activeTabBorder,
    backgroundColor: Colors.dark.cardBackground,
  },
  dropdownText: {
    color: Colors.dark.text,
  },
  sortDropdown: {
    position: 'absolute',
    top: 60,
    right: 12,
    backgroundColor: Colors.dark.cardBackground,
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
    fontSize: 18,
    fontWeight: '600',
  },
  recipeDescription: {
    fontSize: 14,
    marginVertical: 4,
  },
  recipePercentage: {
    fontSize: 14,
  },
  recipeTime: {
    fontSize: 14,
    marginTop: 4,
  },
  recipeDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.activeTabBorder,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ingredientText: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  instructionText: {
    fontSize: 14,
    marginTop: 8,
  },
  nutritionText: {
    fontSize: 14,
    marginTop: 4,
  },
});
