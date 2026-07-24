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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

@app.get("/")
def read_root():
    return {"Hello Peoples"}

@app.get('/upc')
def process_upc(upc: str):
        def usda_calc(upc):
            usda_api = "8SUEWLjbckxHgVegcczqatREm8YFgII6JMV8pUmL"
            url = "https://api.nal.usda.gov/fdc/v1/foods/search"
            parameters = {
                "query": upc,
                "dataType": "Branded",
                "api_key": usda_api }
            api_response = requests.get(url, params=parameters)
            if api_response.status_code == 200: 
                json_response = api_response.json()
            else:
                return "failed to retrieve data. Please try again later."
            # info needed: calories, sugar, sat fat, salt (negatives) and fruit/vegetables, fiber, and protein (positives)
            if 'foods' not in json_response:
                return "invalid upc, please try again"
            # 18 total nutrients accounted for
            nutrient_lookup = {
            n["nutrientName"]: f"{n['value']} {n['unitName']}"
            for n in json_response["foods"][0]["foodNutrients"]}
            cal = nutrient_lookup.get("Energy")
            if cal == None:
                cal = "0"
            sug = nutrient_lookup.get('Total Sugars')
            if sug == None:
                sug = "0"
            sat_fat = nutrient_lookup.get('Fatty acids, total saturated')
            if sat_fat == None:
                sat_fat = "0"
            salt = nutrient_lookup.get('Sodium, Na')
            if salt == None:
                salt = "0"
            fiber = nutrient_lookup.get('Fiber, total dietary')
            if fiber == None:
                fiber = "0"
            protein = nutrient_lookup.get("Protein")
            if protein == None:
                protein = "0"

            cal_b = float(re.sub(r'[a-zA-Z]', '', cal).strip())
            sug_b = float(re.sub(r'[a-zA-Z]', '', sug).strip())
            sat_fat_b = float(re.sub(r'[a-zA-Z]', '', sat_fat).strip())
            salt_b = float(re.sub(r'[a-zA-Z]', '', salt).strip())
            fiber_b = float(re.sub(r'[a-zA-Z]', '', fiber).strip())
            protein_b = float(re.sub(r'[a-zA-Z]', '', protein).strip())

            def calculations(cal_b, sug_b, sat_fat_b, salt_b, fiber_b, protein_b):
                points = 0

                print("Calculations Started")
                if cal_b < 80:
                    points = points
                elif cal_b > 800:
                    points = points + 10
                else:
                    points = points + (cal_b/80)
                if sug_b < 4.5:
                    points = points
                elif sug_b > 45:
                    points = points + 10
                else:
                    points = points + (sug_b/4.5)
                if sat_fat_b < 1:
                    points = points
                elif sat_fat_b > 10:
                    points = points + 10
                else:
                    points = points + (sat_fat_b/1)
                if salt_b < 90:
                    points = points
                elif salt_b > 900:
                    points = points + 10
                else:
                    points = points + (salt_b/90)
                if fiber_b < 0.7:
                    points = points
                elif fiber_b > 3.5:
                    points = points - 5
                else:
                    points = points - ((fiber_b/0.7))
                if protein_b < 1.6:
                    points = points
                elif protein_b > 8:
                    points = points - 5
                else:
                    points = points - (protein_b/1.6)

                if points <= -1.05882352941:
                    return {"nutri_score" : "A"}
                elif points <= 1.88235294118:
                    return {"nutri_score" : "B"}
                elif points <= 9.4117647059:
                    return {"nutri_score" : "C"}
                elif points <= 16.9411764706:
                    return {"nutri_score" : "D"}
                else:
                    return {"nutri_score" : "E"}

            return calculations(cal_b, sug_b, sat_fat_b, salt_b, fiber_b, protein_b)
        
        openff = f"https://world.openfoodfacts.net/api/v2/product/{upc}?fields=product_name,nutrition_grades,nutriscore_data"
        openff_api_response = requests.get(openff)
        if openff_api_response.status_code == 200:
            openff_data = openff_api_response.json()
            nutri_product = openff_data.get("product")
            if "nutrition_grades" in nutri_product:
                nutri_score = openff_data.get("product", {}).get("nutrition_grades")
                return {"nutri_score": nutri_score}
            else:
                nutri_score = usda_calc(upc)
                return nutri_score
        else:
            nutri_score = usda_calc(upc)
            return nutri_score
