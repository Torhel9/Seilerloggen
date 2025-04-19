const params = new URLSearchParams(location.search);
const idx = parseInt(params.get('i'), 10);
const all = JSON.parse(localStorage.getItem('trips')||'[]').reverse();
const trip = all[idx] || {};
if (!trip.coords) {
  alert('Ingen posisjonsdata funnet.');
  history.back();
}

let map = L.map('map').fitBounds(trip.coords);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.polyline(trip.coords, { color: '#1E3A8A', weight: 4 }).addTo(map);
L.marker(trip.coords[0]).addTo(map).bindPopup('Start');
L.marker(trip.coords[trip.coords.length-1]).addTo(map).bindPopup('Slutt');