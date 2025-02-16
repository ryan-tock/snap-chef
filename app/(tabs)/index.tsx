import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions, Camera } from 'expo-camera';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';
const screenHeight = Dimensions.get('window').height;
const cameraHeight = screenHeight * 0.7;

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit?: string;
}

const API_URL = 'http://10.37.163.63:5000'; // Adjust to your server IP

export default function ApiTest() {
  const router = useRouter();
  const { isDark } = useThemeToggle();
  // Make sure TypeScript knows these two strings:
  const currentColorScheme: 'light' | 'dark' = isDark ? 'dark' : 'light';

  // State
  const [image, setImage] = useState<string | null>(null);
  const [fridgeContents, setFridgeContents] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Camera
  const [facing, setFacing] = useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const [cameraShown, setCameraShown] = useState(false);

  // 1) Camera Permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera permissions to make this work!');
      }
    })();
  }, []);

  // 2) Media Library Permission
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  // 3) Parse Ingredients
  const parseIngredients = (contents: string) => {
    const ingredientsList: Ingredient[] = [];
    const lines = contents.split('\n');

    lines.forEach((line, index) => {
      if (line.includes(':')) {
        const [name, quantity] = line.split(':').map((s) => s.trim());
        const cleanName = name.replace(/\*/g, '').trim();

        if (cleanName && quantity) {
          const numbers = quantity.match(/\d+/g);
          let amount = 0;
          let unit = '';

          // Extract number
          if (numbers) {
            if (numbers.length === 2) {
              amount = Math.round((parseInt(numbers[0]) + parseInt(numbers[1])) / 2);
            } else {
              amount = parseInt(numbers[0]);
            }
          } else {
            amount = 1;
          }

          // Determine unit
          const lowerQuantity = quantity.toLowerCase();
          if (lowerQuantity.includes('bag') || lowerQuantity.includes('container')) {
            unit = amount > 1 ? 'piece' : 'bag';
          } else if (lowerQuantity.includes('cup')) {
            unit = 'cup';
          } else if (lowerQuantity.includes('slice')) {
            unit = 'slice';
          } else if (lowerQuantity.includes('pack')) {
            unit = amount > 1 ? 'piece' : 'pack';
          } else if (lowerQuantity.includes('bottle')) {
            unit = amount > 1 ? 'piece' : 'bottle';
          } else if (lowerQuantity.includes('can')) {
            unit = amount > 1 ? 'piece' : 'can';
          } else {
            unit = 'piece';
          }

          ingredientsList.push({
            id: `ingredient-${index}-${Date.now()}`,
            name: cleanName,
            amount,
            unit,
          });
        }
      }
    });

    return ingredientsList;
  };

  // 4) Camera Logic
  const takePicture = async () => {
    if (cameraRef.current) {
      const photoData = await cameraRef.current.takePictureAsync();
      if (!photoData) return;
      setImage(photoData.uri);
    } else {
      console.log('No camera ref');
    }
  };

  // 5) Image Upload
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
        setFridgeContents(data.fridge_contents || '');
        const parsedIngredients = parseIngredients(data.fridge_contents || '');
        setIngredients(parsedIngredients);

        setMatchedRecipes(Array.isArray(data.matched_recipes) ? data.matched_recipes : []);
        setAiSuggestions(data.ai_suggestions || '');

        // Navigate to ingredients screen with the new data
        router.push({
          pathname: '/ingredients',
          params: { ingredients: JSON.stringify(parsedIngredients) },
        });
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

  // 6) Pick Image
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

  // 7) Render
  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[currentColorScheme].background }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, { color: Colors[currentColorScheme].text }]}>
          Snap Chef
        </Text>

        {/* Buttons or Camera */}
        {!cameraShown ? (
          <>
            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: Colors[currentColorScheme].primaryButton },
              ]}
              onPress={pickImage}
            >
              <MaterialIcons name="photo-library" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>Choose Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.uploadButton,
                { backgroundColor: Colors[currentColorScheme].primaryButton },
              ]}
              onPress={() => {
                setImage(null);
                setCameraShown(true);
              }}
            >
              <MaterialIcons name="photo-camera" size={24} color="#fff" />
              <Text style={styles.uploadButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {image ? (
              <Image source={{ uri: image }} style={styles.camera} />
            ) : (
              <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
            )}
            {image ? (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => setImage(null)}
                >
                  <Text>🗑 Clear Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => setCameraShown(false)}
                >
                  <Text>✅ Select Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={() => setCameraShown(false)}
                >
                  <Text>❌ Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <Text>📸 Take Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Analyze Button (only if we have an image and no camera) */}
        {image && !cameraShown && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                { backgroundColor: Colors[currentColorScheme].accentButton },
              ]}
              onPress={handleImageUpload}
              disabled={isLoading}
            >
              <MaterialIcons name="search" size={24} color="#fff" />
              <Text style={styles.buttonText}>Analyze Fridge</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[currentColorScheme].primaryButton} />
            <Text style={[styles.loadingText, { color: Colors[currentColorScheme].secondaryText }]}>
              Analyzing your fridge...
            </Text>
          </View>
        )}

        {/* Fridge Contents */}
        {fridgeContents !== '' && (
          <View style={[styles.card, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
            <Text style={[styles.cardTitle, { color: Colors[currentColorScheme].text }]}>
              Fridge Contents
            </Text>
            <Text style={[styles.cardText, { color: Colors[currentColorScheme].secondaryText }]}>
              {fridgeContents}
            </Text>
          </View>
        )}

        {/* Matched Recipes */}
        {matchedRecipes.length > 0 && (
          <View style={[styles.card, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
            <Text style={[styles.cardTitle, { color: Colors[currentColorScheme].text }]}>
              Matched Recipes
            </Text>
            {matchedRecipes.map((recipe, index) => (
              <View
                key={index}
                style={[
                  styles.recipeCard,
                  { backgroundColor: Colors[currentColorScheme].background },
                ]}
              >
                <Text style={[styles.recipeTitle, { color: Colors[currentColorScheme].text }]}>
                  {recipe.title}
                </Text>
                <Text style={[styles.sectionTitle, { color: Colors[currentColorScheme].text }]}>
                  Ingredients
                </Text>
                {recipe.ingredients.map((ingredient, i) => (
                  <Text key={i} style={[styles.listItem, { color: Colors[currentColorScheme].secondaryText }]}>
                    • {ingredient}
                  </Text>
                ))}
                <Text style={[styles.sectionTitle, { color: Colors[currentColorScheme].text }]}>
                  Instructions
                </Text>
                {recipe.instructions.map((step, i) => (
                  <Text key={i} style={[styles.listItem, { color: Colors[currentColorScheme].secondaryText }]}>
                    {i + 1}. {step}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* AI Suggestions */}
        {aiSuggestions !== '' && (
          <View style={[styles.card, { backgroundColor: Colors[currentColorScheme].cardBackground }]}>
            <Text style={[styles.cardTitle, { color: Colors[currentColorScheme].text }]}>
              AI Recipe Suggestions
            </Text>
            <Text style={[styles.cardText, { color: Colors[currentColorScheme].secondaryText }]}>
              {aiSuggestions}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor is set dynamically
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#fff',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
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
    fontSize: 16,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    // shadow/elevation for iOS/Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
  recipeCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 15,
    marginBottom: 4,
    paddingLeft: 8,
  },
  camera: {
    flex: 1,
    width: '100%',
    height: cameraHeight,
  },
  captureButton: {
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
    alignSelf: 'center',
    borderRadius: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
