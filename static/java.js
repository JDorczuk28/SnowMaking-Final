const map = L.map('map').setView([38.903145122952374, -106.94432074959053],14)
L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {minZoom:15, maxZoom:18}).addTo(map);


/*const markerData = [{ name: "EAST RIVER PUMP HOUSE", lat: 38.92212358356308, lng: -106.95092218936132},
  { name: "FLEET MAINT SHOP",      lat: 38.9190267637674,  lng: -106.95764916955467},
  { name: "SNOWFLAKE CONTROL",     lat: 38.896496332211925,lng: -106.94899842664006},
  { name: "GOLDLINK BOTTOM",       lat: 38.91370926731311, lng: -106.95687669336209},
  { name: "SNOWMAX BUILDING",      lat: 38.90787525887946, lng: -106.95371358438365,},
  { name: "REDLADY VALVE",         lat: 38.89909708585354, lng: -106.9652425436975},]
*/
const markerData = window.valveData

function makeMarker({id,name, lat, lng, state, note}){
    const mark = L.circleMarker([lat,lng], {radius: 20, fillColor: "red", color: "black", weight: 1, fillOpacity: 0.9}).addTo(map).bindTooltip(name, {direction: "top", offset:[0,15], className: "marker-title"})
    mark.valve = { id, name, lat, lng, state, note };
    mark.bindPopup(buildHTML({id, name, lat, long: lng, state, note}))
    mark.on("popupopen", (e) => handlePopup(e.popup.getElement(), mark));
    return mark;
}
markerData.forEach(makeMarker)

function buildHTML({id, name, lat, long, state= "", note = ""}){
    return `
    <div class="popup-wrap" data-id="${id}">
        <div style="font-weight:bold;margin-bottom:6px;">${name}</div>
        <div class="tab-bar">
            <button class="tab-btn active" data-tab="water">Water</button>
            <button class="tab-btn" data-tab="air">Air</button>
            <button class="tab-btn" data-tab="history">History</button>
        </div>
        
        <div class="tab-panel active" data-panel="water">
            <h4>Water</h4>
            <label>Status</label>
            <select class="status-select">
                <option value="Open" ${state==="Open"?"selected":""}>Open</option>
                <option value="Closed" ${state==="Closed"?"selected":""}>Closed</option>
                <option value="Cracked" ${state==="Cracked"?"selected":""}>Cracked</option>
            </select>
            
            <label>Updated by</label>
            <select class="name-select">
                <option value="">Select name…</option>
                <option>Jack</option>
                <option>Dano</option>
                <option>Desmond</option>
            </select>
     
            <label>Notes</label>
            <textarea class="notes" rows="3" placeholder="Notes....">${note ?? ""}</textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">LAT: ${lat}</span>
                    <span class="long">Long: ${long}</span>
                </div>
            </div>
            <div class="msg"></div>
        </div>
        
        <div class="tab-panel" data-panel="air">
            <h4>Air</h4>
            <label>Status</label>
            <select class="status-select">
                <option value="Open">Open</option>
                <option value="Closed">Clased</option>
                <option value="Cracked">Cracked</option>
            </select>
            
            <label>Updated by</label>
            <select class="name-select">
                <option value="">Select name…</option>
                <option>Jack</option>
                <option>Dano</option>
                <option>Desmond</option>
            </select>
        
        
            <label>Notes</label>
            <textarea class="notes" rows="3" placeholder="Notes....">${note ?? ""}</textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">LAT: ${lat}</span>
                    <span class="long">Long: ${long}</span>
                </div>
            </div>
            <div class="msg"></div>
            
        </div>
        <div class="tab-panel" data-panel="history">
            <h4>History</h4>
            <div class="history-list"></div>
        </div>
    </div>`
}
function handlePopup(e, marker){
    const tabButtons = e.querySelectorAll(".tab-btn")
    const tabPanels = e.querySelectorAll(".tab-panel")

    tabButtons.forEach(button => {button.addEventListener("click", function(){
        const tabName = this.dataset.tab;
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));
        this.classList.add("active")
        const activePanel = e.querySelector(`.tab-panel[data-panel="${tabName}"]`);
        if(activePanel){
            activePanel.classList.add("active")
        }
        })
    })

    const save = e.querySelector(".save");
    save?.addEventListener("click", async () => {
        const wrap = e.querySelector(".popup-wrap")
        const id = Number(wrap?.dataset.id);

        const state = e.querySelector(".tab-panel.active .status-select")?.value;
        const note  = e.querySelector(".tab-panel.active .notes")?.value;

        const postData = {
            id: id,
            state: state,
            note: note,
            time: new Date().toLocaleString()
        }
        const res = await fetch('/update_valve', {method: 'POST', headers: { "Content-Type": "application/json"}, body: JSON.stringify(postData)})
        marker.valve.state = state;
        marker.valve.note = note;
        marker.setPopupContent(buildHTML({ ...marker.valve, long: marker.valve.lng }));
    })
}