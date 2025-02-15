from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import PIL.Image
from gemini_api import (
    client,
    model,
    get_potential_recipes,
    parse_foods
)

app = Flask(__name__)
CORS(app)

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
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        image = PIL.Image.open(request.files['image'])
        
        # Get food items from image using Gemini
        try:
            food_response = client.models.generate_content(
                model=model,
                contents=[
                    "You are a helpful assistant. Please identify and list all visible food items and their approximate quantities in this refrigerator image. Only describe what you can clearly see.",
                    image
                ]
            )
            
            foods_txt = food_response.text
            
            # Check if Gemini refused to analyze
            if "programmed to avoid" in foods_txt:
                return jsonify({
                    "fridge_contents": "Unable to analyze image. Please ensure the image shows food items clearly.",
                    "matched_recipes": [],
                    "ai_suggestions": "Please try again with a clear image of food items in your refrigerator."
                })

            # Continue with normal processing
            fridge_ingredients = parse_foods(foods_txt)
            suggested_recipes = get_potential_recipes(fridge_ingredients)
            
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
                        <div class="section-title">Matched Recipes:</div>
                        {''.join([f'''
                            <div class="recipe">
                                <div class="recipe-title">{recipe.get("basic_info", {}).get("title", "Untitled")}</div>
                                <div>
                                    <strong>Ingredients:</strong>
                                    <ul>
                                        {''.join([f"<li>{ingredient}</li>" for ingredient in recipe.get("ingridients", [])])}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Instructions:</strong>
                                    <ol>
                                        {''.join([f"<li>{instruction}</li>" for instruction in recipe.get("instructions", [])])}
                                    </ol>
                                </div>
                            </div>
                        ''' for recipe in suggested_recipes])}
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
                "matched_recipes": [
                    {
                        "title": recipe.get("basic_info", {}).get("title", "Untitled"),
                        "ingredients": recipe.get("ingridients", []),
                        "instructions": recipe.get("instructions", [])
                    } for recipe in suggested_recipes
                ],
                "ai_suggestions": recipe_response.text
            })
            
        except Exception as e:
            return jsonify({
                "error": f"Failed to analyze image: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)