from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import PIL.Image
import io
import base64
from google import genai
from gemini_api import app as recipe_app

app = Flask(__name__)
CORS(app)

model = "gemini-2.0-flash"
client = genai.Client(api_key="AIzaSyC5Q2H6J1XhSKgvIDJa31H4vuAN9CE6HRo")

def parse_foods(foods_txt):
    return [item.strip().lower() for item in foods_txt.split(',')]

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
            model=model,
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

# Register the recipe generation blueprint
app.register_blueprint(recipe_app)

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
            return jsonify({
                "error": f"Failed to analyze image: {str(e)}"
            }), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)