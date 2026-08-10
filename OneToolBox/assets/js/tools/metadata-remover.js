/* ONETOOLBOX - METADATA REMOVER */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const imageInput=document.getElementById("imageInput");
const outputFormat=document.getElementById("outputFormat");
const quality=document.getElementById("quality");
const qualityValue=document.getElementById("qualityValue");
const removeBtn=document.getElementById("removeBtn");
const resetBtn=document.getElementById("resetBtn");
const downloadBtn=document.getElementById("downloadBtn");
const originalPreview=document.getElementById("originalPreview");
const cleanPreview=document.getElementById("cleanPreview");
const cleanPlaceholder=document.getElementById("cleanPlaceholder");
const previewGrid=document.getElementById("previewGrid");
const emptyPreview=document.getElementById("emptyPreview");
const originalInfo=document.getElementById("originalInfo");
const outputInfo=document.getElementById("outputInfo");
const status=document.getElementById("status");
const dimensions=document.getElementById("dimensions");

let sourceImage=null;
let cleanDataUrl="";
let originalName="image";

quality.addEventListener("input",()=>{
qualityValue.textContent=quality.value+"%";
});
outputFormat.addEventListener("change",()=>{
outputInfo.textContent=outputFormat.value.toUpperCase();
});

function setStatus(text){status.textContent=text}

imageInput.addEventListener("change",function(){
const file=this.files[0];
if(!file)return;

const reader=new FileReader();
reader.onload=function(e){
const img=new Image();
img.onload=function(){
sourceImage=img;
originalName=(file.name||"image").replace(/\.[^.]+$/,"");
originalPreview.src=e.target.result;
previewGrid.hidden=false;
emptyPreview.hidden=true;
cleanPreview.removeAttribute("src");
cleanPreview.hidden=true;
cleanPlaceholder.hidden=false;
cleanDataUrl="";
removeBtn.disabled=false;
downloadBtn.disabled=true;

originalInfo.textContent=`${formatBytes(file.size)}`;
dimensions.textContent=`${img.naturalWidth} × ${img.naturalHeight} px`;
setStatus("Image loaded");
};
img.src=e.target.result;
};
reader.readAsDataURL(file);
});

function formatBytes(bytes){
if(!bytes)return "0 B";
const units=["B","KB","MB","GB"];
const i=Math.floor(Math.log(bytes)/Math.log(1024));
return (bytes/Math.pow(1024,i)).toFixed(i?1:0)+" "+units[i];
}

function cleanImage(){
if(!sourceImage)return;

setStatus("Removing metadata...");
removeBtn.disabled=true;

requestAnimationFrame(()=>{
try{
const canvas=document.createElement("canvas");
canvas.width=sourceImage.naturalWidth;
canvas.height=sourceImage.naturalHeight;
const ctx=canvas.getContext("2d",{alpha:true});
ctx.drawImage(sourceImage,0,0);

let mime="image/png";
if(outputFormat.value==="jpg")mime="image/jpeg";
if(outputFormat.value==="webp")mime="image/webp";

const q=Math.max(.5,Math.min(1,Number(quality.value)/100));
cleanDataUrl=canvas.toDataURL(mime,q);

cleanPreview.src=cleanDataUrl;
cleanPreview.hidden=false;
cleanPlaceholder.hidden=true;
downloadBtn.disabled=false;
setStatus("Metadata removed");
}catch(error){
console.error(error);
setStatus("Could not process image");
alert("This image could not be processed by your browser.");
}finally{
removeBtn.disabled=false;
}
});
}

removeBtn.addEventListener("click",cleanImage);

downloadBtn.addEventListener("click",function(){
if(!cleanDataUrl)return;
const ext=outputFormat.value;
const link=document.createElement("a");
link.href=cleanDataUrl;
link.download=`${originalName}-clean.${ext}`;
document.body.appendChild(link);
link.click();
link.remove();
setStatus("Clean image downloaded");
});

resetBtn.addEventListener("click",function(){
sourceImage=null;
cleanDataUrl="";
imageInput.value="";
originalPreview.removeAttribute("src");
cleanPreview.removeAttribute("src");
cleanPreview.hidden=true;
cleanPlaceholder.hidden=false;
previewGrid.hidden=true;
emptyPreview.hidden=false;
removeBtn.disabled=true;
downloadBtn.disabled=true;
originalInfo.textContent="—";
dimensions.textContent="—";
status.textContent="Waiting";
outputFormat.value="png";
outputInfo.textContent="PNG";
quality.value=92;
qualityValue.textContent="92%";
});

});