(() => {
"use strict";
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),upload=$("upload"),runBtn=$("run"),downloadBtn=$("download"),resetBtn=$("reset");
const rotateMode=$("rotateMode"),customBox=$("customBox"),customPages=$("customPages");
const fileSize=$("fileSize"),pageCount=$("pageCount"),uploadTitle=$("uploadTitle"),uploadHint=$("uploadHint");
const status=$("status"),bar=$("bar"),pct=$("pct"),resultInfo=$("resultInfo"),resultEmpty=$("resultEmpty"),resultSummary=$("resultSummary"),resultText=$("resultText");
let selectedFile=null,outputBlob=null,angle=90;

function fmt(bytes){if(!bytes)return"0 KB";if(bytes<1024)return bytes+" Bytes";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";return(bytes/1048576).toFixed(2)+" MB"}
function progress(v){const n=Math.max(0,Math.min(100,Math.round(v)));bar.style.width=n+"%";pct.textContent=n+"%"}
function setStatus(t){status.textContent=t}

document.querySelectorAll(".rotate-choice").forEach(btn=>{
  btn.addEventListener("click",()=>{
    document.querySelectorAll(".rotate-choice").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    angle=Number(btn.dataset.deg);
  });
});
rotateMode.addEventListener("change",()=>customBox.hidden=rotateMode.value!=="custom");

async function selectFile(file){
  if(!file)return;
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){setStatus("Please choose a PDF file.");return}
  selectedFile=file;outputBlob=null;downloadBtn.disabled=true;resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;
  fileSize.textContent=fmt(file.size);uploadTitle.textContent=file.name;uploadHint.innerHTML="PDF selected • Click here to replace";progress(5);setStatus("Reading PDF…");
  try{
    if(!window.PDFLib)throw new Error();
    const pdf=await PDFLib.PDFDocument.load(await file.arrayBuffer());
    pageCount.textContent=pdf.getPageCount();runBtn.disabled=false;progress(10);setStatus("PDF ready. Choose the pages and rotation.");
  }catch(e){selectedFile=null;runBtn.disabled=true;pageCount.textContent="0";progress(0);setStatus("Could not read this PDF.")}
}

function parseCustom(text,total){
  const set=new Set();
  for(const part of text.split(",").map(x=>x.trim()).filter(Boolean)){
    const range=part.match(/^(\d+)\s*-\s*(\d+)$/);
    if(range){
      let a=Number(range[1]),b=Number(range[2]);if(a>b)[a,b]=[b,a];
      if(a<1||b>total)throw new Error("Page range is outside the PDF.");
      for(let i=a;i<=b;i++)set.add(i-1);
    }else{
      const n=Number(part);if(!Number.isInteger(n)||n<1||n>total)throw new Error("Invalid page number.");
      set.add(n-1);
    }
  }
  return set;
}

function shouldRotate(i,total){
  const mode=rotateMode.value;
  if(mode==="all")return true;
  if(mode==="odd")return (i+1)%2===1;
  if(mode==="even")return (i+1)%2===0;
  return parseCustom(customPages.value,total).has(i);
}

async function convert(){
  if(!selectedFile)return;
  if(!window.PDFLib){setStatus("PDF tool is not ready. Please refresh and try again.");return}
  runBtn.disabled=true;downloadBtn.disabled=true;progress(3);
  try{
    const source=await PDFLib.PDFDocument.load(await selectedFile.arrayBuffer());
    const pages=source.getPages(),total=pages.length;
    if(rotateMode.value==="custom"&&!customPages.value.trim())throw new Error("Enter the page numbers to rotate.");
    const custom=rotateMode.value==="custom"?parseCustom(customPages.value,total):null;
    let changed=0;
    pages.forEach((page,i)=>{
      if(rotateMode.value==="custom"?custom.has(i):shouldRotate(i,total)){
        const current=page.getRotation().angle||0;
        page.setRotation(PDFLib.degrees(current+angle));
        changed++;
      }
    });
    setStatus("Creating rotated PDF…");progress(75);
    const bytes=await source.save({useObjectStreams:true,addDefaultPage:false});
    outputBlob=new Blob([bytes],{type:"application/pdf"});
    resultInfo.textContent=fmt(outputBlob.size);resultText.textContent=`${changed} page${changed!==1?"s":""} rotated`;
    resultEmpty.hidden=true;resultSummary.hidden=false;downloadBtn.disabled=false;progress(100);setStatus("Rotated PDF is ready.");
  }catch(e){console.error(e);progress(0);setStatus(e.message||"Could not rotate the PDF.")}
  finally{runBtn.disabled=!selectedFile}
}

function download(){
  if(!outputBlob)return;
  const url=URL.createObjectURL(outputBlob),a=document.createElement("a");
  a.href=url;a.download="rotated-pdf.pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function reset(){
  selectedFile=null;outputBlob=null;fileInput.value="";fileSize.textContent="0 KB";pageCount.textContent="0";uploadTitle.textContent="Choose File";uploadHint.innerHTML="📁 Select a PDF<br>🖱️ Drag & Drop";resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;runBtn.disabled=true;downloadBtn.disabled=true;customPages.value="";progress(0);setStatus("Choose a PDF file to begin.");
}
fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{if(!e.target.closest("label,input"))fileInput.click()});
upload.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click()}});
upload.addEventListener("dragover",e=>{e.preventDefault();upload.classList.add("dragging")});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{e.preventDefault();upload.classList.remove("dragging");selectFile(e.dataTransfer.files&&e.dataTransfer.files[0])});
runBtn.addEventListener("click",convert);downloadBtn.addEventListener("click",download);resetBtn.addEventListener("click",reset);
})();