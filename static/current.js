// Access the data we injected in index.html
///UNUSED
const valves = window.valveData;

// Initialize Map
const map = L.map('map').setView([38.899, -106.9653], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Add Markers
valves.forEach(valve => {
    if (valve.lat && valve.lng) {
        const popupContent = `
            <div class="popup-box">
                <strong>${valve.name}</strong><br>
                Status: <b id="state-${valve.id}" style="color:${valve.state === "OPEN" ? "green" : "red"};">
                    ${valve.state}
                </b><br>
                <button onclick="updateValve(${valve.id}, 'OPEN')">Open</button>
                <button onclick="updateValve(${valve.id}, 'CLOSED')">Close</button>
            </div>
        `;

        L.marker([valve.lat, valve.lng])
            .addTo(map)
            .bindPopup(popupContent);
    }
});

// Update Function
function updateValve(id, newState) {
    fetch('/update_valve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: id,
            state: newState,
            time: new Date().toLocaleString()
        })
    })
    .then(res => res.json())
    .then(data => {
        if(data.status === "updated") {
            const el = document.getElementById("state-" + id);
            if(el) {
                el.innerText = newState;
                el.style.color = (newState === "OPEN") ? "green" : "red";
            }
        }
    });
}