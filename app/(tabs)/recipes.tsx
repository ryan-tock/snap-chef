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
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

interface Recipe {
  id: string;
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
  // Use theme toggle
  const { isDark } = useThemeToggle();
  const currentColorScheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  const params = useLocalSearchParams();

  // Populate recipes only from Gemini ingredients (via route parameters)
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  useEffect(() => {
    if (!params.recipes) {
      setRecipes([]);
      return;
    }
    try {
      const recipesString =
        typeof params.recipes === 'string'
          ? params.recipes
          : JSON.stringify(params.recipes);
      const parsed = JSON.parse(recipesString);
      if (parsed.success && Array.isArray(parsed.recipes)) {
        const processedRecipes = parsed.recipes.map((recipe: any) => ({
          id: recipe.id,
          title: recipe.name,
          description: recipe.description,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: Array.isArray(recipe.ingredients)
            ? recipe.ingredients.map((ing: any) =>
                typeof ing === 'string'
                  ? ing
                  : `${ing.name} (${ing.amount} ${ing.unit})`
              )
            : [],
          instructions: recipe.instructions,
          dietary: recipe.dietary || [],
          requiredItems: recipe.requiredItems || [],
          expiringSoon: recipe.expiringSoon || false,
          matchingPercentage: recipe.matchingPercentage || 0,
        }));
        setRecipes(processedRecipes);
      } else {
        console.error('Invalid recipes data structure:', parsed);
        setRecipes([]);
      }
    } catch (e) {
      console.error('Failed to parse recipes:', e);
      setRecipes([]);
    }
  }, [params.recipes]);

  // --- Search State ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Sort State ---
  const baseSortOptions = [
    { label: 'No Sort', value: 'none' },
    { label: '% Ingredients', value: 'matching' },
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

  const handleSortChange = (
    value: 'none' | 'matching' | 'time' | 'servings' | null
  ) => {
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
      return exists ? prev.filter(r => r.id !== recipe.id) : [...prev, recipe];
    });
  };

  // --- Toggle between All Recipes and Saved Recipes ---
  const [showSaved, setShowSaved] = useState(false);

  // --- Apply Filter (by title) ---
  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Apply Sorting ---
  // If no sort option is chosen, leave the list unsorted.
  // For 'matching', sort descending (highest first).
  // For 'time', sort ascending (lowest total time first).
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

  // Recipe Card Component
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [expanded, setExpanded] = useState(false);
    const isSaved = savedRecipes.some(r => r.id === recipe.id);

    return (
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <ThemedView
          style={[
            styles.recipeCard,
            { backgroundColor: Colors[currentColorScheme].cardBackground },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText
              style={[styles.recipeTitle, { color: Colors[currentColorScheme].text }]}
            >
              {recipe.title}
            </ThemedText>
            <TouchableOpacity onPress={() => toggleBookmark(recipe)}>
              <MaterialIcons
                name={isSaved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={Colors[currentColorScheme].text}
              />
            </TouchableOpacity>
          </View>
          <ThemedText
            style={[styles.recipeDescription, { color: Colors[currentColorScheme].secondaryText }]}
          >
            {recipe.description}
          </ThemedText>
          <ThemedText
            style={[styles.prepTime, { color: Colors[currentColorScheme].secondaryText }]}
          >
            Prep Time: {recipe.prepTime}m | Total Time: {recipe.prepTime + recipe.cookTime}m
          </ThemedText>
          <ThemedText
            style={[styles.extraInfo, { color: Colors[currentColorScheme].secondaryText }]}
          >
            % Matching: {recipe.matchingPercentage ? recipe.matchingPercentage + '%' : '0%'} | Servings: {recipe.servings}
          </ThemedText>
          {expanded && (
            <ThemedView
              style={[styles.subtab, { backgroundColor: Colors[currentColorScheme].background }]}
            >
              <ThemedText
                style={[styles.sectionTitle, { color: Colors[currentColorScheme].text }]}
              >
                Ingredients:
              </ThemedText>
              {recipe.ingredients.map((ing, i) => (
                <ThemedText
                  key={i}
                  style={[styles.listItem, { color: Colors[currentColorScheme].secondaryText }]}
                >
                  • {ing}
                </ThemedText>
              ))}
              <ThemedText
                style={[styles.sectionTitle, { color: Colors[currentColorScheme].text }]}
              >
                Instructions:
              </ThemedText>
              {recipe.instructions.map((step, i) => (
                <ThemedText
                  key={i}
                  style={[styles.listItem, { color: Colors[currentColorScheme].secondaryText }]}
                >
                  {i + 1}. {step}
                </ThemedText>
              ))}
            </ThemedView>
          )}
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      <View style={styles.content}>
        {/* Header with Filter and Sort Top Tab Buttons */}
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
            <ThemedText style={styles.sortByStatic}>Sort By:</ThemedText>
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

        {/* Render Dropdowns Right Below Header */}
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

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: Colors[currentColorScheme].text,
                borderColor: Colors[currentColorScheme].activeTabBorder,
                backgroundColor: Colors[currentColorScheme].cardBackground,
              },
            ]}
            placeholder="Search recipes..."
            placeholderTextColor={Colors[currentColorScheme].secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Render Recipes List */}
        {showSaved ? (
          savedRecipes.length > 0 ? (
            <FlatList
              data={savedRecipes}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <RecipeCard recipe={item} />}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: Colors[currentColorScheme].secondaryText }]}>
                No saved recipes
              </ThemedText>
            </View>
          )
        ) : (
          <FlatList
            data={sortedRecipes}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <RecipeCard recipe={item} />}
          />
        )}

        {/* Saved Recipes Tab */}
        <TouchableOpacity
          style={[styles.savedTab, { backgroundColor: Colors[currentColorScheme].accentButton }]}
          onPress={() => setShowSaved(true)}
        >
          <MaterialIcons name="bookmark" size={24} color="#fff" />
          <ThemedText style={styles.savedTabText}>Saved Recipes</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default RecipesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  headerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 12, 
    zIndex: 3000,
  },
  filterButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8, 
    maxWidth: '60%',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
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
    padding: 8,
    borderRadius: 8,
  },
  sortByText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginRight: 4,
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
  dropdownContainer: { 
    marginBottom: 12, 
  },
  dropdownStyle: { 
    backgroundColor: '#f5f5f5', 
    borderColor: '#ccc' 
  },
  dropdownListStyle: { 
    backgroundColor: '#e8e8e8', 
    borderColor: '#ccc' 
  },
  dropdownText: { 
    fontSize: 16, 
    color: '#000' 
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
    fontSize: 16,
    color: '#000',
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
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
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
  extraInfo: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  subtab: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
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
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sortLabel: {
    fontSize: 16,
  },
  sortChoice: {
    fontSize: 16,
  },
});
