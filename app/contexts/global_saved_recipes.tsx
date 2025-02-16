// SavedRecipesContext.tsx
import React, { createContext, useContext, useState } from 'react';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  dietary?: string[];
  requiredItems?: string[];
  expiringSoon?: boolean;
  matchingPercentage?: number;
}

interface SavedRecipesContextType {
  savedRecipes: Recipe[];
  toggleBookmark: (recipe: Recipe) => void;
}

const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

export const SavedRecipesProvider: React.FC = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const toggleBookmark = (recipe: Recipe) => {
    setSavedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  return (
    <SavedRecipesContext.Provider value={{ savedRecipes, toggleBookmark }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export const useSavedRecipes = () => {
  const context = useContext(SavedRecipesContext);
  if (!context) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  }
  return context;
};
