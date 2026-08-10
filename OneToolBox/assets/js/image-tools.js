/* =========================================
   ONETOOLBOX - IMAGE TOOLS JS
   Search + card navigation
   ========================================= */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

    const search = document.getElementById("toolSearch");
    const cards = Array.from(document.querySelectorAll(".image-tool-card"));
    const count = document.getElementById("toolCount");
    const clear = document.getElementById("clearSearch");
    const noResults = document.getElementById("noResults");

    function filterTools(){
        const query = search ? search.value.trim().toLowerCase() : "";
        let visible = 0;

        cards.forEach(function(card){
            const text = (
                (card.dataset.search || "") + " " +
                (card.textContent || "")
            ).toLowerCase();

            const match = !query || text.includes(query);
            card.hidden = !match;

            if(match) visible++;
        });

        count.textContent = visible;
        if(clear) clear.hidden = !query;
        if(noResults) noResults.hidden = visible !== 0;
    }

    if(search){
        search.addEventListener("input",filterTools);
    }

    if(clear){
        clear.addEventListener("click",function(){
            if(search) search.value = "";
            filterTools();
            if(search) search.focus();
        });
    }

    /* Whole card is clickable, while the actual <a> keeps normal link behavior. */
    cards.forEach(function(card){

        const link = card.querySelector("a[href]");
        if(!link) return;

        card.addEventListener("click",function(event){
            if(event.target.closest("a")) return;
            window.location.href = link.href;
        });

        card.addEventListener("keydown",function(event){
            if(event.key !== "Enter" && event.key !== " ") return;
            if(event.target.closest("a")) return;

            event.preventDefault();
            window.location.href = link.href;
        });

    });

    filterTools();
});
