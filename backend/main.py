from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from ai_service import get_crop_analysis

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

    print("POLYGON RECEIVED:")
    print(data.polygon)

    result = get_crop_analysis(
        data.latitude,
        data.longitude,
        data.polygon
    )

    return result


@app.post("/analyze")
def analyze(data: FarmRequest):

    result = get_crop_analysis(
        data.latitude,
        data.longitude,
        data.polygon
    )

    return result