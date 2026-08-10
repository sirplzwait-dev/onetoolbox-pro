/* ==========================================================
   OneToolBox History Manager v1.0
========================================================== */

"use strict";

const HistoryManager = (() => {

const history = {};


/* ==========================================================
   Storage Key
========================================================== */

history.key = "otb-tool-history";


/* ==========================================================
   State
========================================================== */

history.items = [];


/* ==========================================================
   Initialize
========================================================== */

history.init = function(){

    this.load();

};


/* ==========================================================
   Add History
========================================================== */

history.add = function(data){

    const item = {

        id:

        Date.now(),

        tool:

        data.tool || "unknown",

        action:

        data.action || "process",

        files:

        data.files || [],

        size:

        data.size || 0,

        date:

        new Date().toISOString()

    };


    this.items.unshift(item);


    this.save();

};


/* ==========================================================
   Save
========================================================== */

history.save=function(){

    localStorage.setItem(

        this.key,

        JSON.stringify(

            this.items

        )

    );

};


/* ==========================================================
   Load
========================================================== */

history.load=function(){

    const data=

    localStorage.getItem(

        this.key

    );


    if(data){

        this.items=

        JSON.parse(data);

    }

};


/* ==========================================================
   Get All
========================================================== */

history.get=function(){

    return this.items;

};


/* ==========================================================
   Latest
========================================================== */

history.latest=function(limit=10){

    return this.items.slice(

        0,

        limit

    );

};


/* ==========================================================
   Find By Tool
========================================================== */

history.byTool=function(tool){

    return this.items.filter(

        item=>

        item.tool===tool

    );

};


/* ==========================================================
   Remove One
========================================================== */

history.remove=function(id){

    this.items=

    this.items.filter(

        item=>

        item.id!==id

    );


    this.save();

};


/* ==========================================================
   Clear All
========================================================== */

history.clear=function(){

    this.items=[];

    localStorage.removeItem(

        this.key

    );

};
/* ==========================================================
   Recent Files
========================================================== */

history.addFile = function(file){

    const files =

    JSON.parse(

        localStorage.getItem(

            "otb-recent-files"

        ) || "[]"

    );


    files.unshift({

        name:file.name,

        type:file.type,

        size:file.size,

        date:

        new Date().toISOString()

    });


    const limited =

    files.slice(0,50);


    localStorage.setItem(

        "otb-recent-files",

        JSON.stringify(limited)

    );

};


/* ==========================================================
   Get Recent Files
========================================================== */

history.getFiles=function(limit=20){

    const files=

    JSON.parse(

        localStorage.getItem(

            "otb-recent-files"

        ) || "[]"

    );


    return files.slice(

        0,

        limit

    );

};


/* ==========================================================
   Favorite Tools
========================================================== */

history.favorite=function(tool){

    let fav=

    JSON.parse(

        localStorage.getItem(

            "otb-favorites"

        ) || "[]"

    );


    if(!fav.includes(tool)){

        fav.push(tool);

    }


    localStorage.setItem(

        "otb-favorites",

        JSON.stringify(fav)

    );

};


/* ==========================================================
   Remove Favorite
========================================================== */

history.removeFavorite=function(tool){

    let fav=

    JSON.parse(

        localStorage.getItem(

            "otb-favorites"

        ) || "[]"

    );


    fav=

    fav.filter(

        item=>item!==tool

    );


    localStorage.setItem(

        "otb-favorites",

        JSON.stringify(fav)

    );

};


/* ==========================================================
   Get Favorites
========================================================== */

history.getFavorites=function(){

    return JSON.parse(

        localStorage.getItem(

            "otb-favorites"

        ) || "[]"

    );

};


/* ==========================================================
   Search History
========================================================== */

history.search=function(keyword){

    keyword=

    keyword.toLowerCase();


    return this.items.filter(item=>

        item.tool

        .toLowerCase()

        .includes(keyword)

    );

};


/* ==========================================================
   Export History
========================================================== */

history.export=function(){

    const blob=

    new Blob(

        [

            JSON.stringify(

                this.items,

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

    "OneToolBox-History.json";


    a.click();


    URL.revokeObjectURL(url);

};


/* ==========================================================
   Import History
========================================================== */

history.import=function(file){

    return new Promise((resolve)=>{


        const reader=

        new FileReader();


        reader.onload=e=>{


            try{


                this.items=

                JSON.parse(

                    e.target.result

                );


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
   Storage Size
========================================================== */

history.storageSize=function(){

    let total=0;

    Object.keys(localStorage)

    .forEach(key=>{

        total +=

        localStorage

        .getItem(key)

        .length;

    });


    return {

        bytes:total,

        kb:

        (total/1024)

        .toFixed(2),

        mb:

        (total/1024/1024)

        .toFixed(2)

    };

};


/* ==========================================================
   Storage Limit Check
========================================================== */

history.checkStorage=function(){

    const size=

    this.storageSize();


    if(

        size.mb > 5

    ){

        this.cleanup();

        return false;

    }


    return true;

};


/* ==========================================================
   Auto Cleanup
========================================================== */

history.cleanup=function(){

    if(

        this.items.length > 100

    ){

        this.items=

        this.items.slice(

            0,

            100

        );

    }


    this.save();


    localStorage.removeItem(

        "otb-recent-files"

    );

};


/* ==========================================================
   Clear Recent Files
========================================================== */

history.clearFiles=function(){

    localStorage.removeItem(

        "otb-recent-files"

    );

};


/* ==========================================================
   Clear Favorites
========================================================== */

history.clearFavorites=function(){

    localStorage.removeItem(

        "otb-favorites"

    );

};


/* ==========================================================
   Statistics
========================================================== */

history.stats=function(){

    const tools={};


    this.items.forEach(item=>{

        if(!tools[item.tool]){

            tools[item.tool]=0;

        }


        tools[item.tool]++;

    });


    return {

        total:

        this.items.length,

        tools

    };

};


/* ==========================================================
   Last Used Tool
========================================================== */

history.lastTool=function(){

    if(!this.items.length)

        return null;


    return this.items[0].tool;

};


/* ==========================================================
   Backup All Data
========================================================== */

history.backup=function(){

    const data={

        history:this.items,

        files:

        this.getFiles(),

        favorites:

        this.getFavorites()

    };


    const blob=

    new Blob(

        [

            JSON.stringify(

                data,

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

    "OneToolBox-Backup.json";


    a.click();


    URL.revokeObjectURL(url);

};


/* ==========================================================
   Restore Backup
========================================================== */

history.restore=function(data){

    if(data.history){

        this.items=

        data.history;

        this.save();

    }


    if(data.favorites){

        localStorage.setItem(

            "otb-favorites",

            JSON.stringify(

                data.favorites

            )

        );

    }


    if(data.files){

        localStorage.setItem(

            "otb-recent-files",

            JSON.stringify(

                data.files

            )

        );

    }

};


/* ==========================================================
   Final Export
========================================================== */

return history;


})();
