/**
 * valves.js - FINAL VERSION
 */

// --- 1. DATA INITIALIZATION ---
const markerData = window.valveData;

// Filter for valves
const standaloneValves = markerData.filter(v => v.cluster === 0 || v.cluster === null);
const clusterIds = [...new Set(markerData.map(v => v.cluster))].filter(id => id > 0);

// --- 2. MARKER GENERATION ---

function makeMarker(data, isCluster = false) {
    const { id, name, lat, lng, water_state, air_state, note, valves } = data;

    if (lat === undefined || lng === undefined) return null;

    const stateColors = {
        "Open": "#2ecc71",
        "Closed": "#e74c3c",
        "Cracked": "#f39c12"
    };

    let markerColor = "grey";
    if (isCluster) {
        markerColor = "#3498db";
    } else if (water_state === "Open" || air_state === "Open") {
        markerColor = stateColors["Open"];
    } else if (water_state === "Cracked") {
        markerColor = stateColors["Cracked"];
    } else {
        markerColor = stateColors["Closed"];
    }

    // Create the marker
    const mark = L.circleMarker([lat, lng], {
        radius: isCluster ? 14 : 10,
        fillColor: markerColor,
        color: "white",
        weight: 2,
        fillOpacity: 1.0,
        interactive: true // CRITICAL: Ensures the marker reacts to clicks
    }).addTo(map);

    // Bind Tooltip (Hover text)
    mark.bindTooltip(name, {
        direction: "top",
        offset: [0, -10],
        className: "marker-title"
    });

    // Attach data to marker object
    mark.valve = { id, name, lat, lng, water_state, air_state, note };

    // Bind Popups based on type
    if (isCluster && valves) {
        mark.options.cluster = valves;
        mark.bindPopup(buildClusterHtml({ valves }));
        mark.on("popupopen", (e) => handleClusterPopup(e.popup.getElement(), mark));
    } else {
        mark.bindPopup(buildHTML({ id, name, lat, long: lng, water_state, air_state, note }));
        mark.on("popupopen", (e) => handlePopup(e.popup.getElement(), mark));
    }

    return mark;
} // <--- CLOSED PROPERLY NOW

// --- 3. DRAWING COMMANDS ---

// We wrap this in a check to ensure 'map' exists
if (typeof map !== 'undefined') {
    standaloneValves.forEach(v => makeMarker(v, false));

    clusterIds.forEach(id => {
        const valvesInThisCluster = markerData.filter(v => v.cluster === id);
        if (valvesInThisCluster.length > 0) {
            makeMarker({
                ...valvesInThisCluster[0],
                valves: valvesInThisCluster,
                name: `Group: ${valvesInThisCluster[0].name.split(' ')[0]} Area`
            }, true);
        }
    });
} else {
    console.error("Leaflet 'map' object not found. Make sure map is initialized before valves.js runs.");
}

// --- 4. HTML BUILDERS ---

function buildHTML({ id, name, lat, long, water_state = "", air_state = "", note = "" }) {
    return `
    <div class="popup-wrap" data-id="${id}" style="min-width: 200px;">
        <div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid #eee;">${name}</div>
        <div class="tab-bar" style="display:flex; gap:5px; margin-bottom:10px;">
            <button class="tab-btn active" data-tab="water">Water</button>
            <button class="tab-btn" data-tab="air">Air</button>
            <button class="tab-btn" data-tab="history">Hist</button>
        </div>

        <div class="tab-panel active" data-panel="water">
            <label>Status</label>
            <select class="status-select" style="width:100%">${["Open", "Closed", "Cracked"].map(s => `<option value="${s}" ${water_state===s?'selected':''}>${s}</option>`).join('')}</select>
            <textarea class="notes" placeholder="Notes..." style="width:100%; margin-top:5px;">${note ?? ""}</textarea>
            <button class="save" style="width:100%; margin-top:5px; background:#2ecc71; color:white; border:none; padding:5px;">Save</button>
        </div>

        <div class="tab-panel" data-panel="air" style="display:none;">
            <label>Air Status</label>
            <select class="status-select" style="width:100%"><option value="Open" ${air_state==='Open'?'selected':''}>Open</option><option value="Closed" ${air_state==='Closed'?'selected':''}>Closed</option></select>
            <button class="save" style="width:100%; margin-top:5px; background:#2ecc71; color:white; border:none; padding:5px;">Save</button>
        </div>

        <div class="tab-panel" data-panel="history" style="display:none;">
            <div class="history-list" style="max-height:100px; overflow-y:auto; font-size:0.8em;">Loading...</div>
        </div>
    </div>`;
}

