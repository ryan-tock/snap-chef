from google import genai
import json
from flask import Blueprint, request, jsonify

app = Blueprint('recipes', __name__)
model = "gemini-pro"  # Changed to gemini-pro since we're only doing text
client = genai.Client(api_key="AIzaSyBG764Zn4BcmFCw2ZqkF8VEUwLYmUEZYvE")

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
            '    "name": "Recipe Name",\n'
            '    "category": "Breakfast/Lunch/Dinner",\n'
            '    "description": "Brief description",\n'
            '    "ingredients": ["ingredient 1", "ingredient 2"],\n'
            '    "instructions": ["step 1", "step 2"],\n'
            '    "prepTime": 30,\n'
            '    "cookTime": 20,\n'
            '    "nutritionalValues": "Calories, protein, etc"\n'
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
            "name": "Error Recipe",
            "category": "Error",
            "description": str(e),
            "ingredients": [],
            "instructions": ["Could not generate recipe"],
            "prepTime": 0,
            "cookTime": 0,
            "nutritionalValues": "N/A"
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
            parsed_recipes = json.loads(recipes_response)
            recipes_json = json.dumps(parsed_recipes)
        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
            recipes_json = json.dumps([{
                "name": "Sample Recipe",
                "category": "Dinner",
                "description": recipes_response[:100] + "...",
                "ingredients": [f"{ing['name']} ({ing['amount']})" for ing in ingredients],
                "instructions": ["Could not generate instructions"],
                "prepTime": 0,
                "cookTime": 0,
                "nutritionalValues": "N/A"
            }])

        return jsonify({
            'success': True,
            'recipes': recipes_json
        })
        
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)