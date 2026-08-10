/* ==========================================================
   OneToolBox Toast Manager v1.0
========================================================== */

"use strict";


const Toast = (() => {


const toast = {};


/* ==========================================================
   Settings
========================================================== */

toast.config = {

    position:"bottom-right",

    duration:4000,

    max:5

};


toast.container=null;


/* ==========================================================
   Initialize
========================================================== */

toast.init=function(){


    let box=

    document.getElementById(

        "toast-root"

    );


    if(!box){


        box=

        document.createElement(

            "div"

        );


        box.id=

        "toast-root";


        document.body.appendChild(

            box

        );


    }


    this.container=box;


    this.applyPosition();


};


/* ==========================================================
   Position
========================================================== */

toast.applyPosition=function(){


    if(!this.container)

        return;


    this.container.style.position=

    "fixed";


    this.container.style.zIndex=

    "10000";


    this.container.style.display=

    "flex";


    this.container.style.flexDirection=

    "column";


    this.container.style.gap=

    "12px";


    switch(

        this.config.position

    ){


        case "top-right":

            this.container.style.top="20px";

            this.container.style.right="20px";

            break;


        case "top-left":

            this.container.style.top="20px";

            this.container.style.left="20px";

            break;


        case "bottom-left":

            this.container.style.bottom="20px";

            this.container.style.left="20px";

            break;


        default:

            this.container.style.bottom="20px";

            this.container.style.right="20px";

    }


};


/* ==========================================================
   Show Toast
========================================================== */

toast.show=function(options={}){


if(!this.container)

this.init();


const item=

document.createElement(

"div"

);


const type=

options.type || "info";


item.className=

"toast "+type;


item.innerHTML=

`

<div class="toast-message">

${options.message || ""}

</div>

`;


this.container.appendChild(item);



setTimeout(()=>{


    item.style.opacity="0";


    item.style.transform=

    "translateY(20px)";


    setTimeout(()=>{

        item.remove();

    },300);


},


options.duration ||

this.config.duration

);



};


/* ==========================================================
   Short Methods
========================================================== */

toast.success=function(message){

this.show({

message,

type:"success"

});

};


toast.error=function(message){

this.show({

message,

type:"error"

});

};


toast.warning=function(message){

this.show({

message,

type:"warning"

});

};


toast.info=function(message){

this.show({

message,

type:"info"

});

};
/* ==========================================================
   Loading Toast
========================================================== */

toast.loading=function(

message="Loading..."

){

const id=

"toast-loading";


let item=

document.getElementById(id);


if(item){

item.querySelector(

".toast-message"

).textContent=message;

return id;

}


item=document.createElement(

"div"

);


item.id=id;


item.className=

"toast info";


item.innerHTML=

`

<div class="loader-small"></div>

<div class="toast-message">

${message}

</div>

`;


this.container.appendChild(

item

);


return id;

};


/* ==========================================================
   Update Toast
========================================================== */

toast.update=function(

id,

message,

type="info"

){

const item=

document.getElementById(id);


if(!item)

return;


item.className=

"toast "+type;


const text=

item.querySelector(

".toast-message"

);


if(text){

text.textContent=

message;

}

};


/* ==========================================================
   Progress Toast
========================================================== */

toast.progress=function(

percent,

message="Processing..."

){

let item=

document.getElementById(

"toast-progress"

);


if(!item){

item=document.createElement(

"div"

);


item.id=

"toast-progress";


item.className=

"toast info";


item.innerHTML=

`

<div>

${message}

</div>


<div class="progress">

<div

class="progress-value">

</div>

</div>

`;


this.container.appendChild(item);

}


const bar=

item.querySelector(

".progress-value"

);


if(bar){

bar.style.width=

percent+"%";

}

};


/* ==========================================================
   Remove Toast
========================================================== */

toast.remove=function(id){

const item=

document.getElementById(id);


if(item){

item.remove();

}

};


/* ==========================================================
   Clear All
========================================================== */

toast.clear=function(){

if(this.container){

this.container.innerHTML="";

}

};


/* ==========================================================
   Change Position
========================================================== */

toast.position=function(

position

){

this.config.position=

position;


this.applyPosition();

};


/* ==========================================================
   Final Export
========================================================== */

return toast;


})();
