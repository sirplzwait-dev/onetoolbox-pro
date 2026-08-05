// =====================================
// VIDEO TOOLS SEARCH
// =====================================


const videoSearch = document.getElementById("videoSearch");


const videoCards = document.querySelectorAll(
    ".video-tool-card"
);



if(videoSearch){


videoSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



videoCards.forEach(card=>{


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