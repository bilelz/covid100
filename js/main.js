var initLatlng = { lat: 46.911637, lng: 2.724609 },
  circle100 = undefined,
  marker = undefined;

var map = L.map("map").setView(initLatlng, 5);

L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
  {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
  }
).addTo(map);
map.zoomControl.setPosition("bottomright");

function france() {
  drawCircle({ latlng: initLatlng }, "Cliquez n'importe où sur la carte pour afficher votre zone de 100 km", false);
  map.setView(initLatlng, 5);
}

france();

function onMapClick(e) {
  drawCircle(e, "Cliquez n'importe où sur la carte pour afficher votre zone de 100 km", true);
}

map.on("click", onMapClick);

function drawCircle(e, msg, fit) {
  if (circle100 !== undefined) {
    map.removeLayer(circle100);
  }
  if (marker !== undefined) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  circle100 = L.circle(e.latlng, 100 * 1000, {
    color: "white",
    fillColor: "white",
    fillOpacity: 0.5,
  }).addTo(map);

  if (msg) {
    if (!fit) {
      marker.bindPopup(msg).openPopup();
    } else {
      marker.bindPopup(msg);
    }
  }

  map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng), { duration: 1 });

  if (fit) {
    map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
  }
}

function gps() {
  if ("geolocation" in navigator) {
    document.getElementById("gpsStatus").innerText = "⌛...";
    navigator.geolocation.getCurrentPosition(
      function (position) {
        drawCircle({ latlng: { lat: position.coords.latitude, lng: position.coords.longitude } }, "🏠 Autour de chez vous", true);
        document.getElementById("gpsStatus").innerText = "";
      },
      function (error) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            document.getElementById("gpsStatus").innerText = "Vous avez refusé la demande de localisation";
            break;
          case error.POSITION_UNAVAILABLE:
            document.getElementById("gpsStatus").innerText = "Information localisation indisponible";
            break;
          case error.TIMEOUT:
            document.getElementById("gpsStatus").innerText = "Temps d'attente trop long";
            break;
          case error.UNKNOWN_ERROR:
            document.getElementById("gpsStatus").innerText = "Bouh... erreur inconnue";
            break;
        }
      }
    );
  } else {
    /* la géolocalisation n'est pas disponible */
    document.getElementById("gps").innerHTML = "<p>Votre appareil ne permet la geo-localisation, essayez depuis un autre appareil</p>";
  }
}

if (navigator.share) {
  document.getElementById("share").classList.remove("hide");
}

function share() {
  navigator
    .share({
      title: "Covid100.fr",
      text: "Pour voir où on peut aller à 100km de chez soi",
      url: "https://covid100.fr",
    })
    .then(() => console.log("Successful share"))
    .catch((error) => console.log("Error sharing", error));
}
