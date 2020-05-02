// features device support
if ("geolocation" in navigator === false) {
  document.querySelector("body").classList.add("no-gps");
}
if (navigator.share === undefined) {
  document.querySelector("body").classList.add("no-share");
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    function () {},
    function () {}
  );
}

var initLatlng = { lat: 46.911637, lng: 2.724609 },
  circle100 = undefined,
  marker = undefined,
  radius = 100 * 1000,
  // ads = '<a href="https://www.booking.com/index.html?aid=2018298" target="_blank" class="link">🏕️ Trouvez des vacances proches de chez vous 🏖️</a>';
  ads = "",
  map = L.map("map").setView(initLatlng, 5);

document.querySelector("body").setAttribute("data-radius", radius);

L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
map.zoomControl.setPosition("bottomright");

function france() {
  var msg =
    "Cliquez n'importe où sur la carte pour afficher une zone de 100 km <br/> " +
    '<span data-gps> ou <button type="button" onclick="gps()">cliquez ici</button> pour être géo-localisé.</span>';
  radius = 100 * 1000;
  drawCircle({ latlng: initLatlng }, msg, false);
  map.setView(initLatlng, 5);
  document.querySelector("body").classList.add("centered");
}

france();

function onMapClick(e) {
  drawCircle(e, ads, true);
}

map.on("click", onMapClick);

function drawCircle(e, msg, fit) {
  if (circle100 !== undefined) {
    // map.removeLayer(circle100);
    circle100.setLatLng(e.latlng);
  } else {
    circle100 = L.circle(e.latlng, radius, {
      color: "salmon",
      fillColor: "white",
      fillOpacity: 0.5,
      weight: 3,
      dashArray: "5,10",
    }).addTo(map);
  }
  if (marker !== undefined) {
    marker.setLatLng(e.latlng);
  } else {
    marker = L.marker(e.latlng).addTo(map);
  }

  if (msg) {
    // if (!fit) {
    marker.bindPopup(msg).openPopup();
    // } else {
    //   marker.bindPopup(msg);
    // }
  }

  map.panTo(new L.LatLng(e.latlng.lat, e.latlng.lng), { duration: 1 });

  if (fit) {
    map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
  }
  document.querySelector("body").classList.remove("centered");
}

function setRadius(d) {
  radius = d;
  circle100.setRadius(radius);
  map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
  document.querySelector("body").setAttribute("data-radius", radius);
}

function gps() {
  document.getElementById("gpsStatus").innerText = "⌛...";
  navigator.geolocation.getCurrentPosition(
    function (position) {
      drawCircle({ latlng: { lat: position.coords.latitude, lng: position.coords.longitude } }, "🏠 Autour de chez vous" + ads, true);
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
}

function share() {
  navigator
    .share({
      title: document.title,
      text: document.querySelector("meta[name='description']").getAttribute("content"),
      url: "https://covid100.fr",
    })
    .then(() => console.log("Successful share"))
    .catch((error) => console.log("Error sharing", error));
}

console.log(
  "%c 🏴‍☠️PIRATE! ",
  [
    "background: linear-gradient(to right, #ffc371, #ff5f6d)",
    "color: white",
    "display: block",
    "text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)",
    "line-height: 40px",
    "text-align: center",
    "font-size: 40px",
  ].join(";")
);
