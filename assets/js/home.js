/* ==========================================================
   OneToolBox Home Page Loader FINAL
========================================================== */

"use strict";


document.addEventListener(
"DOMContentLoaded",
()=>{

    loadCategories();

    loadTools();

    loadFAQ();

});



/* ==========================================================
   Load Categories
========================================================== */

async function loadCategories(){


const box =
document.getElementById(
"categoryGrid"
);


if(!box)

return;



try{


const res =
await fetch(
"data/categories.json"
);



const data =
await res.json();



box.innerHTML="";



data.forEach(cat=>{


box.innerHTML += `

<a href="${cat.url || '#'}" 
class="category-card">


<div class="category-icon">

<i class="${cat.icon || 'fas fa-tools'}"></i>

</div>



<h3>

${cat.name}

</h3>



<p>

${cat.count || ""}

</p>



<span class="category-link">

Explore →

</span>



</a>

`;

});


}

catch(error){


console.error(

"Category Load Error",

error

);


}


}





/* ==========================================================
   Load Tools
========================================================== */


async function loadTools(){


const popularBox =

document.getElementById(

"popularTools"

);



const latestBox =

document.getElementById(

"latestTools"

);



try{


const res =

await fetch(

"data/tools.json"

);



const tools =

await res.json();





/* Popular Tools */


if(popularBox){


popularBox.innerHTML="";



tools

.filter(

tool=>tool.popular

)

.slice(0,8)

.forEach(tool=>{


popularBox.innerHTML +=

toolCard(tool);


});


}





/* Latest Tools */


if(latestBox){


latestBox.innerHTML="";



tools

.slice(0,8)

.forEach(tool=>{


latestBox.innerHTML +=

toolCard(tool);


});


}



}


catch(error){


console.error(

"Tools Load Error",

error

);


}


}
/* ==========================================================
   Tool Card
========================================================== */


function toolCard(tool){


return `

<a href="${tool.url || '#'}"
class="tool-card">



<div class="tool-icon">

${tool.icon || "⚙️"}

</div>



<h3>

${tool.title}

</h3>



<p>

${tool.description || "Online Tool"}

</p>



<span class="tool-link">

Open Tool →

</span>



</a>

`;

}







/* ==========================================================
   Load FAQ
========================================================== */


async function loadFAQ(){


const box =

document.getElementById(

"faqContainer"

);



if(!box)

return;



try{


const res =

await fetch(

"data/faq.json"

);



const data =

await res.json();



box.innerHTML="";



data.forEach(item=>{


box.innerHTML += `

<div class="faq-item">


<button class="faq-question">


<span>

${item.question}

</span>



<i class="fas fa-plus"></i>


</button>





<div class="faq-answer">


<p>

${item.answer}

</p>


</div>



</div>

`;

});


}


catch(error){


console.error(

"FAQ Load Error",

error

);


}


}







/* ==========================================================
   FAQ Accordion
========================================================== */


document.addEventListener(

"click",

(e)=>{


const btn =

e.target.closest(

".faq-question"

);



if(!btn)

return;



const item =

btn.parentElement;



item.classList.toggle(

"active"

);



});
