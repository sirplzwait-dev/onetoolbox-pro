(() => {
"use strict";
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),upload=$("upload"),runBtn=$("run"),downloadBtn=$("download"),resetBtn=$("reset");
const extractPages=$("extractPages"),selectedCount=$("selectedCount");
const fileSize=$("fileSize"),pageCount=$("pageCount"),uploadTitle=$("uploadTitle"),uploadHint=$("uploadHint"),status=$("status"),bar=$("bar"),pct=$("pct"),resultInfo=$("resultInfo"),resultEmpty=$("resultEmpty"),resultSummary=$("resultSummary"),resultText=$("resultText");
let selectedFile=null,outputBlob=null,total=0;

function fmt(bytes){if(!bytes)return"0 KB";if(bytes<1024)return bytes+" Bytes";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";return(bytes/1048576).toFixed(2)+" MB"}
function progress(v){const n=Math.max(0,Math.min(100,Math.round(v)));bar.style.width=n+"%";pct.textContent=n+"%"}
function setStatus(t){status.textContent=t}

function parsePages(text,max){
 const set=new Set();
 for(const part of text.split(",").map(x=>x.trim()).filter(Boolean)){
  const m=part.match(/^(\d+)\s*-\s*(\d+)$/);
  if(m){
   let a=+m[1],b=+m[2];if(a>b)[a,b]=[b,a];
   if(a<1||b>max)throw new Error("Page range is outside the PDF.");
   for(let i=a;i<=b;i++)set.add(i-1);
  }else{
   const n=+part;
   if(!Number.isInteger(n)||n<1||n>max)throw new Error("Invalid page number.");
   set.add(n-1);
  }
 }
 return set;
}
function updateCount(){
 if(!total){selectedCount.textContent="0";return}
 try{selectedCount.textContent=parsePages(extractPages.value,total).size}catch{selectedCount.textContent="—"}
}
extractPages.addEventListener("input",updateCount);

async function selectFile(file){
 if(!file)return;
 if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){setStatus("Please choose a PDF file.");return}
 selectedFile=file;outputBlob=null;downloadBtn.disabled=true;resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;
 fileSize.textContent=fmt(file.size);uploadTitle.textContent=file.name;uploadHint.innerHTML="PDF selected • Click here to replace";progress(5);setStatus("Reading PDF…");
 try{
  if(!window.PDFLib)throw new Error();
  const pdf=await PDFLib.PDFDocument.load(await file.arrayBuffer());total=pdf.getPageCount();pageCount.textContent=total;runBtn.disabled=false;progress(10);setStatus("PDF ready. Enter pages to extract.");
 }catch(e){selectedFile=null;total=0;runBtn.disabled=true;pageCount.textContent="0";progress(0);setStatus("Could not read this PDF.")}
}

document.querySelectorAll(".quick").forEach(btn=>btn.addEventListener("click",()=>{
 if(!total){setStatus("Choose a PDF first.");return}
 if(btn.dataset.mode==="first")extractPages.value="1";
 if(btn.dataset.mode==="last")extractPages.value=String(total);
 if(btn.dataset.mode==="first5")extractPages.value=`1-${Math.min(5,total)}`;
 if(btn.dataset.mode==="all")extractPages.value=`1-${total}`;
 updateCount();
}));

async function convert(){
 if(!selectedFile)return;
 try{
  const wanted=parsePages(extractPages.value,total);
  if(!wanted.size)throw new Error("Enter at least one page to extract.");
  runBtn.disabled=true;downloadBtn.disabled=true;progress(5);setStatus("Creating extracted PDF…");
  const source=await PDFLib.PDFDocument.load(await selectedFile.arrayBuffer());
  const out=await PDFLib.PDFDocument.create();
  const indexes=Array.from(wanted).sort((a,b)=>a-b);
  const pages=await out.copyPages(source,indexes);pages.forEach(p=>out.addPage(p));
  progress(80);const bytes=await out.save({useObjectStreams:true,addDefaultPage:false});
  outputBlob=new Blob([bytes],{type:"application/pdf"});
  resultInfo.textContent=fmt(outputBlob.size);resultText.textContent=`${indexes.length} page${indexes.length>1?"s":""} extracted`;
  resultEmpty.hidden=true;resultSummary.hidden=false;downloadBtn.disabled=false;progress(100);setStatus("Extracted PDF is ready.");
 }catch(e){progress(0);setStatus(e.message||"Could not extract the PDF pages.")}
 finally{runBtn.disabled=!selectedFile}
}
function download(){if(!outputBlob)return;const url=URL.createObjectURL(outputBlob),a=document.createElement("a");a.href=url;a.download="extracted-pdf-pages.pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function reset(){selectedFile=null;outputBlob=null;total=0;fileInput.value="";extractPages.value="";selectedCount.textContent="0";fileSize.textContent="0 KB";pageCount.textContent="0";uploadTitle.textContent="Choose File";uploadHint.innerHTML="📁 Select a PDF<br>🖱️ Drag & Drop";resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;runBtn.disabled=true;downloadBtn.disabled=true;progress(0);setStatus("Choose a PDF file to begin.")}

fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{if(!e.target.closest("label,input"))fileInput.click()});
upload.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click()}});
upload.addEventListener("dragover",e=>{e.preventDefault();upload.classList.add("dragging")});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{e.preventDefault();upload.classList.remove("dragging");selectFile(e.dataTransfer.files&&e.dataTransfer.files[0])});
runBtn.addEventListener("click",convert);downloadBtn.addEventListener("click",download);resetBtn.addEventListener("click",reset);
})();