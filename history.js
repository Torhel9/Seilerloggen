function formatTime(sec) {
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s=sec%60;
  const pad = n=>n.toString().padStart(2,'0');
  return h>0?`\${h}:\${pad(m)}:\${pad(s)}`:`\${pad(m)}:\${pad(s)}`;
}

const fromInput = document.getElementById('fromDate');
const toInput = document.getElementById('toDate');
const listEl = document.getElementById('tripsList');
const totalDistEl = document.getElementById('totalDistance');
const totalTimeEl = document.getElementById('totalTime');

const trips = JSON.parse(localStorage.getItem('trips')||'[]').reverse();

// Sett default datoer
if (trips.length) {
  const dates = trips.map(t=>new Date(t.date));
  fromInput.value = new Date(Math.min(...dates)).toISOString().split('T')[0];
  toInput.value = new Date(Math.max(...dates)).toISOString().split('T')[0];
}

function render() {
  const from = new Date(fromInput.value), to = new Date(toInput.value);
  const filtered = trips.filter(t=>{
    const d=new Date(t.date);
    return d>=from && d<=to;
  });

  let td=0, tt=0;
  listEl.innerHTML = filtered.length
    ? filtered.map((t,i)=> {
        td += t.distance;
        tt += t.time;
        return `
          <div class="trip-card">
            <div class="trip-header">
              <h3>\${t.name}</h3>
              <button onclick="deleteTrip(\${i})">🗑️</button>
            </div>
            <p>\${new Date(t.date).toLocaleString()}</p>
            <p>Distanse: \${t.distance.toFixed(2)} NM</p>
            <p>Tid: \${formatTime(t.time)}</p>
            <p>Maks fart: \${t.max.toFixed(1)} kt</p>
            <p>Snittfart: \${t.avg.toFixed(1)} kt</p>
            <button onclick="viewRoute(\${i})" class="btn-primary">Vis rute</button>
          </div>`;
      }).join('')
    : '<p>Ingen turer funnet for valgt periode.</p>';

  totalDistEl.textContent = td.toFixed(2)+' NM';
  totalTimeEl.textContent = formatTime(tt);
}

function deleteTrip(idx) {
  if (!confirm('Er du sikker på at du vil slette denne turen?')) return;
  const all = JSON.parse(localStorage.getItem('trips')||'[]');
  all.splice(all.length-1-idx, 1);
  localStorage.setItem('trips', JSON.stringify(all));
  location.reload();
}

function viewRoute(idx) {
  window.location.href = `route.html?i=${idx}`;
}

fromInput.onchange = render;
toInput.onchange = render;

render();