import React, { useState, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

const SavedRecipesScreen = (): React.JSX.Element => {
  const router = useRouter();

  // Replace with your actual saved recipes source (global state, AsyncStorage, etc.)
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

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
  ]);

  // --- New Multi-select Filter Dropdown for dietary and expiring soon ---
  const filterOptions = [
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Gluten-Free', value: 'Gluten-Free' },
    { label: 'Including Expiring Soon', value: 'ExpiringSoon' },
  ];
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  // --- Apply Filter (by title) ---
  const filteredByFilter = filterBy === 'All'
    ? savedRecipes
    : savedRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(filterBy.toLowerCase())
      );

  // --- Apply Multi-select Filter Options ---
  let filteredByFilters = filteredByFilter;
  if (selectedFilters.length > 0) {
    if (selectedFilters.includes('Vegan')) {
      filteredByFilters = filteredByFilters.filter(recipe => recipe.dietary?.includes('Vegan'));
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

  // Recipe Card component
  const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
    const [expanded, setExpanded] = useState(false);

    return (
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <ThemedView style={styles.recipeCard}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.recipeTitle}>{recipe.title}</ThemedText>
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
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search saved recipes..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Saved Recipes List */}
        {sortedRecipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No saved recipes</ThemedText>
          </View>
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

        {/* Back Button at the bottom */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
          <ThemedText style={styles.backButtonText}>Back</ThemedText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SavedRecipesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B5E20',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
  },
});
