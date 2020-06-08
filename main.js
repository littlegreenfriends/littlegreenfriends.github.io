//Map Setup
let startLayer = L.tileLayer.provider("Esri.WorldStreetMap");

// let markers = L.markerClusterGroup({
//     // spiderfyOnMaxZoom: true,
//     // disableClusteringAtZoom: 13,
//     polygonOptions: {
//         fillColor: "green",
//         color: "#3d9970",
//         weight: 1,
//         fillOpacity: 0.2
//     }
// });

let overlay = {
    // drugaccidents: markers,
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

        // let date = element[9].slice(0,10); //nicht alle Punkte werden angezeigt
        // console.log(date)

        //Sterbeort
        let location; 
        if (element[19] == "Other") {
            location = element[20]
        } else {
            location = element[19]
        }

        //medical precondition
        if (element[27] !== null) {
            // console.log(element[27]) //hier funktioniert Null Abfrage
        }

        //Abfrage der nachgewiesenen Drogen
        //Teste auf bestimmte Substanzen in element[28] bis element[44] - Sammeln in Array
        let DetectDrugs = [];
        for (let index = 28; index < 45; index++) {
            DetectDrugs.push(element[index]);
        }

        let substances = []; //Sammeln der nachgewiesenen Substanzen

        for (let i = 0; i < DetectDrugs.length; i++) { //Index 0 startet mit element[28]
            let testDrug = DetectDrugs[i];

            let index = 28 + i; //Key für Element - gleich für DATA.data und DATA.meta
            let substance;

            if (testDrug == "Y") { //wenn Droge nachgewiesen ("Yes")
                substance = DATA.meta.view.columns[index].name; //Name der Droge aus Metadaten abrufen
                substances.push(substance)
            }
        };

        let detectSubst = substances.join("</li><li>"); //Zusammenfügen der Drogen in String bzw. Template für unsortierte Liste 


        //Popup Text
        let popupText = `<h3>Details</h3>` +
            `<b>Date:</b> ${element[9]}</br>` +
            `<b>Personal Details:</b> ${element[12]}, ${element[11]}</br>` +
            // `<b>Location of Death:</b> ${element[19]} (${element[17]}, ${element[18]})`+
            `<b>Location of Death:</b> ${location || "-"}` +
            `</br><b>Cause of Death:</b> ${element[26]}</br>` +
            (typeof element[27] !== null ? `<b>Medical Preconditions:</b> ${element[27]}</br>` : "") + //zeigt noch null an
            `<b>Detected Substance(s):</b></br>` +
            `<ul><li>${detectSubst}</li></ul>`;

        mrk.bindPopup(popupText);


    }
};

drawAccidents();

// drawAccidents.on("loaded", function(evt) {
//     map.fitBounds(evt.target.getBounds());
// });

// markers.on('clusterclick', function (a) {
// 	a.layer.zoomToBounds({padding: [20, 20]});
// });