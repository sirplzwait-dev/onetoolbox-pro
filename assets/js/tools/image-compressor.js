// =====================================
// IMAGE COMPRESSOR FINAL JS
// =====================================


const imageInput = document.getElementById("imageInput");

const uploadArea = document.getElementById("uploadArea");

const resetBtn = document.getElementById("resetBtn");


const originalPreview = document.getElementById("originalPreview");

const originalTitle = document.getElementById("originalTitle");

const uploadIcon = document.getElementById("uploadIcon");

const uploadText = document.getElementById("uploadText");

const uploadInfo = document.getElementById("uploadInfo");


const originalSize = document.getElementById("originalSize");


const compressedPreview =
document.getElementById("compressedPreview");


const compressedSize =
document.getElementById("compressedSize");


const savedPercent =
document.getElementById("savedPercent");


const compressBtn =
document.getElementById("compressBtn");


const downloadBtn =
document.getElementById("downloadBtn");


const customSize =
document.getElementById("customSize");


const progressBar =
document.getElementById("progressBar");


const progressText =
document.getElementById("progressText");



let selectedFile = null;

let compressedBlob = null;

let originalBytes = 0;

let fileType = "image/jpeg";







// =============================
// SIZE SELECT
// =============================


document.querySelectorAll(".size-btn input")
.forEach(input=>{


input.addEventListener("change",()=>{


if(input.value==="custom"){

customSize.style.display="block";

}

else{

customSize.style.display="none";

}


});


});







// =============================
// SELECT IMAGE
// =============================


imageInput.addEventListener(
"change",
e=>{

loadImage(e.target.files[0]);

});








// =============================
// LOAD IMAGE
// =============================


function loadImage(file){


if(!file)return;



if(!file.type.startsWith("image")){

alert("Please select image file");

return;

}



selectedFile=file;


originalBytes=file.size;

fileType=file.type;



originalSize.innerText=
formatSize(file.size);





let url=
URL.createObjectURL(file);



originalPreview.src=url;


originalPreview.style.display="block";



originalTitle.innerText=
"Original Image";



uploadIcon.style.display="none";

uploadText.style.display="none";

uploadInfo.style.display="none";



}









// =============================
// DRAG DROP
// =============================


uploadArea.addEventListener(
"dragover",
e=>{

e.preventDefault();

uploadArea.style.background="#dbeafe";

});



uploadArea.addEventListener(
"dragleave",
()=>{

uploadArea.style.background="";

});



uploadArea.addEventListener(
"drop",
e=>{


e.preventDefault();


uploadArea.style.background="";


loadImage(
e.dataTransfer.files[0]
);


});








// =============================
// PASTE IMAGE
// =============================


document.addEventListener(
"paste",
e=>{


let items=
e.clipboardData.items;



for(let item of items){


if(item.type.includes("image")){


loadImage(
item.getAsFile()
);


}


}


});









// =============================
// COMPRESS
// =============================


compressBtn.addEventListener(
"click",
()=>{


if(!selectedFile){

alert("Please upload image");

return;

}



let selected =
document.querySelector(
".size-btn input:checked"
);



let target;



if(selected.value==="custom"){


target=
Number(customSize.value)*1024;


}

else{


target=
Number(selected.value);


}



if(!target){

alert("Select target size");

return;

}



compressImage(target);


});









// =============================
// COMPRESSION ENGINE
// =============================


function compressImage(target){


let reader=
new FileReader();



reader.onload=e=>{


let img=
new Image();



img.onload=()=>{


let canvas=
document.createElement("canvas");


let ctx=
canvas.getContext("2d");



let scale=1;

let quality=.95;





function process(){



canvas.width=
img.width*scale;


canvas.height=
img.height*scale;



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
canvas.width,
canvas.height
);





canvas.toBlob(
blob=>{



let progress =
Math.min(
95,
Math.round((1-quality)*100)
);



progressBar.style.width=
progress+"%";


progressText.innerText=
progress+"%";






if(blob.size<=target || quality<=0.1){


compressedBlob=blob;


showResult(blob);


return;


}





quality-=0.05;



if(quality<=0.2){


scale-=0.1;

quality=.9;


}



setTimeout(
process,
100
);



},


fileType,

quality



);



}



process();



};



img.src=e.target.result;



};



reader.readAsDataURL(selectedFile);



}









// =============================
// RESULT
// =============================


function showResult(blob){



compressedPreview.src=
URL.createObjectURL(blob);



compressedSize.innerText=
formatSize(blob.size);



let saved=

100-
((blob.size/originalBytes)*100);



savedPercent.innerText=
saved.toFixed(1)+"%";



progressBar.style.width="100%";


progressText.innerText="100%";



downloadBtn.disabled=false;



}









// =============================
// DOWNLOAD
// =============================


downloadBtn.addEventListener(
"click",
()=>{


if(!compressedBlob)return;



let url=
URL.createObjectURL(compressedBlob);



let a=
document.createElement("a");



a.href=url;


a.download=
"compressed-image."+
selectedFile.name.split(".").pop();



a.click();



});









// =============================
// RESET
// =============================


resetBtn.addEventListener(
"click",
()=>{


selectedFile=null;


compressedBlob=null;


imageInput.value="";



originalPreview.src="";

originalPreview.style.display="none";



compressedPreview.src="";



originalTitle.innerText=
"Upload Image";



uploadIcon.style.display="block";

uploadText.style.display="block";

uploadInfo.style.display="block";



originalSize.innerText="0 KB";


compressedSize.innerText="0 KB";


savedPercent.innerText="0%";



progressBar.style.width="0%";


progressText.innerText="0%";



customSize.value="";

customSize.style.display="none";



downloadBtn.disabled=true;



});








function formatSize(bytes){


if(bytes<1024)

return bytes+" Bytes";


if(bytes<1024*1024)

return(
bytes/1024
).toFixed(2)+" KB";


return(
bytes/(1024*1024)
).toFixed(2)+" MB";


}