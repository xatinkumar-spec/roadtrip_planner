const summaryContainer = document.getElementById("summaryContainer");
const distanceContainer = document.getElementById("distanceContainer");
const totalDistanceEl = document.getElementById("totalDistance");

const tripData = JSON.parse(localStorage.getItem("tripData"));

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

async function getRoadDistance(fromCoords, toCoords) {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=false`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
        return null;
    }

    const meters = data.routes[0].distance;
    return meters / 1000;
}


/* NEW FUNCTION — DATABASE UPDATE */

async function updateTripTotalDistance(totalKm) {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.log("User not logged in");
        return;
    }

    const destinationText = tripData.destinations.join(", ");

    const { error } = await supabaseClient
        .from("trips")
        .update({
            total_distance: totalKm.toFixed(2) + " km"
        })
        .eq("user_id", user.id)
        .eq("start_location", tripData.start_location)
        .eq("destinations", destinationText)
        .eq("total_distance", "Not calculated yet");

    if (error) {
        console.log("Distance update error:", error.message);
    }
}



async function loadSummary() {

    if (!tripData) {
        summaryContainer.innerHTML = "<p>No trip data found.</p>";
        return;
    }

    summaryContainer.innerHTML = `
        <p><strong>Start Location:</strong> ${tripData.start_location}</p>
        <p><strong>Days:</strong> ${tripData.days}</p>
        <p><strong>Budget:</strong> ${tripData.budget}</p>
    `;

    const places = [tripData.start_location, ...tripData.destinations];
    localStorage.setItem("places", JSON.stringify(places));

    let totalKm = 0;
    let html = "<h3>Distance Summary</h3><ul>";

    for (let i = 0; i < places.length - 1; i++) {

        const from = places[i];
        const to = places[i + 1];

        const fromCoords = await geocodePlace(from);
        const toCoords = await geocodePlace(to);

        if (fromCoords && toCoords) {

            const distance = await getRoadDistance(fromCoords, toCoords);

            if (distance !== null) {

                totalKm += distance;

                html += `
                    <li>
                        <a class="route-link" href="map.html" onclick="saveSelectedRoute('${from}', '${to}')">
                            <strong>${from}</strong> → <strong>${to}</strong> = ${distance.toFixed(2)} km
                        </a>
                    </li>
                `;
            }

            else {

                html += `
                    <li>
                        <strong>${from}</strong> → <strong>${to}</strong> = Route not found
                    </li>
                `;
            }

        } else {

            html += `
                <li>
                    <strong>${from}</strong> → <strong>${to}</strong> = Location not found
                </li>
            `;
        }
    }

    html += "</ul>";

    distanceContainer.innerHTML = html;

    totalDistanceEl.innerText =
        "Total Distance: " + totalKm.toFixed(2) + " km";


    /* NEW LINE — DATABASE UPDATE */

    updateTripTotalDistance(totalKm);
}



function saveSelectedRoute(from, to) {
    localStorage.setItem("selectedRoute", JSON.stringify({ from, to }));
}


loadSummary();