import ee
import os
from dotenv import load_dotenv
from datetime import datetime, date

# Load .env from backend folder
load_dotenv()

PROJECT_ID = os.getenv("GEE_PROJECT_ID")
SERVICE_ACCOUNT = os.getenv("GEE_SERVICE_ACCOUNT")
KEY_PATH = os.getenv("GEE_KEY_PATH")

print("PROJECT_ID:", PROJECT_ID)
print("SERVICE_ACCOUNT:", SERVICE_ACCOUNT)
print("KEY_PATH:", KEY_PATH)

credentials = ee.ServiceAccountCredentials(
    SERVICE_ACCOUNT,
    KEY_PATH
)

ee.Initialize(
    credentials,
    project="demoapp-18464"
)


def get_crop_analysis(lat, lon, polygon=None):

    print("POLYGON DATA:")
    print(polygon)

    if polygon:

        coords = polygon["geometry"]["coordinates"]

        point = ee.Geometry.Polygon(coords)

    else:

        point = ee.Geometry.Point([lon, lat])

    image = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(point)
       .filterDate("2026-01-01", "2026-12-31")
       .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
       .sort("system:time_start", False)   # newest first
       .first()
    )

    image_date = ee.Date(
        image.get("system:time_start")
    ).format("YYYY-MM-dd").getInfo()

    print("Image Date:", image_date)

    ndvi = image.normalizedDifference(["B8", "B4"])

    ndmi = image.normalizedDifference(["B8", "B11"])

    ndvi_value = ndvi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=point,
        scale=10
    ).get("nd").getInfo()

    ndmi_value = ndmi.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=point,
        scale=10
    ).get("nd").getInfo()

    print("NDVI:", ndvi_value)
    print("NDMI:", ndmi_value)

    bands = image.select(
        ["B2", "B3", "B4", "B8", "B11", "B12"]
    ).reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=point,
        scale=10
    ).getInfo()

   

    # NDVI History

    ndvi_history = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(point)
        .filterDate("2025-01-01", "2026-12-31")
        .map(
            lambda img: img.set(
                "NDVI",
                img.normalizedDifference(
                    ["B8", "B4"]
                ).reduceRegion(
                    reducer=ee.Reducer.mean(),
                    geometry=point,
                    scale=10
                ).get("nd")
            )
        )
    )

    history = ndvi_history.aggregate_array(
        "NDVI"
    ).getInfo()

    dates = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterBounds(point)
        .filterDate("2025-01-01", "2026-12-31")
        .aggregate_array(
            "system:time_start"
        )
        .getInfo()
    )

    valid_history = [
        x for x in history
        if x is not None
    ]

    avg_ndvi = (
        sum(valid_history) /
        len(valid_history)
    )

    
    peak_ndvi = max(valid_history)

    peak_index = valid_history.index(
        peak_ndvi
    )

    peak_timestamp = dates[peak_index]

    peak_date = datetime.fromtimestamp(
        peak_timestamp / 1000
    ).strftime("%Y-%m-%d")

    peak_dt = datetime.strptime(
        peak_date,
        "%Y-%m-%d"
    ).date()

    today = date.today()

    days_since_peak = (
        today - peak_dt
    ).days

    current_vs_peak = (
        ndvi_value / peak_ndvi
    ) * 100

   
    
        # Crop Health

    if ndvi_value > 0.5:
        health = "Healthy"

    elif ndvi_value > 0.3:
        health = "Moderate"

    else:
        health = "Poor"

    # Moisture Stress

    if ndmi_value > 0.25:
        moisture_stress = "Low"

    elif ndmi_value > 0.10:
        moisture_stress = "Moderate"

    else:
        moisture_stress = "High"

    # Water Balance

    if ndmi_value > 0.20:
        water_balance = "Surplus"

    elif ndmi_value > 0.10:
        water_balance = "Balanced"

    else:
        water_balance = "Deficit"

    # Smart Recommendation

    if moisture_stress == "High":

        recommendation = (
            "High moisture stress detected. "
            "Immediate irrigation is recommended. "
            "Apply 30-40 mm water and monitor after 5 days."
        )

    elif moisture_stress == "Moderate":

        recommendation = (
            "Moderate moisture stress detected. "
            "Irrigation is recommended within the next 2-3 days. "
            "Apply 15-25 mm water and monitor after 7 days."
        )

    else:

        recommendation = (
            "Crop moisture condition is healthy. "
            "No irrigation is currently required. "
            "Monitor again after 10 days."
        )

    # Irrigation Recommendation

    if moisture_stress == "High":

        irrigation = "Required"
        water_requirement = "30-40 mm"
        next_monitoring = "After 5 days"

    elif moisture_stress == "Moderate":

        irrigation = "Recommended"
        water_requirement = "15-25 mm"
        next_monitoring = "After 7 days"

    else:

        irrigation = "Not Required"
        water_requirement = "0 mm"
        next_monitoring = "After 10 days"

    # Irrigation Duration

    if irrigation == "Required":

        irrigation_duration = "5-8 Hours"

    elif irrigation == "Recommended":

        irrigation_duration = "3-5 Hours"

    else:

        irrigation_duration = "Not Required"

