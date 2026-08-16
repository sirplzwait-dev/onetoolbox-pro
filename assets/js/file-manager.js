/* ==========================================================
   OneToolBox File Manager
========================================================== */

"use strict";

const FileManager = (() => {

const fm = {};

/* ==========================================================
   State
========================================================== */

fm.files = [];

fm.accept = [];

fm.maxSize = 1024 * 1024 * 1024;

fm.multiple = true;

/* ==========================================================
   Initialize
========================================================== */

fm.init = function(options={}){

this.accept=

options.accept||[];

this.maxSize=

options.maxSize||

this.maxSize;

this.multiple=

options.multiple??

true;

};

/* ==========================================================
   Add Files
========================================================== */

fm.add=function(fileList){

const added=[];

[...fileList].forEach(file=>{

if(

this.validate(file)

){

this.files.push(file);

added.push(file);

}

});

return added;

};

/* ==========================================================
   Validate
========================================================== */

fm.validate=function(file){

if(

this.accept.length

){

if(

!this.accept.includes(

file.type

)

){

ToolCore.toast(

"Unsupported File",

"error"

);

return false;

}

}

if(

file.size>

this.maxSize

){

ToolCore.toast(

"File Too Large",

"error"

);

return false;

}

return true;

};

/* ==========================================================
   Remove
========================================================== */

fm.remove=function(index){

this.files.splice(index,1);

};

/* ==========================================================
   Clear
========================================================== */

fm.clear=function(){

this.files=[];

};

/* ==========================================================
   Count
========================================================== */

fm.count=function(){

return this.files.length;

};

/* ==========================================================
   Get
========================================================== */

fm.get=function(index){

return this.files[index];

};

/* ==========================================================
   All
========================================================== */

fm.all=function(){

return this.files;

};
/* ==========================================================
   Rename File
========================================================== */

fm.rename = function(index, newName) {

    const file = this.files[index];

    if (!file) return;

    const ext =

        file.name.substring(

            file.name.lastIndexOf(".")

        );

    this.files[index] = new File(

        [file],

        newName + ext,

        {

            type: file.type,

            lastModified: file.lastModified

        }

    );

};

/* ==========================================================
   Duplicate Detection
========================================================== */

fm.findDuplicates = function() {

    const seen = new Set();

    const duplicates = [];

    this.files.forEach(file => {

        const key =

            file.name +

            "_" +

            file.size;

        if (seen.has(key)) {

            duplicates.push(file);

        } else {

            seen.add(key);

        }

    });

    return duplicates;

};

/* ==========================================================
   Search
========================================================== */

fm.search = function(keyword) {

    keyword =

        keyword.toLowerCase();

    return this.files.filter(file =>

        file.name

        .toLowerCase()

        .includes(keyword)

    );

};

/* ==========================================================
   Filter
========================================================== */

fm.filter = function(type) {

    return this.files.filter(file =>

        file.type.startsWith(type)

    );

};

/* ==========================================================
   Sort
========================================================== */

fm.sort = function(by = "name") {

    switch (by) {

        case "size":

            this.files.sort(

                (a, b) =>

                a.size - b.size

            );

            break;

        case "date":

            this.files.sort(

                (a, b) =>

                a.lastModified -

                b.lastModified

            );

            break;

        default:

            this.files.sort(

                (a, b) =>

                a.name.localeCompare(

                    b.name

                )

            );

    }

};

/* ==========================================================
   Move Queue Item
========================================================== */

fm.move = function(from, to) {

    if (

        from === to ||

        from < 0 ||

        to < 0 ||

        from >= this.files.length ||

        to >= this.files.length

    ) return;

    const item =

        this.files.splice(from, 1)[0];

    this.files.splice(to, 0, item);

};

/* ==========================================================
   Total Size
========================================================== */

fm.totalSize = function() {

    return this.files.reduce(

        (sum, file) =>

        sum + file.size,

        0

    );

};

/* ==========================================================
   Export File List
========================================================== */

fm.exportList = function() {

    return this.files.map(file => ({

        name: file.name,

        type: file.type,

        size: file.size,

        lastModified: file.lastModified

    }));

};

/* ==========================================================
   Import List (Metadata Only)
========================================================== */

fm.importList = function(list = []) {

    console.log(

        "Imported",

        list.length,

        "records"

    );

};
/* ==========================================================
   SHA-256 Hash
========================================================== */

fm.hash = async function(file){

    const buffer =

    await file.arrayBuffer();

    const digest =

    await crypto.subtle.digest(

        "SHA-256",

        buffer

    );

    return [...new Uint8Array(digest)]

    .map(x=>x.toString(16).padStart(2,"0"))

    .join("");

};

/* ==========================================================
   File Category
========================================================== */

fm.category=function(file){

    if(file.type.startsWith("image/"))

        return "image";

    if(file.type.startsWith("video/"))

        return "video";

    if(file.type.startsWith("audio/"))

        return "audio";

    if(file.type==="application/pdf")

        return "pdf";

    if(

        file.type.includes("zip") ||

        file.type.includes("rar")

    )

        return "archive";

    return "other";

};

/* ==========================================================
   Clipboard Files
========================================================== */

fm.enableClipboard=function(){

    document.addEventListener(

        "paste",

        e=>{

            const files=[];

            [...e.clipboardData.items]

            .forEach(item=>{

                if(item.kind==="file"){

                    files.push(

                        item.getAsFile()

                    );

                }

            });

            if(files.length){

                this.add(files);

            }

        }

    );

};

/* ==========================================================
   Folder Reader
========================================================== */

fm.scanFolder=function(fileList){

    const output=[];

    [...fileList].forEach(file=>{

        output.push({

            name:file.name,

            path:

            file.webkitRelativePath ||

            file.name,

            size:file.size,

            type:file.type

        });

    });

    return output;

};

/* ==========================================================
   Queue Move Up
========================================================== */

fm.moveUp=function(index){

    if(index<=0)return;

    [

        this.files[index-1],

        this.files[index]

    ]=[

        this.files[index],

        this.files[index-1]

    ];

};

/* ==========================================================
   Queue Move Down
========================================================== */

fm.moveDown=function(index){

    if(

        index>=

        this.files.length-1

    )return;

    [

        this.files[index],

        this.files[index+1]

    ]=[

        this.files[index+1],

        this.files[index]

    ];

};

/* ==========================================================
   Image Only
========================================================== */

fm.images=function(){

    return this.files.filter(

        file=>

        file.type.startsWith(

            "image/"

        )

    );

};

/* ==========================================================
   PDF Only
========================================================== */

fm.pdfs=function(){

    return this.files.filter(

        file=>

        file.type===

        "application/pdf"

    );

};

/* ==========================================================
   Videos Only
========================================================== */

fm.videos=function(){

    return this.files.filter(

        file=>

        file.type.startsWith(

            "video/"

        )

    );

};

/* ==========================================================
   Audio Only
========================================================== */

fm.audio=function(){

    return this.files.filter(

        file=>

        file.type.startsWith(

            "audio/"

        )

    );

};

return fm;

})();
