import { 
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
}

export default function IngredientsScreen() {
  const params = useLocalSearchParams();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState('');

  // --- Single Drop-Down for Sorting (Least/Most) ---
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortItems, setSortItems] = useState([
    { label: 'No Sort', value: 'none' },
    { label: 'Least Ingredients', value: 'asc' },   // ascending by amount
    { label: 'Most Ingredients', value: 'desc' },  // descending by amount
  ]);

  useEffect(() => {
    if (params.ingredients) {
      setIngredients(JSON.parse(params.ingredients as string));
    }
  }, [params.ingredients]);

  // Increment / Decrement an ingredient's amount
  const updateAmount = (id: string, increment: boolean) => {
    setIngredients(prevIngredients => 
      prevIngredients.map(ingredient => 
        ingredient.id === id
          ? {
              ...ingredient,
              amount: increment ? ingredient.amount + 1 : Math.max(0, ingredient.amount - 1),
            }
          : ingredient
      )
    );
  };

  // 1) Filter by search query
  const filtered = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2) Sort by amount (one dropdown for "Least" or "Most")
  let finalIngredients = [...filtered];
  if (sortBy === 'asc') {
    finalIngredients.sort((a, b) => a.amount - b.amount);     // least first
  } else if (sortBy === 'desc') {
    finalIngredients.sort((a, b) => b.amount - a.amount);     // most first
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Ingredients</ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Single Dropdown for sorting */}
        <DropDownPicker
          open={openSort}
          value={sortBy}
          items={sortItems}
          setOpen={setOpenSort}
          setValue={setSortBy}
          setItems={setSortItems}
          placeholder="Sort by Amount"
          style={styles.dropdownStyle}
          containerStyle={styles.dropdownContainer}
          dropDownContainerStyle={styles.dropdownListStyle}
          textStyle={styles.dropdownText}
          zIndex={2000} 
          zIndexInverse={2000}
        />

        {/* Ingredients List */}
        <FlatList
          data={finalIngredients}
          keyExtractor={item => item.id}
          extraData={ingredients}
          renderItem={({ item }) => (
            <View style={styles.ingredientContainer} key={item.id}>
              <View style={styles.labelContainer}>
                <ThemedText style={styles.ingredientName}>{item.name}</ThemedText>
                <View style={styles.amountContainer}>
                  <TouchableOpacity
                    onPress={() => updateAmount(item.id, false)}
                    style={styles.button}
                  >
                    <MaterialIcons name="remove" size={24} color="#2E7D32" />
                  </TouchableOpacity>

                  <ThemedText style={styles.amount}>
                    {item.amount} {item.unit}
                  </ThemedText>

                  <TouchableOpacity
                    onPress={() => updateAmount(item.id, true)}
                    style={styles.button}
                  >
                    <MaterialIcons name="add" size={24} color="#2E7D32" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

// ---------------------------------
//            Styles
// ---------------------------------
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
  // Ingredient Card
  ingredientContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amount: {
    fontSize: 16,
    color: '#666',
    minWidth: 60,
    textAlign: 'center',
  },
  button: {
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
});
