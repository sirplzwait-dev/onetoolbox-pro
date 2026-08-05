/* ==========================================================
   OneToolBox App Loader v1.0
========================================================== */

"use strict";


const AppLoader = (()=>{


const app={};


/* ==========================================================
   Modules
========================================================== */

app.modules = [

    "ToolCore",

    "FileManager",

    "HistoryManager",

    "SettingsManager",

    "Dialog",

    "Toast",

    "ZipManager",

    "WorkerManager"

];


/* ==========================================================
   Loaded Status
========================================================== */

app.loaded={};


/* ==========================================================
   Load Script
========================================================== */

app.loadScript=function(src){

return new Promise((resolve,reject)=>{


const script=

document.createElement(

"script"

);


script.src=src;


script.onload=()=>{


app.loaded[src]=true;


resolve(src);


};


script.onerror=()=>{


reject(

"Failed: "+src

);


};


document.head.appendChild(

script

);


});


};


/* ==========================================================
   Load Multiple Scripts
========================================================== */

app.loadScripts=async function(

scripts=[]

){


for(

const script of scripts

){


await this.loadScript(

script

);


}


return true;


};


/* ==========================================================
   Check Module
========================================================== */

app.check=function(name){


return typeof window[name]

!==

"undefined";


};


/* ==========================================================
   Initialize Modules
========================================================== */

app.initModules=function(){


if(

window.Toast

)

Toast.init();



if(

window.Dialog

)

Dialog.init();



if(

window.SettingsManager

)

SettingsManager.boot();



if(

window.HistoryManager

)

HistoryManager.init();



if(

window.ToolCore

)

ToolCore.boot();



if(

window.FileManager

)

FileManager.init();


};


/* ==========================================================
   Ready
========================================================== */

app.ready=function(callback){


if(

document.readyState==="loading"

){


document.addEventListener(

"DOMContentLoaded",

callback

);


}

else{


callback();


}


};


return app;


})();
/* ==========================================================
   Detect Current Tool
========================================================== */

app.detectTool=function(){

    const path =

    window.location.pathname;


    const parts =

    path.split("/");


    return {

        category:

        parts[

            parts.length-3

        ] || null,


        tool:

        parts[

            parts.length-2

        ] || null

    };

};


/* ==========================================================
   Register Tool
========================================================== */

app.registerTool=function(){

    const info=

    this.detectTool();


    window.currentTool=info;


    if(

        window.ToolCore

    ){

        ToolCore.register(

            info.tool || "home",

            "1.0"

        );

    }

};


/* ==========================================================
   Header Loader
========================================================== */

app.loadHeader=async function(){

    const box=

    document.getElementById(

        "header-placeholder"

    );


    if(!box)

    return;


    try{


        const res=

        await fetch(

            "/components/header.html"

        );


        box.innerHTML=

        await res.text();


    }

    catch(err){


        console.error(

            "Header Load Error",

            err

        );


    }

};


/* ==========================================================
   Footer Loader
========================================================== */

app.loadFooter=async function(){

    const box=

    document.getElementById(

        "footer-placeholder"

    );


    if(!box)

    return;


    try{


        const res=

        await fetch(

            "/components/footer.html"

        );


        box.innerHTML=

        await res.text();


    }

    catch(err){


        console.error(

            "Footer Load Error",

            err

        );


    }

};


/* ==========================================================
   Global Error Handler
========================================================== */

app.errorHandler=function(){

    window.onerror=function(

        message,

        source,

        line

    ){

        console.error({

            message,

            source,

            line

        });


        if(

            window.Toast

        ){

            Toast.error(

                "Something went wrong"

            );

        }


    };

};


/* ==========================================================
   Performance Monitor
========================================================== */

app.performance=function(){

    if(

        !window.performance

    )

    return;


    const timing=

    performance.getEntriesByType(

        "navigation"

    )[0];


    if(timing){

        console.log(

            "Page Load:",

            Math.round(

                timing.loadEventEnd

                -

                timing.startTime

            ),

            "ms"

        );

    }

};


/* ==========================================================
   Start Application
========================================================== */

app.start=async function(){


this.ready(async()=>{


await this.loadHeader();


await this.loadFooter();


this.initModules();


this.registerTool();


this.errorHandler();


this.performance();


console.log(

"🚀 OneToolBox Started"

);


});


};


/* ==========================================================
   Auto Start
========================================================== */

app.start();


return app;


})();
