// features device support
if ("geolocation" in navigator === false) {
  document.querySelector("body").classList.add("no-gps");
}
if (navigator.share === undefined) {
  document.querySelector("body").classList.add("no-share");
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    function () { },
    function () { }
  );
}

const initLatlng = { lat: 46.911637, lng: 2.724609 },
  camping = '',
  /*'<a href="https://www.awin1.com/cread.php?awinmid=13329&awinaffid=714551&clickref=&ued=" class="link" target="_blank" rel="noopener">' +
  '<span class="emoji">🏕️</span> <span class="text">Locations de vacances près d\'ici</span> <span class="emoji">🏖️</span>' +
  "</a>",*/
  button1_100km =
    `Cliquez n'importe où sur la carte <br/>ou
    <button type="button" data-share onclick="sharePosition()" class="invert small">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="512px"
              id="Layer_1" style="enable-background:new 0 0 512 512;" version="1.1" viewBox="0 0 512 512" width="512px"
              xml:space="preserve">
              <g>
                <path d="M288,298.1v92.3L448,256L288,112v80C100.8,192,64,400,64,400C117,307,186.4,298.1,288,298.1z" />
              </g>
            </svg>
    partager cette position</button>`;

let circle100 = undefined,
  marker = undefined,
  radius = +document.querySelector("input[type=radio][name=radius]:checked").value;

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
  if (document.querySelector(`input[type=radio][name=radius][value='${d}']`)) {
    document.querySelector("body").setAttribute("data-radius", radius);
    document.querySelector(`input[type=radio][name=radius][value='${d}']`).checked = true;

    if (circle100) {
      radius = d;
      circle100.setRadius(radius);
      map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
    }
    
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
    const radius = +document.querySelector("input[type=radio][name=radius]:checked").value;
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
    `Cliquez n'importe où sur la carte <br/> 
    <button type="button" onclick="gps()" class="invert" data-gps>
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"> <path d="M0 0h24v24H0z" fill="none" /> <path      d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
    &nbsp;Géo-localisez moi</button>`;
  setRadius(10 * 1000);
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

function sharePosition() {
  const latestLatLng = localStorage.getItem("latestLatLng");
  if (latestLatLng) {
    const latLng = JSON.parse(latestLatLng);
    const radius = document.querySelector(" input[type=radio][name=radius]:checked").value;
    const url = `${document.location.protocol}//${document.location.host}?lat=${latLng.lat}&lng=${latLng.lng}&radius=${radius}`;
    console.log(url);
    navigator.share({
      title: `Je te partage ma zone de 10km autour d'ici. ${document.title}`,
      text: document.querySelector("meta[name='description']").getAttribute("content"),
      url: url,
    });
  } else {
    share();
  }
}

function rgpd() {
  localStorage.setItem("rgpd", "ok");
  document.getElementById("rgpd").classList.add("hidden");
}

if (localStorage.getItem("rgpd")) {
  document.getElementById("rgpd").classList.add("hidden");
}

// init circle position
function init() {
  const search = document.location.search;
  const params = new URLSearchParams(search);

  if (params.get('radius')) {
    setRadius(params.get('radius'));
  }

  if (params.get('lat') && params.get('lng')) {
    drawCircle({ latlng: { lat: params.get('lat'), lng: params.get('lng') } }, button1_100km + camping, true);
  }
  if (localStorage.getItem("latestLatLng")) {
    drawCircle({ latlng: JSON.parse(localStorage.getItem("latestLatLng")) }, button1_100km + camping, true);
  } else if (localStorage.getItem("gps")) {
    gps();

  } else {
    france();
  }
  window.history.replaceState({}, document.title, "/");
}

init();

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
