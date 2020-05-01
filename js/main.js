var initLatlng = [46.911637, 2.724609];

var mymap = L.map("map").setView(initLatlng, 5);

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
).addTo(mymap);

// L.marker(initLatlng).addTo(mymap).bindPopup("<b>Hello!</b><br />Cliquez n'importe ou sur la carte pour afficher votre zone de 100km").openPopup();

drawCircle({ latlng: initLatlng }, "<b>Hello!</b><br />Cliquez n'importe ou sur la carte pour afficher votre zone de 100km");

function onMapClick(e) {
  drawCircle(e);
}

mymap.on("click", onMapClick);

function drawCircle(e, msg) {
  if (msg) {
    var popup = L.popup();
    popup.setLatLng(e.latlng).setContent(msg).openOn(mymap);
  }

  L.circle(e.latlng, 100 * 1000, {
    color: "green",
    fillColor: "#f03",
    fillOpacity: 0.1,
  })
    .addTo(mymap)
    .bindPopup("I am a circle.");
}
