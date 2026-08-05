// =====================================
// IMAGE TOOLS SEARCH
// =====================================


const toolSearch = document.getElementById("toolSearch");


const toolCards = document.querySelectorAll(
    ".image-tool-card"
);



if(toolSearch){


toolSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



toolCards.forEach(card=>{


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