let map;
let directionsService;
let directionsRenderer;

function initMap() {
  const center = { lat: 12.9716, lng: 77.5946 }; // Bangalore default

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: center,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionsRenderer.setMap(map);

  // form submit handle
  const form = document.getElementById("tripForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const start = document.getElementById("start_location").value;
    const destination = document.getElementById("destination").value;

    drawRoute(start, destination);
  });
}

function drawRoute(start, destination) {
  directionsService.route(
    {
      origin: start,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (result, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(result);

        // distance calculate
        const route = result.routes[0].legs[0];
        const distance = route.distance.text;
        const duration = route.duration.text;

        alert("Distance: " + distance + "\nTime: " + duration);
      } else {
        alert("Route not found: " + status);
      }
    }
  );
}

window.onload = initMap;