import { StyleSheet, SafeAreaView, ScrollView, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
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
  
  useEffect(() => {
    if (params.ingredients) {
      setIngredients(JSON.parse(params.ingredients as string));
    }
  }, [params.ingredients]);

  const updateAmount = (index: number, increment: boolean) => {
    setIngredients(current => 
      current.map((item, idx) => 
        idx === index 
          ? { ...item, amount: increment ? item.amount + 1 : Math.max(0, item.amount - 1) }
          : item
      )
    );
  };

  const getBarWidth = (amount: number) => {
    const maxAmount = Math.max(...ingredients.map(i => i.amount));
    return (amount / maxAmount) * 100;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Ingredients</ThemedText>
        </ThemedView>

        {ingredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientContainer}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.ingredientName}>{ingredient.name}</ThemedText>
              <ThemedText style={styles.amount}>
                {ingredient.amount} {ingredient.unit || 'pieces'}
              </ThemedText>
            </View>
            
            <View style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { width: `${getBarWidth(ingredient.amount)}%` }
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
