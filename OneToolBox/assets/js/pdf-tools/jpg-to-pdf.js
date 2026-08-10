(() => {
"use strict";

const $ = id => document.getElementById(id);

const fileInput = $("fileInput");
const upload = $("upload");
const runBtn = $("run");
const downloadBtn = $("download");
const resetBtn = $("reset");

const pageSize = $("pageSize");
const orientation = $("orientation");
const margin = $("margin");

const imageCount = $("imageCount");
const pageCount = $("pageCount");
const uploadTitle = $("uploadTitle");
const uploadHint = $("uploadHint");
const status = $("status");
const bar = $("bar");
const pct = $("pct");
const resultInfo = $("resultInfo");
const resultEmpty = $("resultEmpty");
const resultSummary = $("resultSummary");
const resultText = $("resultText");

let selectedFiles = [];
let pdfBlob = null;

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

function setStatus(t){status.textContent=t}

function validImage(file){
  return /^image\/(jpeg|png|webp)$/.test(file.type);
}

function setFiles(files){
  const arr=Array.from(files||[]).filter(validImage);

  if(!arr.length){
    setStatus("Please choose JPG, PNG or WebP images.");
    return;
  }

  selectedFiles=arr;
  imageCount.textContent=arr.length;
  pageCount.textContent=arr.length;

  uploadTitle.textContent =
    arr.length===1 ? arr[0].name : `${arr.length} images selected`;

  uploadHint.innerHTML="Images selected • Click here to replace";

  runBtn.disabled=false;
  downloadBtn.disabled=true;
  pdfBlob=null;
  resultInfo.textContent="—";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;
  progress(0);

  setStatus(`${arr.length} image${arr.length>1?"s":""} ready.`);
}

function getImage(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=reject;
    img.src=src;
  });
}

async function imageToDataURL(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>resolve(reader.result);
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

function pageConfig(img){
  const ps=pageSize.value;
  const ori=orientation.value;

  let w,h;

  if(ps==="fit"){
    w=img.naturalWidth;
    h=img.naturalHeight;
    return {w,h,unit:"px"};
  }

  if(ps==="letter"){
    w=215.9; h=279.4;
  }else{
    w=210; h=297;
  }

  if(ori==="landscape"){
    [w,h]=[h,w];
  }else if(ori==="auto"){
    if(img.naturalWidth>img.naturalHeight) [w,h]=[h,w];
  }

  return {w,h,unit:"mm"};
}

async function convert(){
  if(!selectedFiles.length)return;

  if(!window.jspdf || !window.jspdf.jsPDF){
    setStatus("PDF tool is not ready. Please refresh and try again.");
    return;
  }

  runBtn.disabled=true;
  downloadBtn.disabled=true;
  pdfBlob=null;
  progress(3);

  try{
    let pdf=null;

    for(let i=0;i<selectedFiles.length;i++){
      const file=selectedFiles[i];
      setStatus(`Adding image ${i+1} of ${selectedFiles.length}…`);

      const data=await imageToDataURL(file);
      const img=await getImage(data);
      const cfg=pageConfig(img);

      if(!pdf){
        if(cfg.unit==="px"){
          pdf=new jspdf.jsPDF({
            orientation:img.naturalWidth>img.naturalHeight?"landscape":"portrait",
            unit:"px",
            format:[cfg.w,cfg.h],
            compress:true
          });
        }else{
          pdf=new jspdf.jsPDF({
            orientation:cfg.w>cfg.h?"landscape":"portrait",
            unit:"mm",
            format:[cfg.w,cfg.h],
            compress:true
          });
        }
      }else{
        if(cfg.unit==="px"){
          pdf.addPage([cfg.w,cfg.h],
            img.naturalWidth>img.naturalHeight?"landscape":"portrait");
        }else{
          pdf.addPage([cfg.w,cfg.h],
            cfg.w>cfg.h?"landscape":"portrait");
        }
      }

      let pageW=pdf.internal.pageSize.getWidth();
      let pageH=pdf.internal.pageSize.getHeight();

      let m=Number(margin.value)||0;
      if(cfg.unit==="px" && pageSize.value==="fit") m=0;

      const maxW=Math.max(1,pageW-(m*2));
      const maxH=Math.max(1,pageH-(m*2));

      const scale=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight);
      const drawW=img.naturalWidth*scale;
      const drawH=img.naturalHeight*scale;
      const x=(pageW-drawW)/2;
      const y=(pageH-drawH)/2;

      const format=file.type==="image/png"?"PNG":"JPEG";

      pdf.addImage(data,format,x,y,drawW,drawH,undefined,"FAST");

      progress(5+(i/selectedFiles.length)*90);
    }

    setStatus("Creating PDF…");
    progress(97);

    pdfBlob=pdf.output("blob");

    resultInfo.textContent=fmt(pdfBlob.size);
    resultText.textContent=
      `${selectedFiles.length} page${selectedFiles.length>1?"s":""} ready`;

    resultEmpty.hidden=true;
    resultSummary.hidden=false;
    downloadBtn.disabled=false;

    progress(100);
    setStatus("PDF is ready.");

  }catch(error){
    console.error(error);
    progress(0);
    setStatus("Could not create the PDF. Please try another image.");
  }finally{
    runBtn.disabled=selectedFiles.length===0;
  }
}

function download(){
  if(!pdfBlob)return;

  const url=URL.createObjectURL(pdfBlob);
  const a=document.createElement("a");
  a.href=url;
  a.download="images-to-pdf.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function reset(){
  selectedFiles=[];
  pdfBlob=null;
  fileInput.value="";

  imageCount.textContent="0";
  pageCount.textContent="0";
  uploadTitle.textContent="Choose Images";
  uploadHint.innerHTML="📁 Select JPG / PNG<br>🖱️ Drag & Drop";

  resultInfo.textContent="—";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;

  runBtn.disabled=true;
  downloadBtn.disabled=true;

  progress(0);
  setStatus("Choose images to begin.");
}

fileInput.addEventListener("change",e=>setFiles(e.target.files));

upload.addEventListener("click",e=>{
  if(e.target.closest("label,input"))return;
  fileInput.click();
});

upload.addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){
    e.preventDefault();
    fileInput.click();
  }
});

upload.addEventListener("dragover",e=>{
  e.preventDefault();
  upload.classList.add("dragging");
});

upload.addEventListener("dragleave",()=>{
  upload.classList.remove("dragging");
});

upload.addEventListener("drop",e=>{
  e.preventDefault();
  upload.classList.remove("dragging");
  setFiles(e.dataTransfer.files);
});

runBtn.addEventListener("click",convert);
downloadBtn.addEventListener("click",download);
resetBtn.addEventListener("click",reset);

})();
