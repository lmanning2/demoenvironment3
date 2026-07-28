/**
 * Route Map — interactive Nile Air destination map.
 *
 * Rebuilds the Nile Air "our-flights" route map using Leaflet + OpenStreetMap
 * (no API key required). Renders airport markers and great-circle-ish route
 * lines from the Cairo hub to every destination. Clicking a destination marker
 * (or picking one from the selector) highlights that route.
 *
 * Authored content: the block needs no authored rows — destinations are the
 * Nile Air network (public airport coordinates). Any authored rows are ignored
 * so the block renders consistently.
 */

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

const HUB = {
  code: 'CAI', name: 'Cairo Intl. Airport', lat: 30.1219, lng: 31.4056,
};

// Nile Air destinations (public airport coordinates).
const DESTINATIONS = [
  {
    code: 'DUS', name: 'Düsseldorf', lat: 51.2895, lng: 6.7668,
  },
  {
    code: 'HRG', name: 'Hurghada', lat: 27.1783, lng: 33.7994,
  },
  {
    code: 'MUC', name: 'Munich', lat: 48.3538, lng: 11.7861,
  },
  {
    code: 'BER', name: 'Berlin Brandenburg', lat: 52.3667, lng: 13.5033,
  },
  {
    code: 'ASW', name: 'Aswan', lat: 23.9644, lng: 32.8200,
  },
  {
    code: 'AAN', name: 'Al Ain', lat: 24.2617, lng: 55.6092,
  },
  {
    code: 'ARN', name: 'Stockholm Arlanda', lat: 59.6519, lng: 17.9186,
  },
  {
    code: 'SHJ', name: 'Sharjah', lat: 25.3286, lng: 55.5172,
  },
  {
    code: 'KWI', name: 'Kuwait', lat: 29.2266, lng: 47.9689,
  },
  {
    code: 'SAW', name: 'Istanbul Sabiha Gökçen', lat: 40.8986, lng: 29.3092,
  },
  {
    code: 'LXR', name: 'Luxor', lat: 25.6710, lng: 32.7066,
  },
  {
    code: 'BGW', name: 'Baghdad', lat: 33.2625, lng: 44.2346,
  },
  {
    code: 'SSH', name: 'Sharm El Sheikh', lat: 27.9773, lng: 34.3950,
  },
  {
    code: 'CGN', name: 'Cologne Bonn', lat: 50.8659, lng: 7.1427,
  },
  {
    code: 'BGY', name: 'Bergamo', lat: 45.6739, lng: 9.7042,
  },
  {
    code: 'RAE', name: 'Arar', lat: 30.9066, lng: 41.1382,
  },
  {
    code: 'ELQ', name: 'Gassim', lat: 26.3028, lng: 43.7744,
  },
  {
    code: 'AJF', name: 'Al Jouf', lat: 29.7851, lng: 40.1000,
  },
  {
    code: 'GIZ', name: 'Gizan', lat: 16.9011, lng: 42.5858,
  },
  {
    code: 'TAS', name: 'Tashkent', lat: 41.2579, lng: 69.2812,
  },
  {
    code: 'AHB', name: 'Abha', lat: 18.2404, lng: 42.6566,
  },
  {
    code: 'TIF', name: 'Taif', lat: 21.4834, lng: 40.5443,
  },
  {
    code: 'TUU', name: 'Tabuk', lat: 28.3654, lng: 36.6189,
  },
  {
    code: 'HAS', name: "Ha'il", lat: 27.4379, lng: 41.6863,
  },
  {
    code: 'RUH', name: 'Riyadh', lat: 24.9576, lng: 46.6988,
  },
  {
    code: 'JED', name: 'Jeddah', lat: 21.6796, lng: 39.1565,
  },
  {
    code: 'AQI', name: 'Qaisumah', lat: 28.3352, lng: 46.1250,
  },
  {
    code: 'YNB', name: 'Yanbu', lat: 24.1442, lng: 38.0634,
  },
  {
    code: 'DMM', name: 'Dammam', lat: 26.4712, lng: 49.7979,
  },
  {
    code: 'EAM', name: 'Najran', lat: 17.6115, lng: 44.4192,
  },
];

function loadCss(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(); return; }
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = reject;
    document.head.append(s);
  });
}

