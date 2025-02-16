from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import PIL.Image
import io
import base64
from google import genai
import json
import time

app = Flask(__name__)
CORS(app)

model = "gemini-pro"  # For text generation
vision_model = "gemini-2.0-flash"  # For image analysis
client = genai.Client(api_key="AIzaSyBG764Zn4BcmFCw2ZqkF8VEUwLYmUEZYvE")

def parse_foods(foods_txt):
    return [item.strip().lower() for item in foods_txt.split(',')]

def generate_recipes(ingredients):
    try:
        # Check if there are any expiring ingredients
        expiring_ingredients = [ing for ing in ingredients if ing.get('isExpiring')]
        
        ingredients_prompt = "Generate recipes using these ingredients. Count the quantities in individual pieces, not in bunches or in groups, or other non-individual units.:\n"
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

        print("Sending prompt to Gemini:", ingredients_prompt)

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

@app.route('/analyze_image', methods=['POST'])
def analyze_image():
    try:
        # Get base64 image from request
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({'error': 'No image data received'}), 400

        # Convert base64 to PIL Image
        image_bytes = base64.b64decode(image_data.split(',')[1])
        image = PIL.Image.open(io.BytesIO(image_bytes))

        # Send to Gemini for analysis
        food_response = client.models.generate_content(
            model=vision_model,
            contents=["Identify all the foods and the number of each food in the fridge.", image]
        )

        foods_txt = food_response.text
        print("Fridge contents:", foods_txt)

        # Parse the response into a structured format
        ingredients = []
        for food in parse_foods(foods_txt):
            ingredients.append({
                'id': f'ingredient-{len(ingredients)}',
                'name': food,
                'amount': 1,
                'unit': 'piece'
            })

        return jsonify({
            'success': True,
            'ingredients': ingredients
        })

    except Exception as e:
        print(f"Error analyzing image: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

# Add a route for the home page
@app.route('/')
def home():
    return """
    <html>
        <head>
            <title>Snap Chef</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .container { margin-top: 20px; }
                .recipe { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; }
                .recipe-title { font-size: 1.2em; font-weight: bold; }
                img { max-width: 100%; height: auto; margin: 20px 0; }
                .section { margin: 20px 0; }
                .section-title { font-weight: bold; margin-bottom: 10px; }
            </style>
        </head>
        <body>
            <h1>Snap Chef</h1>
            <form action="/api/analyze-fridge" method="POST" enctype="multipart/form-data">
                <input type="file" name="image" accept="image/*" required>
                <button type="submit">Analyze Fridge</button>
            </form>
            <div class="container" id="results">
            </div>
        </body>
    </html>
    """

@app.route('/api/analyze-fridge', methods=['POST'])
def analyze_fridge():
    try:
        # Check for image in multipart form data
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Ensure the file is an image
        if not file.content_type.startswith('image/'):
            return jsonify({"error": "File must be an image"}), 400
        
        image = PIL.Image.open(file)
        
        # Get food items from image using Gemini
        try:
            food_response = client.models.generate_content(
                model=vision_model,
                contents=[
                    "You are a helpful assistant. Please identify and list all visible food items and their approximate quantities in this refrigerator image. Only describe what you can clearly see.",
                    image
                ]
            )
            
            foods_txt = food_response.text
            
            # Check if Gemini refused to analyze
            if "programmed to avoid" in foods_txt:
                return jsonify({
                    "error": "Unable to analyze image. Please ensure the image shows food items clearly."
                }), 400

            # Continue with normal processing
            fridge_ingredients = parse_foods(foods_txt)
            
            # Get AI recipe suggestions
            recipe_prompt = (
                f"Based on the following list of foods and their quantities: {foods_txt}, "
                "please suggest recipes that use these ingredients. For each recipe, provide "
                "a list of ingredients with the required amounts, step-by-step cooking instructions, "
                "and indicate if any additional common ingredients are needed."
            )

            recipe_response = client.models.generate_content(
                model=model,
                contents=[recipe_prompt]
            )
            
            # If the request wants HTML (from browser form submission)
            if request.headers.get('Accept', '').find('text/html') != -1:
                results_html = f"""
                    <div class="section">
                        <div class="section-title">Fridge Contents:</div>
                        <p>{foods_txt}</p>
                    </div>
                    
                    <div class="section">
                        <div class="section-title">AI Recipe Suggestions:</div>
                        <p style="white-space: pre-line">{recipe_response.text}</p>
                    </div>
                """
                return results_html
            
            # If the request wants JSON (from API calls)
            return jsonify({
                "fridge_contents": foods_txt,
                "ai_suggestions": recipe_response.text
            })
            
        except Exception as e:
            error_msg = f"Failed to analyze image: {str(e)}"
            if request.headers.get('Accept', '').find('text/html') != -1:
                return f"""
                    <div class="section">
                        <div class="section-title">Error:</div>
                        <p>{error_msg}</p>
                    </div>
                """
            return jsonify({"error": error_msg}), 500

    except Exception as e:
        error_msg = str(e)
        if request.headers.get('Accept', '').find('text/html') != -1:
            return f"""
                <div class="section">
                    <div class="section-title">Error:</div>
                    <p>{error_msg}</p>
                </div>
            """
        return jsonify({"error": error_msg}), 500

@app.route('/api/recipes', methods=['GET'])
def get_recipes():
    try:
        # Get ingredients from the previous analyze_fridge call
        ingredients_response = request.args.get('ingredients', '[]')
        ingredients = json.loads(ingredients_response)
        
        # Generate recipes using the ingredients
        recipes_response = generate_recipes(ingredients)
        parsed_recipes = json.loads(recipes_response)
        
        return jsonify({
            "success": True,
            "recipes": parsed_recipes
        })
    except json.JSONDecodeError as e:
        print(f"JSON parse error: {e}")
        return jsonify({
            "success": False,
            "error": "Failed to parse recipes"
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)