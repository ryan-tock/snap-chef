<<<<<<< HEAD
// recipes.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
=======
import { 
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
  StyleSheet,
  SafeAreaView,
  View,
  TextInput,
  Platform,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

interface Recipe {
  id: string;
<<<<<<< HEAD
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
=======
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  dietary?: string[];
  requiredItems?: string[];
  expiringSoon?: boolean;
  matchingPercentage?: number;
}

function RecipesScreen(): React.JSX.Element {
  const params = useLocalSearchParams();

  // Load recipes from route parameters if provided; otherwise, use sample recipes.
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    if (params.recipes) {
      setRecipes(JSON.parse(params.recipes as string));
    }
  }, [params.recipes]);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Sort State ---
  const baseSortOptions = [
    { label: 'No Sort', value: 'none' },
    { label: '% Matching Ingredients', value: 'matching' },
    { label: 'Time', value: 'time' },
    { label: 'Servings', value: 'servings' },
  ];
  const [sortBy, setSortBy] = useState<'none' | 'matching' | 'time' | 'servings'>('none');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortItems, setSortItems] = useState<{ label: string; value: string }[]>(baseSortOptions);
  const [openSort, setOpenSort] = useState(false);

  const toggleSortDirection = () => {
    if (sortBy !== 'none') {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    }
  };

  const handleSortChange = (value: "none" | "matching" | "time" | "servings" | null) => {
    if (value === null) return;
    if (value === sortBy) {
      toggleSortDirection();
    } else {
      setSortBy(value);
      setSortDirection('asc');
    }
  };

  const onSortValueChange = (callback: string | ((prev: string) => string)) => {
    const newValue = typeof callback === 'function' ? callback(sortBy) : callback;
    handleSortChange(newValue as "none" | "matching" | "time" | "servings");
  };

  // --- Filtering Dropdown (for title) ---
  const [openFilter, setOpenFilter] = useState(false);
  const [filterBy, setFilterBy] = useState('All');
  const [filterItems, setFilterItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'Pasta', value: 'Pasta' },
    { label: 'Pancakes', value: 'Pancakes' },
    { label: 'Salad', value: 'Salad' },
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
  ]);

  // --- Filter Panel for extra filters (if needed) ---
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [dietaryFilter, setDietaryFilter] = useState('All');
  const [dietaryItems, setDietaryItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
  ]);
  const [servingsFilter, setServingsFilter] = useState('All');
  const [servingsItems, setServingsItems] = useState([
    { label: 'All', value: 'All' },
    { label: '1', value: '1' },
    { label: '2', value: '2' },
    { label: '3', value: '3' },
    { label: '4', value: '4' },
    { label: '5', value: '5' },
  ]);
  const [requiredFilter, setRequiredFilter] = useState('All');
  const [requiredItems, setRequiredItems] = useState([
    { label: 'All', value: 'All' },
    { label: 'Cheese', value: 'Cheese' },
    { label: 'Eggs', value: 'Eggs' },
    { label: 'Milk', value: 'Milk' },
    { label: 'Pasta', value: 'Pasta' },
  ]);

