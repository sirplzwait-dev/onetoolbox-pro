/* =====================================================
   OneToolBox Professional Image Compressor
===================================================== */

"use strict";

/* =====================================================
   Elements
===================================================== */

const uploadBox = document.getElementById("uploadBox");
const browseBtn = document.getElementById("browseBtn");
const fileInput = document.getElementById("fileInput");

const imageQueue = document.getElementById("imageQueue");

const compressionMode =
document.getElementById("compressionMode");

const quality =
document.getElementById("quality");

const qualityLabel =
document.getElementById("qualityLabel");

const targetValue =
document.getElementById("targetValue");

const targetUnit =
document.getElementById("targetUnit");

const widthInput =
document.getElementById("widthInput");

const heightInput =
document.getElementById("heightInput");

const resizeUnit =
document.getElementById("resizeUnit");

const keepRatio =
document.getElementById("keepRatio");

const outputFormat =
document.getElementById("outputFormat");

const removeMetadata =
document.getElementById("removeMetadata");

const progressiveJpg =
document.getElementById("progressiveJpg");

const optimizeColor =
document.getElementById("optimizeColor");

const compressBtn =
document.getElementById("compressBtn");

const resetBtn =
document.getElementById("resetBtn");

const progressFill =
document.getElementById("progressFill");

const progressText =
document.getElementById("progressText");

const resultsContainer =
document.getElementById("resultsContainer");

const downloadAllBtn =
document.getElementById("downloadAllBtn");

const downloadZipBtn =
document.getElementById("downloadZipBtn");

const loadingOverlay =
document.getElementById("loadingOverlay");

/* =====================================================
   Variables
===================================================== */

let files = [];

let results = [];

let worker = null;

/* =====================================================
   Worker
===================================================== */

if (window.Worker) {

    worker = new Worker("worker.js");

}

/* =====================================================
   Browse
===================================================== */

browseBtn.onclick = () => {

    fileInput.click();

};

/* =====================================================
   File Select
===================================================== */

fileInput.onchange = e => {

    addFiles(e.target.files);

};

/* =====================================================
   Drag & Drop
===================================================== */

uploadBox.ondragover = e => {

    e.preventDefault();

    uploadBox.classList.add("dragover");

};

uploadBox.ondragleave = () => {

    uploadBox.classList.remove("dragover");

};

uploadBox.ondrop = e => {

    e.preventDefault();

    uploadBox.classList.remove("dragover");

    addFiles(e.dataTransfer.files);

};

/* =====================================================
   Paste Image
===================================================== */

document.addEventListener("paste", e => {

    const items = e.clipboardData.items;

    for (const item of items) {

        if (item.type.startsWith("image")) {

            addFiles([item.getAsFile()]);

        }

    }

});

/* =====================================================
   Add Files
===================================================== */

function addFiles(fileList){

    [...fileList].forEach(file=>{

        if(!file.type.startsWith("image")){

            return;

        }

        files.push(file);

    });

    renderQueue();

}

/* =====================================================
   Queue
===================================================== */

function renderQueue(){

    imageQueue.innerHTML="";

    files.forEach((file,index)=>{

        const card=document.createElement("div");

        card.className="queue-item";

        card.innerHTML=`

        <img
        class="queue-thumb"
        src="${URL.createObjectURL(file)}">

        <div class="queue-info">

            <div class="queue-name">

            ${file.name}

            </div>

            <div class="queue-size">

            ${formatBytes(file.size)}

            </div>

        </div>

        <button
        class="queue-remove">

        <i class="fas fa-trash"></i>

        </button>

        `;

        card
        .querySelector(".queue-remove")
        .onclick=()=>{

            files.splice(index,1);

            renderQueue();

        };

        imageQueue.append(card);

    });

}

/* =====================================================
   Quality Slider
===================================================== */

quality.oninput=()=>{

qualityLabel.innerHTML=

quality.value+"%";

};
/* =====================================================
   Compress Button
===================================================== */

compressBtn.onclick = async () => {

    if (!files.length) {

        alert("Please select at least one image.");

        return;

    }

    results = [];

    resultsContainer.innerHTML = "";

    loadingOverlay.classList.remove("hidden");

    progressFill.style.width = "0%";

    progressText.innerHTML = "Preparing...";

    for (let i = 0; i < files.length; i++) {

        progressText.innerHTML =
            `Compressing ${i + 1} of ${files.length}`;

        progressFill.style.width =
            ((i / files.length) * 100) + "%";

        const result =
            await compressImage(files[i]);

        results.push(result);

        createResultCard(result);

    }

    progressFill.style.width = "100%";

    progressText.innerHTML = "Completed";

    loadingOverlay.classList.add("hidden");

    downloadAllBtn.disabled = false;

    downloadZipBtn.disabled = false;

};

/* =====================================================
   Compress One Image
===================================================== */

