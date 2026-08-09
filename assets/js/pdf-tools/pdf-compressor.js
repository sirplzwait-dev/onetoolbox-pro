/* PDF COMPRESSOR - IMAGE COMPRESSOR STYLE */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const pdfInput=document.getElementById("pdfInput");
const uploadArea=document.getElementById("uploadArea");
const uploadIcon=document.getElementById("uploadIcon");
const pdfPreviewEmpty=document.getElementById("pdfPreviewEmpty");
const originalPreview=document.getElementById("originalPreview");
const compressedPreview=document.getElementById("compressedPreview");
const compressedEmpty=document.getElementById("compressedEmpty");
const originalSize=document.getElementById("originalSize");
const compressedSize=document.getElementById("compressedSize");
const savedPercent=document.getElementById("savedPercent");
const pageCount=document.getElementById("pageCount");
const compressBtn=document.getElementById("compressBtn");
const downloadBtn=document.getElementById("downloadBtn");
const resetBtn=document.getElementById("resetBtn");
const quality=document.getElementById("quality");
const qualityValue=document.getElementById("qualityValue");
const customSize=document.getElementById("customSize");
const targetDisplay=document.getElementById("targetDisplay");
const progressBar=document.getElementById("progressBar");
const progressText=document.getElementById("progressText");
const statusText=document.getElementById("statusText");

let selectedFile=null;
let compressedBlob=null;
let pdfLib=null;
let lastName="document";

function bytesText(bytes){
 if(!bytes)return "0 KB";
 if(bytes<1024*1024)return (bytes/1024).toFixed(1)+" KB";
 return (bytes/(1024*1024)).toFixed(2)+" MB";
}

function setProgress(p,text){
 p=Math.max(0,Math.min(100,Math.round(p)));
 progressBar.style.width=p+"%";
 progressText.textContent=p+"%";
 if(text)statusText.textContent=text;
}

function targetBytes(){
 const selected=document.querySelector('input[name="size"]:checked');
 if(!selected)return 51200;
 if(selected.value==="custom"){
   const kb=Math.max(1,Number(customSize.value)||100);
   return kb*1024;
 }
 return Number(selected.value);
}

function updateTarget(){
 const bytes=targetBytes();
 targetDisplay.textContent=bytesText(bytes);
}

document.querySelectorAll('input[name="size"]').forEach(r=>{
 r.addEventListener("change",function(){
   customSize.style.display=this.value==="custom"?"block":"none";
   updateTarget();
 });
});
customSize.addEventListener("input",updateTarget);

quality.addEventListener("input",()=>{
 qualityValue.textContent=quality.value+"%";
});

async function getPdfJs(){
 if(window.pdfjsLib){
   window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
   return window.pdfjsLib;
 }
 throw new Error("PDF.js library failed to load.");
}

function getJsPDF(){
 if(window.jspdf && window.jspdf.jsPDF)return window.jspdf;
 throw new Error("jsPDF library failed to load.");
}

async function loadFile(file){
 if(!file || file.type!=="application/pdf"){
   alert("Please select a PDF file.");
   return;
 }
 selectedFile=file;
 compressedBlob=null;
 downloadBtn.disabled=true;
 compressBtn.disabled=false;
 lastName=file.name.replace(/\.pdf$/i,"");

 originalSize.textContent=bytesText(file.size);
 compressedSize.textContent="0 KB";
 savedPercent.textContent="0%";
 statusText.textContent="Loading PDF...";
 setProgress(3);

 try{
   const lib=await getPdfJs();
   const buffer=await file.arrayBuffer();
   const pdf=await lib.getDocument({data:buffer}).promise;
   pageCount.textContent=pdf.numPages;

   const page=await pdf.getPage(1);
   const viewport=page.getViewport({scale:1.1});
   originalPreview.width=viewport.width;
   originalPreview.height=viewport.height;
   await page.render({canvasContext:originalPreview.getContext("2d"),viewport}).promise;

   originalPreview.hidden=false;
   pdfPreviewEmpty.hidden=true;
   uploadIcon.style.display="none";
   statusText.textContent="PDF ready to compress.";
   setProgress(0);
 }catch(err){
   console.error(err);
   alert("Could not read this PDF.");
   resetAll();
 }
}

pdfInput.addEventListener("change",e=>loadFile(e.target.files[0]));

["dragenter","dragover"].forEach(ev=>uploadArea.addEventListener(ev,e=>{
 e.preventDefault();
 uploadArea.classList.add("dragover");
}));
["dragleave","drop"].forEach(ev=>uploadArea.addEventListener(ev,e=>{
 e.preventDefault();
 uploadArea.classList.remove("dragover");
}));
uploadArea.addEventListener("drop",e=>{
 const file=e.dataTransfer.files[0];
 loadFile(file);
});