<<<<<<< HEAD
  // Example list of recipes
  const recipes: Recipe[] = [
=======
  // --- New Multi-select Filter Dropdown for dietary and expiring soon ---
  const filterOptions = [
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
    { label: 'Including Expiring Soon', value: 'ExpiringSoon' },
  ];
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // --- Bookmarking State ---
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const toggleBookmark = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  // --- Option to toggle between All Recipes and Saved Recipes ---
  const [showSaved, setShowSaved] = useState(false);

  // --- Sample Recipes ---
  const sampleRecipes: Recipe[] = [
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    {
      id: 'r1',
      title: 'Pasta Primavera',
      description: 'A vibrant pasta dish with fresh veggies.',
      prepTime: 15,
      cookTime: 20,
      servings: 4,
      ingredients: ['Pasta', 'Tomatoes', 'Bell Peppers', 'Zucchini'],
      instructions: [
        'Boil pasta until al dente.',
        'Sauté vegetables with garlic and olive oil.',
        'Mix pasta with veggies, season with salt and pepper.'
      ],
      dietary: ['Vegetarian'],
      requiredItems: ['Pasta', 'Tomatoes'],
      expiringSoon: false,
      matchingPercentage: 75,
    },
    {
      id: 'r2',
      title: 'Hearty Pancakes',
      description: 'Fluffy pancakes perfect for breakfast.',
      prepTime: 10,
      cookTime: 5,
      servings: 2,
      ingredients: ['Flour', 'Eggs', 'Milk', 'Maple Syrup'],
      instructions: [
        'Mix flour, eggs, and milk until smooth.',
        'Cook on a griddle until bubbles form, flip and cook the other side.',
        'Serve with maple syrup.'
      ],
      dietary: [],
      requiredItems: ['Eggs', 'Milk'],
      expiringSoon: true,
      matchingPercentage: 50,
    },
    {
      id: 'r3',
      title: 'Fresh Garden Salad',
      description: 'A crisp and refreshing salad.',
      prepTime: 8,
      cookTime: 0,
      servings: 3,
      ingredients: ['Lettuce', 'Tomatoes', 'Cucumber', 'Olive Oil', 'Lemon Juice'],
      instructions: [
        'Chop all vegetables.',
        'Toss with olive oil and lemon juice.',
        'Season with salt and pepper.'
      ],
      dietary: ['Vegan', 'Gluten-Free'],
      requiredItems: ['Lettuce', 'Tomatoes'],
      expiringSoon: false,
      matchingPercentage: 90,
    },
  ];

<<<<<<< HEAD
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
=======
  const allRecipes: Recipe[] = recipes.length > 0 ? recipes : sampleRecipes;

  // --- Apply Filter (by title) ---
  const filteredByFilter = filterBy === 'All' 
    ? allRecipes 
    : allRecipes.filter(recipe => recipe.title.toLowerCase().includes(filterBy.toLowerCase()));

  // --- Apply Extra Filter Panel Options ---
  let filteredByFilters = filteredByFilter;
  if (dietaryFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.dietary?.includes(dietaryFilter)
    );
  }
  if (servingsFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.servings === parseInt(servingsFilter)
    );
  }
  if (requiredFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.requiredItems?.includes(requiredFilter)
    );
  }

  // --- Apply Multi-select Filter Options ---
  if (selectedFilters.length > 0) {
    if (selectedFilters.includes('Vegan')) {
      filteredByFilters = filteredByFilters.filter(recipe => recipe.dietary?.includes('Vegan'));
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    }
    if (selectedFilters.includes('Vegetarian')) {
      filteredByFilters = filteredByFilters.filter(recipe => recipe.dietary?.includes('Vegetarian'));
    }
    if (selectedFilters.includes('Gluten-Free')) {
      filteredByFilters = filteredByFilters.filter(recipe => recipe.dietary?.includes('Gluten-Free'));
    }
    if (selectedFilters.includes('ExpiringSoon')) {
      filteredByFilters = filteredByFilters.filter(recipe => recipe.expiringSoon);
    }
  }

