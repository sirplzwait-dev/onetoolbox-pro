// ============================
// OneToolBox Image Converter
// ============================

const imageInput = document.getElementById("imageInput");
const originalPreview = document.getElementById("originalPreview");
const convertedPreview = document.getElementById("convertedPreview");

const fileName = document.getElementById("fileName");
const originalSize = document.getElementById("originalSize");
const originalDimension = document.getElementById("originalDimension");
const originalFormat = document.getElementById("originalFormat");

const formatSelect = document.getElementById("formatSelect");
const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");

const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");

const resultText = document.getElementById("resultText");

const newFormat = document.getElementById("newFormat");
const newDimension = document.getElementById("newDimension");
const newSize = document.getElementById("newSize");

const uploadArea = document.getElementById("uploadArea");

let selectedFile = null;
let bgColor = "#ffffff";

qualityRange.addEventListener("input", () => {
    qualityValue.textContent = qualityRange.value + "%";
});

function loadImage(file){

    selectedFile = file;

    fileName.textContent = file.name;
    originalSize.textContent = (file.size/1024).toFixed(1)+" KB";
    originalFormat.textContent = file.type.replace("image/","").toUpperCase();

    const reader = new FileReader();

    reader.onload = function(e){

        originalPreview.src = e.target.result;
        originalPreview.style.display="block";

        uploadIcon.style.display="none";
        uploadText.style.display="none";
        uploadInfo.style.display="none";

        const img = new Image();

        img.onload=function(){

            originalDimension.textContent =
            img.width+" × "+img.height+" px";

        }

        img.src=e.target.result;

    }

    reader.readAsDataURL(file);

}

imageInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) loadImage(file);
});

const chooseBtn = document.querySelector(".choose-btn");

if (chooseBtn) {
    chooseBtn.addEventListener("click", (e) => {
        // Let the real file input receive the click.
        if (e.target !== imageInput) {
            e.preventDefault();
            imageInput.click();
        }
    });
}

// ============================
// Drag & Drop
// ============================

["dragenter","dragover"].forEach(eventName=>{

uploadArea.addEventListener(eventName,e=>{

e.preventDefault();

uploadArea.classList.add("dragging");

});

});

["dragleave","drop"].forEach(eventName=>{

uploadArea.addEventListener(eventName,e=>{

e.preventDefault();

uploadArea.classList.remove("dragging");

});

});

uploadArea.addEventListener("drop",e=>{

const files=e.dataTransfer.files;

if(files.length){

loadImage(files[0]);

}

});


// ============================
// Paste Image (Ctrl+V)
// ============================

document.addEventListener("paste",e=>{

const items=e.clipboardData.items;

for(const item of items){

if(item.type.startsWith("image")){

const file=item.getAsFile();

loadImage(file);

break;

}

}

});


// ============================
// Background Button
// ============================

document.querySelectorAll(".background-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

document.querySelectorAll(".background-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

bgColor=btn.dataset.color;

});

});


// ============================
// Convert
// ============================

convertBtn.addEventListener("click",()=>{

if(!selectedFile){

alert("Please choose an image.");

return;

}

const img=new Image();

img.onload=function(){

const canvas=document.createElement("canvas");

canvas.width=img.width;

canvas.height=img.height;

const ctx=canvas.getContext("2d");

if(formatSelect.value==="image/jpeg"){

ctx.fillStyle=bgColor;

ctx.fillRect(0,0,canvas.width,canvas.height);

}

ctx.drawImage(img,0,0);

canvas.toBlob(blob=>{

const url=URL.createObjectURL(blob);

convertedPreview.src=url;

convertedPreview.style.display="block";

resultText.style.display="none";

downloadBtn.href=url;

downloadBtn.download="converted."+formatSelect.value.split("/")[1];

downloadBtn.classList.remove("disabled");

newFormat.textContent=formatSelect.value.replace("image/","").toUpperCase();

newDimension.textContent=img.width+" × "+img.height+" px";

newSize.textContent=(blob.size/1024).toFixed(1)+" KB";

},formatSelect.value,qualityRange.value/100);

}

img.src=URL.createObjectURL(selectedFile);

});


// ============================
// Reset
// ============================

resetBtn.addEventListener("click",()=>{

selectedFile=null;

imageInput.value="";

originalPreview.src="";
convertedPreview.src="";

originalPreview.style.display="none";
convertedPreview.style.display="none";

uploadIcon.style.display="";
uploadText.style.display="";
uploadInfo.style.display="";

resultText.style.display="";

fileName.textContent="-";
originalSize.textContent="0 KB";
originalDimension.textContent="0 × 0 px";
originalFormat.textContent="-";

newFormat.textContent="-";
newDimension.textContent="0 × 0 px";
newSize.textContent="0 KB";

downloadBtn.removeAttribute("href");
downloadBtn.classList.add("disabled");

});