export default async function decorate(block) {
  block.textContent = '';

  // --- Controls (origin fixed to Cairo, destination selector) -------------
  const controls = document.createElement('div');
  controls.className = 'route-map-controls';

  const origin = document.createElement('div');
  origin.className = 'route-map-origin';
  origin.innerHTML = '<span class="route-map-label">From</span><span class="route-map-value">Cairo Intl. Airport (CAI)</span>';

  const destWrap = document.createElement('label');
  destWrap.className = 'route-map-dest';
  destWrap.innerHTML = '<span class="route-map-label">To</span>';
  const select = document.createElement('select');
  select.className = 'route-map-select';
  select.setAttribute('aria-label', 'Select a destination');
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'All destinations';
  select.append(optAll);
  DESTINATIONS.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach((d) => {
    const o = document.createElement('option');
    o.value = d.code;
    o.textContent = `${d.name} (${d.code})`;
    select.append(o);
  });
  destWrap.append(select);
  controls.append(origin, destWrap);

  const mapEl = document.createElement('div');
  mapEl.className = 'route-map-canvas';
  mapEl.setAttribute('role', 'region');
  mapEl.setAttribute('aria-label', 'Nile Air route map');

  block.append(controls, mapEl);

  loadCss(LEAFLET_CSS);
  try {
    await loadScript(LEAFLET_JS);
  } catch (e) {
    mapEl.innerHTML = '<p class="route-map-error">Map could not be loaded.</p>';
    return;
  }
  const { L } = window;
  if (!L) return;

  const map = L.map(mapEl, { scrollWheelZoom: false, attributionControl: true })
    .setView([30, 35], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const NAVY = '#162844';
  const GOLD = '#c3ae7c';

  const dot = (color, size) => L.divIcon({
    className: 'route-map-pin',
    html: `<span style="background:${color};width:${size}px;height:${size}px"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

  // Hub marker
  L.marker([HUB.lat, HUB.lng], { icon: dot(GOLD, 16), title: `${HUB.name} (${HUB.code})`, zIndexOffset: 1000 })
    .addTo(map)
    .bindPopup(`<strong>${HUB.name}</strong><br>${HUB.code} — hub`);

  const routes = {}; // code -> { line, marker }
  const bounds = [[HUB.lat, HUB.lng]];

  function opacityFor(code, active) {
    if (code === 'all') return 0.45;
    return active ? 0.95 : 0.12;
  }

  function highlight(code) {
    Object.entries(routes).forEach(([c, { line, marker }]) => {
      const isActive = code === 'all' || c === code;
      const isSelected = c === code;
      line.setStyle({
        color: isSelected ? GOLD : NAVY,
        weight: isSelected ? 3 : 1.5,
        opacity: opacityFor(code, isActive),
      });
      marker.setIcon(dot(isSelected ? GOLD : NAVY, isSelected ? 13 : 10));
    });
    if (code !== 'all' && routes[code]) {
      const { lat, lng } = routes[code].marker.getLatLng();
      map.fitBounds([[HUB.lat, HUB.lng], [lat, lng]], { padding: [60, 60] });
    } else {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }

  DESTINATIONS.forEach((d) => {
    const line = L.polyline([[HUB.lat, HUB.lng], [d.lat, d.lng]], {
      color: NAVY, weight: 1.5, opacity: 0.45,
    }).addTo(map);
    const marker = L.marker([d.lat, d.lng], { icon: dot(NAVY, 10), title: `${d.name} (${d.code})` })
      .addTo(map)
      .bindPopup(`<strong>${d.name}</strong><br>Cairo (CAI) → ${d.code}`);
    marker.on('click', () => {
      select.value = d.code;
      highlight(d.code);
      marker.openPopup();
    });
    routes[d.code] = { line, marker };
    bounds.push([d.lat, d.lng]);
  });

  select.addEventListener('change', () => highlight(select.value));

  // Fit the network into view. The block is lazy-decorated, so the container
  // may still be sizing — recalculate size first, then fit, and re-fit once
  // more after layout settles so we never end up zoomed to max over the hub.
  function fitAll() {
    map.invalidateSize();
    map.fitBounds(bounds, { padding: [30, 30] });
  }
  fitAll();
  setTimeout(fitAll, 300);
  if (window.ResizeObserver) {
    let done = false;
    const ro = new ResizeObserver(() => {
      if (done) return;
      if (mapEl.clientHeight > 0) { done = true; fitAll(); }
    });
    ro.observe(mapEl);
  }
}