<<<<<<< HEAD
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
=======
  // --- Apply Search ---
  const filteredRecipes = filteredByFilters.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Apply Sorting based on sortBy and sortDirection ---
  let sortedRecipes = [...filteredRecipes];
  if (sortBy === 'matching') {
    sortedRecipes.sort((a, b) =>
      sortDirection === 'asc'
        ? (a.matchingPercentage || 0) - (b.matchingPercentage || 0)
        : (b.matchingPercentage || 0) - (a.matchingPercentage || 0)
    );
  } else if (sortBy === 'time') {
    sortedRecipes.sort((a, b) =>
      sortDirection === 'asc'
        ? (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime)
        : (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime)
    );
  } else if (sortBy === 'servings') {
    sortedRecipes.sort((a, b) =>
      sortDirection === 'asc'
        ? a.servings - b.servings
        : b.servings - a.servings
    );
  }

  // Recipe Card (without image).
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [expanded, setExpanded] = useState(false);
    const isSaved = savedRecipes.some(r => r.id === recipe.id);

    return (
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <ThemedView style={styles.recipeCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.recipeTitle}>{recipe.title}</ThemedText>
            <TouchableOpacity onPress={() => toggleBookmark(recipe)}>
              <MaterialIcons 
                name={isSaved ? "bookmark" : "bookmark-border"} 
                size={24} 
                color="#1B5E20" 
              />
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.recipeDescription}>{recipe.description}</ThemedText>
          <ThemedText style={styles.prepTime}>
            Prep Time: {recipe.prepTime}m | Total Time: {recipe.prepTime + recipe.cookTime}m
          </ThemedText>
          <ThemedText style={styles.extraInfo}>
            % Matching: {recipe.matchingPercentage ? recipe.matchingPercentage + '%' : '0%'} | Servings: {recipe.servings}
          </ThemedText>
          {expanded && (
            <ThemedView style={styles.subtab}>
              <ThemedText style={styles.sectionTitle}>Ingredients:</ThemedText>
              {recipe.ingredients.map((ing, i) => (
                <ThemedText key={i} style={styles.listItem}>• {ing}</ThemedText>
              ))}
              <ThemedText style={styles.sectionTitle}>Instructions:</ThemedText>
              {recipe.instructions.map((step, i) => (
                <ThemedText key={i} style={styles.listItem}>
                  {i + 1}. {step}
                </ThemedText>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    );
  };

  return (
<<<<<<< HEAD
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      {/* Header: Search and Sort */}
      <View style={styles.headerContainer}>
=======
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header with Filter and Sort Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setOpenFilter(!openFilter)}
          >
            <MaterialIcons name="filter-list" size={24} color="#1B5E20" />
            <ThemedText style={styles.sortByText}>Filter</ThemedText>
            <MaterialIcons name="arrow-drop-down" size={24} color="#1B5E20" />
          </TouchableOpacity>
          <View style={styles.sortHeader}>
            <TouchableOpacity onPress={toggleSortDirection} style={styles.sortIconButton}>
              <MaterialIcons 
                name={sortDirection === 'asc' ? 'arrow-upward' : 'arrow-downward'} 
                size={20} 
                color="#1B5E20" 
              />
            </TouchableOpacity>
            <ThemedText style={styles.sortByStatic}>Sort By: </ThemedText>
            <TouchableOpacity 
              style={styles.sortByButton}
              onPress={() => setOpenSort(!openSort)}
            >
              <ThemedText style={styles.sortByText}>
                {sortBy !== 'none'
                  ? sortBy === 'matching'
                    ? '% Matching Ingredients'
                    : sortBy === 'time'
                    ? 'Time'
                    : sortBy === 'servings'
                    ? 'Servings'
                    : ''
                  : 'Select'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
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

        {/* Saved Recipes Tab (always visible, below search bar) */}
        <TouchableOpacity 
          style={styles.savedTab}
          onPress={() => setShowSaved(true)}
        >
<<<<<<< HEAD
          <ThemedText style={[styles.sortButtonLabel, { color: Colors[currentColorScheme].text }]}>
            Sort
          </ThemedText>
          <SortIcon />
=======
          <MaterialIcons name="bookmark" size={24} color="#fff" />
          <ThemedText style={styles.savedTabText}>Saved Recipes</ThemedText>
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
        </TouchableOpacity>

        {/* Render content based on selected tab */}
        {showSaved ? (
          savedRecipes.length > 0 ? (
            <FlatList
              data={savedRecipes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No saved recipes</ThemedText>
            </View>
          )
        ) : (
          <FlatList
            data={sortedRecipes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
          />
        )}

        {/* Filter Dropdown */}
        {openFilter && (
          <DropDownPicker<string>
            open={openFilter}
            value={selectedFilters}
            items={filterOptions}
            setOpen={setOpenFilter}
            setValue={setSelectedFilters}
            placeholder="Select filter options"
            multiple={true}
            style={styles.dropdownStyle}
            containerStyle={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdownListStyle}
            textStyle={styles.dropdownText}
            zIndex={2200}
            zIndexInverse={2200}
          />
        )}

        {/* Sort Dropdown */}
        {openSort && (
          <DropDownPicker<string>
            open={openSort}
            value={sortBy}
            items={sortItems}
            setOpen={setOpenSort}
            setValue={(callback) => {
              const newValue = typeof callback === 'function' ? callback(sortBy) : callback;
              handleSortChange(newValue);
            }}
            setItems={setSortItems}
            placeholder="Sort by Option"
            multiple={false}
            style={styles.dropdownStyle}
            containerStyle={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdownListStyle}
            textStyle={styles.dropdownText}
            zIndex={2000}
            zIndexInverse={2000}
          />
        )}
      </View>
<<<<<<< HEAD

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
=======
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    </SafeAreaView>
  );
}

<<<<<<< HEAD
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
=======
export default RecipesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
  },
  filterButton: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  sortHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortByStatic: {
    fontSize: 16,
    color: '#1B5E20',
  },
  sortByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  sortByText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  sortIconButton: {
    marginRight: 4,
  },
  savedTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 12,
  },
  savedTabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dropdownContainer: { marginBottom: 12 },
  dropdownStyle: { backgroundColor: '#f5f5f5', borderColor: '#ccc' },
  dropdownListStyle: { backgroundColor: '#e8e8e8', borderColor: '#ccc' },
  dropdownText: { fontSize: 16, color: '#000' },
  searchContainer: { marginBottom: 12 },
  searchInput: {
    borderWidth: 1,
<<<<<<< HEAD
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
=======
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#000',
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
  },
  recipeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
<<<<<<< HEAD
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
=======
  recipeTitle: {
    fontSize: 18,
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
<<<<<<< HEAD
  ingredientText: {
    fontSize: 14,
    marginLeft: 8,
    marginBottom: 2,
  },
  instructionText: {
=======
  recipeDescription: { 
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  prepTime: {
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    fontSize: 14,
    color: '#555',
  },
<<<<<<< HEAD
  nutritionText: {
=======
  extraInfo: {
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
<<<<<<< HEAD
=======
  subtab: {
    marginTop: 8,
    backgroundColor: '#f0f0f0', // Grey white background for subtabs
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 8,
    padding: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 8,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    paddingLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
<<<<<<< HEAD
>>>>>>> bf46308f3d91d345d560e387a0911791626d68a9
});
=======
});
>>>>>>> d9cb9103c9a1365766be8c153dfbe788b589d4c1
