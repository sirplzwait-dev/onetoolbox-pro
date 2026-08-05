// =====================================
// PDF TOOLS SEARCH
// =====================================


const pdfSearch = document.getElementById("pdfSearch");


const pdfCards = document.querySelectorAll(
    ".pdf-tool-card"
);



if(pdfSearch){


pdfSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



pdfCards.forEach(card=>{


let cardText =
card.innerText.toLowerCase();



if(cardText.includes(searchText)){


card.style.display="block";


}

else{


card.style.display="none";


}


});


});


}