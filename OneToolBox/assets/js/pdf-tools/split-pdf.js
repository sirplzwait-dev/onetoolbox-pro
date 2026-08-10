(() => {
"use strict";

const $=id=>document.getElementById(id);
const fileInput=$("fileInput");
const upload=$("upload");
const runBtn=$("run");
const downloadBtn=$("download");
const resetBtn=$("reset");
const splitMode=$("splitMode");
const everyN=$("everyN");
const everyBox=$("everyBox");
const rangesBox=$("rangesBox");
const ranges=$("ranges");

const fileSize=$("fileSize");
const pageCount=$("pageCount");
const uploadTitle=$("uploadTitle");
const uploadHint=$("uploadHint");
const status=$("status");
const bar=$("bar");
const pct=$("pct");
const resultCount=$("resultCount");
const resultEmpty=$("resultEmpty");
const resultSummary=$("resultSummary");
const resultText=$("resultText");

let selectedFile=null;
let outputs=[];

function fmt(bytes){
  if(!bytes)return "0 KB";
  if(bytes<1024)return bytes+" Bytes";
  if(bytes<1024*1024)return (bytes/1024).toFixed(1)+" KB";
  return (bytes/1024/1024).toFixed(2)+" MB";
}
function progress(v){
  const n=Math.max(0,Math.min(100,Math.round(v)));
  bar.style.width=n+"%"; pct.textContent=n+"%";
}
function setStatus(t){status.textContent=t}

splitMode.addEventListener("change",()=>{
  const mode=splitMode.value;
  everyBox.classList.toggle("hidden",mode!=="every");
  rangesBox.classList.toggle("hidden",mode!=="ranges");
});

async function selectFile(file){
  if(!file)return;
  if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){
    setStatus("Please choose a PDF file.");
    return;
  }

  selectedFile=file;
  outputs=[];
  fileSize.textContent=fmt(file.size);
  uploadTitle.textContent=file.name;
  uploadHint.innerHTML="PDF selected • Click here to replace";
  resultCount.textContent="0";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;
  downloadBtn.disabled=true;
  progress(5);
  setStatus("Reading PDF…");

  try{
    if(!window.PDFLib)throw new Error("PDF library unavailable");
    const pdf=await PDFLib.PDFDocument.load(await file.arrayBuffer());
    pageCount.textContent=pdf.getPageCount();
    runBtn.disabled=false;
    progress(10);
    setStatus("PDF ready. Choose how you want to split it.");
  }catch(e){
    console.error(e);
    selectedFile=null;
    runBtn.disabled=true;
    pageCount.textContent="0";
    progress(0);
    setStatus("Could not read this PDF.");
  }
}

function parseRanges(text,total){
  const chunks=[];
  const parts=text.split(",").map(s=>s.trim()).filter(Boolean);

  for(const part of parts){
    const match=part.match(/^(\d+)\s*-\s*(\d+)$/);
    if(!match)throw new Error(`Invalid range: ${part}`);

    let start=Number(match[1]);
    let end=Number(match[2]);

    if(start>end)[start,end]=[end,start];
    if(start<1||end>total)throw new Error(`Range ${part} is outside the PDF pages.`);

    chunks.push({start:start-1,end:end});
  }
  return chunks;
}

function makeChunks(total){
  const mode=splitMode.value;

  if(mode==="single"){
    return Array.from({length:total},(_,i)=>({start:i,end:i+1}));
  }

  if(mode==="ranges"){
    if(!ranges.value.trim())throw new Error("Enter page ranges.");
    return parseRanges(ranges.value,total);
  }

  const n=Math.max(1,Number(everyN.value)||1);
  const chunks=[];
  for(let start=0;start<total;start+=n){
    chunks.push({start,end:Math.min(start+n,total)});
  }
  return chunks;
}

async function convert(){
  if(!selectedFile)return;

  if(!window.PDFLib){
    setStatus("PDF tool is not ready. Please refresh and try again.");
    return;
  }

  runBtn.disabled=true;
  downloadBtn.disabled=true;
  outputs=[];
  progress(3);

  try{
    const source=await PDFLib.PDFDocument.load(await selectedFile.arrayBuffer());
    const total=source.getPageCount();
    const chunks=makeChunks(total);

    if(!chunks.length)throw new Error("No pages selected.");

    for(let i=0;i<chunks.length;i++){
      const chunk=chunks[i];
      setStatus(`Creating PDF ${i+1} of ${chunks.length}…`);

      const out=await PDFLib.PDFDocument.create();
      const indexes=[];
      for(let p=chunk.start;p<chunk.end;p++)indexes.push(p);

      const pages=await out.copyPages(source,indexes);
      pages.forEach(page=>out.addPage(page));

      const bytes=await out.save({
        useObjectStreams:true,
        addDefaultPage:false
      });

      outputs.push({
        blob:new Blob([bytes],{type:"application/pdf"}),
        name:selectedFile.name.replace(/\.pdf$/i,"")+`-part-${i+1}.pdf`
      });

      progress(8+((i+1)/chunks.length)*87);
    }

    resultCount.textContent=outputs.length;
    resultText.textContent=
      `${outputs.length} PDF${outputs.length>1?"s":""} created`;

    resultEmpty.hidden=true;
    resultSummary.hidden=false;
    downloadBtn.disabled=false;
    progress(100);
    setStatus("Split PDF files are ready.");
  }catch(e){
    console.error(e);
    progress(0);
    setStatus(e.message||"Could not split the PDF.");
  }finally{
    runBtn.disabled=!selectedFile;
  }
}

async function downloadAll(){
  if(!outputs.length)return;

  for(const item of outputs){
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
  outputs=[];
  fileInput.value="";
  fileSize.textContent="0 KB";
  pageCount.textContent="0";
  uploadTitle.textContent="Choose File";
  uploadHint.innerHTML="📁 Select a PDF<br>🖱️ Drag & Drop";
  resultCount.textContent="0";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;
  runBtn.disabled=true;
  downloadBtn.disabled=true;
  ranges.value="";
  progress(0);
  setStatus("Choose a PDF file to begin.");
}

fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{
  if(e.target.closest("label,input"))return;
  fileInput.click();
});
upload.addEventListener("keydown",e=>{
  if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click();}
});
upload.addEventListener("dragover",e=>{
  e.preventDefault(); upload.classList.add("dragging");
});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{
  e.preventDefault(); upload.classList.remove("dragging");
  selectFile(e.dataTransfer.files&&e.dataTransfer.files[0]);
});

runBtn.addEventListener("click",convert);
downloadBtn.addEventListener("click",downloadAll);
resetBtn.addEventListener("click",reset);

})();
