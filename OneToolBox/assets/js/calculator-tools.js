// =====================================
// CALCULATOR TOOLS SEARCH
// =====================================


const calculatorSearch = document.getElementById("calculatorSearch");


const calculatorCards = document.querySelectorAll(
    ".calculator-tool-card"
);



if(calculatorSearch){


calculatorSearch.addEventListener(
"keyup",
function(){


let searchText = 
this.value.toLowerCase().trim();



calculatorCards.forEach(card=>{


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