//gets valve data from database
const markerData = window.valveData
const standaloneValves = markerData.filter(v => v.cluster == 0)
console.log(standaloneValves)

//function create markers, takes in needed paramaters needed to create html used in the bindPopup function
//sets shape, color, radius and other parameters
function makeMarker({id,name, lat, lng, water_state, air_state, note, valves}, cluster_check=false){
    const mark = L.circleMarker([lat,lng], {radius: 10, fillColor: "red", color: "black", weight: 1, fillOpacity: 0.9}).addTo(map).bindTooltip(name, {direction: "top", offset:[0,15], className: "marker-title"})
    mark.valve = { id, name, lat, lng, water_state, air_state, note };
    if(cluster_check === true){
        mark.options.cluster = valves
        mark.bindPopup(buildClusterHtml({valves}))
        mark.on("popupopen", (e) => handleClusterPopup(e.popup.getElement(), mark));
    }
    else{
        mark.bindPopup(buildHTML({id, name, lat, long: lng, water_state, air_state, note}))
        mark.on("popupopen", (e) => handlePopup(e.popup.getElement(), mark));

    }
    return mark;
}
//creates markers for every item in markerData (Every valve)
standaloneValves.forEach(makeMarker)


//Follows template to build html for each valve
//unique information is passed through parameters
//creates 3 tabs to be used, air, water and history
//
function buildHTML({id, name, lat, long, water_state= "", air_state= "", note = ""}){
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
                <option value="Open" ${water_state==="Open"?"selected":""}>Open</option>
                <option value="Closed" ${water_state==="Closed"?"selected":""}>Closed</option>
                <option value="Cracked" ${water_state==="Cracked"?"selected":""}>Cracked</option>
            </select><br>
            
            <label>Updated by</label>
            <select class="name-select">
                <option value="">Select name…</option>
                <option>Jack</option>
                <option>Dano</option>
                <option>Desmond</option>
            </select><br>
     
            <label>Notes</label>
            <textarea class="notes" rows="3" placeholder="Notes....">${note ?? ""}</textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">${lat},</span>
                    <span class="long">${long}</span>
                </div>
            </div>
            <div class="msg"></div>
        </div>
        
        <div class="tab-panel" data-panel="air">
            <h4>Air</h4>
            <label>Status</label>
            <select class="status-select">
                <option value="Open" ${air_state==="Open"?"selected":""}>Open</option>
                <option value="Closed" ${air_state==="Closed"?"selected":""}>Closed</option>
                <option value="Cracked" ${air_state==="Cracked"?"selected":""}>Cracked</option>
            </select><br>

            <label>Updated by</label>
            <select class="name-select">
                <option value="">Select name…</option>
                <option>Jack</option>
                <option>Dano</option>
                <option>Desmond</option>
            </select><br>
            
        
            <label>Notes</label>
            <textarea class="notes" rows="3" placeholder="Notes....">${note ?? ""}</textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">${lat},</span>
                    <span class="long">${long}</span>
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
    console.log("hello")
    const tabButtons = e.querySelectorAll(".tab-btn")
    const tabPanels = e.querySelectorAll(".tab-panel")

    //arrow functions used to attach click listeners then logic in asynchronous function (needed for await)
    tabButtons.forEach(button => {button.addEventListener("click", async function () {
        //decides what tab
        const tabName = this.dataset.tab;
        //sends to switchTab function to switch tab
        switchTab(e, tabName);
        //speical handling for history
        //if history tab, gets data from history table based off ID, and lists history in html
        if (tabName === "history") {
            History(e)
        }
    })
    })
    //controls save button and attachs click listener, uses async for fetch
    e.querySelectorAll(".save").forEach((btn) => {btn.addEventListener("click", async() => {
        const wrap = e.querySelector(".popup-wrap")
        const id = Number(wrap?.dataset.id);

        //pull status and notes from inside active tab, allows to work for all tabs
        const type = e.querySelector(".tab-panel.active")?.dataset.panel;
        const state = e.querySelector(".tab-panel.active .status-select")?.value;
        const note  = e.querySelector(".tab-panel.active .notes")?.value;
        const user = e.querySelector(".tab-panel.active .name-select")?.value;
        //data thats sent to server
        const postData = {
            id: id,
            state: state,
            note: note,
            time: new Date().toLocaleString(),
            user: user,
            type: type
        }
        //sends http request to flask in JSON form, stores response (doesnt matter not used but should be)
        const res = await fetch('/update_valve', {method: 'POST', headers: { "Content-Type": "application/json"}, body: JSON.stringify(postData)})
        //update marker states
        if(type === "water"){
            marker.valve.water_state = state
        }else if(type === "air"){
            marker.valve.air_state = state
        }
        marker.valve.note = note;
        //rebuilds html to reflect saved value, if it changes, re gets root element and re runs function attach buttons again
        if(marker.options && marker.options.cluster){
            marker.setPopupcontent(buildClusterHtml({valves: marker.options.cluster}))
            const newEl = marker.getPopup().getElement()
            if(newEl){
                handleClusterPopup(newEl, marker)
        }else{
            marker.setPopupcontent(buildHTML({...marker.valve, long: marker.valve.lng}))
            const newEl = marker.getPopup.getElement()
            if(newEl){
                handlePopup(newEl, marker)
            }
        }
        }
    })})
}

// History Function
// Async function (needed for await), takes in html root element as parameter and finds history list
// fetches need info from history database
// updates innerHTML to display history
async function History(e){
        const id = Number(e.querySelector(".popup-wrap").dataset.id)
        const listEl = e.querySelector(".history-list")
        const res = await fetch(`/valve_history/${id}`)
        const data = await res.json()
        const history = data.history
        listEl.innerHTML = history.map(h => `
            <div class="hist">
                <b>${h.type.toUpperCase()} - ${h.state} - ${h.time} - by: ${h.user}</b>
            </div>`).join("")
}

//Function to switch tabs, takes in html root element and tab name as parameters
//Removes active class from all tabs and panels, adds active class to the tab and panel that matches the tab name
function switchTab(e, tabName){
    const tabButtons = e.querySelectorAll(".tab-btn")
    const tabPanels = e.querySelectorAll(".tab-panel")
    tabButtons.forEach(button => button.classList.remove("active"));
    tabPanels.forEach(panel => panel.classList.remove("active"));
    e.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add("active")
    e.querySelector(`.tab-panel[data-panel="${tabName}"]`).classList.add("active")
}

