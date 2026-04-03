/**
 * valves.js - FINAL VERSION
 */

// --- 1. DATA INITIALIZATION ---
const markerData = window.valveData;

let usersList = [];

async function loadUsers() {
    try {
        const res = await fetch('/users');
        const data = await res.json();
        usersList = data.users || [];
    } catch (err) {
        console.error("Failed to load users:", err);
        usersList = [];
    }
}

// Separate standalone valves (cluster 0 or null) from clustered ones
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

    // Clusters are always blue; standalone valves reflect their water/air state
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

    const mark = L.circleMarker([lat, lng], {
        radius: isCluster ? 14 : 10,
        fillColor: markerColor,
        color: "white",
        weight: 2,
        fillOpacity: 1.0,
        interactive: true
    }).addTo(map);

    mark.bindTooltip(name, {
        direction: "top",
        offset: [0, -10],
        className: "marker-title"
    });

    // Store valve state on the marker for later reference
    mark.valve = { id, name, lat, lng, water_state, air_state, note };

    if (isCluster && valves) {
        // Cluster marker: store all child valves and build cluster popup
        mark.options.cluster = valves;
        mark.bindPopup(buildClusterHtml({ valves }));
        mark.on("popupopen", (e) => handleClusterPopup(e.popup.getElement(), mark));
    } else {
        // Standalone marker: build single valve popup
        mark.bindPopup(buildHTML({ id, name, lat, long: lng, water_state, air_state, note }));
        mark.on("popupopen", (e) => handlePopup(e.popup.getElement(), mark));
        // Admin GPS edit context menu (right-click)
        if (window.attachAdminContextMenu) {
            window.attachAdminContextMenu(mark, id, name);
        }
    }

    return mark;
}

// --- 3. DRAWING COMMANDS ---

if (typeof map !== 'undefined') {
    // Draw all standalone valves
    standaloneValves.forEach(v => makeMarker(v, false));

    // Draw one cluster marker per cluster ID using the first valve's coordinates
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
    console.error("Leaflet 'map' object not found.");
}

// --- 4. HTML BUILDERS ---

