import React from 'react';

interface SavedRecipesButtonProps {
  onClick: () => void;
}

const SavedRecipesButton: React.FC<SavedRecipesButtonProps> = ({ onClick }) => {
  return (
    <button
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
      onClick={onClick}
    >
      Saved Recipes
    </button>
  );
};

export default SavedRecipesButton;
