from google import genai
from google.genai import types
import PIL.Image
import sqlite3

model="gemini-2.0-flash"
image = PIL.Image.open('/Users/jcson/Downloads/fridgeImage.jpg')

client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")
food_response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["Identify all the foods and the number of each food in the fridge.", image]
    )

foods_txt = food_response.text
print(foods_txt)

def is_overlap_over_80(fridge_ingredients, recipe_ingredients):
    fridge_set = {item.strip().lower() for item in fridge_ingredients}
    recipe_set = {item.strip().lower() for item in recipe_ingredients}

    common = fridge_set.intersection(recipe_set)

    if not recipe_set:
        return False, 0.0, common
    
    overlap_percentage = len(common) / len(recipe_set)
    return overlap_percentage >= 0.8, overlap_percentage, common

def parse_foods(foods_txt):
    return [item.strip().lower() for item in foods_txt.split(',')]

fridge_ingredients = parse_foods(foods_txt)

conn = sqlite3.connect('recipes.db')
cursor = conn.cursor()

def get_potential_recipes(fridge_ingredients):
    recipes = []
    cursor.execute("Select id, name, ingredients, directions, other info")
    all_recipes = cursor.fetchall()

    for recipe in all_recipes:
        recipe_id, recipe_name, recipe_ingredients, recipe_directions, recipe_metadata = recipe
        recipe_ingredients_list = parse_foods(recipe_ingredients)
        if is_overlap_over_80(fridge_ingredients, recipe_ingredients_list):
            recipes.append({
                "id": recipe_id,
                "name": recipe_name,
                "ingredients": recipe_ingredients_list,
                "directions": recipe_directions,
                "metadata": recipe_metadata
            })

    return recipes

# suggested_recipes = get_potential_recipes(fridge_ingredients)

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
print("Recipe suggestions:", recipe_response.text)