// Builds the popup HTML for a single valve with Water, Air, and History tabs
function buildHTML({ id, name, lat, long, water_state = "", air_state = "", note = "" }) {
    return `
    <div class="popup-wrap" data-id="${id}" style="min-width: 200px;">
        <div style="font-weight:bold;margin-bottom:6px;border-bottom:1px solid #eee;">${name}</div>

        <label>User</label>
        <select class="users" style="width:100%; margin-bottom:8px;">
            <option value="">-- Select User --</option>
        </select>

        <div class="tab-bar" style="display:flex; gap:5px; margin-bottom:10px;">
            <button class="tab-btn active" data-tab="water">Water</button>
            <button class="tab-btn" data-tab="air">Air</button>
            <button class="tab-btn" data-tab="history">Hist</button>
        </div>

        <div class="tab-panel active" data-panel="water">
            <label>Status</label>
            <select class="status-select" style="width:100%">
                ${["Open", "Closed", "Cracked"].map(s => `<option value="${s}" ${water_state === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
            <textarea class="notes" placeholder="Notes..." style="width:100%; margin-top:5px;"></textarea>
            <button class="save" style="width:100%; margin-top:5px; background:#2ecc71; color:white; border:none; padding:5px;">Save</button>
        </div>

        <div class="tab-panel" data-panel="air" style="display:none;">
            <label>Air Status</label>
            <select class="status-select" style="width:100%">
                <option value="Open" ${air_state === 'Open' ? 'selected' : ''}>Open</option>
                <option value="Closed" ${air_state === 'Closed' ? 'selected' : ''}>Closed</option>
            </select>
            <textarea class="notes" placeholder="Notes..." style="width:100%; margin-top:5px;"></textarea>
            <button class="save" style="width:100%; margin-top:5px; background:#2ecc71; color:white; border:none; padding:5px;">Save</button>
        </div>

        <div class="tab-panel" data-panel="history" style="display:none;">
            <div class="history-list" style="max-height:150px; overflow-y:auto; font-size:0.8em;">Loading...</div>
        </div>
    </div>`;
}

// Builds the popup HTML for a cluster marker with a dropdown to switch between valves
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

// Handles all interactivity for a single valve popup:
// - Populates user dropdown
// - Fetches latest water_note, air_note, water_state, air_state from DB
// - Tab switching (Water / Air / History)
// - Save button
function handlePopup(e, marker) {
    // Populate the user dropdown from the cached usersList
    const userSelect = e.querySelector(".users");
    if (userSelect && usersList.length > 0) {
        usersList.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.name;
            opt.textContent = u.name;
            userSelect.appendChild(opt);
        });
    }

    // Fetch the latest valve state and notes from the DB
    const wrap = e.querySelector(".popup-wrap") ?? e.closest(".popup-wrap");
    const valveId = Number(wrap?.dataset.id);

    if (valveId) {
        fetch(`/valve_data/${valveId}`)
            .then(res => res.json())
            .then(data => {
                const waterPanel = e.querySelector('.tab-panel[data-panel="water"]');
                const airPanel   = e.querySelector('.tab-panel[data-panel="air"]');

                // Water tab gets its own note and state
                if (waterPanel) {
                    const notesEl  = waterPanel.querySelector(".notes");
                    const statusEl = waterPanel.querySelector(".status-select");
                    if (notesEl)  notesEl.value  = data.water_note  || "";
                    if (statusEl) statusEl.value = data.water_state || "Closed";
                }

                // Air tab gets its own note and state
                if (airPanel) {
                    const notesEl  = airPanel.querySelector(".notes");
                    const statusEl = airPanel.querySelector(".status-select");
                    if (notesEl)  notesEl.value  = data.air_note  || "";
                    if (statusEl) statusEl.value = data.air_state || "Closed";
                }
            })
            .catch(err => console.error("Failed to load valve data:", err));
    }

    // Tab switching: Water / Air / History
    e.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            // Deactivate all tabs and hide all panels
            e.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            e.querySelectorAll(".tab-panel").forEach(p => p.style.display = "none");

            // Activate clicked tab and show its panel
            this.classList.add("active");
            const target = e.querySelector(`.tab-panel[data-panel="${this.dataset.tab}"]`);
            if (target) target.style.display = "block";

            // Fetch and render history when the history tab is clicked
            if (this.dataset.tab === "history") fetchHistory(e);
        });
    });

    // Save button: posts state, note, type, user, and time to the backend
    e.querySelectorAll(".save").forEach(btn => {
        btn.addEventListener("click", async () => {
            const wrap = e.querySelector(".popup-wrap") ?? e.closest(".popup-wrap");
            const panel = btn.closest(".tab-panel");

            if (!wrap || !panel) return;

            const valveId   = Number(wrap.dataset.id);
            const panelType = panel.dataset.panel; // "water" or "air"

            const selectedUser = wrap.querySelector(".users")?.value || "";

            if (!selectedUser) {
                alert("Please select a user before saving.");
                return;
            }

            const postData = {
                id:    valveId,
                state: panel.querySelector(".status-select").value,
                note:  panel.querySelector(".notes")?.value || "",
                type:  panelType,
                time:  new Date().toLocaleString(),
                user:  selectedUser
            };

            try {
                const res = await fetch('/update_valve', {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(postData)
                });

                if (res.ok) {
                    // Update the in-memory marker state so color reflects latest save
                    if (postData.type === "water") {
                        marker.valve.water_state = postData.state;
                    } else {
                        marker.valve.air_state = postData.state;
                    }
                    marker.valve.note = postData.note;

                    const stateColors = {
                        "Open": "#2ecc71",
                        "Closed": "#e74c3c",
                        "Cracked": "#f39c12"
                    };

                    // Cluster markers stay blue; standalone markers reflect valve state
                    let newColor = "grey";
                    if (marker.options?.cluster) {
                        newColor = "#3498db";
                    } else if (marker.valve.water_state === "Open" || marker.valve.air_state === "Open") {
                        newColor = stateColors["Open"];
                    } else if (marker.valve.water_state === "Cracked") {
                        newColor = stateColors["Cracked"];
                    } else {
                        newColor = stateColors["Closed"];
                    }

                    marker.setStyle({ fillColor: newColor });

                    btn.textContent = "Saved!";
                    setTimeout(() => btn.textContent = "Save", 1500);
                }
            } catch (err) {
                console.error("Save failed:", err);
                btn.textContent = "Error!";
                setTimeout(() => btn.textContent = "Save", 1500);
            }
        });
    });
}

// Handles the cluster popup dropdown:
// - Switches between valve panels when dropdown changes
// - Initializes handlePopup() for each panel the first time it's shown
function handleClusterPopup(e, marker) {
    const dropdown  = e.querySelector(".cluster-dropdown");
    const tabPanels = e.querySelectorAll(".cluster-panel");

    dropdown.addEventListener("change", (event) => {
        const selectedIndex = event.target.value;

        // Show only the selected panel
        tabPanels.forEach((panel, i) => {
            panel.style.display = (i == selectedIndex) ? "block" : "none";

            // Initialize popup logic the first time a panel is shown
            if (i == selectedIndex && !panel.dataset.ready) {
                handlePopup(panel, marker);
                panel.dataset.ready = "true";
            }
        });
    });

    // Initialize the first panel by default on popup open
    if (tabPanels[0] && !tabPanels[0].dataset.ready) {
        handlePopup(tabPanels[0], marker);
        tabPanels[0].dataset.ready = "true";
    }
}

// Fetches valve history from the backend and renders it split into
// Water and Air columns inside the history tab
async function fetchHistory(e) {
    const wrap   = e.querySelector(".popup-wrap") ?? e.closest(".popup-wrap");
    const id     = Number(wrap?.dataset.id);
    const listEl = e.querySelector(".history-list");

    if (!id) {
        if (listEl) listEl.innerHTML = "Could not load history (no ID).";
        return;
    }

    if (listEl) listEl.innerHTML = "Loading...";

    try {
        const res  = await fetch(`/valve_history/${id}`);
        const data = await res.json();

        if (!data.history.length) {
            listEl.innerHTML = "No history yet.";
            return;
        }

        // Split history into water and air entries
        const waterHistory = data.history.filter(h => h.type === "water");
        const airHistory   = data.history.filter(h => h.type === "air");

        // Renders a list of history entries or a fallback message
        const renderEntries = (entries) =>
            entries.length ? entries.map(h => `
                <div style="border-bottom:1px solid #eee; padding: 3px 0;">
                    <b>${h.state}</b>
                    ${h.note ? `<span style="color:#555;"> — ${h.note}</span>` : ""}
                    <br>
                    <small>${h.time}</small><br>
                    <small>User: ${h.user}</small>
                </div>
            `).join("") : `<div style="color:#aaa; font-size:0.8em;">No history yet.</div>`;

        // Render water and air history side by side
        listEl.innerHTML = `
            <div style="display:flex; gap:8px;">
                <div style="flex:1;">
                    <div style="font-weight:bold; margin-bottom:4px; font-size:0.85em; border-bottom:1px solid #ddd;">💧 Water</div>
                    <div style="max-height:150px; overflow-y:auto; font-size:0.8em;">
                        ${renderEntries(waterHistory)}
                    </div>
                </div>
                <div style="flex:1;">
                    <div style="font-weight:bold; margin-bottom:4px; font-size:0.85em; border-bottom:1px solid #ddd;">💨 Air</div>
                    <div style="max-height:150px; overflow-y:auto; font-size:0.8em;">
                        ${renderEntries(airHistory)}
                    </div>
                </div>
            </div>
        `;

    } catch (err) {
        if (listEl) listEl.innerHTML = "Failed to load history.";
        console.error("fetchHistory error:", err);
    }
}

// --- INIT ---
loadUsers();