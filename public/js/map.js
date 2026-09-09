// Google Maps loader for the listing detail page.
// Reads config from data attributes on the #map container to avoid
// hardcoding the API key (it is injected server-side via the template).
(function () {
  "use strict";

  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const apiKey = mapEl.dataset.apikey;
  const location = mapEl.dataset.location;

  const fallbackMessage = (msg) => {
    mapEl.innerHTML = '<p class="text-muted text-center mt-4">' + msg + "</p>";
  };

  // No key / no usable location -> show a graceful notice instead of a blank box
  if (!apiKey || apiKey === "undefined" || !location) {
    fallbackMessage("Map is unavailable for this listing.");
    return;
  }

  window.__initProjectAirMap__ = function () {
    const geocoder = new google.maps.Geocoder();
    const showMap = (center, zoom) => {
      const map = new google.maps.Map(mapEl, { center, zoom });
      new google.maps.Marker({ map, position: center });
    };

    geocoder.geocode({ address: location }, (results, status) => {
      if (status === "OK" && results[0]) {
        showMap(results[0].geometry.location, 12);
      } else {
        // geo failed -> still render a world view with no marker rather than crash
        showMap({ lat: 20, lng: 0 }, 2);
      }
    });
  };

  const script = document.createElement("script");
  script.src =
    "https://maps.googleapis.com/maps/api/js?key=" +
    encodeURIComponent(apiKey) +
    "&loading=async&callback=__initProjectAirMap__&v=weekly";
  script.async = true;
  script.defer = true;
  script.onerror = function () {
    fallbackMessage("Map could not be loaded.");
  };
  document.head.appendChild(script);
})();
