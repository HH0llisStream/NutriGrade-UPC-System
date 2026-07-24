# A food grading system based off of Europes Nutri Grade system, but for the United States.
# framework: Uses US Database of foods API, searches for UPC with barcode API, gets Nutrition Information
# for the said UPC, and uses the nutriscale calculator

import requests
import json
import pprint
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
a = 2
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get('/upc')
def process_upc(upc: str):
    openff = f"https://world.openfoodfacts.net/api/v2/product/{upc}?fields=nutriscore_data"
    nutri_score = requests.get(openff).json()
    print(nutri_score)
    return nutri_score

@app.get("/")
def read_root():
    return {nutri_score}