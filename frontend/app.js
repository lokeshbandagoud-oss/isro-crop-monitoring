// ==========================================
// ISRO AI Crop Monitoring Platform
// app.js - Part 1
// ==========================================

// ----------------------
// Initialize Map
// ----------------------

const map = L.map("map").setView([17.3850, 78.4867], 7);

L.tileLayer(
    "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    {
        maxZoom: 20,
        attribution: "Google Hybrid"
    }
).addTo(map);

// ----------------------
// Global Variables
// ----------------------

let marker = null;
let farmPolygon = null;
let currentLayer = null;

let selectedLat = 0;
let selectedLon = 0;

let fieldAcres = 0;
let fieldHectares = 0;

const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// ----------------------
// Draw Toolbar
// ----------------------

const drawControl = new L.Control.Draw({

    draw:{

        polygon:true,
        rectangle:true,
        polyline:false,
        circle:false,
        marker:false,
        circlemarker:false

    },

    edit:{

        featureGroup:drawnItems

    }

});

map.addControl(drawControl);

// ==========================================
// Map Click
// ==========================================

map.on("click",function(e){

    selectedLat=e.latlng.lat;
    selectedLon=e.latlng.lng;

    farmPolygon=null;

    if(marker){

        map.removeLayer(marker);

    }

    marker=L.marker([selectedLat,selectedLon]).addTo(map);

    showLocationInfo();

});

// ==========================================
// Polygon Drawing
// ==========================================

map.on(L.Draw.Event.CREATED,function(event){

    const layer=event.layer;

    drawnItems.clearLayers();

    drawnItems.addLayer(layer);

    currentLayer=layer;

    farmPolygon=layer.toGeoJSON();

    const latlngs=layer.getLatLngs()[0];

    // ---------- Area ----------

    const area=L.GeometryUtil.geodesicArea(latlngs);

    fieldHectares=area/10000;

    fieldAcres=fieldHectares*2.47105;

    // ---------- Centroid ----------

    let sumLat=0;

    let sumLon=0;

    latlngs.forEach(point=>{

        sumLat+=point.lat;

        sumLon+=point.lng;

    });

    selectedLat=sumLat/latlngs.length;

    selectedLon=sumLon/latlngs.length;

    showFarmInfo();

});

// ==========================================
// Search Location
// ==========================================

async function searchLocation(){

    const place=document
        .getElementById("locationInput")
        .value
        .trim();

    if(place===""){

        alert("Please enter a location.");

        return;

    }

    try{

        const response=await fetch(

`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(place)}`

        );

        const data=await response.json();

        if(data.length===0){

            alert("Location not found");

            return;

        }

        const lat=parseFloat(data[0].lat);

        const lon=parseFloat(data[0].lon);

        map.setView([lat,lon],16);

        if(marker){

            map.removeLayer(marker);

        }

        marker=L.marker([lat,lon]).addTo(map);

        selectedLat=lat;
        selectedLon=lon;

    }

    catch(error){

        console.error(error);

        alert("Unable to search location.");

    }

}

// ==========================================
// Loading Animation
// ==========================================

function showLoading(){

    document
        .getElementById("loadingOverlay")
        .style.display="flex";

    const bar=document.getElementById("progressBar");

    const text=document.getElementById("loadingText");

    bar.style.width="10%";

    text.innerHTML=
    "🛰 Connecting to Google Earth Engine...";

    setTimeout(()=>{

        bar.style.width="35%";

        text.innerHTML=
        "☁ Downloading Sentinel-2 imagery...";

    },800);

    setTimeout(()=>{

        bar.style.width="65%";

        text.innerHTML=
        "🌿 Computing NDVI & NDMI...";

    },1800);

    setTimeout(()=>{

        bar.style.width="90%";

        text.innerHTML=
        "🤖 Generating AI Recommendation...";

    },2800);

}

function hideLoading(){

    document
        .getElementById("loadingOverlay")
        .style.display="none";

}

// ==========================================
// Dashboard Before Analysis
// ==========================================

function showLocationInfo(){

    document.getElementById("info").innerHTML=`

        <h3>📍 Selected Location</h3>

        <p><b>Latitude:</b> ${selectedLat.toFixed(6)}</p>

        <p><b>Longitude:</b> ${selectedLon.toFixed(6)}</p>

        <button id="analyzeBtn">
            Analyze Location
        </button>

        <div id="result"></div>

    `;

    document
        .getElementById("analyzeBtn")
        .addEventListener("click",analyzeCrop);

}

function showFarmInfo(){

    document.getElementById("info").innerHTML=`

        <h3>🌾 Farm Boundary Selected</h3>

        <p><b>Area:</b> ${fieldHectares.toFixed(2)} ha</p>

        <p><b>Acres:</b> ${fieldAcres.toFixed(2)}</p>

        <button id="analyzeBtn">
            Analyze Farm
        </button>

        <div id="result"></div>

    `;

    document
        .getElementById("analyzeBtn")
        .addEventListener("click",analyzeCrop);

}

// ==========================================
// analyzeCrop()
// Part 2 Starts Here
// ==========================================
// ==========================================
// Analyze Crop
// ==========================================

