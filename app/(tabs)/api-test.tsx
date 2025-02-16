import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Alert, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

interface Ingredient {
  name: string;
  amount: number;
  unit?: string;
}

const API_URL = 'http://10.37.163.63:5000'; // Use your actual local IP here

const ApiTest = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [fridgeContents, setFridgeContents] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  const parseIngredients = (contents: string) => {
    const ingredientsList: Ingredient[] = [];
    const lines = contents.split('\n');
    
    lines.forEach(line => {
      const match = line.match(/\*\*([^:]+):\*\*\s*([^,\n]+)/);
      if (match) {
        const name = match[1].trim();
        const quantityStr = match[2].trim();
        
        const numericMatch = quantityStr.match(/(\d+)(?:-(\d+))?\s*([a-zA-Z]*)/);
        if (numericMatch) {
          const amount = parseInt(numericMatch[2] || numericMatch[1]);
          const unit = numericMatch[3] || 'pieces';
          
          ingredientsList.push({
            name,
            amount,
            unit
          });
        }
      }
    });
    
    return ingredientsList;
  };

  const handleImageUpload = async () => {
    if (!image) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'fridge.jpg',
      } as any);

      console.log('Sending request to:', `${API_URL}/api/analyze-fridge`);
      
      const response = await fetch(`${API_URL}/api/analyze-fridge`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Setting fridge contents:', data.fridge_contents);
        setFridgeContents(data.fridge_contents || '');
        const parsedIngredients = parseIngredients(data.fridge_contents);
        setIngredients(parsedIngredients);
        console.log('Setting matched recipes:', data.matched_recipes);
        setMatchedRecipes(Array.isArray(data.matched_recipes) ? data.matched_recipes : []);
        console.log('Setting AI suggestions:', data.ai_suggestions);
        setAiSuggestions(data.ai_suggestions || '');
      } else {
        Alert.alert('Error', data.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Detailed error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePicture = () => {
    // router.push('/camera');
  };

  useEffect(() => {
    // Request permissions
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Snap Chef</Text>
          
          <TouchableOpacity 
            style={styles.ingredientsButton}
            onPress={() => router.push('/ingredients')}
          >
            <MaterialIcons name="kitchen" size={24} color="white" />
            <Text style={styles.buttonText}>Ingredients</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={pickImage}
          >
            <MaterialIcons name="photo-library" size={24} color="white" />
            <Text style={styles.uploadButtonText}>Choose Photo</Text>
          </TouchableOpacity>

          {image && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: image }} 
                style={styles.image} 
              />
              <TouchableOpacity 
                style={styles.analyzeButton}
                onPress={handleImageUpload}
                disabled={isLoading}
              >
                <MaterialIcons name="search" size={24} color="white" />
                <Text style={styles.buttonText}>Analyze Fridge</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Analyzing your fridge...</Text>
            </View>
          )}

          {fridgeContents && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fridge Contents</Text>
              <Text style={styles.cardText}>{fridgeContents}</Text>
            </View>
          )}

          {aiSuggestions && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>AI Recipe Suggestions</Text>
              <Text style={styles.cardText}>{aiSuggestions}</Text>
            </View>
          )}

          {ingredients.length > 0 && (
            <TouchableOpacity 
              style={styles.ingredientsButton}
              onPress={() => router.push({
                pathname: '/ingredients',
                params: { ingredients: JSON.stringify(ingredients) }
              })}
            >
              <MaterialIcons name="kitchen" size={24} color="white" />
              <Text style={styles.buttonText}>View Ingredients</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginVertical: 20,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  analyzeButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
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
  ingredientsButton: {
    backgroundColor: '#1976D2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default ApiTest;