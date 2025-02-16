import { 
  StyleSheet,
  SafeAreaView,
  View,
  TextInput,
  Platform,
  FlatList,
  TouchableOpacity 
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

function RecipesScreen() {
  const params = useLocalSearchParams();

  // Get recipes from route parameters if available
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    if (params.recipes) {
      setRecipes(JSON.parse(params.recipes as string));
    }
  }, [params.recipes]);

  // --- Search for Recipes ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Drop-Down for Sorting Recipes (Title A-Z / Z-A) ---
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortItems, setSortItems] = useState([
    { label: 'No Sort', value: 'none' },
    { label: 'Title A-Z', value: 'asc' },
    { label: 'Title Z-A', value: 'desc' },
  ]);

  // Sample recipes to autopopulate if none are passed via parameters.
  const sampleRecipes: Recipe[] = [
    {
      id: 'r1',
      title: 'Pasta Primavera',
      description: 'A vibrant pasta dish with fresh veggies.',
      ingredients: ['Pasta', 'Tomatoes', 'Bell Peppers', 'Zucchini'],
      instructions: [
        'Boil pasta until al dente.',
        'Sauté vegetables with garlic.',
        'Combine pasta and veggies, season to taste.'
      ],
    },
    {
      id: 'r2',
      title: 'Hearty Pancakes',
      description: 'Fluffy pancakes perfect for breakfast.',
      ingredients: ['Flour', 'Eggs', 'Milk', 'Maple Syrup'],
      instructions: [
        'Mix flour, eggs, and milk into a smooth batter.',
        'Cook on a griddle until bubbles form, flip and cook the other side.',
        'Serve with maple syrup.'
      ],
    },
    {
      id: 'r3',
      title: 'Fresh Garden Salad',
      description: 'A crisp and refreshing salad.',
      ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Olive Oil', 'Lemon Juice'],
      instructions: [
        'Chop all vegetables.',
        'Toss with olive oil and lemon juice.',
        'Season with salt and pepper.'
      ],
    },
  ];

  // Use passed recipes if available; otherwise, use sampleRecipes.
  const finalRecipes: Recipe[] = recipes.length > 0 ? recipes : sampleRecipes;

  // Filter recipes by search query (searching title and description)
  const filteredRecipes = finalRecipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort recipes based on sortBy value
  let sortedRecipes = [...filteredRecipes];
  if (sortBy === 'asc') {
    sortedRecipes.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'desc') {
    sortedRecipes.sort((a, b) => b.title.localeCompare(a.title));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Recipes</ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Dropdown for sorting */}
        <DropDownPicker
          open={openSort}
          value={sortBy}
          items={sortItems}
          setOpen={setOpenSort}
          setValue={setSortBy}
          setItems={setSortItems}
          placeholder="Sort by Title"
          style={styles.dropdownStyle}
          containerStyle={styles.dropdownContainer}
          dropDownContainerStyle={styles.dropdownListStyle}
          textStyle={styles.dropdownText}
          zIndex={2000}
          zIndexInverse={2000}
        />

        {/* Recipes List */}
        <FlatList
          data={sortedRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.recipeCard}>
              <ThemedText style={styles.recipeTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.recipeDescription}>{item.description}</ThemedText>
              <ThemedText style={styles.sectionTitle}>Ingredients:</ThemedText>
              {item.ingredients.map((ing, i) => (
                <ThemedText key={i} style={styles.listItem}>• {ing}</ThemedText>
              ))}
              <ThemedText style={styles.sectionTitle}>Instructions:</ThemedText>
              {item.instructions.map((step, i) => (
                <ThemedText key={i} style={styles.listItem}>
                  {i + 1}. {step}
                </ThemedText>
              ))}
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  // Search
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#000',
  },
  // DropDown styling
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownStyle: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
  },
  dropdownListStyle: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
    color: '#000',
  },
  // Recipe Card styling
  recipeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
});

export default RecipesScreen;
