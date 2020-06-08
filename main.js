//Map Setup
let startLayer = L.tileLayer.provider("Esri.WorldStreetMap");

let overlay = {
    drugaccidents: L.markerClusterGroup({
        //spiderfyOnMaxZoom: false
        //disableClusteringAtZoom: true
        polygonOptions: {
            fillColor: "green",
            color: "#3d9970",
            weight: 1,
            fillOpacity: 0.2
        }
    })
};

let map = L.map("map", {
    center: [41.7625, -72.674167], //Hartford
    zoom: 9,
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
        let mrk = L.marker([lat, lng], {
            // icon: L.divIcon({
            //     html: `<div class="label-weed"><i class="fas fa-cannabis"></i>`,
            //     // iconSize: [28, 28],
            //     className: "ignore-me"
            // })

            icon: L.icon({
                iconSize: [28, 28],
                iconUrl: "images/cannabis-solid-green.png"
            })
   

            
        }).addTo(overlay.drugaccidents);

        let popupText = `<h3>Details</h3>`+
            `<b>Date:</b> ${element[9]}</br>`+
            `<b>Personal Details:</b> ${element[12]}, ${element[11]}</br>`+
            // `<b>Location of Death:</b> ${element[19]} (${element[17]}, ${element[18]})`+
            (typeof element[19] === "Other" ? `<b>Location of Death:</b> ${element[20]} (${element[17]}, ${element[18]})` : `<b>Location of Death:</b> ${element[19]} (${element[17]}, ${element[18]})`)+
            `</br><b>Cause of Death:</b> ${element[26]}</br>`+
            `<b>Medical Preconditions:</b> ${element[27] || "-"}</br>`+
            `<b>Detected Substances:</b></br>`
            // (typeof element[28] == "Y" ? `<li>${DATA.meta.view.columns[28].name}</li>` : "")+
            ;

        mrk.bindPopup(popupText);
       

    }
};

drawAccidents();

// drawAccidents.on("loaded", function(evt) {
//     map.fitBounds(evt.target.getBounds());
// });


console.log(DATA.meta.view.columns[28].name);

