from google import genai
from google.genai import types
import PIL.Image
import json

model = "gemini-2.0-flash"
client = genai.Client(api_key="AIzaSyCyVeSxYdPBcrKF0bgHqDXAbAhzGnZBnVQ")

def parse_foods(foods_txt):
    return [item.strip().lower() for item in foods_txt.split(',')]

if __name__ == '__main__':
    path = "images\\fridgeImage.jpg"
    # path = "images\\getty.jpg"
    image = PIL.Image.open(path)

    food_response = client.models.generate_content(
        model=model,
        contents=["Identify all the foods and the number of each food in the fridge.", image]
    )

    foods_txt = food_response.text
    print("Fridge contents:", foods_txt)

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