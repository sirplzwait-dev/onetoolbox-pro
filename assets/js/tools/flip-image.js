/* OneToolBox Flip Image */
"use strict";
document.addEventListener("DOMContentLoaded",()=>{

const $=id=>document.getElementById(id);
const imageInput=$("imageInput"),uploadArea=$("uploadArea"),originalPreview=$("originalPreview");
const uploadIcon=$("uploadIcon"),uploadText=$("uploadText"),uploadInfo=$("uploadInfo");
const resetBtn=$("resetBtn"),originalSize=$("originalSize"),originalDimension=$("originalDimension");
const originalFormat=$("originalFormat"),flipHorizontal=$("flipHorizontal"),flipVertical=$("flipVertical");
const flipBoth=$("flipBoth"),resetFlip=$("resetFlip"),flipStatus=$("flipStatus");
const formatSelect=$("formatSelect"),qualityRange=$("qualityRange"),qualityValue=$("qualityValue");
const applyBtn=$("applyBtn"),resetSettings=$("resetSettings"),resultImage=$("resultImage");
const resultText=$("resultText"),newDimension=$("newDimension"),newSize=$("newSize");
const newFormat=$("newFormat"),newFlip=$("newFlip"),downloadBtn=$("downloadBtn");

let image=null,imageFile=null,imageURL=null,resultURL=null,flipX=1,flipY=1;

function size(n){
 if(!n)return"0 KB";
 if(n<1024)return n+" B";
 if(n<1048576)return(n/1024).toFixed(2)+" KB";
 return(n/1048576).toFixed(2)+" MB";
}
function ext(m){return m==="image/png"?"png":m==="image/webp"?"webp":"jpg"}
function flipName(){
 if(flipX===-1&&flipY===-1)return"Horizontal + Vertical";
 if(flipX===-1)return"Horizontal";
 if(flipY===-1)return"Vertical";
 return"Original";
}
function update(){
 if(!image)return;
 originalPreview.style.transform=`scale(${flipX},${flipY})`;
 flipStatus.textContent=flipName();
 newFlip.textContent=flipName();
}
function load(file){
 if(!file)return;
 if(!file.type.startsWith("image/"))return alert("Please choose a valid image file.");
 imageFile=file;
 if(imageURL)URL.revokeObjectURL(imageURL);
 imageURL=URL.createObjectURL(file);
 const img=new Image();
 img.onload=()=>{
  image=img;
  originalPreview.src=imageURL;
  originalPreview.style.display="block";
  uploadIcon.style.display="none";
  uploadText.style.display="none";
  uploadInfo.style.display="none";
  originalSize.textContent=size(file.size);
  originalDimension.textContent=`${img.naturalWidth} × ${img.naturalHeight} px`;
  originalFormat.textContent=file.type.split("/")[1].toUpperCase();
  flipX=1;flipY=1;update();
  resultImage.style.display="none";resultImage.removeAttribute("src");
  resultText.style.display="block";
  newDimension.textContent="0 × 0 px";newSize.textContent="0 KB";newFormat.textContent="-";newFlip.textContent="Original";
  downloadBtn.classList.add("disabled");downloadBtn.removeAttribute("href");
 };
 img.src=imageURL;
}
imageInput.addEventListener("change",e=>load(e.target.files[0]));
uploadArea.addEventListener("dragover",e=>{e.preventDefault();uploadArea.classList.add("dragover")});
uploadArea.addEventListener("dragleave",()=>uploadArea.classList.remove("dragover"));
uploadArea.addEventListener("drop",e=>{e.preventDefault();uploadArea.classList.remove("dragover");load(e.dataTransfer.files[0])});
document.addEventListener("paste",e=>{
 for(const item of e.clipboardData?.items||[]){
  if(item.type.startsWith("image/")){load(item.getAsFile());break}
 }
});
flipHorizontal.addEventListener("click",()=>{if(image){flipX*=-1;update()}});
flipVertical.addEventListener("click",()=>{if(image){flipY*=-1;update()}});
flipBoth.addEventListener("click",()=>{if(image){flipX*=-1;flipY*=-1;update()}});
resetFlip.addEventListener("click",()=>{if(image){flipX=1;flipY=1;update()}});
qualityRange.addEventListener("input",()=>qualityValue.textContent=qualityRange.value+"%");
resetSettings.addEventListener("click",()=>{
 formatSelect.value="image/jpeg";qualityRange.value=90;qualityValue.textContent="90%";
 flipX=1;flipY=1;update();
});
applyBtn.addEventListener("click",()=>{
 if(!image)return alert("Please choose an image first.");
 const mime=formatSelect.value,canvas=document.createElement("canvas");
 canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
 const ctx=canvas.getContext("2d");
 if(mime==="image/jpeg"){ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height)}
 ctx.save();
 ctx.translate(flipX===-1?canvas.width:0,flipY===-1?canvas.height:0);
 ctx.scale(flipX,flipY);
 ctx.drawImage(image,0,0,canvas.width,canvas.height);
 ctx.restore();
 canvas.toBlob(blob=>{
  if(!blob)return;
  if(resultURL)URL.revokeObjectURL(resultURL);
  resultURL=URL.createObjectURL(blob);
  resultImage.src=resultURL;resultImage.style.display="block";resultText.style.display="none";
  newDimension.textContent=`${canvas.width} × ${canvas.height} px`;
  newSize.textContent=size(blob.size);newFormat.textContent=ext(mime).toUpperCase();newFlip.textContent=flipName();
  downloadBtn.href=resultURL;
  downloadBtn.download=`${(imageFile.name||"image").replace(/\.[^/.]+$/,"")} - OneToolBox.${ext(mime)}`;
  downloadBtn.classList.remove("disabled");
 },mime,Number(qualityRange.value)/100);
});
resetBtn.addEventListener("click",()=>{
 imageInput.value="";
 if(imageURL)URL.revokeObjectURL(imageURL);
 if(resultURL)URL.revokeObjectURL(resultURL);
 image=null;imageFile=null;imageURL=null;resultURL=null;flipX=1;flipY=1;
 originalPreview.removeAttribute("src");originalPreview.style.display="none";
 uploadIcon.style.display="";uploadText.style.display="";uploadInfo.style.display="";
 originalSize.textContent="0 KB";originalDimension.textContent="0 × 0 px";originalFormat.textContent="-";
 flipStatus.textContent="Original";resultImage.removeAttribute("src");resultImage.style.display="none";
 resultText.style.display="block";newDimension.textContent="0 × 0 px";newSize.textContent="0 KB";
 newFormat.textContent="-";newFlip.textContent="Original";downloadBtn.classList.add("disabled");downloadBtn.removeAttribute("href");
});
});