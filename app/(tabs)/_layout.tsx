import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/pIconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeToggle } from '@/components/ThemeToggleContext';

import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  const { isDark } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';
  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://10.37.163.63:5000/api/recipes');
        const data = await response.json();
        
        if (data.success) {
          router.push({
            pathname: '/recipes',
            params: { recipes: JSON.stringify(data) }
          });
        }
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[currentColorScheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Upload',
          tabBarIcon: ({ color }) => <Entypo name="camera" size={24} color={color}/>,
        }}
      />
      <Tabs.Screen
        name="ingredients"
        options={{
          title: 'Ingredients',
          tabBarIcon: ({ color }) => <Entypo name="shopping-basket" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <Entypo name="book" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved Recipes',
          tabBarIcon: ({ color }) => <Entypo name="save" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
