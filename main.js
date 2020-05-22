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