# =====================================
# Crop Type Detection (Improved)
# =====================================

    if (
      peak_ndvi >= 0.75 and peak_ndvi <= 0.88 and
      avg_ndvi >= 0.40 and avg_ndvi <= 0.55 and
     ndmi_value >= 0.30
    ):
     crop_type = "Rice (Paddy)"

    elif (
     peak_ndvi >= 0.70 and peak_ndvi <= 0.85 and
     avg_ndvi >= 0.35 and avg_ndvi <= 0.50 and
     ndmi_value >= 0.15 and ndmi_value <= 0.35
    ):
     crop_type = "Wheat"

    elif (
      peak_ndvi >= 0.75 and peak_ndvi <= 0.85 and
      avg_ndvi >= 0.50 and avg_ndvi <= 0.65 and
      ndmi_value >= 0.35
    ):
     crop_type = "Sugarcane"

    elif (
      peak_ndvi >= 0.65 and peak_ndvi <= 0.78 and
      avg_ndvi >= 0.35 and avg_ndvi <= 0.45 and
      ndmi_value >= 0.10 and ndmi_value <= 0.25
    ):
      crop_type = "Cotton"

    elif (
      peak_ndvi >= 0.70 and peak_ndvi <= 0.82 and
      avg_ndvi >= 0.38 and avg_ndvi <= 0.48 and
      ndmi_value >= 0.20 and ndmi_value <= 0.35
    ):
     crop_type = "Maize"

    elif (
      peak_ndvi >= 0.60 and peak_ndvi <= 0.75 and
      avg_ndvi >= 0.30 and avg_ndvi <= 0.42 and
      ndmi_value >= 0.05 and ndmi_value <= 0.20
    ):
     crop_type = "Pulses / Oilseeds"

    elif (
      peak_ndvi >= 0.50 and peak_ndvi <= 0.68 and
      avg_ndvi >= 0.25 and avg_ndvi <= 0.38 and
      ndmi_value >= -0.05 and ndmi_value <= 0.15
    ):
     crop_type = "Millets / Sorghum"

    else:
      crop_type = "Unknown Crop"
    # Growth Stage

    if current_vs_peak > 80:

        growth_stage = "Peak Vegetative"

    elif current_vs_peak > 50:

        growth_stage = "Vegetative"

    elif current_vs_peak > 25:

        growth_stage = "Maturity"

    else:

        growth_stage = "Harvest / Post-Harvest"

    return {
     "latitude": round(lat, 6),
    "longitude": round(lon, 6),

    "ndvi": round(ndvi_value, 3),
    "ndmi": round(ndmi_value, 3),

    "crop_type": crop_type,
    "growth_stage": growth_stage,

    "crop_health": health,
    "moisture_stress": moisture_stress,
    "water_balance": water_balance,

    "irrigation": irrigation,
    "water_requirement": water_requirement,
    "irrigation_duration": irrigation_duration,
    "next_monitoring": next_monitoring,

    "recommendation": recommendation
}
        