// =====================================
// AUDIO TOOLS SEARCH
// =====================================


const audioSearch = document.getElementById("audioSearch");


const audioCards = document.querySelectorAll(
    ".audio-tool-card"
);



if(audioSearch){


audioSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



audioCards.forEach(card=>{


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