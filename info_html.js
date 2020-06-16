//Informationen für html-Seiten

//Start- und Enddatum des Untersuchungszeitraums:
let StartDateRaw = new Date (DATA.meta.view.columns[9].cachedContents.smallest)
let StartDate = StartDateRaw.toISOString().substring(0, 4);
let StartDateHTML = document.querySelector("#StartDateHTML");
StartDateHTML.innerHTML=StartDate;

let EndDateRaw = new Date (DATA.meta.view.columns[9].cachedContents.largest)
let EndDate = EndDateRaw.toISOString().substring(0, 4);
// console.log(EndDate)
let EndDateHTML = document.querySelector("#EndDateHTML");
EndDateHTML.innerHTML=EndDate;


//Gesamtanzahl der Todesfälle:
let DeathRaw = new Date (DATA.meta.view.columns[8].cachedContents.non_null)
let Death = DeathRaw.toISOString().substring(0, 4);
let DeathHTML = document.querySelector("#DeathHTML");
DeathHTML.innerHTML=Death;


//Anzahl der Todesfälle nach häufigsten Drogen (Fentanyl, Heroin und Kokain)
let FenRaw = new Date (DATA.meta.view.columns[30].cachedContents.non_null)
let Fen = FenRaw.toISOString().substring(0, 4);
let FenHTML = document.querySelector("#FenHTML");
FenHTML.innerHTML=Fen;

let HerRaw = new Date (DATA.meta.view.columns[28].cachedContents.non_null)
let Her = HerRaw.toISOString().substring(0, 4);
let HerHTML = document.querySelector("#HerHTML");
HerHTML.innerHTML=Her;

let KokRaw = new Date (DATA.meta.view.columns[29].cachedContents.non_null)
let Kok = KokRaw.toISOString().substring(0, 4);
let KokHTML = document.querySelector("#KokHTML");
KokHTML.innerHTML=Kok;