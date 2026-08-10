(() => {
"use strict";

const $ = id => document.getElementById(id);

const fileInput=$("fileInput");
const upload=$("upload");
const runBtn=$("run");
const downloadBtn=$("download");
const resetBtn=$("reset");

const fileList=$("fileList");
const fileCount=$("fileCount");
const pageCount=$("pageCount");
const uploadTitle=$("uploadTitle");
const uploadHint=$("uploadHint");
const status=$("status");
const bar=$("bar");
const pct=$("pct");
const resultInfo=$("resultInfo");
const resultEmpty=$("resultEmpty");
const resultSummary=$("resultSummary");
const resultText=$("resultText");

let files=[];
let mergedBlob=null;

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

function renderList(pageCounts=[]){
  if(!files.length){
    fileList.innerHTML=
      '<div class="empty-list"><i class="fa-regular fa-file-pdf"></i><span>Your PDF files will appear here.</span></div>';
    return;
  }

  fileList.innerHTML="";

  files.forEach((file,index)=>{
    const row=document.createElement("div");
    row.className="file-item";

    const num=document.createElement("div");
    num.className="file-number";
    num.textContent=index+1;

    const name=document.createElement("div");
    name.className="file-name";
    name.title=file.name;
    name.textContent=file.name;

    const meta=document.createElement("div");
    meta.className="file-meta";

    const pages=document.createElement("span");
    pages.className="file-pages";
    const count=pageCounts[index];
    pages.textContent=(count ? `${count} page${count>1?"s":""}` : "Reading…");

    const size=document.createElement("span");
    size.className="file-size";
    size.textContent=fmt(file.size);

    meta.append(pages,size);

    const remove=document.createElement("button");
    remove.type="button";
    remove.className="file-remove";
    remove.innerHTML='<i class="fa-solid fa-xmark"></i>';
    remove.title="Remove";
    remove.addEventListener("click",()=>{
      files.splice(index,1);
      updateFiles();
    });

    row.append(num,name,meta,remove);
    fileList.appendChild(row);
  });
}

async function updateFiles(){
  fileCount.textContent=files.length;
  pageCount.textContent="…";
  mergedBlob=null;
  downloadBtn.disabled=true;
  resultInfo.textContent="—";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;

  if(!files.length){
    pageCount.textContent="0";
    const orderTotal=document.getElementById("orderTotalPages");
    if(orderTotal) orderTotal.textContent="0";
    uploadTitle.textContent="Choose Files";
    uploadHint.innerHTML="📁 Select PDF files<br>🖱️ Drag & Drop";
    runBtn.disabled=true;
    progress(0);
    renderList();
    setStatus("Choose PDF files to begin.");
    return;
  }

  uploadTitle.textContent=`${files.length} PDF${files.length>1?"s":""} selected`;
  uploadHint.innerHTML="PDFs selected • Click here to replace";
  runBtn.disabled=false;

  try{
    if(!window.PDFLib)throw new Error("PDF library unavailable");

    let total=0;
    const pageCounts=[];

    for(let i=0;i<files.length;i++){
      const bytes=await files[i].arrayBuffer();
      const pdf=await PDFLib.PDFDocument.load(bytes,{ignoreEncryption:false});
      const count=pdf.getPageCount();
      pageCounts.push(count);
      total+=count;
    }

    pageCount.textContent=total;
    const orderTotal=document.getElementById("orderTotalPages");
    if(orderTotal) orderTotal.textContent=total;
    renderList(pageCounts);
    setStatus(`${files.length} PDF${files.length>1?"s":""} ready to merge.`);
  }catch(e){
    console.error(e);
    pageCount.textContent="—";
    const orderTotal=document.getElementById("orderTotalPages");
    if(orderTotal) orderTotal.textContent="—";
    renderList();
    setStatus("Some PDF files could not be read.");
  }
}

function acceptFiles(fileListObj){
  const incoming=Array.from(fileListObj||[]).filter(file=>
    file.type==="application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );

  if(!incoming.length){
    setStatus("Please choose PDF files.");
    return;
  }

  files=[...files,...incoming];
  updateFiles();
}

async function merge(){
  if(!files.length)return;

  if(!window.PDFLib){
    setStatus("PDF tool is not ready. Please refresh and try again.");
    return;
  }

  runBtn.disabled=true;
  downloadBtn.disabled=true;
  progress(2);

  try{
    const merged=await PDFLib.PDFDocument.create();
    let totalPages=0;

    for(let i=0;i<files.length;i++){
      setStatus(`Merging PDF ${i+1} of ${files.length}…`);

      const sourceBytes=await files[i].arrayBuffer();
      const source=await PDFLib.PDFDocument.load(sourceBytes);
      const copied=await merged.copyPages(source,source.getPageIndices());

      copied.forEach(page=>{
        merged.addPage(page);
        totalPages++;
      });

      progress(5+((i+1)/files.length)*88);
    }

    setStatus("Creating merged PDF…");
    const bytes=await merged.save({
      useObjectStreams:true,
      addDefaultPage:false
    });

    mergedBlob=new Blob([bytes],{type:"application/pdf"});

    resultInfo.textContent=fmt(mergedBlob.size);
    resultText.textContent=`${totalPages} page${totalPages>1?"s":""} • ${files.length} PDF files`;

    resultEmpty.hidden=true;
    resultSummary.hidden=false;
    downloadBtn.disabled=false;

    progress(100);
    setStatus("Merged PDF is ready.");
  }catch(e){
    console.error(e);
    progress(0);
    setStatus("Could not merge the PDFs. Please check the files and try again.");
  }finally{
    runBtn.disabled=files.length===0;
  }
}

function download(){
  if(!mergedBlob)return;

  const url=URL.createObjectURL(mergedBlob);
  const a=document.createElement("a");
  a.href=url;
  a.download="merged-pdf.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function reset(){
  files=[];
  mergedBlob=null;
  fileInput.value="";

  fileCount.textContent="0";
  pageCount.textContent="0";
  const orderTotal=document.getElementById("orderTotalPages");
  if(orderTotal) orderTotal.textContent="0";
  uploadTitle.textContent="Choose Files";
  uploadHint.innerHTML="📁 Select PDF files<br>🖱️ Drag & Drop";

  resultInfo.textContent="—";
  resultEmpty.hidden=false;
  resultSummary.hidden=true;

  runBtn.disabled=true;
  downloadBtn.disabled=true;

  progress(0);
  setStatus("Choose PDF files to begin.");
  renderList();
}

fileInput.addEventListener("change",e=>{
  // Every new selection is added to the existing list.
  acceptFiles(e.target.files);
  // Allow selecting the same file again later.
  fileInput.value="";
});

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

  acceptFiles(e.dataTransfer.files);
});

runBtn.addEventListener("click",merge);
downloadBtn.addEventListener("click",download);
resetBtn.addEventListener("click",reset);

renderList();

})();
