/* ==========================================================
   OneToolBox Dialog Manager v1.0
========================================================== */

"use strict";


const Dialog = (() => {


const dialog = {};


/* ==========================================================
   Create Container
========================================================== */

dialog.container = null;


dialog.init=function(){


    if(

        document.getElementById(

            "dialog-root"

        )

    ){

        this.container=

        document.getElementById(

            "dialog-root"

        );

    }

    else{


        this.container=

        document.createElement(

            "div"

        );


        this.container.id=

        "dialog-root";


        document.body.appendChild(

            this.container

        );

    }

};


/* ==========================================================
   Alert
========================================================== */

dialog.alert=function(

message,

title="OneToolBox"

){


return new Promise(resolve=>{


this.container.innerHTML=

`

<div class="modal">


<div class="modal-content">


<h2>

${title}

</h2>


<p>

${message}

</p>


<button

class="tool-btn tool-btn-primary"

id="dialogOk">

OK

</button>


</div>


</div>

`;


this.container

.querySelector(

"#dialogOk"

)

.onclick=()=>{


this.close();


resolve(true);


};


});


};


/* ==========================================================
   Confirm
========================================================== */

dialog.confirm=function(

message,

title="Confirm"

){


return new Promise(resolve=>{


this.container.innerHTML=

`

<div class="modal">


<div class="modal-content">


<h2>

${title}

</h2>


<p>

${message}

</p>


<div style="display:flex;gap:15px;">


<button

class="tool-btn tool-btn-primary"

id="confirmYes">

Yes

</button>


<button

class="tool-btn tool-btn-outline"

id="confirmNo">

No

</button>


</div>


</div>


</div>

`;


this.container

.querySelector(

"#confirmYes"

)

.onclick=()=>{


this.close();


resolve(true);


};



this.container

.querySelector(

"#confirmNo"

)

.onclick=()=>{


this.close();


resolve(false);


};


});


};


/* ==========================================================
   Close
========================================================== */

dialog.close=function(){


if(this.container){


this.container.innerHTML="";


}


};

/* ==========================================================
   Input Dialog
========================================================== */

dialog.input=function(

message,

defaultValue="",

title="Input"

){

return new Promise(resolve=>{


this.container.innerHTML=

`

<div class="modal">


<div class="modal-content">


<h2>

${title}

</h2>


<p>

${message}

</p>


<input

class="tool-input"

id="dialogInput"

value="${defaultValue}">


<br><br>


<div style="display:flex;gap:15px;">


<button

class="tool-btn tool-btn-primary"

id="inputOk">

OK

</button>


<button

class="tool-btn tool-btn-outline"

id="inputCancel">

Cancel

</button>


</div>


</div>


</div>

`;


this.container

.querySelector("#inputOk")

.onclick=()=>{


const value=

this.container

.querySelector("#dialogInput")

.value;


this.close();


resolve(value);


};


this.container

.querySelector("#inputCancel")

.onclick=()=>{


this.close();


resolve(null);


};


});


};


/* ==========================================================
   Loading Dialog
========================================================== */

dialog.loading=function(

message="Processing..."

){


this.container.innerHTML=

`

<div class="modal">


<div class="modal-content"

style="text-align:center;">


<div class="loader"></div>


<h3>

${message}

</h3>


</div>


</div>

`;

};


/* ==========================================================
   Progress Dialog
========================================================== */

dialog.progress=function(

percent,

message="Processing..."

){


let bar=

this.container

.querySelector(

"#dialogProgress"

);


if(!bar){

this.container.innerHTML=

`

<div class="modal">


<div class="modal-content">


<h3>

${message}

</h3>


<div class="progress">


<div

id="dialogProgress"

class="progress-value">

</div>


</div>


</div>


</div>

`;

bar=

this.container

.querySelector(

"#dialogProgress"

);

}


bar.style.width=

percent+"%";


};


/* ==========================================================
   Image Preview Dialog
========================================================== */

dialog.image=function(

src,

title="Preview"

){


this.container.innerHTML=

`

<div class="modal">


<div class="modal-content"


style="text-align:center;">


<h2>

${title}

</h2>


<img

src="${src}"

style="max-width:100%;max-height:500px;">


<br><br>


<button

class="tool-btn tool-btn-primary"

id="closePreview">

Close

</button>


</div>


</div>

`;


this.container

.querySelector(

"#closePreview"

)

.onclick=()=>{

this.close();

};


};


/* ==========================================================
   Custom Dialog Builder
========================================================== */

dialog.custom=function(options={}){


const title=

options.title || "OneToolBox";


const body=

options.body || "";


const buttons=

options.buttons || [];


let html=

`

<div class="modal">


<div class="modal-content">


<h2>${title}</h2>


<div>

${body}

</div>


<div

style="display:flex;gap:10px;margin-top:20px;">

`;


buttons.forEach((btn,index)=>{


html+=`

<button

class="tool-btn ${btn.class||''}"

data-btn="${index}">

${btn.text}

</button>

`;

});


html+=`

</div>


</div>


</div>

`;


this.container.innerHTML=html;


buttons.forEach((btn,index)=>{


this.container

.querySelector(

`[data-btn="${index}"]`

)

.onclick=()=>{


if(btn.click){

btn.click();

}


};


});


};


/* ==========================================================
   Final Export
========================================================== */

return dialog;


})();
