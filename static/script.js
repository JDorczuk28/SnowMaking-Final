const map = L.map('map').setView([38.899, -106.9653], 14);
L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {minZoom:13, maxZoom:17}).addTo(map)


function buildHTML({lat, long}){
    print("TODO")
}
const popuphtml = `
    <div class="popup-wrap">
        <div class="tab-bar">
            <button class="tab-btn active" data-tab="water">Water</button>
            <button class="tab-btn" data-tab="air">Air</button>
            <button class="tab-btn" data-tab="history">History</button>
        </div>
        
        <div class="tab-panel active" data-panel="water">
            <h4>Water</h4>
            <label>Status</label>
            <select class="status-select">
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
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
            <textarea class="notes" rows="3" placeholder="Notes...."></textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">LAT: 38.899</span>
                    <span class="long">Long: -106.965</span>
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
            <textarea class="notes" rows="3" placeholder="Notes...."></textarea>
            <div class="save-row">
                <button class="save">Save</button>
                <div class="coords">
                    <span class="lat">LAT: 38.899</span>
                    <span class="long">Long: -106.965</span>
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
const testmark = L.marker([38.889, -106.957091]).addTo(map).bindPopup(popuphtml)
testmark.on('popupopen', function(e){
    const popupel = e.popup.getElement();
    handlePopup(popupel)
});

function handlePopup(e){
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
}

        
        