document.addEventListener("paste",e=>{
 const items=e.clipboardData && e.clipboardData.items;
 if(!items)return;
 for(const item of items){
   if(item.type==="application/pdf"){
     loadFile(item.getAsFile());
     break;
   }
 }
});

async function renderPdfToBlob(file,qualityPercent,scale){
 const lib=await getPdfJs();
 const jspdf=getJsPDF();
 const buffer=await file.arrayBuffer();
 const pdf=await lib.getDocument({data:buffer}).promise;
 const qualityValue=Math.max(.2,Math.min(.95,qualityPercent/100));

 let out=null;

 for(let i=1;i<=pdf.numPages;i++){
   const page=await pdf.getPage(i);
   const base=page.getViewport({scale:1});
   const viewport=page.getViewport({scale:scale});

   const canvas=document.createElement("canvas");
   canvas.width=Math.max(1,Math.round(viewport.width));
   canvas.height=Math.max(1,Math.round(viewport.height));

   const ctx=canvas.getContext("2d",{alpha:false});
   ctx.fillStyle="#fff";
   ctx.fillRect(0,0,canvas.width,canvas.height);

   await page.render({canvasContext:ctx,viewport}).promise;

   const data=canvas.toDataURL("image/jpeg",qualityValue);

   if(!out){
     out=new jspdf.jsPDF({
       orientation:base.width>base.height?"landscape":"portrait",
       unit:"pt",
       format:[base.width,base.height],
       compress:true
     });
   }else{
     out.addPage([base.width,base.height],base.width>base.height?"landscape":"portrait");
   }

   out.addImage(data,"JPEG",0,0,base.width,base.height,undefined,"FAST");
   setProgress((i/pdf.numPages)*80,`Compressing page ${i} of ${pdf.numPages}...`);
 }

 return out.output("blob");
}

async function compress(){
 if(!selectedFile)return;

 compressBtn.disabled=true;
 downloadBtn.disabled=true;
 statusText.textContent="Starting compression...";
 setProgress(2);

 try{
   const target=targetBytes();
   let q=Number(quality.value);
   let scale=1;
   let best=null;

   /* Several browser-side attempts, similar to image target-size compression. */
   for(let attempt=0;attempt<5;attempt++){
     const blob=await renderPdfToBlob(selectedFile,q,scale);
     best=blob;

     if(blob.size<=target)break;

     q=Math.max(20,q-12);
     scale=Math.max(.55,scale-.10);
     setProgress(80+(attempt+1)*3,`Optimizing size... attempt ${attempt+2}`);
   }

   compressedBlob=best;

   compressedSize.textContent=bytesText(best.size);
   const saved=Math.max(0,(1-best.size/selectedFile.size)*100);
   savedPercent.textContent=saved.toFixed(1)+"%";

   const lib=await getPdfJs();
   const b=await best.arrayBuffer();
   const resultPdf=await lib.getDocument({data:b}).promise;
   const page=await resultPdf.getPage(1);
   const viewport=page.getViewport({scale:1.0});

   compressedPreview.width=viewport.width;
   compressedPreview.height=viewport.height;
   await page.render({canvasContext:compressedPreview.getContext("2d"),viewport}).promise;
   compressedPreview.hidden=false;
   compressedEmpty.hidden=true;

   downloadBtn.disabled=false;
   setProgress(100,best.size<=target?"Target reached. Compression complete.":"Best practical compression created.");
 }catch(err){
   console.error(err);
   alert("PDF compression failed. Try another PDF or a larger target size.");
   setProgress(0,"Compression failed.");
 }finally{
   compressBtn.disabled=!selectedFile;
 }
}

compressBtn.addEventListener("click",compress);

downloadBtn.addEventListener("click",()=>{
 if(!compressedBlob)return;
 const url=URL.createObjectURL(compressedBlob);
 const a=document.createElement("a");
 a.href=url;
 a.download=lastName+"-compressed.pdf";
 document.body.appendChild(a);
 a.click();
 a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
});

function resetAll(){
 selectedFile=null;
 compressedBlob=null;
 pdfInput.value="";
 compressBtn.disabled=true;
 downloadBtn.disabled=true;
 originalSize.textContent="0 KB";
 compressedSize.textContent="0 KB";
 savedPercent.textContent="0%";
 pageCount.textContent="0";
 targetDisplay.textContent=bytesText(targetBytes());
 originalPreview.hidden=true;
 compressedPreview.hidden=true;
 pdfPreviewEmpty.hidden=false;
 compressedEmpty.hidden=false;
 uploadIcon.style.display="";
 setProgress(0,"Choose a PDF to begin.");
}

resetBtn.addEventListener("click",resetAll);

updateTarget();
});