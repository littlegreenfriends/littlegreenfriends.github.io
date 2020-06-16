// Skript für Modal Bildvergrößerungen (für mehrere Bilder abgewandelt)
// Get the modal
let modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
// Muss nur einmal ausgeführt werden
let modalImg = document.getElementById("img01");
let captionText = document.getElementById("caption");

//Umwandlung nötig, da id nur ein Element zulässt, wir aber mehrere Bilder haben wollen
//Klasse enthält mehrere Elemente, für jedes Element soll die onclick-Funktion ausgeführt werden
let array = document.getElementsByClassName('zoomImg');
for (let i = 0; i < array.length; i++) {
    array[i].onclick = function () {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    }
}

// Wieder nur einmal auszuführen
// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}