// =====================================
// RESIZE IMAGE TOOL JS
// OneToolBox Final
// =====================================


const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const resetBtn = document.getElementById("resetBtn");


const originalPreview = document.getElementById("originalPreview");
const resizedPreview = document.getElementById("resizedPreview");

const resultText = document.getElementById("resultText");


const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");


const originalSize = document.getElementById("originalSize");
const originalDimension = document.getElementById("originalDimension");


const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");


const dpiInput = document.getElementById("dpiInput");


const widthUnit = document.getElementById("widthUnit");
const heightUnit = document.getElementById("heightUnit");


const ratioLock = document.getElementById("ratioLock");


const resizeBtn = document.getElementById("resizeBtn");
const downloadBtn = document.getElementById("downloadBtn");


const newDimension = document.getElementById("newDimension");
const newSize = document.getElementById("newSize");



let image = null;

let aspectRatio = 1;

let currentUnit = "px";

let originalWidth = 0;

let originalHeight = 0;








// ==========================
// UNIT CHANGE
// ==========================


document.querySelectorAll(".mode")
.forEach(button=>{


button.addEventListener("click",()=>{


document.querySelectorAll(".mode")
.forEach(btn=>btn.classList.remove("active"));


button.classList.add("active");


currentUnit = button.dataset.unit;


widthUnit.innerText=currentUnit;

heightUnit.innerText=currentUnit;



if(image){

showUnitValue();

}



});


});









// ==========================
// SELECT IMAGE
// ==========================


uploadArea.addEventListener("click",()=>{

imageInput.click();

});





imageInput.addEventListener("change",(e)=>{


loadImage(e.target.files[0]);


});








function loadImage(file){


if(!file) return;



let url = URL.createObjectURL(file);


let img = new Image();



img.onload = ()=>{


image = img;


originalWidth = img.width;

originalHeight = img.height;


aspectRatio = originalWidth / originalHeight;



originalPreview.src=url;

originalPreview.style.display="block";



uploadIcon.style.display="none";

uploadText.style.display="none";

uploadInfo.style.display="none";



originalSize.innerText=formatSize(file.size);



originalDimension.innerText =
`${originalWidth} × ${originalHeight} px`;



widthInput.value=originalWidth;

heightInput.value=originalHeight;



};



img.src=url;


}









// ==========================
// ASPECT RATIO
// ==========================


widthInput.addEventListener("input",()=>{


if(ratioLock.checked && image){


let width = Number(widthInput.value);



if(currentUnit==="px"){


heightInput.value =
Math.round(width / aspectRatio);


}

else{


heightInput.value =
(width / aspectRatio).toFixed(2);


}


}



});







heightInput.addEventListener("input",()=>{


if(ratioLock.checked && image){


let height = Number(heightInput.value);



if(currentUnit==="px"){


widthInput.value =
Math.round(height * aspectRatio);


}

else{


widthInput.value =
(height * aspectRatio).toFixed(2);


}


}



});









// ==========================
// UNIT DISPLAY
// ==========================


function showUnitValue(){


let dpi =
Number(dpiInput.value)||300;



if(currentUnit==="cm"){


widthInput.value =
(originalWidth*2.54/dpi).toFixed(2);


heightInput.value =
(originalHeight*2.54/dpi).toFixed(2);


}



else if(currentUnit==="inch"){


widthInput.value =
(originalWidth/dpi).toFixed(2);


heightInput.value =
(originalHeight/dpi).toFixed(2);


}



else{


widthInput.value=originalWidth;

heightInput.value=originalHeight;


}


}









// ==========================
// CONVERT PX
// ==========================


function convertToPixel(value){


let dpi =
Number(dpiInput.value)||300;



if(currentUnit==="cm"){


return Math.round(value*dpi/2.54);


}



if(currentUnit==="inch"){


return Math.round(value*dpi);


}



return Math.round(value);


}









// ==========================
// RESIZE
// ==========================


resizeBtn.addEventListener("click",()=>{


if(!image){


alert("Please upload image first");

return;


}



let width =
convertToPixel(Number(widthInput.value));


let height =
convertToPixel(Number(heightInput.value));




let canvas=document.createElement("canvas");


canvas.width=width;

canvas.height=height;



let ctx=canvas.getContext("2d");



ctx.drawImage(

image,

0,

0,

width,

height

);





canvas.toBlob(blob=>{


let url=URL.createObjectURL(blob);



resizedPreview.src=url;


resultText.style.display="none";


newDimension.innerText =
`${width} × ${height} px`;



newSize.innerText =
formatSize(blob.size);



downloadBtn.href=url;

downloadBtn.download="resized-image.png";

downloadBtn.removeAttribute("disabled");



},"image/png");



});









// ==========================
// RESET
// ==========================


resetBtn.addEventListener("click",()=>{


image=null;


imageInput.value="";


originalPreview.src="";

resizedPreview.src="";



resultText.style.display="block";



originalPreview.style.display="none";



uploadIcon.style.display="block";

uploadText.style.display="block";

uploadInfo.style.display="block";



originalSize.innerText="0 KB";


originalDimension.innerText="0 × 0 px";


newDimension.innerText="0 × 0 px";


newSize.innerText="0 KB";


widthInput.value=0;

heightInput.value=0;


});









// ==========================
// DRAG DROP
// ==========================


uploadArea.addEventListener("dragover",(e)=>{

e.preventDefault();

});



uploadArea.addEventListener("drop",(e)=>{


e.preventDefault();


loadImage(e.dataTransfer.files[0]);


});









// ==========================
// SIZE FORMAT
// ==========================


function formatSize(bytes){


if(bytes<1024)

return bytes+" Bytes";



if(bytes<1024*1024)

return (bytes/1024).toFixed(2)+" KB";



return (bytes/(1024*1024)).toFixed(2)+" MB";


}