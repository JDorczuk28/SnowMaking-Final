
    const map = L.map('map').setView([38.903145122952374, -106.94432074959053],14)
    L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {minZoom:15, maxZoom:18}).addTo(map);
    function switchTab(tab){
        const water = document.getElementById("water-tab");
        const air = document.getElementById("air-tab");
        if(tab == "water"){
            water.style.display = "block";
            air.style.display = "none";
        } else {
            water.style.display = "none";
            air.style.display = "block"
        }
    }

// MARKER AT EAST RIVER PUMP HOUSE
L.circleMarker([38.92212358356308, -106.95092218936132], {
    radius: 20,
    fillColor: "red",
    color: "black",
    weight: 1,
    fillOpacity: 0.9
})
.addTo(map)
.bindTooltip("EAST RIVER PUMP HOUSE", {
    permanent: true,
    direction: "top",
    offset: [0, -15],
    className: "marker-title"
})
.bindPopup(`
    <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
        EAST RIVER PUMP HOUSE
    </div>
    <div style="display:flex;">
        <button onclick="switchTab('water')">Water</button>
        <button onclick="switchTab('air')">Air</button>
    </div>

    <div id="water-tab">
        <div style="font-weight:bold;">Valve #24</div>
        Status: <b style="color:red;">CLOSED</b><br>
        Pressure: 120 PSI
    </div>

    <div id="air-tab" style="display:none;">
        <div style="font-weight:bold;">Air Line #24</div>
        Status: <b style="color:green;">OPEN</b><br>
        Pressure: 120 PSI
    </div>
`, {
    maxWidth: 900,
    minWidth: 800,
    className: 'big-popup'
});

//MARKER AT FLEET MAINT SHOP
            L.circleMarker([38.9190267637674, -106.95764916955467], {
                radius: 20,
                fillColor: "red",
                color: "black",
                weight: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindTooltip("FLEET MAINT SHOP", {
                permanent: true,
                direction: "top",
                offset: [0, -15],
                className: "marker-title"
            })
            .bindPopup(`
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
            FLEET MAINT SHOP
            </div>
            <div style="display:flex;">
                <button onclick="switchTab('water')">Water</button>
                <button onclick="switchTab('air')">Air</button>
            </div>

            <div id="water-tab">
                <div style="font-weight:bold;">Valve #21</div>
                Status: <b style="color:red;">CLOSED</b><br>
                Pressure: 120 PSI
            </div>

            <div id="air-tab" style="display:none;">
                <div style="font-weight:bold;">Air Line #21</div>
                Status: <b style="color:green;">OPEN</b><br>
                Pressure: 120 PSI
            </div>
        </div>

    `        ,{
            maxWidth: 900,
            minWidth: 800,
            className: 'big-popup'
        });

//MARKER AT SNOWFLAKE CONTROL
        L.circleMarker([38.896496332211925, -106.94899842664006], {
                radius: 30,
                fillColor: "green",
                color: "black",
                weight: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindTooltip("SNOWFLAKE CONTROL", {
                permanent: true,
                direction: "top",
                offset: [0, -15],
                className: "marker-title"
            })

            .bindPopup(`
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
            SNOWFLAKE CONTROL
            </div>
            <div style="display:flex;">
                <button onclick="switchTab('water')">Water</button>
                <button onclick="switchTab('air')">Air</button>
            </div>

            <div id="water-tab">
                <div style="font-weight:bold;">Valve #22</div>
                Status: <b style="color:red;">CLOSED</b><br>
                Pressure: 120 PSI
            </div>

            <div id="air-tab" style="display:none;">
                <div style="font-weight:bold;">Air Line #22</div>
                Status: <b style="color:green;">OPEN</b><br>
                Pressure: 120 PSI
            </div>
        </div>

    `                ,{
            maxWidth: 900,
            minWidth: 800,
            className: 'big-popup'
        });
//MAKER At bottom of GODLINK
        L.circleMarker([38.91370926731311, -106.95687669336209], {
                radius: 20,
                fillColor: "red",
                color: "black",
                weight: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindTooltip("GOLDLINK BOTTOM", {
                permanent: true,
                direction: "top",
                offset: [0, -15],
                className: "marker-title"
            })
            .bindPopup(`
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
            GOLDLINK
            </div>
            <div style="display:flex;">
                <button onclick="switchTab('water')">Water</button>
                <button onclick="switchTab('air')">Air</button>
            </div>

            <div id="water-tab">
                <div style="font-weight:bold;">Valve #22</div>
                Status: <b style="color:red;">CLOSED</b><br>
                Pressure: 120 PSI
            </div>

            <div id="air-tab" style="display:none;">
                <div style="font-weight:bold;">Air Line #22</div>
                Status: <b style="color:green;">OPEN</b><br>
                Pressure: 120 PSI
            </div>
        </div>

    `                ,{
            maxWidth: 900,
            minWidth: 800,
            className: 'big-popup'
        });
//MARKER at SNOWMAX building
            L.circleMarker([38.90787525887946, -106.95371358438365], {
                radius: 20,
                fillColor: "red",
                color: "black",
                weight: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindTooltip("SNOWMAX BUILDING", {
                permanent: true,
                direction: "top",
                offset: [0, -15],
                className: "marker-title"
            })
            .bindPopup(`
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
            SNOWMAX BUILDING
            </div>
            <div style="display:flex;">
                <button onclick="switchTab('water')">Water</button>
                <button onclick="switchTab('air')">Air</button>
            </div>

            <div id="water-tab">
                <div style="font-weight:bold;">Valve #21</div>
                Status: <b style="color:red;">CLOSED</b><br>
                Pressure: 120 PSI
            </div>

            <div id="air-tab" style="display:none;">
                <div style="font-weight:bold;">Air Line #21</div>
                Status: <b style="color:green;">OPEN</b><br>
                Pressure: 120 PSI
            </div>
        </div>

    `        ,{
            maxWidth: 900,
            minWidth: 800,
            className: 'big-popup'
        });



//MARKER at  REDLADY
            L.circleMarker([38.89909708585354, -106.9652425436975], {
                radius: 20,
                fillColor: "red",
                color: "black",
                weight: 1,
                fillOpacity: 0.9
            }).addTo(map)
            .bindTooltip("REDLADY VALVE", {
                permanent: true,
                direction: "top",
                offset: [0, -15],
                className: "marker-title"
            })
            .bindPopup(`
            <div style="font-size:20px;font-weight:bold;margin-bottom:8px;">
            SNOWMAX BUILDING
            </div>
            <div style="display:flex;">
                <button onclick="switchTab('water')">Water</button>
                <button onclick="switchTab('air')">Air</button>
            </div>

            <div id="water-tab">
                <div style="font-weight:bold;">Valve #21</div>
                Status: <b style="color:red;">CLOSED</b><br>
                Pressure: 120 PSI
            </div>

            <div id="air-tab" style="display:none;">
                <div style="font-weight:bold;">Air Line #21</div>
                Status: <b style="color:green;">OPEN</b><br>
                Pressure: 120 PSI
            </div>
        </div>

    `        ,{
            maxWidth: 900,
            minWidth: 800,
            className: 'big-popup'
        });
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