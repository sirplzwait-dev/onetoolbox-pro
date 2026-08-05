// ======================================
// OneToolBox Crop Image
// ======================================

let cropper;

const imageInput = document.getElementById("imageInput");
const cropImage = document.getElementById("cropImage");
const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");

const originalSize = document.getElementById("originalSize");
const originalResolution = document.getElementById("originalResolution");

const uploadArea = document.getElementById("uploadArea");

const resultImage = document.getElementById("resultImage");
const resultText = document.getElementById("resultText");

const newSize = document.getElementById("newSize");
const newResolution = document.getElementById("newResolution");

const downloadBtn = document.getElementById("downloadBtn");

const resetBtn = document.getElementById("resetBtn");


// ===============================
// Load Image
// ===============================

function loadImage(file){

if(!file) return;

originalSize.innerHTML =
(file.size/1024).toFixed(1)+" KB";

const reader = new FileReader();

reader.onload = function(e){

cropImage.src = e.target.result;

cropImage.style.display="block";

uploadIcon.style.display="none";
uploadText.style.display="none";
uploadInfo.style.display="none";

cropImage.onload = ()=>{

originalResolution.innerHTML =
cropImage.naturalWidth+" × "+cropImage.naturalHeight+" px";

if(cropper){

cropper.destroy();

}

cropper = new Cropper(cropImage,{

viewMode:1,

dragMode:"move",

autoCropArea:1,

responsive:true,

background:false,

checkOrientation:true,

zoomable:true,

movable:true,

rotatable:true,

scalable:true

});

}

}

reader.readAsDataURL(file);

}


// ===============================
// Choose Image
// ===============================

imageInput.addEventListener("change",e=>{

if(e.target.files.length){

loadImage(e.target.files[0]);

}

});


// ===============================
// Drag Drop
// ===============================

uploadArea.addEventListener("dragover",e=>{

e.preventDefault();

});

uploadArea.addEventListener("drop",e=>{

e.preventDefault();

if(e.dataTransfer.files.length){

loadImage(e.dataTransfer.files[0]);

}

});


// ===============================
// Paste Image
// ===============================

document.addEventListener("paste",e=>{

const items=e.clipboardData.items;

for(let item of items){

if(item.type.indexOf("image")!==-1){

const file=item.getAsFile();

loadImage(file);

break;

}

}

});
// ======================================
// Aspect Ratio
// ======================================

document.querySelectorAll(".ratio-btn").forEach(btn=>{

btn.addEventListener("click",()=>{

document.querySelectorAll(".ratio-btn")
.forEach(b=>b.classList.remove("active"));

btn.classList.add("active");

let ratio=btn.dataset.ratio;

if(ratio==="NaN"){

cropper.setAspectRatio(NaN);

}else{

cropper.setAspectRatio(parseFloat(ratio));

}

});

});



// ======================================
// Rotate
// ======================================

document.getElementById("rotateLeft")
.addEventListener("click",()=>{

if(cropper){

cropper.rotate(-90);

}

});

document.getElementById("rotateRight")
.addEventListener("click",()=>{

if(cropper){

cropper.rotate(90);

}

});



// ======================================
// Flip
// ======================================

let scaleX=1;
let scaleY=1;

document.getElementById("flipHorizontal")
.addEventListener("click",()=>{

if(cropper){

scaleX = scaleX===1 ? -1 : 1;

cropper.scaleX(scaleX);

}

});

document.getElementById("flipVertical")
.addEventListener("click",()=>{

if(cropper){

scaleY = scaleY===1 ? -1 : 1;

cropper.scaleY(scaleY);

}

});



// ======================================
// Zoom
// ======================================

document.getElementById("zoomIn")
.addEventListener("click",()=>{

if(cropper){

cropper.zoom(0.1);

}

});

document.getElementById("zoomOut")
.addEventListener("click",()=>{

if(cropper){

cropper.zoom(-0.1);

}

});



// ======================================
// Crop
// ======================================

document.getElementById("cropBtn")
.addEventListener("click",()=>{

if(!cropper) return;

const canvas=cropper.getCroppedCanvas({

imageSmoothingQuality:"high"

});

const url=canvas.toDataURL("image/png");

resultImage.src=url;

resultImage.style.display="block";

resultText.style.display="none";

newResolution.innerHTML=
canvas.width+" × "+canvas.height+" px";

canvas.toBlob(blob=>{

newSize.innerHTML=
(blob.size/1024).toFixed(1)+" KB";

downloadBtn.href=url;

downloadBtn.download="cropped-image.png";

downloadBtn.classList.remove("disabled");

});

});



// ======================================
// Reset
// ======================================

resetBtn.addEventListener("click",()=>{

if(cropper){

cropper.destroy();

cropper=null;

}

imageInput.value="";

cropImage.removeAttribute("src");
cropImage.style.display="none";

uploadIcon.style.display="";
uploadText.style.display="";
uploadInfo.style.display="";

resultImage.removeAttribute("src");
resultImage.style.display="none";

resultText.style.display="";

originalSize.innerHTML="0 KB";
originalResolution.innerHTML="0 × 0 px";

newSize.innerHTML="0 KB";
newResolution.innerHTML="0 × 0 px";

downloadBtn.removeAttribute("href");
downloadBtn.classList.add("disabled");

});
