import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, ScrollView, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

const API_URL = 'http://localhost:5000'; // or your Flask server URL

const ApiTest = () => {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [fridgeContents, setFridgeContents] = useState('');
  const [matchedRecipes, setMatchedRecipes] = useState<Recipe[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      const response = await fetch(`${API_URL}/api/analyze-fridge`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setFridgeContents(data.fridge_contents);
        setMatchedRecipes(data.matched_recipes);
        setAiSuggestions(data.ai_suggestions);
      } else {
        Alert.alert('Error', data.error || 'Failed to analyze image');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
      console.error(error);
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
    router.push('/camera');
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

  useEffect(() => {
    // Handle image from camera
    if (router.current?.params?.imageUri) {
      setImage(router.current.params.imageUri as string);
    }
  }, [router.current?.params]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Button 
          title="Pick from Gallery" 
          onPress={pickImage} 
        />

        {image && (
          <>
            <Image 
              source={{ uri: image }} 
              style={styles.image} 
            />
            <Button 
              title="Analyze Fridge" 
              onPress={handleImageUpload}
              disabled={isLoading} 
            />
          </>
        )}

        {isLoading && <ActivityIndicator size="large" />}

        {fridgeContents && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fridge Contents:</Text>
            <Text>{fridgeContents}</Text>
          </View>
        )}

        {matchedRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matched Recipes:</Text>
            {matchedRecipes.map((recipe, index) => (
              <View key={index} style={styles.recipe}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.subTitle}>Ingredients:</Text>
                {recipe.ingredients.map((ingredient, i) => (
                  <Text key={i}>• {ingredient}</Text>
                ))}
                <Text style={styles.subTitle}>Instructions:</Text>
                {recipe.instructions.map((step, i) => (
                  <Text key={i}>{i + 1}. {step}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {aiSuggestions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Recipe Suggestions:</Text>
            <Text>{aiSuggestions}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    resizeMode: 'contain',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recipe: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
});

export default ApiTest;