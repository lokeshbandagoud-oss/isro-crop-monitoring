import ee

SERVICE_ACCOUNT = "lokisamisro@demoapp-18464.iam.gserviceaccount.com"

credentials = ee.ServiceAccountCredentials(
    SERVICE_ACCOUNT,
    "earth-engine-key.json"
)

ee.Initialize(credentials, project="demoapp-18464")

print("SUCCESS")