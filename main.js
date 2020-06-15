//Map Setup
let startLayer = L.tileLayer.provider("CartoDB.VoyagerLabelsUnder");

let HoverStyleGreen = {
    fillColor: "green",
    color: "#3d9970",
    weight: 1,
    fillOpacity: 0.2
};

let overlay = {
    drugaccidents: L.markerClusterGroup({
        polygonOptions: HoverStyleGreen
    }),
    drugaccidents_female: L.markerClusterGroup({
        polygonOptions: HoverStyleGreen
    }),
    drugaccidents_male: L.markerClusterGroup({
        polygonOptions: HoverStyleGreen
    }),
    accidents_county: L.featureGroup()
};

let map = L.map("map", {
    fullscreenControl: true,
    zoomControl: false,
    center: [41.7625, -72.674167], //Hartford
    zoom: 9,
    layers: [
        startLayer,
        overlay.drugaccidents
    ]
});

//ZoomHome-Funktion
let zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);

let baseMaps = {
    "CartoDB.VoyagerLabelsUnder": startLayer,
    "CartoDB.Positron": L.tileLayer.provider("CartoDB.Positron"),
    "Esri.WorldStreetMap": L.tileLayer.provider("Esri.WorldStreetMap"),
    "Esri.WorldTopoMap": L.tileLayer.provider("Esri.WorldTopoMap"),
    "Esri.WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
};

let groupedOverlays = {
    "Fatal Drug Abuse Incidents": {
        "Total": overlay.drugaccidents,
        "Female": overlay.drugaccidents_female,
        "Male": overlay.drugaccidents_male
    },
    "Cases by County": {
        "Fatal Drug Abuse Incidents": overlay.accidents_county
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
        let date = new Date(element[9]);
        let YearMonthDay = date.toISOString().substring(0, 10);

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
            `<b>Date:</b> ${YearMonthDay}</br>` +
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
let CountyCount = function (data) {
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

let CountArray = CountyCount(DATA.data);

let drawCountyCount = function (ArrayWithCountyCounts) {
    overlay.accidents_county.clearLayers();

    for (let i in county_center) {
        let county = county_center[i]
        let countSingleCounty = ArrayWithCountyCounts[i]

        // console.log(countCounty, county);

        let s = 4;
        let r = Math.sqrt(countSingleCounty * s / Math.PI);
        let circle = L.circleMarker([county[1], county[2]], {
            radius: r,
            color: "#85144b"
        }).addTo(overlay.accidents_county);

        circle.bindPopup(`Fatal Incidents in ${county[0]}: ${countSingleCounty}`);

    };
};

drawCountyCount(CountArray);


//Funktion zum Zählen der Fälle pro County pro Monat
let CountyCountsPerMonth = function (data) {
    //Sortieren des Datensatzes nach Todesdatum
    data.sort(function (row1, row2) {
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

    //console.log("Nach Datum sortiert:", data);

    //Einzelne Monate abfragen
    let collectMonth = []; //Sammelt alle Dateneinträge eines Monats
    let collectTotal = []; //Kontroll Array
    let collectAllCountsPerMonth = []; //Sammelt alle CountyCounts pro Monat + Akkumulierte CountyCounts
    let collectAccCountsOfMonths = [0, 0, 0, 0, 0, 0, 0, 0]; //Akkumuliert monatliche CountyCounts 

    //Zeilenweiser Vergleich von Einträgen, um Monate zu differenzieren 
    for (let i = 1; i < data.length; i++) {
        let element1 = data[i - 1]; //Eintrag 1 wird mit Eintrag 2 verglichen
        let element2 = data[i];

        //Datum im Datensatz ist in ISO Format gespeichert --> Abruf mit "new Date"
        let date1 = new Date(element1[9]);
        let date2 = new Date(element2[9]);

        let year1 = date1.getFullYear(); //Jahr
        let month1 = date1.getMonth() + 1; //Monat (Hintergrund von +1: Month Index ist 0-baisert (Januar = 0))
        let YearMonth = date1.toISOString().substring(0, 7); //Information Monat 

        let year2 = date2.getFullYear(); //Jahr
        let month2 = date2.getMonth() + 1; //Monat (Hintergrund von +1: Month Index ist 0-baisert (Januar = 0))

        //ID für jeden Monat aus Summe von "Jahr" und "Monat" gebildet
        //Dadurch können Monate voneinander unterschieden werden 
        let monthID1 = year1 + month1; //z.B. Januar 2012 = 2013 (Faktor 333 für unique ID)
        let monthID2 = year2 + month2; //z.B. Februar 2012 = 2014 (Faktor 333 für unique ID)

        //Vergleich der Dateneinträge
        if (monthID1 == monthID2) { //solange gleiche "MonatID" (ergo gleicher Monat)
            collectMonth.push(element1);
            collectTotal.push(element1); //Kontroll Array
            // console.log(collectMonth);
            continue; //Nächstes "Datenpaar" abfragen

        } else { // = Monatsgrenze (element1 in anderem Monat als element2)
            collectMonth.push(element1); //letzter Eintrag des Monats
            collectTotal.push(element1); //letzter Eintrag des Monats (Kontroll Array)

            // console.log(collectMonth);
            let countMonth = CountyCount(collectMonth); //Zählen der Todesfälle pro County pro Monat

            collectAccCountsOfMonths = collectAccCountsOfMonths.map(function (num, idx) {
                return num + countMonth[idx];
            });

            collectAllCountsPerMonth.push([YearMonth, countMonth, collectAccCountsOfMonths]);

            // console.log(year1, month1, countMonth, "Einträge: ", collectMonth.length);
            collectMonth = []; //Array leeren für nächsten Monat
        };
    };
    // console.log("total check", collectTotal);
    return collectAllCountsPerMonth;
};

let AllCountsPerMonth = CountyCountsPerMonth(DATA.data);
// console.log(AllCountsPerMonth, AllCountsPerMonth.length);

let slider = document.querySelector("#slider");
slider.min = 0;
slider.max = AllCountsPerMonth.length-1;
slider.step = 1;

slider.onchange = function () {
    overlay.accidents_county.addTo(map);
    let index = slider.value;
    let dataMonth = AllCountsPerMonth[index][2];
    drawCountyCount(dataMonth);
};

//Animation
let playButton = document.querySelector("#play");
let runningAnimation = null; 

playButton.onclick = function () {
    overlay.accidents_county.clearLayers();
    overlay.accidents_county.addTo(map);

    let value = slider.min; //Startet bei Minimum (0)
    if (slider.value == slider.max) { 
        value = slider.min;
    } else {
        value = slider.value; //Wert des Sliders 
    }

    playButton.value = "⏸";

    if (runningAnimation) {
        window.clearInterval(runningAnimation);
        playButton.value = "▶";
        runningAnimation = null;
    } else {

        runningAnimation = window.setInterval(function () { //Funktion wird als Variable definiert
            slider.value = value; //Wert wird der Sliderposition übergeben
            drawCountyCount(AllCountsPerMonth[slider.value][2]);
            value++;

            if (value > slider.max) { //bei einem Wert größer als max
                window.clearInterval(runningAnimation);
                playButton.value = "▶";
                runningAnimation = null;
            }
        }, 100)
    }
}