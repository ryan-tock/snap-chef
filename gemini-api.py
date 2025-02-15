from google import genai
from google.genai import types
import PIL.Image

model="gemini-2.0-flash"
image = PIL.Image.open('/Users/jcson/Downloads/fridgeImage.jpg')

client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")
food_response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["Identify all the foods and the number of each food in the fridge.", image]
    )

foods_txt = food_response.text
print(foods_txt)

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