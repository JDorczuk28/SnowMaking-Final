const map = L.map('map').setView([38.903145122952374, -106.94432074959053],14)
// set map, zoom limited so you cant scroll to far in or too far out.
L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {minZoom:14, maxZoom:18}).addTo(map);

//uses valve data that was queried in html
const markerData = window.valveData

//function create markers, takes in needed paramaters needed to create html used in the bindPopup function
//sets shape, color, radius and other parameters
function makeMarker({id,name, lat, lng, state, note}){
    const mark = L.circleMarker([lat,lng], {radius: 10, fillColor: "red", color: "black", weight: 1, fillOpacity: 0.9}).addTo(map).bindTooltip(name, {direction: "top", offset:[0,15], className: "marker-title"})
    //mark.valve = { id, name, lat, lng, state, note };
    mark.bindPopup(buildHTML({id, name, lat, long: lng, state, note}))
    mark.on("popupopen", (e) => handlePopup(e.popup.getElement(), mark));
    return mark;
}
//creates markers for every item in markerData (Every valve)
markerData.forEach(makeMarker)

//Follows template to build html for each valve
//unique information is passed through parameters
//creates 3 tabs to be used, air, water and history
//
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
    </div>
`
}
//function to handle tab behavior and button behavior
//takes html DOM element (root element) and marker for the parameters

function handlePopup(e, marker){
    const tabButtons = e.querySelectorAll(".tab-btn")
    const tabPanels = e.querySelectorAll(".tab-panel")

    //arrow functions used to attach click listeners then logic in asynchronous function (needed for await)
    tabButtons.forEach(button => {button.addEventListener("click", async function () {
        //decides what tab
        const tabName = this.dataset.tab;
        //removes active class from all tabs and panels then makes clicked button active and makes matching panel active
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));
        this.classList.add("active")
        const activePanel = e.querySelector(`.tab-panel[data-panel="${tabName}"]`);
        if (activePanel) {
            activePanel.classList.add("active")
        }
        //speical handling for history
        //if history tab, gets data from history table based off ID, and lists history in html
        if (tabName === "history") {
            const id = Number(e.querySelector(".popup-wrap")?.dataset.id);
            const listEl = e.querySelector(".history-list");
            const res = await fetch(`/valve_history/${id}`);
            const data = await res.json();
            const history = data.history
            listEl.innerHTML = history.map(h => `
            <div class="hist">
                <div><b>${h.state ?? ""}</b> — ${h.time ?? ""}</b></div>
                ${h.user ? `<div>By: ${h.user}</div>` : ""}
            </div>
            `).join("")
        }
    })
    })
    //controls save button and attachs click listener, uses async for fetch
    const save = e.querySelector(".save");
    save?.addEventListener("click", async () => {
        const wrap = e.querySelector(".popup-wrap")
        const id = Number(wrap?.dataset.id);

        //pull status and notes from inside active tab, allows to work for all tabs
        const state = e.querySelector(".tab-panel.active .status-select")?.value;
        const note  = e.querySelector(".tab-panel.active .notes")?.value;

        //data thats sent to server
        const postData = {
            id: id,
            state: state,
            note: note,
            time: new Date().toLocaleString()
        }
        //sends http request to flask in JSON form, stores response (doesnt matter not used but should be)
        const res = await fetch('/update_valve', {method: 'POST', headers: { "Content-Type": "application/json"}, body: JSON.stringify(postData)})
        //update marker states
        marker.valve.state = state;
        marker.valve.note = note;
        //rebuilds html to reflect saved value, if it changes, re gets root element and re runs function attach buttons again
        marker.setPopupContent(buildHTML({ ...marker.valve, long: marker.valve.lng }));
        const newEl = marker.getPopup()?.getElement();
        if(newEl){
            handlePopup(newEl, marker)
        }
    })


}

// PUMP HOUSE water line to snowmax and base area
var latlngs = [
    [38.92212358356308, -106.95092218936132],
    [38.92007018178994, -106.94974201739856],
    [38.91934396445631, -106.95403355181423],
    [38.9190267637674, -106.95764916955467],
    [38.917691166312, -106.956941066375390],
    [38.917649428488104, -106.95697325288347],
    [38.91583798327965, -106.95792811928969],
    [38.91370926731311, -106.95687669336209],
    [38.90787525887946, -106.95371358438365],
    [38.902888805097945, -106.95398784576206],
    [38.89981252008462, -106.96205130495868],
    [38.89906642426362, -106.96529507436509]

];

var polyline = L.polyline(latlngs, {color: 'blue'}).addTo(map);

//AIR LINE from snowflake to base area
var latlngs2 = [
    [38.89653608222876, -106.94893806634154],
    [38.89706728486381, -106.94883127504416],
    [38.89744309929405, -106.94939773323028],
    [38.89659300941321, -106.95050768830124],
    [38.89670543922974, -106.95283217083325],
    [38.89856561579149, -106.95423736648704],
    [38.89934237839511, -106.96365349063436],
    [38.89909708585354, -106.9652425436975]
];

var polyline2 = L.polyline(latlngs2, {color: 'red'}).addTo(map);



// water line from snowflake to peanut
var latlngs3 = [
    [38.89653608222876, -106.94893806634154],
    [38.89699501262998, -106.94848304255267],
    [38.897529825418594, -106.9492955850328]
];

var polyline3 = L.polyline(latlngs3, {color: 'blue'}).addTo(map);