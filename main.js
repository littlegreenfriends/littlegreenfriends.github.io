//Map Setup
let startLayer = L.tileLayer.provider("Esri.WorldStreetMap");

let map = L.map("map", {
    center: [41.7625, -72.674167], //Hartford
    zoom: 8,
    layers: [
        startLayer
    ]
});

let overlay = {
    drugaccidents: L.featureGroup() 
};

L.control.layers({
    "Esri.WorldStreetMap": L.tileLayer.provider("Esri.WorldStreetMap"),
    "Esri.WorldPhysical": L.tileLayer.provider("Esri.WorldPhysical"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap")
}, {
    "Drug Accidents": overlay.drugaccidents
}).addTo(map);

//Data
console.log("Datensatz", DATA);
console.log("Daten", DATA["data"])

for (let index in DATA.data) {
    if (!DATA.data.hasOwnProperty(index)) continue;
    let element = DATA.data[index];
    // console.log(element);
    let PoD = element[46] //GeoInfo Sterbeort
    // console.log("lat", element[46][1]);
    console.log("Eintrag:", index);
    console.log("Sterbeort:", "(lat)", PoD[1], "--- (lng)", PoD[2])
};