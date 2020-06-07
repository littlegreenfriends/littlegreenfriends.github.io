//Map Setup
let startLayer = L.tileLayer.provider("Esri.WorldStreetMap");

let overlay = {
    drugaccidents: L.markerClusterGroup()
};

let map = L.map("map", {
    center: [41.7625, -72.674167], //Hartford
    zoom: 8,
    layers: [
        startLayer,
        overlay.drugaccidents
    ]
});

L.control.layers({
    "Esri.WorldStreetMap": L.tileLayer.provider("Esri.WorldStreetMap"),
    "Esri.WorldPhysical": L.tileLayer.provider("Esri.WorldPhysical"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap")
}, {
    "Drug Accidents": overlay.drugaccidents
}).addTo(map);

//Data
// console.log("Datensatz", DATA);
// console.log("Daten", DATA["data"])

let drawAccidents = function () {
    let AccData = DATA.data;

    for (let index in AccData) {
        if (!AccData.hasOwnProperty(index)) continue;
        let element = AccData[index];
        // console.log(element);
        let PoD = element[46] //GeoInfo Sterbeort
        // console.log("lat", element[46][1]);
        // console.log("Eintrag:", index);
        // console.log("Sterbeort:", "(lat)", PoD[1], "--- (lng)", PoD[2])
        let lat = PoD[1];
        let lng = PoD[2];
        let mrk = L.marker([lat, lng]).addTo(overlay.drugaccidents);
    }
};

drawAccidents();