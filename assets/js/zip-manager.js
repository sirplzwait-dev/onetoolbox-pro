/* ==========================================================
   OneToolBox ZIP Manager v1.0
========================================================== */

"use strict";

const ZipManager = (() => {

const zip = {};

/* ==========================================================
   State
========================================================== */

zip.files = [];

zip.options = {

compression:"DEFLATE",

level:9

};

/* ==========================================================
   Initialize
========================================================== */

zip.init=function(options={}){

this.options={

...this.options,

...options

};

};


/* ==========================================================
   Add File
========================================================== */

zip.add=function(

name,

blob

){

this.files.push({

name,

blob

});

};


/* ==========================================================
   Add Multiple Files
========================================================== */

zip.addMany=function(list=[]){

list.forEach(item=>{

this.add(

item.name,

item.blob

);

});

};


/* ==========================================================
   Clear
========================================================== */

zip.clear=function(){

this.files=[];

};


/* ==========================================================
   Count
========================================================== */

zip.count=function(){

return this.files.length;

};


/* ==========================================================
   Create ZIP
========================================================== */

zip.create=async function(){

if(

typeof JSZip==="undefined"

){

throw new Error(

"JSZip library missing"

);

}


const archive=new JSZip();


this.files.forEach(file=>{

archive.file(

file.name,

file.blob

);

});


const result=

await archive.generateAsync({

type:"blob",

compression:

this.options.compression,

compressionOptions:{

level:

this.options.level

}

});


return result;

};


/* ==========================================================
   Download ZIP
========================================================== */

zip.download=async function(

fileName=

"OneToolBox.zip"

){

const blob=

await this.create();


const url=

URL.createObjectURL(blob);


const link=

document.createElement("a");


link.href=url;

link.download=fileName;


document.body.appendChild(link);


link.click();


link.remove();


setTimeout(()=>{

URL.revokeObjectURL(url);

},1000);


};

/* ==========================================================
   ZIP Progress Generator
========================================================== */

zip.createWithProgress = async function(

callback

){

if(

typeof JSZip==="undefined"

){

throw new Error(

"JSZip library missing"

);

}


const archive = new JSZip();


const total = this.files.length;


for(

let i = 0;

i < total;

i++

){

const file = this.files[i];


archive.file(

file.name,

file.blob

);


if(callback){

callback({

current:i+1,

total,

percent:

Math.round(

((i+1)/total)*100

),

name:file.name

});

}

}


const result =

await archive.generateAsync({

type:"blob",

compression:

this.options.compression,

compressionOptions:{

level:

this.options.level

}

},

metadata=>{


if(callback){

callback({

stage:"compressing",

percent:

Math.round(

metadata.percent

)

});

}


});


return result;

};


/* ==========================================================
   Folder Structure
========================================================== */

zip.addFolderFile=function(

folder,

name,

blob

){

this.files.push({

name:

folder+"/"+name,

blob

});

};


/* ==========================================================
   Duplicate Rename
========================================================== */

zip.uniqueName=function(

name

){

const exists =

this.files.some(

file=>

file.name===name

);


if(!exists){

return name;

}


const dot =

name.lastIndexOf(".");


let base = name;

let ext="";


if(dot!==-1){

base=name.substring(0,dot);

ext=name.substring(dot);

}


let count=1;

let newName;


do{

newName=

base+

"("+

count+

")"+

ext;


count++;


}

while(

this.files.some(

file=>

file.name===newName

));


return newName;

};


/* ==========================================================
   Add Safe File
========================================================== */

zip.addSafe=function(

name,

blob

){

this.files.push({

name:

this.uniqueName(name),

blob

});

};


/* ==========================================================
   ZIP Information
========================================================== */

zip.info=function(){

let size=0;


this.files.forEach(file=>{

size += file.blob.size;

});


return{

files:

this.files.length,

size

};

};


/* ==========================================================
   Memory Cleanup
========================================================== */

zip.cleanup=function(){

this.files=[];

};


/* ==========================================================
   ZIP Preview
========================================================== */

zip.preview = function(){

    return this.files.map(file => ({

        name:file.name,

        size:file.blob.size,

        type:file.blob.type

    }));

};


/* ==========================================================
   Auto Download
========================================================== */

zip.autoDownload = async function(

name="OneToolBox-Export.zip"

){

    const blob =

    await this.create();


    const url =

    URL.createObjectURL(blob);


    const a =

    document.createElement("a");


    a.href=url;

    a.download=name;


    document.body.appendChild(a);


    a.click();


    a.remove();


    setTimeout(()=>{

        URL.revokeObjectURL(url);

    },2000);

};


/* ==========================================================
   Error Handler
========================================================== */

zip.error = function(error){

    console.error(

        "ZIP Error:",

        error

    );


    if(window.ToolCore){

        ToolCore.toast(

            error.message ||

            "ZIP creation failed",

            "error"

        );

    }

};


/* ==========================================================
   ToolCore Integration
========================================================== */

zip.exportResults = function(results=[]){

    this.clear();


    results.forEach(item=>{

        this.addSafe(

            item.name,

            item.blob

        );

    });


    return this;

};


/* ==========================================================
   Save ZIP History
========================================================== */

zip.saveHistory=function(){

    const history =

    JSON.parse(

        localStorage.getItem(

            "otb-zip-history"

        ) || "[]"

    );


    history.push({

        date:

        new Date().toISOString(),

        files:

        this.files.length,

        size:

        this.info().size

    });


    localStorage.setItem(

        "otb-zip-history",

        JSON.stringify(history)

    );

};


/* ==========================================================
   Load ZIP History
========================================================== */

zip.history=function(){

    return JSON.parse(

        localStorage.getItem(

            "otb-zip-history"

        ) || "[]"

    );

};


/* ==========================================================
   Final Export
========================================================== */

return zip;


})();