// =====================================
// DEVELOPER TOOLS SEARCH
// =====================================


const developerSearch = document.getElementById("developerSearch");


const developerCards = document.querySelectorAll(
    ".developer-tool-card"
);



if(developerSearch){


developerSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



developerCards.forEach(card=>{


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