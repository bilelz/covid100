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

const initLatlng = { lat: 46.911637, lng: 2.724609 },
  camping =
    '<a href="https://www.awin1.com/cread.php?awinmid=13329&awinaffid=714551&clickref=&ued=" class="link" target="_blank" rel="noopener">' +
    '<span class="emoji">🏕️</span> <span class="text">Locations de vacances près d\'ici</span> <span class="emoji">🏖️</span>' +
    "</a>",
  button1_100km =
    'Voir aussi <button type="button" data-1000  class="invert small" onclick="setRadius(1000)">1km</button>' +
    '<button type="button" data-100000  class="invert small" onclick="setRadius(100000)">100km</button> autour d\'ici.';

let circle100 = undefined,
  marker = undefined,
  radius = 100 * 1000;

// map = L.map("map").setView(initLatlng, 7);

document.querySelector("body").setAttribute("data-radius", radius);

// L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
//   maxZoom: 20,
//   attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);
// map.zoomControl.setPosition("bottomright");

const OpenStreetMap_France = L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

const Stamen_Watercolor = L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}", {
  attribution:
    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  subdomains: "abcd",
  minZoom: 1,
  maxZoom: 16,
  ext: "jpg",
});

const map = L.map("map", {
  center: initLatlng,
  zoom: 7,
  layers: [OpenStreetMap_France],
});

const baseLayers = {
  "Classic (OSM)": OpenStreetMap_France,
  "📜 Parchemin": Stamen_Watercolor,
};

L.control.layers(baseLayers, null, { position: "bottomright" }).addTo(map);

map.zoomControl.setPosition("bottomright");

let currentMapIndex = 0;
document.querySelector("body").setAttribute("data-map", currentMapIndex);
function toggleMap() {
  currentMapIndex = currentMapIndex === 1 ? 0 : 1;
  var layerControlElement = document.querySelector(".leaflet-control-layers");
  layerControlElement.getElementsByTagName("input")[currentMapIndex].click();
  document.querySelector("body").setAttribute("data-map", currentMapIndex);
}

function setRadius(d) {
  if (circle100) {
    radius = d;
    circle100.setRadius(radius);
    map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
    document.querySelector("body").setAttribute("data-radius", radius);
  }
}

function onMapClick(e) {
  drawCircle(e, button1_100km + camping, true);
}

map.on("click", onMapClick);

function drawCircle(e, msg, fit) {
  if (circle100 !== undefined) {
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
  localStorage.setItem("latestLatLng", JSON.stringify(e.latlng));
}

function france() {
  const msg =
    "Cliquez n'importe où sur la carte pour afficher une zone de 100 km <br/> " +
    '<button type="button" onclick="gps()" class="invert" data-gps>' +
    '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none" /> <path      d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>' +
    "&nbsp;Cliquez ici pour être géo-localisé.</button>";
  setRadius(100 * 1000);
  drawCircle({ latlng: initLatlng }, msg, false);
  map.setView(initLatlng, 5);
  document.querySelector("body").classList.add("centered");
}

function gps() {
  gpsLog("⌛...");
  document.querySelector("body").classList.add("gps-waiting");
  setTimeout(function () {
    document.querySelector("body").classList.remove("gps-waiting");
  }, 3000);

  navigator.geolocation.getCurrentPosition(
    function (position) {
      localStorage.setItem("gps", "ok");
      drawCircle({ latlng: { lat: position.coords.latitude, lng: position.coords.longitude } }, "🏠" + button1_100km + camping, true);
      gpsLogHide();
    },
    function (error) {
      localStorage.removeItem("gps");
      switch (error.code) {
        case error.PERMISSION_DENIED:
          gpsErrorLog("Vous avez refusé la demande de localisation");
          break;
        case error.POSITION_UNAVAILABLE:
          gpsErrorLog("Information localisation indisponible");
          break;
        case error.TIMEOUT:
          gpsErrorLog("Temps d'attente trop long");
          break;
        case error.UNKNOWN_ERROR:
          gpsErrorLog("Bouh... erreur inconnue");
          break;
      }
    }
  );
}

function gpsLog(msg) {
  document.getElementById("gpsStatus").classList.remove("hidden");
  document.getElementById("gpsStatus").innerHTML = msg;
}
function gpsErrorLog(msg) {
  document.querySelector("body").classList.remove("gps-waiting");
  document.getElementById("gpsStatus").classList.remove("hidden");
  document.getElementById("gpsStatus").innerHTML = msg + ' <button type="button" onclick="gpsLogHide()" class="invert small">ok</button>';
  document.querySelector("#gpsStatus button").focus();
}
function gpsLogHide() {
  document.getElementById("gpsStatus").classList.add("hidden");
  document.getElementById("gpsStatus").innerHTML = "";
  document.querySelector("body").classList.remove("gps-waiting");
}

function share() {
  navigator.share({
    title: document.title,
    text: document.querySelector("meta[name='description']").getAttribute("content"),
    url: "https://covid100.fr",
  });
}

function rgpd() {
  localStorage.setItem("rgpd", "ok");
  document.getElementById("rgpd").classList.add("hidden");
}

if (localStorage.getItem("rgpd")) {
  document.getElementById("rgpd").classList.add("hidden");
}

// init circle position
if (localStorage.getItem("gps")) {
  gps();
} else if (localStorage.getItem("latestLatLng")) {
  drawCircle({ latlng: JSON.parse(localStorage.getItem("latestLatLng")) }, button1_100km + camping, true);
} else {
  france();
}

console.log(
  "%c  🏴‍☠️TIPIAK! 🏴‍☠️PIRATE! ",
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
