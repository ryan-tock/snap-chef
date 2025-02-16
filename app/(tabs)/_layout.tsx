import { global_saved_recipes } from '@/contexts/SavedRecipesContext';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useThemeToggle } from '@/components/ThemeToggleContext';
import Entypo from '@expo/vector-icons/Entypo';

export default function TabLayout() {
  const { isDark } = useThemeToggle();
  const currentColorScheme = isDark ? 'dark' : 'light';

  return (
    <SavedRecipesProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[currentColorScheme].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: { position: 'absolute' },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Upload',
            tabBarIcon: ({ color }) => <Entypo name="camera" size={24} color={color} />,
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
      </Tabs>
    </SavedRecipesProvider>
  );
}
