const tripForm = document.getElementById("tripForm");
const addDestinationBtn = document.getElementById("addDestinationBtn");
const destinationsContainer = document.getElementById("destinationsContainer");

let destinationCount = 1;

addDestinationBtn.addEventListener("click", function () {
    destinationCount++;

    const input = document.createElement("input");
    input.type = "text";
    input.className = "destination";
    input.placeholder = `Enter destination ${destinationCount}`;
    input.required = true;

    destinationsContainer.appendChild(input);
});

tripForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        alert("Please login first");
        window.location.href = "index.html";
        return;
    }

    const start_location = document.getElementById("start_location").value.trim();
    const days = document.getElementById("days").value.trim();
    const budget = document.getElementById("budget").value.trim();

    const destinationInputs = document.querySelectorAll(".destination");
    const destinations = [];

    destinationInputs.forEach(input => {
        if (input.value.trim() !== "") {
            destinations.push(input.value.trim());
        }
    });

    
    const tripData = {
        start_location: start_location,
        destinations: destinations,
        days: days,
        budget: budget
    };

    localStorage.setItem("tripData", JSON.stringify(tripData));


    const { data: userData, error: userDataError } = await supabaseClient
        .from("users")
        .select("name")
        .eq("id", user.id)
        .single();

    if (userDataError) {
        alert("User name fetch error: " + userDataError.message);
        return;
    }

    const user_name = userData?.name || user.email;

    const allDestinations = destinations.join(", ");


    const { error: tripError } = await supabaseClient
        .from("trips")
        .insert([
            {
                user_id: user.id,
                user_name: user_name,
                start_location: start_location,
                destinations: allDestinations,
                days: parseInt(days),
                budget: parseInt(budget),
                total_distance: "Not calculated yet"
            }
        ]);

    if (tripError) {
        alert("Trip save error: " + tripError.message);
        return;
    }

    alert("Trip saved successfully");

    window.location.href = "summary.html";
});
