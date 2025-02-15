import google.generativeai as genai
import google.generativeai as genai
from google import genai
from google.genai import types
import pathlib
import PIL.Image
import os

#genai.configure(api_key=os.environ["API_KEY"])
#client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")

#model = genai.GenerativeModel("gemini-1.5-flash")
model="gemini-2.0-flash"

#sample_file = genai.upload_file(path="/Users/jcson/Downloads/fridgeImage.jpg", display_name="fridge sample")
image = PIL.Image.open('/Users/jcson/Downloads/fridgeImage.jpg')

client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=["What is this image?", image])

#print(f"Uploaded file '{sample_file.display_name}' as: {sample_file.uri}")
#file = genai.get_file(name=sample_file.name)
#print(f"Retrieved file '{file.display_name}' as: {sample_file.uri}")

#client = genai.Client(api_key="AIzaSyBC8hhozZxMx9PXLLUGfLZfhrwpkH222JY")
#response = client.models.generate_content(
 #   model="gemini-2.0-flash", contents="Explain how AI works"
#)
#print(response.text)

#response = model.generate_content([sample_file, "Look at the fridge in the image with the food inside and give me list of the food that you identify."])

print(response.text)