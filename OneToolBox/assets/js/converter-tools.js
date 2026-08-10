// =====================================
// CONVERTER TOOLS SEARCH
// =====================================


const converterSearch = document.getElementById("converterSearch");


const converterCards = document.querySelectorAll(
    ".converter-tool-card"
);



if(converterSearch){


converterSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



converterCards.forEach(card=>{


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