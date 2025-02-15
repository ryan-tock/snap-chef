from google import genai
from google.genai import types
import PIL.Image
import json

model="gemini-2.0-flash"
path = "images\\fridgeImage.jpg"
# path = "images\\getty.jpg"
image = PIL.Image.open(path)

client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")
food_response = client.models.generate_content(
    model=model,
    contents=["Identify all the foods and the number of each food in the fridge.", image]
    )

foods_txt = food_response.text
print("Fridge contents:", foods_txt)

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

def get_potential_recipes(fridge_ingredients, json_file="complete-recipes-list.json"):
    recipes = []
    with open(json_file, "r") as f:
        all_recipes = json.load(f)  # Works even if the JSON is on one line
    for recipe in all_recipes:
        # Note: In your JSON, the ingredients are stored under "ingridients"
        recipe_ingredients_list = [item.strip().lower() for item in recipe.get("ingridients", [])]
        is_match, overlap_percentage, common = is_overlap_over_80(fridge_ingredients, recipe_ingredients_list)
        if is_match:
            recipes.append(recipe)
    return recipes

suggested_recipes = get_potential_recipes(fridge_ingredients, "complete-recipes-list.json")
print("Suggested recipes based on fridge ingredients:")
for rec in suggested_recipes:
    title = rec.get("basic_info", {}).get("title", "Untitled")
    print("-", title)

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