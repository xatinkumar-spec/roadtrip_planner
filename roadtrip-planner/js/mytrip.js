const tripsList = document.getElementById("tripsList");

async function loadMyTrips() {
    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const { data, error } = await supabaseClient
        .from("trips")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        tripsList.innerHTML = `<p>Error loading trips: ${error.message}</p>`;
        return;
    }

    if (!data || data.length === 0) {
        tripsList.innerHTML = `<div class="summary-box"><p>No trips found.</p></div>`;
        return;
    }

    let html = "";

    data.forEach((trip) => {
        html += `
            <div class="summary-box trip-card">
                <h3>${trip.user_name || "User Trip"}</h3>
                <p><strong>Start:</strong> ${trip.start_location}</p>
                <p><strong>Destinations:</strong> ${trip.destinations || "-"}</p>
                <p><strong>Days:</strong> ${trip.days}</p>
                <p><strong>Budget:</strong> ${trip.budget}</p>
                <p><strong>Total Distance:</strong> ${trip.total_distance || "Not calculated yet"}</p>

                <div class="trip-actions">
                    <button onclick="viewTripRoute('${trip.start_location}', \`${trip.destinations || ""}\`)">View Route</button>
                    <button onclick="deleteTrip('${trip.id}')" class="delete-btn">Delete Trip</button>
                </div>
            </div>
        `;
    });

    tripsList.innerHTML = html;
}

function viewTripRoute(start, destinationsText) {
    const destinations = destinationsText
        ? destinationsText.split(",").map(item => item.trim()).filter(Boolean)
        : [];

    const tripData = {
        start_location: start,
        destinations: destinations,
        days: 0,
        budget: 0
    };

    localStorage.setItem("tripData", JSON.stringify(tripData));
    window.location.href = "summary.html";
}

async function deleteTrip(tripId) {
    const ok = confirm("Are you sure you want to delete this trip?");
    if (!ok) return;

    const { error } = await supabaseClient
        .from("trips")
        .delete()
        .eq("id", tripId);

    if (error) {
        alert("Delete failed: " + error.message);
        return;
    }

    alert("Trip deleted successfully");
    loadMyTrips();
}

loadMyTrips();