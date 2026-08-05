// =====================================
// UTILITY TOOLS SEARCH
// =====================================


const utilitySearch = document.getElementById("utilitySearch");


const utilityCards = document.querySelectorAll(
    ".utility-tool-card"
);



if(utilitySearch){


utilitySearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



utilityCards.forEach(card=>{


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