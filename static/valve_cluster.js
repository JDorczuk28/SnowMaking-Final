const clusterValves = markerData.filter(v => v.cluster == 1)

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
//builds for first in tabPanels by default
function handleClusterPopup(e, marker){
    const tabButtons = e.querySelectorAll(".cluster-tab")
    const tabPanels = e.querySelectorAll(".cluster-panel")

    tabButtons.forEach(button => button.addEventListener("click", () => {
        tabButtons.forEach(button => button.classList.remove("active"));
        tabPanels.forEach(panel => panel.style.display = "none");
        button.classList.add("active");
        const panels = tabPanels[Number(button.dataset.tab)]
        panels.style.display = "block";
        if(!panels.dataset.ready){
            handlePopup(panels, marker)
            panels.dataset.ready = true
        }
    }))
    if(tabPanels[0] && !tabPanels[0].dataset.ready){
        handlePopup(tabPanels[0], marker)
        tabPanels[0].dataset.ready = "true"
    }
}
