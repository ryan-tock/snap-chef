import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Recipe {
  id: string;
  name: string;
  category: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  dietary?: string[];
  requiredItems?: string[];
  expiringSoon?: boolean;
  matchingPercentage?: number;
}

interface SavedRecipesContextType {
  savedRecipes: Recipe[];
  addRecipe: (recipe: Recipe) => void;
  removeRecipe: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export const SavedRecipesContext = createContext<SavedRecipesContextType | undefined>(undefined);

export function useSavedRecipes() {
  const context = useContext(SavedRecipesContext);
  if (context === undefined) {
    throw new Error('useSavedRecipes must be used within a SavedRecipesProvider');
  }
  return context;
}

const SavedRecipesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);

  const addRecipe = (recipe: Recipe) => {
    setSavedRecipes(prev => [...prev, recipe]);
  };

  const removeRecipe = (id: string) => {
    setSavedRecipes(prev => prev.filter(recipe => recipe.id !== id));
  };

  const isSaved = (id: string) => {
    return savedRecipes.some(recipe => recipe.id === id);
  };

  return (
    <SavedRecipesContext.Provider value={{ savedRecipes, addRecipe, removeRecipe, isSaved }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export default SavedRecipesProvider; 