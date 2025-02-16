import { StyleSheet, SafeAreaView, ScrollView, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Ingredient {
  name: string;
  amount: number;
  unit?: string;
}

export default function IngredientsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // For searching by ingredient name
  const [searchQuery, setSearchQuery] = useState('');

  // --- First Drop-Down: Filter by unit type ---
  const [openUnit, setOpenUnit] = useState(false);
  const [filterUnit, setFilterUnit] = useState('all'); // Selected unit from drop-down
  const [unitItems, setUnitItems] = useState([
    { label: 'All', value: 'all' },
    { label: 'Amount', value: 'amount' },
  ]);

  // --- Second Drop-Down: Sort by amount (ascending/descending) ---
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortItems, setSortItems] = useState([
    { label: 'No Sort', value: 'none' },
    { label: 'Amount Ascending', value: 'asc' },
    { label: 'Amount Descending', value: 'desc' },
  ]);

  useEffect(() => {
    if (params.ingredients) {
      setIngredients(JSON.parse(params.ingredients as string));
    }
  }, [params.ingredients]);

  // Function to increment or decrement ingredient amount
  const updateAmount = (index: number, increment: boolean) => {
    setIngredients((current) =>
      current.map((item, idx) =>
        idx === index
          ? {
              ...item,
              amount: increment ? item.amount + 1 : Math.max(0, item.amount - 1),
            }
          : item
      )
    );
  };

  // For the horizontal bar width
  const getBarWidth = (amount: number) => {
    const maxAmount = Math.max(...ingredients.map((i) => i.amount));
    return maxAmount === 0 ? 0 : (amount / maxAmount) * 100;
  };

  // --------------------------
  // 1) Filter by search query
  // --------------------------
  const filteredBySearch = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --------------------------------
  // 2) Filter by unit drop-down
  // --------------------------------
  let filteredByUnit = filteredBySearch;
  if (filterUnit !== 'all') {
    filteredByUnit = filteredBySearch.filter(
      (ingredient) =>
        // If ingredient.unit is undefined or doesn't match, this will filter it out
        ingredient.unit?.toLowerCase() === filterUnit.toLowerCase()
    );
  }

  // ----------------------------------------
  // 3) Sort by amount (from the second menu)
  // ----------------------------------------
  let finalIngredients = [...filteredByUnit];
  if (sortBy === 'asc') {
    finalIngredients.sort((a, b) => a.amount - b.amount);
  } else if (sortBy === 'desc') {
    finalIngredients.sort((a, b) => b.amount - a.amount);
  }
  // If sortBy === 'none', just leave them as-is

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Title */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Ingredients</ThemedText>
        </ThemedView>

        {/* ---------- Search Bar ---------- */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ---------- First Drop-Down: Filter by Unit ---------- */}
        <DropDownPicker
          open={openUnit}
          value={filterUnit}
          items={unitItems}
          setOpen={setOpenUnit}
          setValue={setFilterUnit}
          setItems={setUnitItems}
          placeholder="Filter by Unit"
          style={styles.dropdownStyle}
          containerStyle={styles.dropdownContainer}
          dropDownContainerStyle={styles.dropdownListStyle}
          textStyle={styles.dropdownText}
          zIndex={3000} // Helps ensure this drop-down is on top if multiple are open
          zIndexInverse={1000}
        />

        {/* ---------- Second Drop-Down: Sort by Amount ---------- */}
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

        {/* ---------- Render Ingredients ---------- */}
        {finalIngredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientContainer}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.ingredientName}>{ingredient.name}</ThemedText>
              <ThemedText style={styles.amount}>
                {ingredient.amount}{' '}
                {ingredient.unit || 'pieces'}
              </ThemedText>
            </View>

            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  { width: `${getBarWidth(ingredient.amount)}%` },
                ]}
              />
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                onPress={() => updateAmount(index, false)}
                style={styles.button}
              >
                <MaterialIcons name="remove" size={24} color="#2E7D32" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateAmount(index, true)}
                style={styles.button}
              >
                <MaterialIcons name="add" size={24} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  // --- Search ---
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
  // --- DropDown styling ---
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
  // --- Ingredient Card ---
  ingredientContainer: {
    backgroundColor: 'white',
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
    marginBottom: 8,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    color: '#666',
  },
  barContainer: {
    height: 20,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  bar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
  },
});
