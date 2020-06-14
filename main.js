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
    fullscreenControl: true,
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
let CountyCount = function () {
    let data = DATA.data;

    //Zählvariablen für alle Counties + Total
    let total = count = hartford = newhaven = fairfield = newlondon = litchfield = middlesex = windham = tolland = 0;

    let countarray = [];

    for (let index in data) {
        if (!data.hasOwnProperty(index)) continue;
        let element = data[index];

        if (!element.hasOwnProperty(18)) continue; //DeathCounty

        let DeathCounty = element[18]
        let date = element[9]
        // console.log(date);

        //Daten nach Counties kategorisieren und zählen
        switch (DeathCounty) {
            case "HARTFORD":
                hartford++;
                break;
            case "NEW HAVEN":
                newhaven++;
                break;
            case "FAIRFIELD":
                fairfield++;
                break;
            case "NEW LONDON":
                newlondon++;
                break;
            case "LITCHFIELD":
                litchfield++;
                break;
            case "MIDDLESEX":
                middlesex++;
                break;
            case "WINDHAM":
                windham++;
                break;
            case "TOLLAND":
                tolland++;
                break;

            default:
                break;
        }
    };

    //Sammeln der Counts pro County
    //Reihenfolge in Countarray wie Counties in Variable "county_center"
    countarray = [hartford, newhaven, fairfield, newlondon, litchfield, middlesex, windham, tolland];
    // console.log(countarray);
    return countarray;
};

let CountArray = CountyCount();

let drawCountyCount = function () {
    for (let i in county_center) {
        let county = county_center[i]
        let countCounty = CountArray[i]

        // console.log(countCounty, county);
    
        let s = 4;
        let r = Math.sqrt(countCounty * s / Math.PI);
        let circle = L.circleMarker([county[1], county[2]], {
            radius: r,
            color: "#85144b"
        }).addTo(map);
    
        circle.bindPopup(`${county[0]}: ${countCounty}`);
    
    };
};

drawCountyCount();