// features device support
if ("geolocation" in navigator === false) {
  document.querySelector("body").classList.add("no-gps");
}
if (navigator.share === undefined) {
  document.querySelector("body").classList.add("no-share");
}
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(
    function () {
      console.log("CLIENT: service worker registration complete.");
    },
    function () {
      console.log("CLIENT: service worker registration failure.");
    }
  );
}

var initLatlng = { lat: 46.911637, lng: 2.724609 },
  circle100 = undefined,
  marker = undefined;
ads = "";
// '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8845074534433406" data-ad-slot="6628551281" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>';

var map = L.map("map").setView(initLatlng, 5);

L.tileLayer("https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png", {
  maxZoom: 20,
  attribution: '&copy; Openstreetmap France | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
map.zoomControl.setPosition("bottomright");

function france() {
  var msg =
    "Cliquez n'importe où sur la carte pour afficher votre zone de 100 km <br/> " +
    '<span data-gps> ou <button type="button" onclick="gps()">cliquez ici</button> pour être géo-localisé.</span>';
  drawCircle({ latlng: initLatlng }, msg, false);
  map.setView(initLatlng, 5);
  document.querySelector("body").classList.add("centered");
}

france();

function onMapClick(e) {
  drawCircle(e, "Cliquez n'importe où sur la carte pour afficher votre zone de 100 km" + ads, true);
}

map.on("click", onMapClick);

function drawCircle(e, msg, fit) {
  if (circle100 !== undefined) {
    // map.removeLayer(circle100);
    circle100.setLatLng(e.latlng);
  } else {
    circle100 = L.circle(e.latlng, 100 * 1000, {
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
  document.querySelector("body").classList.remove("centered");
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
