const clusters = Object.groupBy(markerData, v => v.cluster);
//reuses makeMarker function with first valve in cluster array
makeMarker({...clusterValves[0], valves: clusterValves}, true)

function buildClusterHtml(cluster) {
    const valves = cluster.valves
    const index = 0
    const tabs = valves.map((v, i) =>
        `<button class="cluster-tab ${i === index ? "active" : ""}" data-tab="${i}">${v.name}</button>
        `).join("")

    const panels = valves.map((v, i) =>
        `<div class="cluster-panel" data-panel="${i}" style="display:${i === index ? 'block' : 'none'};">
            ${buildHTML({ ...v, long: v.lng})}
        </div>`
    ).join("")

    return `
        <div class="cluster-wrap">
            <div class="panel-tabs">${tabs}</div>
            <div class="cluster-container">${panels}</div>
        </div>`
}

//tab switching logic for parent tabs (valve tabs) same logic as in handlePopup()
//sends to handlePopup() once tab is selected
//builds for first in tabPanels by defaultfunction handleClusterPopup(e, marker) {
    const tabButtons = e.querySelectorAll(".cluster-tab");
    const tabPanels = e.querySelectorAll(".cluster-panel");

    tabButtons.forEach(button => button.addEventListener("click", () => {
        tabButtons.forEach(b => b.classList.remove("active"));
        tabPanels.forEach(panel => panel.style.display = "none");
        button.classList.add("active");

        const panel = tabPanels[Number(button.dataset.tab)];
        panel.style.display = "block";

        if (!panel.dataset.ready) {
            // Pass the individual valve's marker data so handlePopup
            // can create a valve-specific mock marker for color updates
            const valveIndex = Number(button.dataset.tab);
            const valveData = marker.options.cluster[valveIndex];
            const valveMarker = createValveProxy(valveData, marker);

            handlePopup(panel, valveMarker);
            panel.dataset.ready = "true";
        }
    }));

    // Initialize first panel by default
    if (tabPanels[0] && !tabPanels[0].dataset.ready) {
        const valveData = marker.options.cluster[0];
        const valveMarker = createValveProxy(valveData, marker);

        handlePopup(tabPanels[0], valveMarker);
        tabPanels[0].dataset.ready = "true";
    }
}

// Creates a proxy object that mimics a single valve marker
// so handlePopup can update state without touching the cluster marker's color
function createValveProxy(valveData, clusterMarker) {
    return {
        valve: {
            id: valveData.id,
            water_state: valveData.water_state,
            air_state: valveData.air_state,
            note: valveData.note,
        },
        options: {}, // no .cluster key = treated as standalone in color logic
        setStyle: () => {} // no-op: cluster marker stays blue, individual valves don't recolor it
    };
}