let map, service, currentMarker, infowindow;

function initMap() {
  // Initialize the map
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 23.0225, lng: 72.5714 }, // Default to Ahmedabad
    zoom: 12,
  });

  // Initialize PlacesService to search for fuel stations
  service = new google.maps.places.PlacesService(map);

  // Handle the "Current Location" button click
  document.getElementById('currentLocationBtn').addEventListener('click', function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Center the map on the user's location
        map.setCenter(userLocation);
        map.setZoom(17);

        // Add a blue marker for the current location
        if (currentMarker) {
          currentMarker.setMap(null); // Remove old marker if exists
        }

        currentMarker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here",
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker icon
            scaledSize: new google.maps.Size(40, 40), // Resize marker if needed
          },
        });
      }, function() {
        alert("Error: The Geolocation service failed.");
      });
    } else {
      alert("Error: Your browser does not support geolocation.");
    }
  });

  // Add a Places Search functionality
  const input = document.getElementById("locationSearch");
  const searchBox = new google.maps.places.SearchBox(input);

  searchBox.addListener("places_changed", function () {
    const places = searchBox.getPlaces();

    if (places.length === 0) return;

    // Adjust map bounds to fit the searched place
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (!place.geometry || !place.geometry.location) return;

      bounds.extend(place.geometry.location);
    });
    map.fitBounds(bounds);
  });

  // Radius search implementation
  document.getElementById("searchButton").addEventListener("click", function () {
    const radius = document.getElementById("radius").value;
    searchPetrolPumps(radius);
  });
}

function searchPetrolPumps(radius) {
  const center = map.getCenter();
  const request = {
    location: center,
    radius: parseFloat(radius) * 1000, // Convert km to meters
    type: ["gas_station"],
  };

  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      results.forEach((place) => {
        const marker = new google.maps.Marker({
          map,
          position: place.geometry.location,
        });

        google.maps.event.addListener(marker, "click", () => {
          if (!infowindow) infowindow = new google.maps.InfoWindow();
          infowindow.setContent(place.name);
          infowindow.open(map, marker);
        });
      });
    }
  });

}

window.onload = function() {
    if (document.getElementById('map')) {
      // Initialize the map if the map div exists
      initMap();
    }
  };
