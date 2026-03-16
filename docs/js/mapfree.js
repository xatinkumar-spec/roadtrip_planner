const routeData = JSON.parse(localStorage.getItem("selectedRoute"));
const routeTitle = document.getElementById("routeTitle");

if (routeData) {
    routeTitle.innerText = routeData.from + " → " + routeData.to;
}

const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

async function geocodePlace(placeName) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(placeName)}`;

    const response = await fetch(url, {
        headers: {
            "Accept-Language": "en"
        }
    });

    const data = await response.json();

    if (data.length === 0) {
        return null;
    }

    return {
        name: placeName,
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
    };
}

async function showRoadRoute() {
    if (!routeData) return;

    const fromCoords = await geocodePlace(routeData.from);
    const toCoords = await geocodePlace(routeData.to);

    if (!fromCoords || !toCoords) {
        alert("Location not found");
        return;
    }

    const fromLatLng = [fromCoords.lat, fromCoords.lng];
    const toLatLng = [toCoords.lat, toCoords.lng];

    L.marker(fromLatLng).addTo(map).bindPopup(routeData.from);
    L.marker(toLatLng).addTo(map).bindPopup(routeData.to);

    const routeUrl = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=geojson`;

    const response = await fetch(routeUrl);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        alert("Road route not found");
        return;
    }

    const routeGeoJson = data.routes[0].geometry;

    const routeLayer = L.geoJSON(routeGeoJson, {
        style: {
            color: "blue",
            weight: 5
        }
    }).addTo(map);

    map.fitBounds(routeLayer.getBounds());
}

showRoadRoute();