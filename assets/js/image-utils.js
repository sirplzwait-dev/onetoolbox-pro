/* ==========================================================
   OneToolBox Image Utils v1.0
========================================================== */

"use strict";

const ImageUtils = (() => {

const image = {};

/* ==========================================================
   Config
========================================================== */

image.config = {

maxWidth:10000,

maxHeight:10000,

defaultQuality:0.8,

defaultFormat:"image/jpeg"

};

/* ==========================================================
   Canvas
========================================================== */

image.createCanvas=function(

width,

height

){

const canvas=

document.createElement("canvas");

canvas.width=width;

canvas.height=height;

return canvas;

};

/* ==========================================================
   Context
========================================================== */

image.context=function(canvas){

return canvas.getContext(

"2d",

{

alpha:true,

willReadFrequently:true

}

);

};

/* ==========================================================
   Load Image
========================================================== */

image.load=function(file){

return new Promise(

(resolve,reject)=>{

const reader=

new FileReader();

reader.onload=e=>{

const img=

new Image();

img.onload=()=>

resolve(img);

img.onerror=reject;

img.src=e.target.result;

};

reader.onerror=reject;

reader.readAsDataURL(file);

}

);

};

/* ==========================================================
   Draw
========================================================== */

image.draw=function(

canvas,

img,

width,

height

){

const ctx=

this.context(canvas);

ctx.clearRect(

0,

0,

canvas.width,

canvas.height

);

ctx.drawImage(

img,

0,

0,

width,

height

);

};

/* ==========================================================
   Canvas To Blob
========================================================== */

image.blob=function(

canvas,

mime,

quality

){

return new Promise(

resolve=>{

canvas.toBlob(

blob=>resolve(blob),

mime,

quality

);

}

);

};

/* ==========================================================
   Object URL
========================================================== */

image.url=function(blob){

return URL.createObjectURL(blob);

};

/* ==========================================================
   Revoke URL
========================================================== */

image.revoke=function(url){

URL.revokeObjectURL(url);

};

/* ==========================================================
   Metadata
========================================================== */

image.info=function(file,img){

return{

name:file.name,

type:file.type,

size:file.size,

width:img.width,

height:img.height,

ratio:

(img.width/img.height)

.toFixed(2)

};

};
/* ==========================================================
   Resize Engine
========================================================== */

image.resize = async function (

file,

options = {}

) {

    const img = await this.load(file);

    let width = options.width || img.width;
    let height = options.height || img.height;

    if (options.keepRatio !== false) {

        if (options.width && !options.height) {

            height = Math.round(

                img.height *

                (width / img.width)

            );

        }

        if (options.height && !options.width) {

            width = Math.round(

                img.width *

                (height / img.height)

            );

        }

    }

    const canvas = this.createCanvas(

        width,

        height

    );

    this.draw(

        canvas,

        img,

        width,

        height

    );

    const blob = await this.blob(

        canvas,

        options.mime || file.type,

        options.quality ||

        this.config.defaultQuality

    );

    return {

        blob,

        width,

        height,

        url: this.url(blob)

    };

};

/* ==========================================================
   Crop Engine
========================================================== */

image.crop = async function (

file,

crop

) {

    const img = await this.load(file);

    const canvas = this.createCanvas(

        crop.width,

        crop.height

    );

    const ctx = this.context(canvas);

    ctx.drawImage(

        img,

        crop.x,

        crop.y,

        crop.width,

        crop.height,

        0,

        0,

        crop.width,

        crop.height

    );

    const blob = await this.blob(

        canvas,

        file.type,

        this.config.defaultQuality

    );

    return {

        blob,

        url: this.url(blob)

    };

};

/* ==========================================================
   Rotate
========================================================== */

image.rotate = async function (

file,

angle = 90

) {

    const img = await this.load(file);

    const swap =

        angle % 180 !== 0;

    const canvas = this.createCanvas(

        swap ? img.height : img.width,

        swap ? img.width : img.height

    );

    const ctx = this.context(canvas);

    ctx.translate(

        canvas.width / 2,

        canvas.height / 2

    );

    ctx.rotate(

        angle *

        Math.PI /

        180

    );

    ctx.drawImage(

        img,

        -img.width / 2,

        -img.height / 2

    );

    const blob = await this.blob(

        canvas,

        file.type,

        this.config.defaultQuality

    );

    return {

        blob,

        url: this.url(blob)

    };

};

/* ==========================================================
   Flip
========================================================== */

image.flip = async function (

file,

horizontal = true

) {

    const img = await this.load(file);

    const canvas = this.createCanvas(

        img.width,

        img.height

    );

    const ctx = this.context(canvas);

    ctx.save();

    ctx.scale(

        horizontal ? -1 : 1,

        horizontal ? 1 : -1

    );

    ctx.drawImage(

        img,

        horizontal ? -img.width : 0,

        horizontal ? 0 : -img.height

    );

    ctx.restore();

    const blob = await this.blob(

        canvas,

        file.type,

        this.config.defaultQuality

    );

    return {

        blob,

        url: this.url(blob)

    };

};

/* ==========================================================
   Aspect Ratio
========================================================== */

image.aspectRatio = function (

width,

height

) {

    return (

        width / height

    ).toFixed(2);

};

/* ==========================================================
   Fit Inside
========================================================== */

image.fit = function (

width,

height,

maxWidth,

maxHeight

) {

    const ratio = Math.min(

        maxWidth / width,

        maxHeight / height

    );

    return {

        width: Math.round(

            width * ratio

        ),

        height: Math.round(

            height * ratio

        )

    };

};
/* ==========================================================
   Smart Compression Engine
========================================================== */

image.compress = async function (

file,

options = {}

){

const img = await this.load(file);

const canvas = this.createCanvas(

img.width,

img.height

);

this.draw(

canvas,

img,

img.width,

img.height

);

const target =

options.target ||

file.size;

const mime =

options.mime ||

file.type;

return await this.binarySearch(

canvas,

mime,

target

);

};

/* ==========================================================
   Binary Search Compression
========================================================== */

image.binarySearch = async function (

canvas,

mime,

targetBytes

){

let min = 0.02;

let max = 1;

let bestBlob = null;

let bestQuality = 0.8;

for(

let i = 0;

i < 20;

i++

){

const quality =

(min + max) / 2;

const blob =

await this.blob(

canvas,

mime,

quality

);

bestBlob = blob;

bestQuality = quality;

if(

blob.size >

targetBytes

){

max = quality;

}else{

min = quality;

}

if(

Math.abs(

blob.size -

targetBytes

)

<

2048

){

break;

}

}

return{

blob:bestBlob,

quality:bestQuality,

size:bestBlob.size,

url:this.url(bestBlob)

};

};

/* ==========================================================
   Compress To Exact KB
========================================================== */

image.toKB = async function(

file,

kb,

mime=file.type

){

return await this.compress(

file,

{

target:kb*1024,

mime

}

);

};

/* ==========================================================
   Compress To Exact MB
========================================================== */

image.toMB = async function(

file,

mb,

mime=file.type

){

return await this.compress(

file,

{

target:mb*1024*1024,

mime

}

);

};

/* ==========================================================
   Lossless Compression
========================================================== */

image.lossless = async function(

file

){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

this.draw(

canvas,

img,

img.width,

img.height

);

const blob=

await this.blob(

canvas,

file.type,

1

);

return{

blob,

url:this.url(blob),

quality:1

};

};

/* ==========================================================
   Smart Compression
========================================================== */

image.smart = async function(

file

){

const target=

Math.max(

file.size*0.55,

100*1024

);

return await this.compress(

file,

{

target

}

);

};

/* ==========================================================
   Maximum Compression
========================================================== */

image.maximum = async function(

file

){

return await this.compress(

file,

{

target:

Math.max(

20*1024,

file.size*0.15

)

}

);

};
/* ==========================================================
   Convert Image Format
========================================================== */

image.convert = async function (

file,

mime = "image/jpeg",

quality = 0.9

){

const img = await this.load(file);

const canvas = this.createCanvas(

img.width,

img.height

);

this.draw(

canvas,

img,

img.width,

img.height

);

const blob = await this.blob(

canvas,

mime,

quality

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Watermark
========================================================== */

image.watermark = async function(

file,

options={}

){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.drawImage(

img,

0,

0

);

ctx.font=

(options.font ||

"40px Arial");

ctx.fillStyle=

options.color ||

"rgba(255,255,255,.75)";

ctx.textAlign="right";

ctx.fillText(

options.text ||

"OneToolBox",

img.width-30,

img.height-30

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Grayscale
========================================================== */

image.grayscale = async function(file){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.drawImage(

img,

0,

0

);

const pixels=

ctx.getImageData(

0,

0,

canvas.width,

canvas.height

);

for(

let i=0;

i<pixels.data.length;

i+=4

){

const avg=(

pixels.data[i]+

pixels.data[i+1]+

pixels.data[i+2]

)/3;

pixels.data[i]=avg;

pixels.data[i+1]=avg;

pixels.data[i+2]=avg;

}

ctx.putImageData(

pixels,

0,

0

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Brightness
========================================================== */

image.brightness = async function(

file,

value=20

){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.filter=

`brightness(${100+value}%)`;

ctx.drawImage(

img,

0,

0

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Contrast
========================================================== */

image.contrast = async function(

file,

value=20

){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.filter=

`contrast(${100+value}%)`;

ctx.drawImage(

img,

0,

0

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Blur
========================================================== */

image.blur = async function(

file,

value=2

){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.filter=

`blur(${value}px)`;

ctx.drawImage(

img,

0,

0

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};

/* ==========================================================
   Sepia
========================================================== */

image.sepia = async function(file){

const img=

await this.load(file);

const canvas=

this.createCanvas(

img.width,

img.height

);

const ctx=

this.context(canvas);

ctx.filter="sepia(100%)";

ctx.drawImage(

img,

0,

0

);

const blob=

await this.blob(

canvas,

file.type,

0.95

);

return{

blob,

url:this.url(blob)

};

};
/* ==========================================================
   Remove Metadata
========================================================== */

image.removeMetadata = async function(file){

    return await this.convert(

        file,

        file.type,

        1

    );

};

/* ==========================================================
   Auto Enhance
========================================================== */

image.autoEnhance = async function(file){

    const img = await this.load(file);

    const canvas = this.createCanvas(

        img.width,

        img.height

    );

    const ctx = this.context(canvas);

    ctx.filter =

        "contrast(108%) saturate(110%) brightness(103%)";

    ctx.drawImage(

        img,

        0,

        0

    );

    const blob = await this.blob(

        canvas,

        file.type,

        .95

    );

    return{

        blob,

        url:this.url(blob)

    };

};

/* ==========================================================
   Histogram
========================================================== */

image.histogram = async function(file){

    const img = await this.load(file);

    const canvas = this.createCanvas(

        img.width,

        img.height

    );

    const ctx = this.context(canvas);

    ctx.drawImage(

        img,

        0,

        0

    );

    const pixels = ctx.getImageData(

        0,

        0,

        canvas.width,

        canvas.height

    ).data;

    const hist = new Array(256).fill(0);

    for(

        let i=0;

        i<pixels.length;

        i+=4

    ){

        const gray =

        Math.round(

        (

        pixels[i]+

        pixels[i+1]+

        pixels[i+2]

        )/3

        );

        hist[gray]++;

    }

    return hist;

};

/* ==========================================================
   Dominant Color
========================================================== */

image.dominantColor = async function(file){

    const img = await this.load(file);

    const canvas = this.createCanvas(

        50,

        50

    );

    const ctx = this.context(canvas);

    ctx.drawImage(

        img,

        0,

        0,

        50,

        50

    );

    const pixels =

    ctx.getImageData(

        0,

        0,

        50,

        50

    ).data;

    let r=0,g=0,b=0,count=0;

    for(

        let i=0;

        i<pixels.length;

        i+=4

    ){

        r+=pixels[i];
        g+=pixels[i+1];
        b+=pixels[i+2];

        count++;

    }

    return{

        r:Math.round(r/count),

        g:Math.round(g/count),

        b:Math.round(b/count)

    };

};

/* ==========================================================
   Compare
========================================================== */

image.compare = function(

before,

after

){

    return{

        original:before,

        compressed:after,

        saved:

        before-after,

        percent:

        (

        (before-after)

        /before

        *100

        ).toFixed(2)

    };

};

/* ==========================================================
   Batch Helper
========================================================== */

image.batch = async function(

files,

callback

){

    const output=[];

    for(

        const file of files

    ){

        output.push(

        await callback(file)

        );

    }

    return output;

};

/* ==========================================================
   Export
========================================================== */

return image;

})();