/* ==========================================================
   OneToolBox Settings Manager v1.0
========================================================== */

"use strict";

const SettingsManager = (() => {

const settings = {};


/* ==========================================================
   Storage Key
========================================================== */

settings.key = "otb-settings";


/* ==========================================================
   Default Settings
========================================================== */

settings.defaults = {

    theme:"light",

    language:"en",

    quality:80,

    format:"original",

    compressionMode:"smart",

    autoDownload:false,

    removeMetadata:false,

    keepRatio:true,

    notifications:true,

    history:true

};


/* ==========================================================
   Current Settings
========================================================== */

settings.data = {

    ...settings.defaults

};


/* ==========================================================
   Initialize
========================================================== */

settings.init=function(){

    this.load();

};


/* ==========================================================
   Load Settings
========================================================== */

settings.load=function(){

    const saved=

    localStorage.getItem(

        this.key

    );


    if(saved){

        this.data={

            ...this.defaults,

            ...JSON.parse(saved)

        };

    }

};


/* ==========================================================
   Save Settings
========================================================== */

settings.save=function(){

    localStorage.setItem(

        this.key,

        JSON.stringify(

            this.data

        )

    );

};


/* ==========================================================
   Get
========================================================== */

settings.get=function(key){

    return this.data[key];

};


/* ==========================================================
   Set
========================================================== */

settings.set=function(

key,

value

){

    this.data[key]=value;

    this.save();

};


/* ==========================================================
   Update Multiple
========================================================== */

settings.update=function(data){

    this.data={

        ...this.data,

        ...data

    };

    this.save();

};


/* ==========================================================
   Reset
========================================================== */

settings.reset=function(){

    this.data={

        ...this.defaults

    };

    this.save();

};


/* ==========================================================
   Get All
========================================================== */

settings.all=function(){

    return this.data;

};
/* ==========================================================
   Theme Apply
========================================================== */

settings.applyTheme=function(){

    const theme=

    this.data.theme;


    document.documentElement

    .setAttribute(

        "data-theme",

        theme

    );

};


/* ==========================================================
   Toggle Theme
========================================================== */

settings.toggleTheme=function(){

    if(

        this.data.theme==="dark"

    ){

        this.set(

            "theme",

            "light"

        );

    }

    else{

        this.set(

            "theme",

            "dark"

        );

    }


    this.applyTheme();

};


/* ==========================================================
   Language Manager
========================================================== */

settings.languages={

    en:"English",

    hi:"Hindi"

};


settings.setLanguage=function(lang){

    if(

        this.languages[lang]

    ){

        this.set(

            "language",

            lang

        );

    }

};


settings.getLanguage=function(){

    return this.data.language;

};


/* ==========================================================
   Compression Preferences
========================================================== */

settings.compression={

    quality:function(value){

        settings.set(

            "quality",

            value

        );

    },


    format:function(value){

        settings.set(

            "format",

            value

        );

    },


    mode:function(value){

        settings.set(

            "compressionMode",

            value

        );

    }

};


/* ==========================================================
   Tool Specific Settings
========================================================== */

settings.tools={};


settings.saveTool=function(

tool,

data

){

    this.tools[tool]=data;


    localStorage.setItem(

        "otb-tool-"+tool,

        JSON.stringify(data)

    );

};


settings.getTool=function(tool){

    const data=

    localStorage.getItem(

        "otb-tool-"+tool

    );


    return data ?

    JSON.parse(data)

    :

    {};

};


/* ==========================================================
   Import Settings
========================================================== */

settings.import=function(file){

    return new Promise(resolve=>{


        const reader=

        new FileReader();


        reader.onload=e=>{


            try{


                this.data=

                {

                    ...this.defaults,

                    ...JSON.parse(

                        e.target.result

                    )

                };


                this.save();


                resolve(true);


            }

            catch{


                resolve(false);

            }


        };


        reader.readAsText(file);


    });

};


/* ==========================================================
   Export Settings
========================================================== */

settings.export=function(){

    const blob=

    new Blob(

        [

            JSON.stringify(

                this.data,

                null,

                2

            )

        ],

        {

            type:

            "application/json"

        }

    );


    const url=

    URL.createObjectURL(blob);


    const a=

    document.createElement("a");


    a.href=url;

    a.download=

    "OneToolBox-Settings.json";


    a.click();


    URL.revokeObjectURL(url);

};
/* ==========================================================
   Auto Save
========================================================== */

settings.autoSave = function(){

    setInterval(()=>{

        this.save();

    },30000);

};


/* ==========================================================
   Sync With ToolCore
========================================================== */

settings.syncCore=function(){

    if(

        window.ToolCore

    ){

        ToolCore.settings={

            ...ToolCore.settings,

            quality:

            this.data.quality,


            mode:

            this.data.compressionMode,


            format:

            this.data.format

        };

    }

};


/* ==========================================================
   Restore Default
========================================================== */

settings.restoreDefaults=function(){

    this.data={

        ...this.defaults

    };

    this.save();

    this.applyTheme();

};


/* ==========================================================
   Settings Events
========================================================== */

settings.events={};


settings.on=function(

event,

callback

){

    if(

        !this.events[event]

    ){

        this.events[event]=[];

    }


    this.events[event]

    .push(callback);

};


settings.emit=function(

event,

data

){

    if(

        !this.events[event]

    )

    return;


    this.events[event]

    .forEach(fn=>{

        fn(data);

    });

};


/* ==========================================================
   Change Setting Event
========================================================== */

settings.changed=function(

key,

value

){

    this.set(

        key,

        value

    );


    this.emit(

        "change",

        {

            key,

            value

        }

    );

};


/* ==========================================================
   Storage Information
========================================================== */

settings.storage=function(){

    let size=0;


    Object.keys(localStorage)

    .forEach(key=>{

        size +=

        localStorage

        .getItem(key)

        .length;

    });


    return{

        bytes:size,

        kb:

        (size/1024)

        .toFixed(2)

    };

};


/* ==========================================================
   Clear Cache
========================================================== */

settings.clearCache=function(){

    const keep=[

        this.key

    ];


    Object.keys(localStorage)

    .forEach(key=>{

        if(

            !keep.includes(key)

        ){

            localStorage.removeItem(

                key

            );

        }

    });

};


/* ==========================================================
   Boot
========================================================== */

settings.boot=function(){

    this.init();

    this.applyTheme();

    this.autoSave();

    this.syncCore();

};


/* ==========================================================
   Final Export
========================================================== */

return settings;


})();
