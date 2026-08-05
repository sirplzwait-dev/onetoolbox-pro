// =====================================
// AI TOOLS SEARCH
// =====================================


const aiSearch = document.getElementById("aiSearch");


const aiCards = document.querySelectorAll(
    ".ai-tool-card"
);



if(aiSearch){


aiSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



aiCards.forEach(card=>{


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