function buildClusterHtml({ valves }) {
    const options = valves.map((v, i) => `<option value="${i}">${v.name}</option>`).join("");
    const panels = valves.map((v, i) =>
        `<div class="cluster-panel" data-panel="${i}" style="display:${i === 0 ? 'block' : 'none'};">
            ${buildHTML({ ...v, long: v.lng })}
        </div>`
    ).join("");

    return `
        <div class="cluster-wrap" style="width:220px;">
            <select class="cluster-dropdown" style="width:100%; margin-bottom:10px;">${options}</select>
            <div class="cluster-container">${panels}</div>
        </div>`;
}

// --- 5. EVENT HANDLERS ---
function handlePopup(e, marker) {
    // 1. Tab switching logic
    e.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", function() {
            e.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            e.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");

            this.classList.add("active");
            const target = e.querySelector(`.tab-panel[data-panel="${this.dataset.tab}"]`);
            target.style.display = "block";

            if (this.dataset.tab === "history") fetchHistory(e);
        });
    });

    // 2. Save functionality with Priority Color Logic
    e.querySelectorAll(".save").forEach(btn => {
        btn.addEventListener("click", async () => {
            const wrap = e.closest(".popup-wrap") || e.querySelector(".popup-wrap");
            const panel = btn.closest(".tab-panel");

            const postData = {
                id: Number(wrap.dataset.id),
                state: panel.querySelector(".status-select").value,
                note: panel.querySelector(".notes")?.value || "",
                type: panel.dataset.panel, // "water" or "air"
                time: new Date().toLocaleString(),
                user: "Staff"
            };

            // Send update to Database
            await fetch('/update_valve', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(postData)
            });

            // Update the local data object for THIS marker
            if (postData.type === "water") {
                marker.valve.water_state = postData.state;
            } else {
                marker.valve.air_state = postData.state;
            }
            marker.valve.note = postData.note;

            // --- PRIORITY COLOR LOGIC ---
            const stateColors = {
                "Open": "#2ecc71",   // Green
                "Closed": "#e74c3c", // Red
                "Cracked": "#f39c12" // Orange
            };

            let newColor = "grey";

            // Check if it's a cluster first
            if (marker.options && marker.options.cluster) {
                newColor = "#3498db";
            }
            // Priority 1: Is Water OR Air Open? -> Green
            else if (marker.valve.water_state === "Open" || marker.valve.air_state === "Open") {
                newColor = stateColors["Open"];
            }
            // Priority 2: Is Water Cracked? -> Orange
            else if (marker.valve.water_state === "Cracked") {
                newColor = stateColors["Cracked"];
            }
            // Priority 3: Everything else -> Red
            else {
                newColor = stateColors["Closed"];
            }

            // Apply the new color to the map marker instantly
            marker.setStyle({ fillColor: newColor });

            alert(`${marker.valve.name} Updated!`);
        });
    });
}

function handleClusterPopup(e, marker) {
    const dropdown = e.querySelector(".cluster-dropdown");
    const tabPanels = e.querySelectorAll(".cluster-panel");

    dropdown.addEventListener("change", (event) => {
        const selectedIndex = event.target.value;
        tabPanels.forEach((panel, i) => {
            panel.style.display = (i == selectedIndex) ? "block" : "none";
            if (i == selectedIndex && !panel.dataset.ready) {
                handlePopup(panel, marker);
                panel.dataset.ready = "true";
            }
        });
    });

    if (tabPanels[0] && !tabPanels[0].dataset.ready) {
        handlePopup(tabPanels[0], marker);
        tabPanels[0].dataset.ready = "true";
    }
}

async function fetchHistory(e) {
    const wrap = e.closest(".popup-wrap") || e.querySelector(".popup-wrap");
    const id = Number(wrap.dataset.id);
    const listEl = e.querySelector(".history-list");

    const res = await fetch(`/valve_history/${id}`);
    const data = await res.json();
    listEl.innerHTML = data.history.length ? data.history.map(h =>
        `<div style="border-bottom:1px solid #eee;"><b>${h.state}</b><br><small>${h.time}</small></div>`
    ).join("") : "No history.";
}
