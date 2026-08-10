// =====================================
// DOCUMENT TOOLS SEARCH
// =====================================


const documentSearch = document.getElementById("documentSearch");


const documentCards = document.querySelectorAll(
    ".document-tool-card"
);



if(documentSearch){


documentSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



documentCards.forEach(card=>{


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