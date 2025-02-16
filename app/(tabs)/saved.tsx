// saved.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  View,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';

interface Ingredient {
  name: string;
  have: boolean;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  prepTime: number;
  cookTime: number;
  nutritionalValues: string;
}

export default function SavedRecipes() {
  const { isDark } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';

  // Example list of saved recipes
  const savedRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Pasta',
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

  // Component to display each recipe as an expandable tab
  const RecipeTab = ({ recipe }: { recipe: Recipe }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <View style={styles.recipeContainer}>
        <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
          <ThemedView style={[styles.recipeTab, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
            <ThemedText style={[styles.recipeName, { color: Colors[currentColorScheme].text }]}>{recipe.name}</ThemedText>
            <ThemedText style={[styles.recipeDescription, { color: Colors[currentColorScheme].secondaryText }]}>
              {recipe.description}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
        {isExpanded && (
          <ThemedView style={[styles.recipeDetails, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
            <ThemedText style={[styles.detailTitle, { color: Colors[currentColorScheme].text }]}>Ingredients:</ThemedText>
            {recipe.ingredients.map((ing, index) => (
              <ThemedText
                key={index.toString()}
                style={[styles.ingredientText, { color: Colors[currentColorScheme].secondaryText }]}
              >
                {ing.name}: {ing.have ? 'Available' : 'Missing'}
              </ThemedText>
            ))}
            <ThemedText style={[styles.detailTitle, { color: Colors[currentColorScheme].text }]}>Time:</ThemedText>
            <ThemedText style={[styles.recipeTime, { color: Colors[currentColorScheme].secondaryText }]}>
              Prep: {recipe.prepTime}m, Cook: {recipe.cookTime}m
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
      <FlatList
        data={savedRecipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RecipeTab recipe={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
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
  recipeDetails: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#444',
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
  recipeTime: {
    fontSize: 14,
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 14,
    marginTop: 4,
  },
});
