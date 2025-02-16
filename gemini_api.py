from google import genai
import json
from flask import Blueprint, request, jsonify
import time

app = Blueprint('recipes', __name__)
model = "gemini-pro"  # Changed to gemini-pro since we're only doing text
client = genai.Client(api_key="AIzaSyC5Q2H6J1XhSKgvIDJa31H4vuAN9CE6HRo")

def generate_recipes(ingredients):
    try:
        # Check if there are any expiring ingredients
        expiring_ingredients = [ing for ing in ingredients if ing.get('isExpiring')]
        
        ingredients_prompt = "Generate recipes using these ingredients:\n"
        for ing in ingredients:
            expiring = "(Expiring)" if ing.get('isExpiring') else ""
            ingredients_prompt += f"- {ing['name']} (Quantity: {ing['amount']}) {expiring}\n"
        
        if not expiring_ingredients:
            ingredients_prompt += "\nCreate 3 recipes using any of the available ingredients. "
        else:
            ingredients_prompt += "\nCreate 3 recipes prioritizing ingredients marked as (Expiring). "
            
        ingredients_prompt += (
            "Return ONLY a JSON array of recipes with this exact structure:\n"
            "[\n"
            "  {\n"
            '    "id": "recipe-1",\n'
            '    "name": "Recipe Name",\n'
            '    "category": "Breakfast/Lunch/Dinner",\n'
            '    "description": "Brief description",\n'
            '    "ingredients": [\n'
            '      {"name": "Ingredient", "amount": "100", "unit": "g"}\n'
            '    ],\n'
            '    "instructions": ["step 1", "step 2"],\n'
            '    "prepTime": 30,\n'
            '    "cookTime": 20,\n'
            '    "servings": 4,\n'
            '    "dietary": ["Vegetarian", "Gluten-Free"],\n'
            '    "requiredItems": ["item1", "item2"],\n'
            '    "expiringSoon": false,\n'
            '    "matchingPercentage": 75\n'
            "  }\n"
            "]\n"
        )

        print("Sending prompt to Gemini:", ingredients_prompt)  # Debug log

        response = client.models.generate_content(
            model=model,
            contents=ingredients_prompt
        )
        
        return response.text

    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        return json.dumps([{
            "id": f"error-{int(time.time())}",
            "name": "Error Recipe",
            "category": "Error",
            "description": str(e),
            "ingredients": [{"name": ing["name"], "amount": str(ing["amount"]), "unit": "piece"} for ing in ingredients],
            "instructions": ["Could not generate recipe"],
            "prepTime": 0,
            "cookTime": 0,
            "servings": 0,
            "dietary": [],
            "requiredItems": [],
            "expiringSoon": False,
            "matchingPercentage": 0
        }])

@app.route('/generate_recipes', methods=['POST'])
def recipe_endpoint():
    try:
        data = request.json
        ingredients = data.get('ingredients', [])
        
        print(f"Received ingredients: {ingredients}")
        
        recipes_response = generate_recipes(ingredients)
        print(f"Raw Gemini response: {recipes_response}")

        try:
            # Parse the response to ensure it's valid JSON
            parsed_recipes = json.loads(recipes_response)
            
            # Ensure the response matches the expected format
            formatted_recipes = []
            for recipe in parsed_recipes:
                formatted_recipe = {
                    "id": recipe.get("id", f"recipe-{int(time.time())}"),
                    "name": recipe.get("name", "Untitled Recipe"),
                    "category": recipe.get("category", "Other"),
                    "description": recipe.get("description", "No description available"),
                    "ingredients": recipe.get("ingredients", []),
                    "instructions": recipe.get("instructions", []),
                    "prepTime": recipe.get("prepTime", 0),
                    "cookTime": recipe.get("cookTime", 0),
                    "servings": recipe.get("servings", 4),
                    "dietary": recipe.get("dietary", []),
                    "requiredItems": recipe.get("requiredItems", []),
                    "expiringSoon": recipe.get("expiringSoon", False),
                    "matchingPercentage": recipe.get("matchingPercentage", 0)
                }
                formatted_recipes.append(formatted_recipe)

            return jsonify({
                'success': True,
                'recipes': formatted_recipes
            })

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            print(f"Invalid JSON response: {recipes_response}")
            
            fallback_recipe = {
                "id": f"error-{int(time.time())}",
                "name": "Sample Recipe",
                "category": "Dinner",
                "description": "Failed to parse recipe data",
                "ingredients": [{"name": ing["name"], "amount": str(ing["amount"]), "unit": "piece"} for ing in ingredients],
                "instructions": ["Could not generate instructions"],
                "prepTime": 0,
                "cookTime": 0,
                "servings": 0,
                "dietary": [],
                "requiredItems": [],
                "expiringSoon": False,
                "matchingPercentage": 0
            }
            
            return jsonify({
                'success': True,
                'recipes': [fallback_recipe]
            })
        
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)