(() => {
"use strict";

const $ = id => document.getElementById(id);
const fileInput = $("fileInput");
const upload = $("upload");
const runBtn = $("run");
const downloadBtn = $("download");
const resetBtn = $("reset");
const quality = $("quality");
const format = $("format");

const fileSize = $("fileSize");
const pageCount = $("pageCount");
const uploadTitle = $("uploadTitle");
const uploadHint = $("uploadHint");
const status = $("status");
const bar = $("bar");
const pct = $("pct");
const resultCount = $("resultCount");
const resultEmpty = $("resultEmpty");
const resultSummary = $("resultSummary");
const resultText = $("resultText");

let selectedFile = null;
let imageFiles = [];

function fmt(bytes){
  if(!bytes)return "0 KB";
  if(bytes<1024)return bytes+" Bytes";
  if(bytes<1024*1024)return (bytes/1024).toFixed(1)+" KB";
  return (bytes/1024/1024).toFixed(2)+" MB";
}
function progress(v){
  const n=Math.max(0,Math.min(100,Math.round(v)));
  bar.style.width=n+"%";
  pct.textContent=n+"%";
}
function statusText(t){status.textContent=t}

async function selectFile(file){
  if(!file)return;
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){
    statusText("Please choose a PDF file.");
    return;
  }
  selectedFile=file;
  imageFiles=[];
  resultCount.textContent="0";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;
  downloadBtn.disabled=true;
  fileSize.textContent=fmt(file.size);
  pageCount.textContent="…";
  uploadTitle.textContent=file.name;
  uploadHint.innerHTML="PDF selected • Click here to replace";
  progress(5);
  statusText("Reading PDF…");

  try{
    if(!window.pdfjsLib)throw new Error("PDF.js unavailable");
    const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
    pageCount.textContent=pdf.numPages;
    runBtn.disabled=false;
    progress(10);
    statusText("PDF ready. Click PDF To JPG.");
  }catch(e){
    console.error(e);
    selectedFile=null;
    runBtn.disabled=true;
    pageCount.textContent="0";
    progress(0);
    statusText("Could not read this PDF.");
  }
}

async function convert(){
  if(!selectedFile||!window.pdfjsLib)return;
  runBtn.disabled=true;
  downloadBtn.disabled=true;
  imageFiles=[];
  progress(5);

  try{
    const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await selectedFile.arrayBuffer())}).promise;
    const scale=Number(quality.value)||2;
    const mime=format.value;
    const ext=mime==="image/png"?"png":"jpg";

    for(let i=1;i<=pdf.numPages;i++){
      statusText(`Converting page ${i} of ${pdf.numPages}…`);
      const page=await pdf.getPage(i);
      const viewport=page.getViewport({scale});
      const canvas=document.createElement("canvas");
      canvas.width=Math.ceil(viewport.width);
      canvas.height=Math.ceil(viewport.height);
      const ctx=canvas.getContext("2d",{alpha:false});
      ctx.fillStyle="#ffffff";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      await page.render({canvasContext:ctx,viewport}).promise;

      const blob=await new Promise(resolve=>{
        canvas.toBlob(resolve,mime,mime==="image/jpeg"?0.92:undefined);
      });
      if(!blob)throw new Error("Image creation failed");

      imageFiles.push({
        blob,
        name:selectedFile.name.replace(/\.pdf$/i,"")+`-page-${i}.${ext}`
      });

      progress(10+(i/pdf.numPages)*85);
    }

    resultCount.textContent=String(imageFiles.length);
    resultText.textContent=`${imageFiles.length} image${imageFiles.length>1?"s":""} ready`;
    resultEmpty.hidden=true;
    resultSummary.hidden=false;
    downloadBtn.disabled=false;
    progress(100);
    statusText("Conversion complete.");
  }catch(e){
    console.error(e);
    progress(0);
    statusText("Conversion could not be completed. Please try another PDF.");
  }finally{
    runBtn.disabled=!selectedFile;
  }
}

async function download(){
  if(!imageFiles.length)return;

  // Multiple pages: download each image separately. Browser may ask for
  // permission for multiple downloads.
  for(const item of imageFiles){
    const url=URL.createObjectURL(item.blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=item.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    await new Promise(r=>setTimeout(r,180));
  }
}

function reset(){
  selectedFile=null;
  imageFiles=[];
  fileInput.value="";
  fileSize.textContent="0 KB";
  pageCount.textContent="0";
  uploadTitle.textContent="Choose File";
  uploadHint.innerHTML="📁 Select your PDF<br>🖱️ Drag & Drop";
  resultCount.textContent="0";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;
  runBtn.disabled=true;
  downloadBtn.disabled=true;
  progress(0);
  statusText("Choose a PDF file to begin.");
}

fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{
  if(e.target.closest("label,input"))return;
  fileInput.click();
});
upload.addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click();}
});
upload.addEventListener("dragover",e=>{e.preventDefault();upload.classList.add("dragging")});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{
  e.preventDefault();upload.classList.remove("dragging");
  const file=e.dataTransfer.files&&e.dataTransfer.files[0];
  if(file)selectFile(file);
});
runBtn.addEventListener("click",convert);
downloadBtn.addEventListener("click",download);
resetBtn.addEventListener("click",reset);

})();
