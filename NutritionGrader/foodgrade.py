# A food grading system based off of Europes Nutri Grade system, but for the United States.
# framework: Uses US Database of foods API, searches for UPC with barcode API, gets Nutrition Information
# for the said UPC, and uses the nutriscale calculator

import requests
import json
import pprint
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

#tommorow: build standout nutriton feature for open food facts, work on design.

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
        def calc(upc):
            usda_api = "8SUEWLjbckxHgVegcczqatREm8YFgII6JMV8pUmL"
            url = "https://api.nal.usda.gov/fdc/v1/foods/search"
            parameters = {
                "query": upc,
                "dataType": "Branded",
                "api_key": usda_api }
            api_response = requests.get(url, params=parameters)
            if api_response.status_code == 200:
                print("HTTPS connection success")
            else:
                return "failed to retrieve data. Please try again later. Could be bad scan/unkown upc, server being down, or most likely internet connection"
            try:
                json_response = api_response.json()
            except ValueError:
                return "invalid server response. Connection succeeded but something later failed. Please try again later."
            # info needed: calories, sugar, sat fat, salt (negatives) and fruit/vegetables, fiber, and protein (positives)
            # 18 total nutrients accounted for
            try:
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
            except:
                return "error, product may not exist in database or there is an unknown error"

            cal_b = float(re.sub(r'[a-zA-Z]', '', cal).strip())
            sug_b = float(re.sub(r'[a-zA-Z]', '', sug).strip())
            sat_fat_b = float(re.sub(r'[a-zA-Z]', '', sat_fat).strip())
            salt_b = float(re.sub(r'[a-zA-Z]', '', salt).strip())
            fiber_b = float(re.sub(r'[a-zA-Z]', '', fiber).strip())
            protein_b = float(re.sub(r'[a-zA-Z]', '', protein).strip())

            def calculations(cal_b, sug_b, sat_fat_b, salt_b, fiber_b, protein_b):
                points = 0
                standout_nutrition = ["placeholder"]
                #to do list:
                #handle OpenFoodFacts unique responses, such as non applicable or unknown, and funnel them through manual calculations
                #refine calculations
                print("Calculations Started")
                if sug_b < 4:
                    points = points
                elif sug_b > 40:
                    points = points + 10
                    standout_nutrition.append('High in Sugar')
                else:
                    points = points + (sug_b/4)
                if sat_fat_b < 1:
                    points = points
                elif sat_fat_b > 10:
                    points = points + 10
                    standout_nutrition.append('High in Saturated Fat')
                else:
                    points = points + (sat_fat_b/1)
                if salt_b < 100:
                    points = points
                elif salt_b > 1000:
                    points = points + 10
                    standout_nutrition.append('High in Sodium/Salt')
                else:
                    points = points + (salt_b/100)
                if fiber_b < 1:
                    points = points
                elif fiber_b > 5:
                    points = points - 5
                    standout_nutrition.append('High in Fiber')
                else:
                    points = points - ((fiber_b/1))
                if protein_b < 2:
                    points = points
                elif protein_b > 10:
                    points = points - 5
                    standout_nutrition.append('High in Protein')
                else:
                    points = points - (protein_b/2)

                if points <= 0:
                    return {"nutri_score" : "a",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%284%29.png',
                            "standout_nutrition" : standout_nutrition}
                elif points <= 2.9:
                    return {"nutri_score" : "b",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%283%29.png',
                            "standout_nutrition" : standout_nutrition}
                elif points <= 10.9:
                    return {"nutri_score" : "c",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%282%29.png',
                            "standout_nutrition" : standout_nutrition}
                elif points <= 18:
                    return {"nutri_score" : "d",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%281%29.png',
                            "standout_nutrition" : standout_nutrition}
                elif points > 18:
                    return {"nutri_score" : "e",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design.png',
                            "standout_nutrition" : standout_nutrition}
                else:
                    return {"nutri_score" : "unknown",
                            "img_url" : 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%285%29.png',
                            "standout_nutrition" : standout_nutrition}

            return calculations(cal_b, sug_b, sat_fat_b, salt_b, fiber_b, protein_b)
        
        openff = f"https://world.openfoodfacts.net/api/v2/product/{upc}?fields=product_name,nutrition_grades,nutriments,nutriscore_data"
        openff_api_response = requests.get(openff)
        if openff_api_response.status_code == 200 and 'unknown' or 'not applicable' not in str(openff_api_response):
            try:
                openff_data = openff_api_response.json()
            except:
                nutri_score = calc(upc)
                return nutri_score
            nutri_product = openff_data.get("product")
            if "nutrition_grades" in nutri_product:
                nutri_score = openff_data.get("product", {}).get("nutrition_grades")
                if nutri_score == "a":
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%284%29.png'
                elif nutri_score == "b":
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%283%29.png'
                elif nutri_score == "c":
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%282%29.png'
                elif nutri_score == "d":
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%281%29.png'
                elif nutri_score == "e":
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design.png'
                elif nutri_score == 'unknown' or 'not applicable':
                    data = calc(upc)
                    return data
                else:
                    img_url = 'https://ai6v66gckad7chki.public.blob.vercel-storage.com/Untitled%20design%20%285%29.png'
                return {"nutri_score": nutri_score,
                        "img_url" : img_url,
                        "standout_nutrition" : 0}
            elif "072251001563" == upc:
                data = calc(upc)
                return data
            else:
                data = calc(upc)
                return data
        else:
            data = calc(upc)
            return data

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)