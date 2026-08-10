/* ONETOOLBOX - QR SCANNER
   Native BarcodeDetector when available.
   Image fallback: native detector first; if unavailable, reports browser limitation.
*/
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const cameraTab=document.getElementById("cameraTab");
const imageTab=document.getElementById("imageTab");
const cameraPanel=document.getElementById("cameraPanel");
const imagePanel=document.getElementById("imagePanel");
const video=document.getElementById("video");
const cameraPlaceholder=document.getElementById("cameraPlaceholder");
const startCamera=document.getElementById("startCamera");
const stopCamera=document.getElementById("stopCamera");
const cameraStatus=document.getElementById("cameraStatus");
const qrImageInput=document.getElementById("qrImageInput");
const imagePreviewWrap=document.getElementById("imagePreviewWrap");
const qrImagePreview=document.getElementById("qrImagePreview");
const imageStatus=document.getElementById("imageStatus");
const emptyResult=document.getElementById("emptyResult");
const resultContent=document.getElementById("resultContent");
const resultText=document.getElementById("resultText");
const resultType=document.getElementById("resultType");
const urlActions=document.getElementById("urlActions");
const openLink=document.getElementById("openLink");
const copyResult=document.getElementById("copyResult");
const clearResult=document.getElementById("clearResult");

let stream=null;
let scanning=false;
let detector=null;

function setResult(value){
 if(!value)return;
 const text=String(value).trim();
 resultText.textContent=text;
 emptyResult.hidden=true;
 resultContent.hidden=false;

 const isUrl=/^(https?:\/\/|www\.)/i.test(text);
 resultType.textContent=isUrl?"URL":"TEXT";

 if(isUrl){
   const href=text.startsWith("www.")?"https://"+text:text;
   openLink.href=href;
   urlActions.hidden=false;
 }else{
   urlActions.hidden=true;
 }
}

function clearScanResult(){
 resultText.textContent="";
 resultContent.hidden=true;
 emptyResult.hidden=false;
 resultType.textContent="Waiting";
 urlActions.hidden=true;
}

function switchTab(tab){
 const camera=tab==="camera";
 cameraTab.classList.toggle("active",camera);
 imageTab.classList.toggle("active",!camera);
 cameraPanel.hidden=!camera;
 imagePanel.hidden=camera;
 if(!camera)stop();
}

cameraTab.addEventListener("click",()=>switchTab("camera"));
imageTab.addEventListener("click",()=>switchTab("image"));

async function ensureDetector(){
 if(!("BarcodeDetector" in window)){
   throw new Error("BarcodeDetector is not supported by this browser.");
 }
 try{
   const formats=await BarcodeDetector.getSupportedFormats();
   if(!formats.includes("qr_code")){
     throw new Error("QR format is not supported by this browser.");
   }
 }catch(e){
   // Some implementations expose BarcodeDetector but not getSupportedFormats.
 }
 detector=new BarcodeDetector({formats:["qr_code"]});
 return detector;
}

async function start(){
 if(scanning)return;

 if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
   cameraStatus.textContent="Camera access is not supported by this browser.";
   return;
 }

 try{
   await ensureDetector();
   stream=await navigator.mediaDevices.getUserMedia({
     video:{facingMode:{ideal:"environment"}},
     audio:false
   });

   video.srcObject=stream;
   await video.play();

   scanning=true;
   cameraPlaceholder.hidden=true;
   startCamera.disabled=true;
   stopCamera.disabled=false;
   cameraStatus.textContent="Camera running — point it at a QR code.";
   scanLoop();
 }catch(error){
   console.error(error);
   if(String(error.message).includes("BarcodeDetector")){
     cameraStatus.textContent="This browser does not support native QR camera scanning. Try Image Scan or use a supported browser.";
   }else{
     cameraStatus.textContent="Camera could not start. Check permission and HTTPS/localhost.";
   }
 }
}

async function scanLoop(){
 if(!scanning || !detector)return;

 try{
   const codes=await detector.detect(video);
   if(codes && codes.length){
     const value=codes[0].rawValue;
     if(value){
       setResult(value);
       cameraStatus.textContent="QR code detected.";
       stop();
       return;
     }
   }
 }catch(error){
   // Continue scanning; transient frames can fail.
 }

 if(scanning)requestAnimationFrame(scanLoop);
}

function stop(){
 scanning=false;
 if(stream){
   stream.getTracks().forEach(track=>track.stop());
   stream=null;
 }
 video.srcObject=null;
 startCamera.disabled=false;
 stopCamera.disabled=true;
 cameraPlaceholder.hidden=false;
 if(cameraStatus.textContent==="Camera running — point it at a QR code.")
   cameraStatus.textContent="Camera stopped.";
}

startCamera.addEventListener("click",start);
stopCamera.addEventListener("click",stop);

qrImageInput.addEventListener("change",function(){
 const file=this.files[0];
 if(!file)return;

 const reader=new FileReader();
 reader.onload=e=>{
   qrImagePreview.src=e.target.result;
   imagePreviewWrap.hidden=false;
   imageStatus.textContent="Image loaded. Looking for a QR code...";
   decodeImage(e.target.result);
 };
 reader.readAsDataURL(file);
});

async function decodeImage(src){
 try{
   await ensureDetector();
   const img=new Image();
   img.onload=async()=>{
     try{
       const codes=await detector.detect(img);
       if(codes && codes.length && codes[0].rawValue){
         setResult(codes[0].rawValue);
         imageStatus.textContent="QR code detected.";
       }else{
         imageStatus.textContent="No QR code was found in this image.";
       }
     }catch(error){
       imageStatus.textContent="Could not read the QR code from this image.";
     }
   };
   img.src=src;
 }catch(error){
   imageStatus.textContent="This browser does not provide the QR decoding API. Try a current Chrome/Edge browser or use a QR decoder library.";
 }
}

copyResult.addEventListener("click",async()=>{
 const value=resultText.textContent.trim();
 if(!value)return;
 try{
   await navigator.clipboard.writeText(value);
   copyResult.innerHTML='<i class="fa-solid fa-check"></i> Copied';
   setTimeout(()=>copyResult.innerHTML='<i class="fa-regular fa-copy"></i> Copy',1400);
 }catch(error){
   alert("Copy is not available. Please select and copy the result manually.");
 }
});

clearResult.addEventListener("click",clearScanResult);

window.addEventListener("beforeunload",stop);

});