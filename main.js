console.log("Datensatz", DATA);
console.log("Daten",DATA["data"])

for (let key in DATA) {
    //erste Ebene
    if (!DATA.hasOwnProperty(key)) continue;
    let obj = DATA[key];
    //zweite Ebene - einzelne Datensätze
    for (let i in obj) {
        if (!obj.hasOwnProperty(i)) continue;

        console.log("Eintrag", i)
        // console.log(obj[prop]); 
        let PoD = obj[i][46]; //Place of Death
        // console.log(typeof PoD); //object
        console.log("Ort des Todes");
        console.log(PoD);
        // console.log("Lat", PoD[1]) // Fehler: "PoD is undefined" (auch bei PoD["1"])
        // console.log("Lng", PoD[2])
    }

};