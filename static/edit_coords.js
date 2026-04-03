// edit_coords.js  — admin GPS coordinate editor
// Depends on: Leaflet (L), window.isAdmin, window.map

(function () {
    if (!window.isAdmin) return;

    // ── Modal markup
    const modal = document.createElement('div');
    modal.id = 'coord-modal';
    modal.innerHTML = `
        <div id="coord-backdrop"></div>
        <div id="coord-dialog">
            <h3 id="coord-title">Edit GPS Coordinates</h3>
            <p id="coord-valve-name" style="margin:0 0 14px;"></p>

            <label>Latitude
                <input type="number" id="coord-lat" step="0.000001" />
            </label>
            <label>Longitude
                <input type="number" id="coord-lng" step="0.000001" />
            </label>

            <p class="coord-hint">
                Tip: you can also drag the marker on the map — coordinates update live.
            </p>

            <div id="coord-actions">
                <button id="coord-cancel">Cancel</button>
                <button id="coord-save">Save</button>
            </div>
            <p id="coord-status"></p>
        </div>
    `;
    document.body.appendChild(modal);

    // ── Styles───────
    const style = document.createElement('style');
    style.textContent = `
        #coord-modal { display:none; }
        #coord-modal.open { display:block; }

        #coord-backdrop {
            position:fixed; inset:0;
            background:rgba(0,0,0,.45);
            z-index:2000;
        }
        #coord-dialog {
            position:fixed;
            top:50%; left:50%;
            transform:translate(-50%,-50%);
            z-index:2001;
            background:#fff;
            border-radius:10px;
            padding:24px 28px;
            width:320px;
            box-shadow:0 4px 24px rgba(0,0,0,.18);
            font-family:Arial,sans-serif;
        }
        #coord-dialog h3 {
            margin:0 0 4px;
            font-size:16px;
        }
        #coord-valve-name {
            font-size:13px;
            color:#555;
        }
        #coord-dialog label {
            display:block;
            font-size:13px;
            font-weight:600;
            color:#333;
            margin-bottom:10px;
        }
        #coord-dialog input[type=number] {
            display:block;
            width:100%;
            box-sizing:border-box;
            margin-top:4px;
            padding:7px 10px;
            border:1px solid #ccc;
            border-radius:6px;
            font-size:14px;
        }
        .coord-hint {
            font-size:12px;
            color:#888;
            margin:8px 0 16px;
        }
        #coord-actions {
            display:flex;
            justify-content:flex-end;
            gap:10px;
        }
        #coord-cancel, #coord-save {
            padding:7px 18px;
            border-radius:6px;
            font-size:13px;
            cursor:pointer;
            border:1px solid #ccc;
            background:#f5f5f5;
        }
        #coord-save {
            background:#2980b9;
            color:#fff;
            border-color:#2980b9;
        }
        #coord-save:hover { background:#2471a3; }
        #coord-cancel:hover { background:#e8e8e8; }
        #coord-status {
            margin:10px 0 0;
            font-size:13px;
            min-height:18px;
            color:#e74c3c;
        }

        /* Right-click context menu */
        #coord-context-menu {
            position:absolute;
            z-index:1500;
            background:#fff;
            border:1px solid #ccc;
            border-radius:6px;
            box-shadow:0 2px 8px rgba(0,0,0,.2);
            padding:4px 0;
            font-family:Arial,sans-serif;
            font-size:13px;
            display:none;
        }
        #coord-context-menu.open { display:block; }
        #coord-context-menu li {
            list-style:none;
            padding:7px 18px;
            cursor:pointer;
            white-space:nowrap;
        }
        #coord-context-menu li:hover { background:#f0f4f8; }
    `;
    document.head.appendChild(style);

    // ── Context menu─
    const ctxMenu = document.createElement('ul');
    ctxMenu.id = 'coord-context-menu';
    ctxMenu.innerHTML = '<li id="ctx-edit-coords">&#9998; Edit GPS coordinates</li>';
    document.body.appendChild(ctxMenu);

    // ── State────────
    let activeValveId   = null;
    let activeValveName = null;
    let tempMarker      = null;   // draggable preview marker

    // ── Helpers──────
    function closeCtxMenu() { ctxMenu.classList.remove('open'); }
    function closeModal() {
        modal.classList.remove('open');
        document.getElementById('coord-status').textContent = '';
        if (tempMarker) { tempMarker.remove(); tempMarker = null; }
    }

    function openModal(valveId, valveName, lat, lng) {
        activeValveId   = valveId;
        activeValveName = valveName;

        document.getElementById('coord-valve-name').textContent = valveName;
        document.getElementById('coord-lat').value = lat;
        document.getElementById('coord-lng').value = lng;
        document.getElementById('coord-status').textContent = '';

        // Draggable preview marker
        if (tempMarker) tempMarker.remove();
        tempMarker = L.marker([lat, lng], { draggable: true }).addTo(map);
        tempMarker.on('dragend', function (e) {
            const pos = e.target.getLatLng();
            document.getElementById('coord-lat').value = pos.lat.toFixed(7);
            document.getElementById('coord-lng').value = pos.lng.toFixed(7);
        });

        modal.classList.add('open');
    }

    // ── Context menu trigger on valve markers ────────────────────────────────
    // Call this from valves.js after creating each marker:
    //   attachAdminContextMenu(marker, valve.id, valve.name);
    window.attachAdminContextMenu = function (marker, valveId, valveName) {
        marker.on('contextmenu', function (e) {
            L.DomEvent.stopPropagation(e);
            const x = e.originalEvent.clientX;
            const y = e.originalEvent.clientY;
            ctxMenu.style.left = x + 'px';
            ctxMenu.style.top  = y + 'px';
            ctxMenu.classList.add('open');

            // Store what valve this menu is for
            ctxMenu.dataset.valveId   = valveId;
            ctxMenu.dataset.valveName = valveName;
            ctxMenu.dataset.lat       = marker.getLatLng().lat;
            ctxMenu.dataset.lng       = marker.getLatLng().lng;
        });
    };

    // ── Context menu item click ───────────────────────────────────────────────
    document.getElementById('ctx-edit-coords').addEventListener('click', function () {
        openModal(
            parseInt(ctxMenu.dataset.valveId),
            ctxMenu.dataset.valveName,
            parseFloat(ctxMenu.dataset.lat),
            parseFloat(ctxMenu.dataset.lng)
        );
        closeCtxMenu();
    });

    // ── Dismiss context menu ──────────────────────────────────────────────────
    document.addEventListener('click', closeCtxMenu);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeCtxMenu(); closeModal(); }
    });

    // ── Modal buttons─
    document.getElementById('coord-cancel').addEventListener('click', closeModal);
    document.getElementById('coord-backdrop').addEventListener('click', closeModal);

    document.getElementById('coord-save').addEventListener('click', async function () {
        const lat = parseFloat(document.getElementById('coord-lat').value);
        const lng = parseFloat(document.getElementById('coord-lng').value);
        const status = document.getElementById('coord-status');

        if (isNaN(lat) || isNaN(lng)) {
            status.textContent = 'Please enter valid numbers.';
            return;
        }
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            status.textContent = 'Coordinates out of range.';
            return;
        }

        status.style.color = '#888';
        status.textContent = 'Saving…';

        try {
            const res = await fetch('/admin/update_coords', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ id: activeValveId, lat, lng })
            });
            const json = await res.json();

            if (json.status === 'success') {
                status.style.color = '#27ae60';
                status.textContent = 'Saved! Reload the map to see updated position.';
                setTimeout(closeModal, 1800);
            } else {
                status.style.color = '#e74c3c';
                status.textContent = json.message || 'Save failed.';
            }
        } catch (err) {
            status.style.color = '#e74c3c';
            status.textContent = 'Network error — please try again.';
        }
    });

})();