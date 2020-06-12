//Map Setup
let startLayer = L.tileLayer.provider("Esri.WorldStreetMap");

let HoverStyleGreen = {
    fillColor: "green",
    color: "#3d9970",
    weight: 1,
    fillOpacity: 0.2
};

let overlay = {
    drugaccidents: L.markerClusterGroup({
        // spiderfyOnMaxZoom: true,
        // disableClusteringAtZoom: 13,
        polygonOptions: HoverStyleGreen
    }),
    drugaccidents_female: L.markerClusterGroup({
        polygonOptions: HoverStyleGreen
    }),
    drugaccidents_male: L.markerClusterGroup({
        polygonOptions: HoverStyleGreen
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

let baseMaps = {
    "Esri.WorldStreetMap": L.tileLayer.provider("Esri.WorldStreetMap"),
    "Esri.WorldPhysical": L.tileLayer.provider("Esri.WorldPhysical"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap")
};

let groupedOverlays = {
    "Fatal Drug Abuse Incidents": {
        "Total": overlay.drugaccidents,
        "Female": overlay.drugaccidents_female,
        "Male": overlay.drugaccidents_male
    }
};

let options = {
    exclusiveGroups: ["Fatal Drug Abuse Incidents"],
    groupCheckboxes: true
}

L.control.groupedLayers(baseMaps, groupedOverlays, options).addTo(map);


let drawAccidents = function (datapoints, layer) {

    for (let index in datapoints) {
        if (!datapoints.hasOwnProperty(index)) continue;
        let element = datapoints[index];
        // console.log(element);
        let PoD = element[46] //GeoInfo Sterbeort
        let lat = PoD[1];
        let lng = PoD[2];

        let mrk = L.marker([lat, lng], {
            icon: L.icon({
                iconSize: [28, 28],
                iconUrl: "images/pills-solid-green.png"
            })

        }).addTo(layer);

        //Aufbereiten von Informationen für Popup
        // let date = element[9].slice(0,10); //nicht alle Punkte werden angezeigt
        // console.log(date)

        //Sterbeort
        let location;
        if (element[19] == "Other") {
            location = element[20]
        } else {
            location = element[19]
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

        if (element[42] !== null) { //spezielle Abfrage für "Other"
            substance = `Other: ${element[42]}`
            substances.push(substance)
        }
        let detectSubst = substances.join("</li><li>"); //Zusammenfügen der Drogen in String bzw. Template für unsortierte Liste 

        //Popup Text
        let popupText = `<h3>Details on Fatal Drug Abuse Incident</h3>` +
            `<b>Date:</b> ${element[9]}</br>` +
            `<b>Personal Details:</b> ${element[12]}, ${element[11]}</br>` +
            `<b>Location of Death:</b> ${location || "-"} (${element[17] || "-"}, ${element[18] || "-"})</br>` +
            // `</br><b>Location of Death:</b> ${location || "-"}` +
            `<b>Cause of Death:</b> ${element[26]}</br>` +
            // (typeof element[27] !== "null" ? `<b>Medical Preconditions:</b> ${element[27]}</br>` : "") + //zeigt noch null an
            `<b>Medical Preconditions:</b> ${element[27] || "-"}</br>` +
            `<b>Detected Substance(s):</b>` +
            `<ul><li>${detectSubst || "no information"}</li></ul>`;

        mrk.bindPopup(popupText);


    }

    map.fitBounds(layer.getBounds())
};


//Alle Fälle
let drawAccidentsTotal = function () {
    drawAccidents(DATA.data, overlay.drugaccidents);
}
drawAccidentsTotal();


//Filter Funktion
let filterData = function (data, index, key) {
    let datalist = [];
    for (let i in data) {
        if (!data.hasOwnProperty(i)) continue;
        let element = data[i];

        if (element[index] == key) {
            datalist.push(element)
        }
    }
    return datalist;
}

//Female Cases
let drawAccidentsFemale = function () {
    let dataFemale = filterData(DATA.data, 12, "Female");
    drawAccidents(dataFemale, overlay.drugaccidents_female);
}
drawAccidentsFemale();

//Male Cases
let drawAccidentsMale = function () {
    let dataMale = filterData(DATA.data, 12, "Male");
    drawAccidents(dataMale, overlay.drugaccidents_male);
}
drawAccidentsMale();



//Anzahl der Fälle pro County anzeigen 
let drawCountyCount = function () {

    let data = DATA.data;
    // console.log(data);

    data.sort(function (row1, row2) { //Sortieren der Daten nach Todesdatum
        let date1, date2;

        date1 = row1[9];
        date2 = row2[9];
        if (date1 < date2) {
            return -1;
        } else if (date1 > date2) {
            return 1;
        }
        return 0;
    });

    // console.log("data sorted", data)

    //Zählvariablen für alle Counties + Total
    let total = count = hartford = newhaven = fairfield = newlondon = litchfield = middlesex = windham = tolland = 0;

    for (let index in data) {
        if (!data.hasOwnProperty(index)) continue;
        let element = data[index];

        if (!element.hasOwnProperty(18)) continue; //DeathCounty

        let DeathCounty = element[18]
        let date = element[9]


        //Daten nach Counties kategorisieren und zählen
        for (let i in county_center) {
            let county = county_center[i];

            if (DeathCounty == county[0]) {
                // console.log(DeathCounty, county[0], date)
                count++;

                switch (DeathCounty) {
                    case "HARTFORD":
                        // console.log(county_center[0][0], county_center[0][1], county_center[0][2])
                        hartford++;
                        break;
                    case "NEW HAVEN":
                        // console.log(county_center[1][0], county_center[1][1], county_center[1][2])
                        newhaven++;
                        break;
                    case "FAIRFIELD":
                        // console.log(county_center[2][0], county_center[2][1], county_center[2][2])
                        fairfield++;
                        break;
                    case "NEW LONDON":
                        // console.log(county_center[3][0], county_center[3][1], county_center[3][2])
                        newlondon++;
                        break;
                    case "LITCHFIELD":
                        // console.log(county_center[4][0], county_center[4][1], county_center[4][2])
                        litchfield++;
                        break;
                    case "MIDDLESEX":
                        // console.log(county_center[5][0], county_center[5][1], county_center[5][2])
                        middlesex++;
                        break;
                    case "WINDHAM":
                        // console.log(county_center[6][0], county_center[6][1], county_center[6][2])
                        windham++;
                        break;
                    case "TOLLAND":
                        // console.log(county_center[7][0], county_center[7][1], county_center[7][2])
                        tolland++;
                        break;

                    default:
                        break;
                }
            }

        }

    }; //Ende Schleife Datensatz

    //Kontrolle
    console.log("hardfort", hartford);
    console.log("newhaven", newhaven);
    console.log("fairfield", fairfield);
    console.log("newlondon", newlondon);
    console.log("litchfield", litchfield);
    console.log("middlesex", middlesex);
    console.log("windham", windham);
    console.log("tolland", tolland);

    console.log("total", count);

    // for (let i in county_center) {
    //     let county = county_center[i]

    //     switch (county[0]) {
    //         case "HARTFORD":
    //             let r = Math.sqrt(hartford / Math.PI);
    //             let circle = L.circleMarker([county[1], county[2]], {
    //                 radius: r,
    //                 color: "#3d9970"
    //             }).addTo(map);

    //             circle.bindPopup(`Hartford: ${hartford}`);

    //         case "NEW HAVEN":
    //             // console.log(county_center[1][0], county_center[1][1], county_center[1][2])
    //             let r2 = Math.sqrt(newhaven / Math.PI);
    //             let circle2 = L.circleMarker([county[1], county[2]], {
    //                 radius: r2,
    //                 color: "#3d9970"
    //             }).addTo(map);

    //             circle.bindPopup(`New Haven: ${newhaven}`);

    //         default:
    //             break;
    //     }
    // };

    let s = 1;
    let r = Math.sqrt(hartford / Math.PI);
    let circle = L.circleMarker([county_center[0][1], county_center[0][2]], {
        radius: r,
        color: "#3d9970"
    }).addTo(map);

    circle.bindPopup(`Hartford: ${hartford}`);


};

drawCountyCount();