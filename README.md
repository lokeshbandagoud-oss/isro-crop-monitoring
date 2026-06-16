# ISRO Crop Monitoring & Irrigation Recommendation System

## Project Overview

This project is developed for the ISRO Hackathon challenge:

**"Monitoring Crop Growth, Detecting Moisture Stress, and Providing Irrigation Recommendations using Satellite Data."**

The system analyzes agricultural field data such as NDVI and soil moisture values and uses Artificial Intelligence to generate crop health reports and irrigation recommendations.

---

## Problem Statement

Farmers often face difficulties in monitoring crop conditions and deciding the right time for irrigation.

This project aims to:

* Monitor crop health.
* Detect moisture stress.
* Generate irrigation recommendations.
* Provide easy-to-understand reports.
* Support precision agriculture using AI.

---

## Features

### Crop Monitoring

* NDVI-based crop health analysis
* Soil moisture monitoring
* Crop condition assessment

### AI Analysis

* Crop health scoring
* Moisture stress detection
* Irrigation recommendations
* Farmer-friendly AI reports

### Dashboard

* User-friendly web interface
* Input field data
* Real-time analysis results
* Recommendation display

---

## Technology Stack

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Python
* FastAPI

### AI Models

* Claude Sonnet
* Google Gemini
* OpenRouter (optional)

### Version Control

* GitHub

---

## Project Structure

```text
isro-crop-monitoring/

├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── backend/
│   ├── main.py
│   ├── ai_service.py
│   └── sample_data.json
│
├── docs/
│
├── README.md
│
└── requirements.txt
```

---

## Workflow

```text
User Input
    ↓
Frontend Dashboard
    ↓
FastAPI Backend
    ↓
AI Analysis Engine
    ↓
Crop Health Assessment
    ↓
Moisture Stress Detection
    ↓
Irrigation Recommendation
    ↓
Result Dashboard
```

---

## Sample Input

```json
{
  "ndvi": 0.42,
  "moisture": 18
}
```

---

## Sample Output

```text
Crop Health: Moderate

Moisture Stress: High

Recommendation:
Irrigate within 24 hours.

Estimated Water Requirement:
18,000 Litres
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/isro-crop-monitoring.git
```

### Navigate to Project

```bash
cd isro-crop-monitoring
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
uvicorn main:app --reload
```

### Open Dashboard

Open:

```text
http://localhost:8000
```

---

## Future Enhancements

* Real Sentinel-1 Satellite Integration
* Real Sentinel-2 Satellite Integration
* Automatic NDVI Calculation
* GIS Mapping
* Field Heatmaps
* Weather Data Integration
* Mobile Application
* SMS Alert System

---

## Team Goal

To develop an AI-powered agricultural monitoring system that helps farmers make informed irrigation decisions and improves water resource management.

---

## License

This project is developed for educational and hackathon purposes.
