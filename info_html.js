//Informationen für html-Seiten

let EndDateRaw = new Date (DATA.meta.view.columns[9].cachedContents.largest)
let EndDate = EndDateRaw.toISOString().substring(0, 4);
// console.log(EndDate)
let EndDateHTML = document.querySelector("#EndDateHTML");
EndDateHTML.innerHTML=EndDate;

let StartDateRaw = new Date (DATA.meta.view.columns[9].cachedContents.smallest)
let StartDate = StartDateRaw.toISOString().substring(0, 4);
let StartDateHTML = document.querySelector("#StartDateHTML");
StartDateHTML.innerHTML=StartDate;

let DeathRaw = new Date (DATA.meta.view.columns[8].cachedContents.non_null)
let Death = DeathRaw.toISOString().substring(0, 4);
let SDeathHTML = document.querySelector("#DeathHTML");
DeathHTML.innerHTML=Death;