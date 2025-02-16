// ingredients.tsx
import { 
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

const API_URL = 'http://10.37.163.63:5000';  // Your actual IP address

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
  isExpiring?: boolean;
}

export default function IngredientsScreen() {
  const params = useLocalSearchParams();
  const { isDark } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';
  const router = useRouter();

  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Single Drop-Down for Sorting (Least/Most)
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState('none');
  const [sortItems, setSortItems] = useState([
    { label: 'No Sort', value: 'none' },
    { label: 'Least Ingredients', value: 'asc' },
    { label: 'Most Ingredients', value: 'desc' },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newIngredientName, setNewIngredientName] = useState('');
  const [newIngredientAmount, setNewIngredientAmount] = useState('');
  const [newIngredientUnit, setNewIngredientUnit] = useState('pieces');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [editedName, setEditedName] = useState('');

  // Modal for editing amount
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [editedAmount, setEditedAmount] = useState('');

  const [isLoading, setIsLoading] = useState(false);

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

  // For the horizontal bar width (if needed)
  const getBarWidth = (amount: number) => {
    const maxAmount = Math.max(...ingredients.map((i) => i.amount));
    return maxAmount === 0 ? 0 : (amount / maxAmount) * 100;
  };

  // 1) Filter by search query
  const filtered = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2) Sort by amount
  let finalIngredients = [...filtered];
  if (sortBy === 'asc') {
    finalIngredients.sort((a, b) => a.amount - b.amount);
  } else if (sortBy === 'desc') {
    finalIngredients.sort((a, b) => b.amount - a.amount);
  }

  const addIngredient = () => {
    if (!newIngredientName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }
    
    const amount = parseInt(newIngredientAmount) || 1;
    
    setIngredients(prev => [...prev, {
      id: `ingredient-${Date.now()}`,
      name: newIngredientName.trim(),
      amount: amount,
      unit: newIngredientUnit
    }]);
    
    setModalVisible(false);
    setNewIngredientName('');
    setNewIngredientAmount('');
    setNewIngredientUnit('pieces');
  };

  const editIngredient = () => {
    if (!editingIngredient || !editedName.trim()) {
      Alert.alert('Error', 'Please enter an ingredient name');
      return;
    }

    setIngredients(prev => prev.map(ing => 
      ing.id === editingIngredient.id
        ? { ...ing, name: editedName.trim() }
        : ing
    ));
    
    setEditModalVisible(false);
    setEditingIngredient(null);
    setEditedName('');
  };

  const deleteIngredient = (id: string) => {
    Alert.alert(
      'Delete Ingredient',
      'Are you sure you want to delete this ingredient?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: () => setIngredients(prev => prev.filter(ing => ing.id !== id)),
          style: 'destructive'
        },
      ]
    );
  };

  // Modal function for editing amount
  const editAmount = () => {
    if (!editingIngredient) return;
    
    const newAmt = parseInt(editedAmount);
    if (isNaN(newAmt)) {
      Alert.alert('Error', 'Please enter a valid number');
      return;
    }

    setIngredients(prev => prev.map(ing => 
      ing.id === editingIngredient.id
        ? { ...ing, amount: newAmt }
        : ing
    ));
    
    setAmountModalVisible(false);
    setEditingIngredient(null);
    setEditedAmount('');
  };

  const fetchRecipes = async (ingredients: Ingredient[]) => {
    try {
      if (ingredients.length === 0) {
        Alert.alert('Error', 'No ingredients to generate recipes from');
        return;
      }

      setIsLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Send as POST to /generate_recipes instead of /api/recipes
      const response = await fetch(
        `${API_URL}/generate_recipes`,
        {
          signal: controller.signal,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            ingredients: ingredients.map(ing => ({
              name: ing.name,
              amount: ing.amount,
              isExpiring: ing.isExpiring || false
            }))
          })
        }
      );

      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        router.push({
          pathname: '/recipes',
          params: { recipes: JSON.stringify(data) }
        });
      } else {
        throw new Error(data.error || 'Failed to generate recipes');
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to generate recipes. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      <View style={styles.content}>
        {/* Title */}
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={{ color: Colors[currentColorScheme].text }}>
            Ingredients
          </ThemedText>
        </ThemedView>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              { 
                color: Colors[currentColorScheme].text, 
                borderColor: Colors[currentColorScheme].activeTabBorder,
                backgroundColor: Colors[currentColorScheme].cardBackground,
              }
            ]}
            placeholder="Search ingredients..."
            placeholderTextColor={Colors[currentColorScheme].secondaryText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Dropdown for Sorting */}
        <DropDownPicker
          open={openSort}
          value={sortBy}
          items={sortItems}
          setOpen={setOpenSort}
          setValue={setSortBy}
          setItems={setSortItems}
          placeholder="Sort by Amount"
          style={[
            styles.dropdownStyle,
            { backgroundColor: Colors[currentColorScheme].cardBackground, borderColor: Colors[currentColorScheme].activeTabBorder }
          ]}
          containerStyle={styles.dropdownContainer}
          dropDownContainerStyle={[
            styles.dropdownListStyle,
            { backgroundColor: Colors[currentColorScheme].cardBackground, borderColor: Colors[currentColorScheme].activeTabBorder }
          ]}
          textStyle={[styles.dropdownText, { color: Colors[currentColorScheme].text }]}
          zIndex={2000} 
          zIndexInverse={2000}
        />

        {/* Generate Recipes Button */}
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.generateButton}
            onPress={() => fetchRecipes(ingredients)}
          >
            <MaterialIcons name="restaurant" size={24} color="white" />
            <ThemedText style={styles.generateButtonText}>Generate Recipes</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Ingredients List */}
        <FlatList
          data={finalIngredients}
          keyExtractor={(item) => item.id}
          extraData={ingredients}
          renderItem={({ item }) => (
            <View style={[styles.ingredientContainer, { backgroundColor: Colors[currentColorScheme].cardBackground }]} key={item.id}>
              <View style={styles.headerRow}>
                <View style={styles.nameContainer}>
                  <TouchableOpacity 
                    onPress={() => {
                      setEditingIngredient(item);
                      setEditedName(item.name);
                      setEditModalVisible(true);
                    }}
                  >
                    <ThemedText style={styles.ingredientName} numberOfLines={2}>
                      {item.name} {item.unit ? `(${item.unit})` : ''}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <View style={styles.expiringContainer}>
                  <ThemedText style={[
                    styles.expiringText,
                    !item.isExpiring && styles.expiringTextHidden
                  ]}>
                    Expiring Soon!
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => {
                      setIngredients(prev => prev.map(ing => 
                        ing.id === item.id
                          ? { ...ing, isExpiring: !ing.isExpiring }
                          : ing
                      ));
                    }}
                    style={styles.checkboxContainer}
                  >
                    <MaterialIcons 
                      name={item.isExpiring ? "check-box" : "check-box-outline-blank"} 
                      size={24} 
                      color={Colors[currentColorScheme].tint}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.amountRow}>
                <TouchableOpacity
                  onPress={() => updateAmount(item.id, false)}
                  style={[styles.button, { backgroundColor: Colors[currentColorScheme].tint }]}
                >
                  <MaterialIcons name="remove" size={24} color={Colors[currentColorScheme].background} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setEditingIngredient(item);
                    setEditedAmount(item.amount.toString());
                    setAmountModalVisible(true);
                  }}
                >
                  <ThemedText style={[styles.amount, { color: Colors[currentColorScheme].text }]}>
                    {item.amount}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateAmount(item.id, true)}
                  style={[styles.button, { backgroundColor: Colors[currentColorScheme].tint }]}
                >
                  <MaterialIcons name="add" size={24} color={Colors[currentColorScheme].background} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteIngredient(item.id)}
                  style={[styles.button, styles.deleteButton]}
                >
                  <MaterialIcons name="delete" size={24} color="#d32f2f" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Add Ingredient Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
              <ThemedText style={[styles.modalTitle, { color: Colors[currentColorScheme].text }]}>
                Add New Ingredient
              </ThemedText>
              
              <TextInput
                style={[styles.modalInput, { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder }]}
                placeholder="Ingredient Name"
                placeholderTextColor={Colors[currentColorScheme].secondaryText}
                value={newIngredientName}
                onChangeText={setNewIngredientName}
              />
              
              <TextInput
                style={[styles.modalInput, { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder }]}
                placeholder="Amount"
                placeholderTextColor={Colors[currentColorScheme].secondaryText}
                value={newIngredientAmount}
                onChangeText={setNewIngredientAmount}
                keyboardType="numeric"
              />
              
              <TextInput
                style={[styles.modalInput, { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder }]}
                placeholder="Unit (e.g., pieces, cups)"
                placeholderTextColor={Colors[currentColorScheme].secondaryText}
                value={newIngredientUnit}
                onChangeText={setNewIngredientUnit}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]} 
                  onPress={addIngredient}
                >
                  <ThemedText style={styles.buttonText}>Add</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Ingredient Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
              <ThemedText style={[styles.modalTitle, { color: Colors[currentColorScheme].text }]}>
                Edit Ingredient
              </ThemedText>
              
              <TextInput
                style={[styles.modalInput, { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder }]}
                placeholder="Ingredient Name"
                placeholderTextColor={Colors[currentColorScheme].secondaryText}
                value={editedName}
                onChangeText={setEditedName}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => {
                    setEditModalVisible(false);
                    setEditingIngredient(null);
                    setEditedName('');
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]} 
                  onPress={editIngredient}
                >
                  <ThemedText style={styles.buttonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Amount Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={amountModalVisible}
          onRequestClose={() => setAmountModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
              <ThemedText style={[styles.modalTitle, { color: Colors[currentColorScheme].text }]}>
                Edit Amount
              </ThemedText>
              
              <TextInput
                style={[styles.modalInput, { color: Colors[currentColorScheme].text, borderColor: Colors[currentColorScheme].activeTabBorder }]}
                placeholder="Enter new amount"
                placeholderTextColor={Colors[currentColorScheme].secondaryText}
                value={editedAmount}
                onChangeText={setEditedAmount}
                keyboardType="numeric"
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => {
                    setAmountModalVisible(false);
                    setEditingIngredient(null);
                    setEditedAmount('');
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]} 
                  onPress={editAmount}
                >
                  <ThemedText style={styles.buttonText}>Save</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors[currentColorScheme].tint} />
          <ThemedText style={styles.loadingText}>Generating Recipes...</ThemedText>
        </View>
      )}
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
    paddingBottom: 90,
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
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
  },
  // Dropdown styling
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownStyle: {
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownListStyle: {
    borderWidth: 1,
    borderRadius: 8,
  },
  dropdownText: {
    fontSize: 16,
  },
  // Ingredient Card
  ingredientContainer: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    // shadow, elevation, etc., can be added as needed
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    flexWrap: 'wrap',
  },
  expiringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 140,
    justifyContent: 'flex-end',
  },
  expiringText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  expiringTextHidden: {
    opacity: 0,
  },
  checkboxContainer: {
    padding: 4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 16,
    paddingHorizontal: 16,
    minWidth: 80,
    textAlign: 'center',
  },
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
    marginLeft: 'auto',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: '#4CAF50',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },

  headerButtons: {
    marginBottom: 12,
  },
  generateButton: {
    backgroundColor: '#FF5722',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 5,
    height: '100%',
    width: '100%',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
  },
});
