async function getHistory(){
    console.log("hello")
    const panel = document.querySelector(".history-panel")
    if (!panel) return;
    if(panel.classList.contains("open")){
        panel.classList.remove("open")
        return
    }
    panel.classList.add("open")
    const res = await fetch("/history")
    const data = await res.json()
    allHist = data.history
    render(allHist)
}

function render(hist){
    console.log(hist)
    const listEl = document.getElementById("history-list");

    listEl.innerHTML = hist.map(h => `
        <div class="hist">
            <b>${h.valve_name.toUpperCase()} - ${h.type} - ${h.state} - ${h.time} - by: ${h.user}</b>
        </div>`).join("")
}
function filterValves(){
    const filterValve = document.getElementById("valveFilter").value
    const filterState = document.querySelector('input[name="filter-state"]:checked')?.value;
    const filterType = document.querySelector('input[name="filter-type"]:checked')?.value;
    console.log(filterValve, filterState, filterType)
    buildFilteredView(filterValve, filterState, filterType)
}
async function buildFilteredView(valve, State, Type){
    const listEl = document.getElementById("history-list");
    const params = new URLSearchParams({valve: valve || "all", state: State || "all", type: Type || "all"})
    const res = await fetch(`/history?${params}`)
    const data = await res.json()
    render(data.history)
}
