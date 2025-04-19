let map = L.map('map').setView([60.39299, 5.32415], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let polyline, watchId;
let coords = [], totalDist = 0, maxSpeed = 0, startTime;
const R = 6371000;

function formatTime(sec) {
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s=sec%60;
  const pad = n=>n.toString().padStart(2,'0');
  return h>0?`\${h}:\${pad(m)}:\${pad(s)}`:`\${pad(m)}:\${pad(s)}`;
}

function calcDist([lat1,lon1],[lat2,lon2]) {
  const dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

document.getElementById('startBtn').onclick = () => {
  coords = []; totalDist=0; maxSpeed=0;
  document.getElementById('stopBtn').disabled = false;
  document.getElementById('startBtn').disabled = true;
  startTime = Date.now();
  polyline = L.polyline([], { color: '#1E3A8A', weight: 4 }).addTo(map);

  watchId = navigator.geolocation.watchPosition(pos=>{
    const { latitude:lat, longitude:lon, speed } = pos.coords;
    coords.push([lat,lon]);
    if (coords.length>1) {
      const d = calcDist(coords[coords.length-2], coords[coords.length-1]);
      totalDist += d/1852;
    }
    map.setView([lat,lon], map.getZoom(), { animate: true });
    polyline.setLatLngs(coords);
    const knots = (speed||0)*1.94384;
    if (knots>maxSpeed) maxSpeed=knots;
    const elapsed = Math.floor((Date.now()-startTime)/1000);
    const avg = elapsed>0 ? totalDist/(elapsed/3600) : 0;

    document.getElementById('distance').textContent = totalDist.toFixed(2)+' NM';
    document.getElementById('time').textContent = formatTime(elapsed);
    document.getElementById('currentSpeed').textContent = knots.toFixed(1)+' kt';
    document.getElementById('maxSpeed').textContent = maxSpeed.toFixed(1)+' kt';
    document.getElementById('avgSpeed').textContent = avg.toFixed(1)+' kt';
  },{ enableHighAccuracy:true, maximumAge:0, timeout:5000 });
};

document.getElementById('stopBtn').onclick = () => {
  navigator.geolocation.clearWatch(watchId);
  document.getElementById('stopBtn').disabled = true;
  document.getElementById('nameModal').classList.remove('hidden');
};

document.getElementById('saveBtn').onclick = () => {
  const name = document.getElementById('tripName').value || 'Uten navn';
  const trip = {
    date: new Date().toISOString(),
    name,
    distance: totalDist,
    time: Math.floor((Date.now()-startTime)/1000),
    max: maxSpeed,
    avg: totalDist / ((Date.now()-startTime)/3600000),
    coords
  };
  const all = JSON.parse(localStorage.getItem('trips')||'[]');
  all.push(trip);
  localStorage.setItem('trips', JSON.stringify(all));
  window.location.href = 'history.html';
};