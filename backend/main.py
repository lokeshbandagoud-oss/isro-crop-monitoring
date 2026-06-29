from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai_service import get_crop_analysis

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://isro-crop-monitoring.netlify.app"
        # For testing only, you can temporarily use:
        # "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FarmRequest(BaseModel):
    latitude: float
    longitude: float
    polygon: dict | None = None


@app.get("/")
def home():
    return {
        "message": "ISRO Crop Monitoring API Running"
    }


@app.post("/analyze")
def analyze(data: FarmRequest):

    print("Polygon Received:")
    print(data.polygon)

    result = get_crop_analysis(
        data.latitude,
        data.longitude,
        data.polygon
    )

    return result