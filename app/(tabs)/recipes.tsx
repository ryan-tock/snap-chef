import { 
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

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  nutritionalValues: string;
  usesExpiringIngredients?: boolean;
}

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
  isExpiring?: boolean;
}

function RecipesScreen(): React.JSX.Element {
  const params = useLocalSearchParams();

  // Load recipes from route parameters if provided; otherwise, use sample recipes.
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIngredients, setCurrentIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    if (params.recipes) {
      try {
        // The recipes are double-stringified, so we need to parse twice
        const outerParsed = JSON.parse(params.recipes as string);
        const recipes = JSON.parse(outerParsed.recipes);
        
        // Transform the recipes to ensure all required fields exist
        const processedRecipes = recipes.map((recipe: any) => ({
          id: `recipe-${Date.now()}-${Math.random()}`,
          name: recipe.name || 'Untitled Recipe',
          category: recipe.category || 'Other',
          description: recipe.description || 'No description available',
          ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          prepTime: recipe.prepTime || 0,
          cookTime: recipe.cookTime || 0,
          nutritionalValues: recipe.nutritionalValues || 'Not available',
          usesExpiringIngredients: false // We'll calculate this separately
        }));

        setRecipes(processedRecipes);
      } catch (e) {
        console.error('Failed to parse recipes:', e);
      }
    }
    if (params.ingredients) {
      try {
        setCurrentIngredients(JSON.parse(params.ingredients as string));
      } catch (e) {
        console.error('Failed to parse ingredients:', e);
      }
    }
  }, [params.recipes, params.ingredients]);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Sort State ---
  const baseSortOptions = [
    { label: 'No Sort', value: 'none' },
    { label: '# of Ingredients', value: 'matching' },
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
  ]);

  // --- Filter Panel for extra filters ---
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

  // --- New Multi-select Filter Dropdown for dietary and expiring soon ---
  const filterOptions = [
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
    { label: 'Including Expiring Soon', value: 'ExpiringSoon' },
  ];
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // --- Sample Recipes ---
  const sampleRecipes: Recipe[] = [
    {
      id: 'r1',
      name: 'Pasta Primavera',
      category: 'Dinner',
      description: 'A vibrant pasta dish with fresh veggies.',
      ingredients: [{ name: 'Pasta', amount: '200g', unit: 'g' }, { name: 'Tomatoes', amount: '200g', unit: 'g' }, { name: 'Bell Peppers', amount: '100g', unit: 'g' }, { name: 'Zucchini', amount: '100g', unit: 'g' }],
      instructions: [
        'Boil pasta until al dente.',
        'Sauté vegetables with garlic and olive oil.',
        'Mix pasta with veggies, season with salt and pepper.'
      ],
      nutritionalValues: 'Calories: 300, Protein: 10g, Carbs: 50g, Fat: 5g',
      usesExpiringIngredients: false,
      prepTime: 15,
      cookTime: 20,
    },
    {
      id: 'r2',
      name: 'Hearty Pancakes',
      category: 'Breakfast',
      description: 'Fluffy pancakes perfect for breakfast.',
      ingredients: [{ name: 'Flour', amount: '200g', unit: 'g' }, { name: 'Eggs', amount: '4', unit: '' }, { name: 'Milk', amount: '200ml', unit: 'ml' }, { name: 'Maple Syrup', amount: '50ml', unit: 'ml' }],
      instructions: [
        'Mix flour, eggs, and milk until smooth.',
        'Cook on a griddle until bubbles form, flip and cook the other side.',
        'Serve with maple syrup.'
      ],
      nutritionalValues: 'Calories: 200, Protein: 10g, Carbs: 30g, Fat: 5g',
      usesExpiringIngredients: true,
      prepTime: 10,
      cookTime: 5,
    },
    {
      id: 'r3',
      name: 'Fresh Garden Salad',
      category: 'Lunch',
      description: 'A crisp and refreshing salad.',
      ingredients: [{ name: 'Lettuce', amount: '200g', unit: 'g' }, { name: 'Tomatoes', amount: '100g', unit: 'g' }, { name: 'Cucumber', amount: '100g', unit: 'g' }, { name: 'Olive Oil', amount: '20ml', unit: 'ml' }, { name: 'Lemon Juice', amount: '10ml', unit: 'ml' }],
      instructions: [
        'Chop all vegetables.',
        'Toss with olive oil and lemon juice.',
        'Season with salt and pepper.'
      ],
      nutritionalValues: 'Calories: 100, Protein: 2g, Carbs: 10g, Fat: 5g',
      usesExpiringIngredients: false,
      prepTime: 8,
      cookTime: 0,
    },
  ];

  const allRecipes: Recipe[] = recipes.length > 0 ? recipes : sampleRecipes;

  // --- Apply Filter (by title) ---
  const filteredByFilter = filterBy === 'All' 
    ? allRecipes 
    : allRecipes.filter(recipe => recipe.name.toLowerCase().includes(filterBy.toLowerCase()));

  // --- Apply Extra Filter Panel Options ---
  let filteredByFilters = filteredByFilter;
  if (dietaryFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(dietaryFilter.toLowerCase()))
    );
  }
  if (servingsFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.ingredients.some(ing => ing.amount.includes(servingsFilter))
    );
  }
  if (requiredFilter !== 'All') {
    filteredByFilters = filteredByFilters.filter(recipe =>
      recipe.ingredients.some(ing => ing.name.toLowerCase().includes(requiredFilter.toLowerCase()))
    );
  }

  // --- Apply Multi-select Filter Options ---
  if (selectedFilters.length > 0) {
    if (selectedFilters.includes('Vegan')) {
      filteredByFilters = filteredByFilters.filter(recipe =>
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes('vegan'))
      );
    }
    if (selectedFilters.includes('Vegetarian')) {
      filteredByFilters = filteredByFilters.filter(recipe =>
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes('vegetarian'))
      );
    }
    if (selectedFilters.includes('Gluten-Free')) {
      filteredByFilters = filteredByFilters.filter(recipe =>
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes('gluten-free'))
      );
    }
    if (selectedFilters.includes('ExpiringSoon')) {
      filteredByFilters = filteredByFilters.filter(recipe =>
        recipe.usesExpiringIngredients
      );
    }
  }

  // --- Apply Search ---
  const filteredRecipes = filteredByFilters.filter(recipe => 
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Apply Sorting based on sortBy and sortDirection ---
  let sortedRecipes = [...filteredRecipes];
  if (sortBy === 'matching') {
    sortedRecipes.sort((a, b) =>
      sortDirection === 'asc'
        ? a.ingredients.length - b.ingredients.length
        : b.ingredients.length - a.ingredients.length
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
        ? a.ingredients.length - b.ingredients.length
        : b.ingredients.length - a.ingredients.length
    );
  }

  // Recipe Card without image at the top.
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <ThemedView style={styles.recipeCard}>
          <View style={styles.recipeHeader}>
            <ThemedText style={styles.recipeTitle}>{recipe.name}</ThemedText>
            <ThemedText style={styles.recipeCategory}>{recipe.category}</ThemedText>
          </View>
          
          {recipe.usesExpiringIngredients && (
            <View style={styles.expiringBadge}>
              <MaterialIcons name="warning" size={16} color="#FF5722" />
              <ThemedText style={styles.expiringText}>Uses Expiring Ingredients</ThemedText>
            </View>
          )}

          <ThemedText style={styles.recipeDescription}>{recipe.description}</ThemedText>
          <ThemedText style={styles.prepTime}>
            Prep: {recipe.prepTime}m | Cook: {recipe.cookTime}m | Total: {recipe.prepTime + recipe.cookTime}m
          </ThemedText>

          {expanded && (
            <View style={styles.subtab}>
              <ThemedText style={styles.sectionTitle}>Ingredients:</ThemedText>
              {recipe.ingredients.map((ing, i) => (
                <ThemedText key={i} style={styles.listItem}>
                  • {ing.amount} {ing.unit} {ing.name}
                </ThemedText>
              ))}

              <ThemedText style={styles.sectionTitle}>Instructions:</ThemedText>
              {recipe.instructions.map((step, i) => (
                <ThemedText key={i} style={styles.listItem}>
                  {i + 1}. {step}
                </ThemedText>
              ))}

              <ThemedText style={styles.sectionTitle}>Nutrition:</ThemedText>
              <ThemedText style={styles.nutritionText}>{recipe.nutritionalValues}</ThemedText>
            </View>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
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
            {/* Tappable arrow icon on the left toggles sort direction */}
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
                    ? '# of Ingredients'
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

        {/* Recipes List */}
        <FlatList
          data={sortedRecipes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <RecipeCard recipe={item} />}
        />
      </View>
    </SafeAreaView>
  );
}

export default RecipesScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 16 },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12 
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
  dropdownContainer: { marginBottom: 12 },
  dropdownStyle: { backgroundColor: '#f5f5f5', borderColor: '#ccc' },
  dropdownListStyle: { backgroundColor: '#e8e8e8', borderColor: '#ccc' },
  dropdownText: { fontSize: 16, color: '#000' },
  searchContainer: { marginBottom: 12 },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#000',
  },
  recipeCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recipeDescription: { 
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  prepTime: {
    fontSize: 14,
    color: '#555',
  },
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
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBE9E7',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
    gap: 4,
  },
  expiringText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  nutritionText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
