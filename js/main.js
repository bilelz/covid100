// features device support
if ("geolocation" in navigator === false) {
  document.querySelector("body").classList.add("no-gps");
}
if (navigator.share === undefined) {
  document.querySelector("body").classList.add("no-share");
}
if (!navigator.canShare || !navigator.canShare({ files: [new File([''], '')] })) {
  document.querySelector("body").classList.add("no-share-file");
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    function () { },
    function () { }
  );
}

const initLatlng = { lat: 46.911637, lng: 2.724609 };

let circle100 = undefined,
  marker = undefined;

// map = L.map("map").setView(initLatlng, 7);


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
  if (document.querySelector(`#radius option[value='${d}']`)) {
    document.getElementById('radius').value = d;
    localStorage.setItem("latestRadius", d);

    if (circle100) {
      circle100.setRadius(d);
      map.fitBounds(circle100.getBounds(), { padding: [10, 10] });
      marker.bindPopup(getTooltipMsg())
    }

  }
}

function onMapClick(e) {
  drawCircle(e, getTooltipMsg(e.latlng), true);
}

map.on("click", onMapClick);

function drawCircle(e, msg, fit) {
  const radius = +document.getElementById('radius').value;

  if (circle100 !== undefined) {
    circle100.setLatLng(e.latlng);
  } else {
    circle100 = L.circle(e.latlng, radius, {
      color: "red",
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
      drawCircle({ latlng: { lat: position.coords.latitude, lng: position.coords.longitude } }, "🏠 " + getTooltipMsg(), true);
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

function sleep(delay) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

async function screenshot() {
  
  document.body.classList.add('screenshot')
  const markerWasOpen = marker.isPopupOpen();
  if (marker.isPopupOpen()) {
    marker.closePopup();
    await sleep(300);
  }

  
  // Generate image
  const blob = await domtoimage.toBlob(document.body, { width: document.body.clientWidth, height: document.body.clientHeight });

  document.body.classList.remove('screenshot');

  if(markerWasOpen){
    marker.togglePopup();
  }

  const file = new File([blob], 'covid100.fr.jpg', { type: 'image/jpeg' });
  return file;

}

async function sharePosition(event) {
  event.preventDefault();

  const latestLatLng = localStorage.getItem("latestLatLng");
  if (latestLatLng) {
    const latLng = JSON.parse(latestLatLng);
    const radius = document.getElementById('radius').value / 1000;
    const url = `${document.location.protocol}//${document.location.host}?lat=${latLng.lat}&lng=${latLng.lng}&radius=${radius}`;

    if (navigator.canShare && navigator.canShare({ files: [new File([''], '')] })) {
      const file = await screenshot();
      navigator.share({
        files: [file],
        title: `🖼️ Ma zone Covid de ${radius}km autour d'ici. @Covid100fr`,
        text: document.querySelector("meta[name='description']").getAttribute("content"),
        url: url
      })
        .then(() => console.log('Share with file was successful.'))
        .catch((error) => console.log('Sharing with file failed', error));
    } else {
      console.log(`Your system doesn't support sharing files.`);
      navigator.share({
        title: `Ma zone Covid de ${radius}km autour d'ici. @Covid100fr`,
        text: document.querySelector("meta[name='description']").getAttribute("content"),
        url: url,
      });
    }
  } else {
    navigator.share({
      title: document.title,
      text: document.querySelector("meta[name='description']").getAttribute("content"),
      url: "https://covid100.fr",
    });
  }
}

function getTooltipMsg(_latLng) {
  const latestLatLng = localStorage.getItem("latestLatLng");
  const radius = document.getElementById('radius').value / 1000;
  const via = document.querySelector("meta[name='twitter:creator']").getAttribute('content');
  const text = encodeURIComponent(`Ma zone covid de ${radius}km autour d'ici.`);
  const shareTemplate = document.getElementById('share-tmpl').innerHTML;

  if (_latLng) {
    const url = `${document.location.protocol}//${document.location.host}?lat=${_latLng.lat}&lng=${_latLng.lng}&radius=${radius}`;
    return eval("`" + shareTemplate + "`");
  }
  else if (latestLatLng) {
    const latLng = JSON.parse(latestLatLng);
    const url = `${document.location.protocol}//${document.location.host}?lat=${latLng.lat}&lng=${latLng.lng}&radius=${radius}`;
    return eval("`" + shareTemplate + "`");
  } else {
    const url = `${document.location.protocol}//${document.location.host}?radius=${radius}`;
    return eval("`" + shareTemplate + "`");
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
    setRadius(params.get('radius') * 1000);
  } else if (localStorage.getItem("latestRadius")) {
    setRadius(localStorage.getItem("latestRadius"));

  }

  if (params.get('lat') && params.get('lng')) {
    drawCircle({ latlng: { lat: params.get('lat'), lng: params.get('lng') } }, getTooltipMsg(), true);
  }
  if (localStorage.getItem("latestLatLng")) {
    drawCircle({ latlng: JSON.parse(localStorage.getItem("latestLatLng")) }, getTooltipMsg(), true);
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