async function compressImage(file){

    return new Promise(resolve=>{

        const reader=new FileReader();

        reader.onload=e=>{

            const image=new Image();

            image.onload=async()=>{

                const canvas=
                document.createElement("canvas");

                let width=image.width;
                let height=image.height;

                if(widthInput.value){

                    width=
                    Number(widthInput.value);

                    if(keepRatio.checked){

                        height=Math.round(

                        image.height*

                        (width/image.width)

                        );

                    }

                }

                if(heightInput.value &&
                   !keepRatio.checked){

                    height=
                    Number(heightInput.value);

                }

                canvas.width=width;
                canvas.height=height;

                const ctx=
                canvas.getContext("2d");

                ctx.drawImage(

                image,

                0,

                0,

                width,

                height

                );

                const targetBytes=

                getTargetBytes();

                const mime=

                outputFormat.value==="original"

                ?file.type

                :outputFormat.value;

                const blob=

                await smartCompress(

                canvas,

                mime,

                targetBytes

                );

                resolve({

                    file,

                    blob,

                    before:file.size,

                    after:blob.size,

                    url:

                    URL.createObjectURL(blob),

                    width,

                    height

                });

            };

            image.src=e.target.result;

        };

        reader.readAsDataURL(file);

    });

}

/* =====================================================
   Target Bytes
===================================================== */

function getTargetBytes(){

    let size=

    Number(targetValue.value);

    if(targetUnit.value==="MB"){

        size*=1024;

    }

    return size*1024;

}

/* =====================================================
   Smart Compression
===================================================== */

async function smartCompress(

canvas,

mime,

target

){

let min=.05;

let max=1;

let best=null;

for(

let i=0;

i<12;

i++

){

const q=(min+max)/2;

const blob=

await canvasBlob(

canvas,

mime,

q

);

best=blob;

if(blob.size>target){

max=q;

}else{

min=q;

}

}

return best;

}

/* =====================================================
   Canvas To Blob
===================================================== */

function canvasBlob(

canvas,

mime,

quality

){

return new Promise(resolve=>{

canvas.toBlob(

blob=>resolve(blob),

mime,

quality

);

});

}
/* =====================================================
   Create Result Card
===================================================== */

function createResultCard(data){

const saved=data.before-data.after;

const percent=((saved/data.before)*100).toFixed(1);

const card=document.createElement("div");

card.className="result-card";

card.innerHTML=`

<div class="result-preview">

<img src="${data.url}" alt="Compressed">

</div>

<div class="result-body">

<div class="result-title">

${data.file.name}

</div>

<div class="result-stats">

<div class="result-stat">

<label>Original</label>

<strong>${formatBytes(data.before)}</strong>

</div>

<div class="result-stat">

<label>Compressed</label>

<strong>${formatBytes(data.after)}</strong>

</div>

<div class="result-stat">

<label>Saved</label>

<strong>${percent}%</strong>

</div>

<div class="result-stat">

<label>Resolution</label>

<strong>

${data.width} × ${data.height}

</strong>

</div>

</div>

<button
class="btn btn-primary download-btn">

<i class="fas fa-download"></i>

Download

</button>

</div>

`;

card.querySelector(".download-btn")
.onclick=()=>downloadBlob(data);

resultsContainer.append(card);

}

/* =====================================================
   Download One
===================================================== */

function downloadBlob(item){

const link=document.createElement("a");

link.href=item.url;

const ext=item.blob.type.split("/")[1];

link.download=

item.file.name.replace(/\.[^.]+$/,"")+

"-compressed."+ext;

document.body.appendChild(link);

link.click();

link.remove();

}

/* =====================================================
   Download All
===================================================== */

downloadAllBtn.onclick=()=>{

results.forEach(downloadBlob);

};

/* =====================================================
   ZIP Download
===================================================== */

downloadZipBtn.onclick=()=>{

alert(

"ZIP download will be enabled after JSZip integration."

);

};

/* =====================================================
   Reset
===================================================== */

resetBtn.onclick=()=>{

files=[];

results=[];

imageQueue.innerHTML="";

resultsContainer.innerHTML="";

progressFill.style.width="0%";

progressText.innerHTML="Waiting...";

fileInput.value="";

downloadAllBtn.disabled=true;

downloadZipBtn.disabled=true;

};

/* =====================================================
   Bytes Formatter
===================================================== */

function formatBytes(bytes){

if(bytes===0)return"0 Bytes";

const k=1024;

const sizes=[

"Bytes",

"KB",

"MB",

"GB"

];

const i=Math.floor(

Math.log(bytes)/Math.log(k)

);

return(

(bytes/Math.pow(k,i))

.toFixed(2)

+" "+sizes[i]

);

}

/* =====================================================
   Worker Support
===================================================== */

if(worker){

worker.onmessage=e=>{

console.log(

"Worker:",

e.data

);

};

}

/* =====================================================
   Prevent Browser Default
===================================================== */

[
"dragenter",
"dragover",
"dragleave",
"drop"

].forEach(event=>{

document.addEventListener(

event,

e=>{

e.preventDefault();

}

);

});

/* =====================================================
   Ready
===================================================== */

console.log(

"OneToolBox Professional Image Compressor Loaded"

);
