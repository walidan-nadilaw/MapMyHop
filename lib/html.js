import { exec } from 'child_process';

export function buildHtml(hopsWithGeo, host) {
  const located = hopsWithGeo.filter((h) => h.geo);
  const dataJson = JSON.stringify(located);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Trace route to ${host}</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const hops = ${dataJson};
    const map = L.map('map');
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const latlngs = [];
    hops.forEach((h) => {
      const latlng = [h.geo.lat, h.geo.lon];
      latlngs.push(latlng);
      L.marker(latlng)
        .addTo(map)
        .bindPopup(
          '<b>Hop ' + h.hop + '</b><br>' + h.ip + '<br>' +
          h.geo.city + ', ' + h.geo.country + '<br>' + h.geo.isp
        );
    });

    if (latlngs.length > 1) {
      L.polyline(latlngs, { color: 'blue' }).addTo(map);
    }

    if (latlngs.length > 0) {
      map.fitBounds(latlngs, { padding: [40, 40] });
    } else {
      map.setView([20, 0], 2);
    }
  </script>
</body>
</html>
`;
}

export function openInBrowser(filePath) {
  exec(`start chrome "${filePath}"`);
}
