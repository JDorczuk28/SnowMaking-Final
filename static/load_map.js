const map = L.map('map').setView([38.903145122952374, -106.94432074959053],14)
// set map, zoom limited so you cant scroll to far in or too far out.
L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png', {minZoom:13, maxZoom:18}).addTo(map);