async function analyzeCrop(){

    if(!farmPolygon){

        alert("Please draw a farm boundary first.");

        return;

    }

    showLoading();

    try{

        const response=await fetch(

            "http://127.0.0.1:8000/analyze",

            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    latitude:selectedLat,
                    longitude:selectedLon,
                    polygon:farmPolygon

                })

            }

        );

        if(!response.ok){

            throw new Error("Server Error");

        }

        const data=await response.json();

        hideLoading();

        updatePolygonColor(data.crop_health);

        renderDashboard(data);

    }

    catch(error){

        hideLoading();

        console.error(error);

        alert("Analysis Failed");

    }

}

// ==========================================
// Polygon Colour
// ==========================================

function updatePolygonColor(status){

    if(!currentLayer){

        return;

    }

    let color="#2e7d32";

    if(status==="Moderate"){

        color="#ff9800";

    }

    if(status==="Poor"){

        color="#d32f2f";

    }

    currentLayer.setStyle({

        color:color,

        fillColor:color,

        fillOpacity:0.40,

        weight:3

    });

}

// ==========================================
// Dashboard
// ==========================================

function renderDashboard(data){

document.getElementById("result").innerHTML=`

<div class="dashboard-grid">
 <h1>📡 Satellite Analysis</h1>
<div class="card">
    <div class="card-title">📍 Field Center</div>
    <div class="card-value">
        ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}
    </div>
</div>

<div class="card">
<div class="card-title">🌾 Crop Type</div>
<div class="card-value green">${data.crop_type}</div>
</div>

<div class="card">
<div class="card-title">🌱 Growth Stage</div>
<div class="card-value blue">${data.growth_stage}</div>
</div>

<div class="card">
<div class="card-title">💚 Crop Health</div>
<div class="card-value ${
data.crop_health==="Healthy"
?"green":
data.crop_health==="Moderate"
?"orange":"red"
}">
${data.crop_health}
</div>
</div>

<div class="card">
<div class="card-title">💧 Moisture Stress</div>
<div class="card-value ${
data.moisture_stress==="Low"
?"green":
data.moisture_stress==="Moderate"
?"orange":"red"
}">
${data.moisture_stress}
</div>
</div>

<div class="gauge-card">

<div class="gauge"

style="--percent:${Math.min(data.ndvi*100,100)}">

<div class="gauge-value">

${data.ndvi}

</div>

</div>

<h3>🌿 NDVI</h3>

</div>

<div class="gauge-card">

<div class="gauge"

style="--percent:${Math.min((data.ndmi+1)*50,100)}">

<div class="gauge-value">

${data.ndmi}

</div>

</div>

<h3>💧 NDMI</h3>

</div>

<div class="card">
<div class="card-title">⚖ Water Balance</div>
<div class="card-value blue">${data.water_balance}</div>
</div>

<div class="card">
<div class="card-title">🚿 Irrigation</div>
<div class="card-value ${
data.irrigation==="Required"
?"red":
data.irrigation==="Recommended"
?"orange":"green"
}">
${data.irrigation}
</div>
</div>

<div class="card">
<div class="card-title">💦 Water Requirement</div>
<div class="card-value blue">${data.water_requirement}</div>
</div>

<div class="card">
<div class="card-title">⏱ Irrigation Duration</div>
<div class="card-value blue">${data.irrigation_duration}</div>
</div>

<div class="card">
<div class="card-title">📅 Next Monitoring</div>
<div class="card-value blue">${data.next_monitoring}</div>
</div>

<div class="recommend-card">

    <div class="recommend-header">
        🤖 AI Recommendation
    </div>

    <div class="recommend-body">
        ${data.recommendation}
    </div>

    <div class="recommend-grid">

        <div>
            💦 Water Requirement
            <h3>${data.water_requirement}</h3>
        </div>

        <div>
            🚿 Irrigation
            <h3>${data.irrigation}</h3>
        </div>

        <div>
            ⏱ Duration
            <h3>${data.irrigation_duration}</h3>
        </div>

        <div>
            📅 Next Monitoring
            <h3>${data.next_monitoring}</h3>
        </div>

    </div>

</div>

</div>

`;

}
//-------------------
function getCurrentLocation(){

navigator.geolocation.getCurrentPosition(

(position)=>{

const lat=position.coords.latitude;

const lon=position.coords.longitude;

map.setView([lat,lon],16);

if(marker){

map.removeLayer(marker);

}

marker=L.marker([lat,lon]).addTo(map);

selectedLat=lat;

selectedLon=lon;

},

()=>{

alert("Unable to get location.");

}

);

}//-----------------------
function clearField(){

drawnItems.clearLayers();

if(marker){

map.removeLayer(marker);

}

farmPolygon=null;

fieldAcres=0;

fieldHectares=0;

selectedLat=0;

selectedLon=0;

document.getElementById("info").innerHTML=

"Draw a farm boundary and click Analyze.";

}
function resetMap(){

map.setView([17.3850,78.4867],7);

}
// ==============================
// Leaflet Toolbar Tooltips
// ==============================

setTimeout(() => {

    const titles = {

        "leaflet-draw-draw-polygon": "Draw Farm Boundary",

        "leaflet-draw-draw-rectangle": "Draw Rectangle",

        "leaflet-draw-edit-edit": "Edit Boundary",

        "leaflet-draw-edit-remove": "Delete Boundary",

        "leaflet-control-zoom-in": "Zoom In",

        "leaflet-control-zoom-out": "Zoom Out"

    };

    Object.keys(titles).forEach(className => {

        const element = document.querySelector("." + className);

        if(element){

            element.title = titles[className];

        }

    });

},1000);