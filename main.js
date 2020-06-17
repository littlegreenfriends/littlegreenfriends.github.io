//Map Setup
let startLayer = L.tileLayer.provider("CartoDB.VoyagerLabelsUnder");

//Stylen der Polygone bei Hovern über ClusterGroup
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
    no_selection: L.featureGroup(), //Leere FeatureGroup für Ausblenden von ExclusiveOverlays
    
    accidents_county: L.featureGroup(),
    accidents_county_month: L.featureGroup(),
};

let map = L.map("map", {
    zoomControl: false,
    center: [41.641090, -72.721383],
    zoom: 8,
    layers: [
        startLayer,
        overlay.drugaccidents
    ]
});

//Fullscreen Plugin
map.addControl(new L.Control.Fullscreen({
    position: 'bottomleft'
}));

//Variablen für Grouped Layer Controll
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
        "Male": overlay.drugaccidents_male,
        "No Selection": overlay.no_selection
    },
    "Number of Cases by County": {
        "Total (2012-2018)": overlay.accidents_county,
        // "By Month": overlay.accidents_county_month
    }
};

let options = {
    exclusiveGroups: ["Fatal Drug Abuse Incidents"], //nur ein layer kann angezeigt werden
    groupCheckboxes: false
}

L.control.groupedLayers(baseMaps, groupedOverlays, options).addTo(map);

//Funktion zum Zeichnen von Markern mit Informations - Popup für einzelne Todesfälle
let drawAccidents = function (datapoints, layer) {

    for (let index in datapoints) {
        if (!datapoints.hasOwnProperty(index)) continue;
        let element = datapoints[index];
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
        //Datum 
        let date = new Date(element[9]); //ISO Datums Format "abrufen"
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
            `<b>Cause of Death:</b> ${element[26]}</br>` +
            `<b>Medical Preconditions:</b> ${element[27] || "-"}</br>` +
            `<b>Detected Substance(s):</b>` +
            `<ul><li>${detectSubst || "no information"}</li></ul>`;
        mrk.bindPopup(popupText);

    }

    map.fitBounds(layer.getBounds())
};


//Zeichnen von allen Fällen
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

        //Daten nach Counties kategorisieren und zählen
        let DeathCounty = element[18]
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
    return countarray;
};

let CountArray = CountyCount(DATA.data);

let drawCountyCount = function (ArrayWithCountyCounts, sizefactor, popuptext) {
    overlay.accidents_county.clearLayers();

    for (let i in county_center) {
        let county = county_center[i]
        let countSingleCounty = ArrayWithCountyCounts[i]

        if (countSingleCounty == 0) { //Bei Wert 0 keinen Kreis zeichnen
            continue;
        }

        let r = Math.sqrt(countSingleCounty * sizefactor / Math.PI);
        let circle = L.circleMarker([county[1], county[2]], {
            radius: r,
            color: "#85144b"
        }).addTo(overlay.accidents_county);

        circle.bindPopup(`Fatal Incidents in ${county[0]}: ${countSingleCounty} (${popuptext})`);

    };
};

drawCountyCount(CountArray, 6, "Total");


//Funktion zum Zählen der Fälle pro County pro Monat
let CountyCountsPerMonth = function (data_raw) {
    let data = [];

    //Dateneinträge ohne Datum (null) stören die Sortierung
    for (let i in data_raw) {
        if (!data_raw.hasOwnProperty(i)) continue;  
        let element = data_raw[i];

        if (element[9] != null) {
            data.push(element)
        }
    }

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

    //Einzelne Monate abfragen
    let collectMonth = []; //Sammelt alle Dateneinträge eines Monats
    let collectAllCountsPerMonth = []; //Sammelt alle CountyCounts pro Monat 

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
        let monthID1 = year1 + month1; //z.B. Januar 2012 = 2013 
        let monthID2 = year2 + month2; //z.B. Februar 2012 = 2014 

        //Vergleich der Dateneinträge
        if (monthID1 == monthID2) { //solange gleiche "MonatID" (ergo gleicher Monat)
            collectMonth.push(element1);
            continue; //Nächstes "Datenpaar" abfragen

        } else { // = Monatsgrenze (element1 in anderem Monat als element2)
            collectMonth.push(element1); //letzter Eintrag des Monats

            let countMonth = CountyCount(collectMonth); //Zählen der Todesfälle pro County pro Monat
            collectAllCountsPerMonth.push([YearMonth, countMonth]);
            collectMonth = []; //Array leeren für nächsten Monat
        };
    };

    return collectAllCountsPerMonth;
};

let AllCountsPerMonth = CountyCountsPerMonth(DATA.data);

let slider = document.querySelector("#slider");
slider.min = 0;
slider.max = AllCountsPerMonth.length - 1;
slider.step = 1;
slider.value = 0; //Slider auf Start positionieren

let dateOutput = document.querySelector("#dateOutput")

slider.onchange = function () {
    overlay.accidents_county.clearLayers();

    overlay.accidents_county.addTo(map);
    let index = slider.value;
    let dataMonth = AllCountsPerMonth[index][1]
    let month = AllCountsPerMonth[index][0];
    dateOutput.innerHTML = month;

    drawCountyCount(dataMonth, 200, month);
};

//Animation: Visualisierung der Anzahl der Fälle pro County für jeden Monat
let playButton = document.querySelector("#play");
let runningAnimation = null;

playButton.onclick = function () {
    let value = slider.min; //Startet bei Minimum (0)
    if (slider.value == slider.max) { //Fall Slider am Ende, wieder von vorne starten
        value = slider.min;
    } else {
        value = slider.value;
    }

    playButton.value = "⏸";

    if (runningAnimation) {
        window.clearInterval(runningAnimation);

        overlay.accidents_county.clearLayers();
        drawCountyCount(AllCountsPerMonth[slider.value][1], 200, AllCountsPerMonth[slider.value][0]); //Kreise zeichnen, wenn pausiert
        overlay.accidents_county.addTo(map);

        playButton.value = "▶";
        runningAnimation = null;
    } else {

        runningAnimation = window.setInterval(function () { //Funktion wird als Variable definiert
            slider.value = value; //Wert wird der Sliderposition übergeben

            // overlay.accidents_county_month.clearLayers();
            drawCountyCount(AllCountsPerMonth[slider.value][1], 200, AllCountsPerMonth[slider.value][0]);
            overlay.accidents_county.addTo(map);

            let month = AllCountsPerMonth[slider.value][0];
            dateOutput.innerHTML = month;

            value++;

            if (value > slider.max) { //bei einem Wert größer als max
                window.clearInterval(runningAnimation);
                playButton.value = "▶";
                runningAnimation = null;
            }
        }, 150)
    }
}

//ZoomHome-Funktion
let zoomHome = L.Control.zoomHome();
zoomHome.addTo(map);