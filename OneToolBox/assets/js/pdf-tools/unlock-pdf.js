(() => {
"use strict";
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),upload=$("upload"),runBtn=$("run"),downloadBtn=$("download"),resetBtn=$("reset");
const password=$("password"),showPassword=$("showPassword");
const fileSize=$("fileSize"),pageCount=$("pageCount"),uploadTitle=$("uploadTitle"),uploadHint=$("uploadHint"),status=$("status"),bar=$("bar"),pct=$("pct"),resultInfo=$("resultInfo"),resultEmpty=$("resultEmpty"),resultSummary=$("resultSummary"),resultText=$("resultText");
let selectedFile=null,outputBlob=null,qpdf=null,qpdfPromise=null;

function fmt(bytes){if(!bytes)return"0 KB";if(bytes<1024)return bytes+" Bytes";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";return(bytes/1048576).toFixed(2)+" MB"}
function progress(v){const n=Math.max(0,Math.min(100,Math.round(v)));bar.style.width=n+"%";pct.textContent=n+"%"}
function setStatus(t){status.textContent=t}

async function loadQpdf(){
 if(qpdf)return qpdf;if(qpdfPromise)return qpdfPromise;
 qpdfPromise=(async()=>{
  if(typeof window.Module!=="function")throw new Error("QPDF library could not be loaded.");
  return await window.Module({
   locateFile:()=> "https://unpkg.com/@neslinesli93/qpdf-wasm@0.3.0/dist/qpdf.wasm",
   noInitialRun:true,
   preRun:[m=>{try{m.FS.mkdir("/input")}catch{}try{m.FS.mkdir("/output")}catch{}}]
  });
 })();
 qpdf=await qpdfPromise;return qpdf;
}
function cleanup(paths){if(!qpdf?.FS)return;for(const p of paths){try{qpdf.FS.unlink(p)}catch{}}}

async function selectFile(file){
 if(!file)return;
 if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){setStatus("Please choose a PDF file.");return}
 selectedFile=file;outputBlob=null;downloadBtn.disabled=true;resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;
 fileSize.textContent=fmt(file.size);uploadTitle.textContent=file.name;uploadHint.innerHTML="PDF selected • Click here to replace";progress(5);setStatus("Reading PDF…");
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());
  const text=new TextDecoder("latin1").decode(bytes);
  const matches=text.match(/\/Type\s*\/Page\b/g);pageCount.textContent=matches?matches.length:"—";
  runBtn.disabled=false;progress(10);setStatus("PDF ready. Enter the current password.");
 }catch{pageCount.textContent="—";runBtn.disabled=false;progress(0);setStatus("PDF selected. Enter the current password.")}
}
async function unlock(){
 const pass=password.value;
 if(!selectedFile||!pass){setStatus("Choose a PDF and enter its current password.");return}
 runBtn.disabled=true;downloadBtn.disabled=true;progress(5);setStatus("Loading PDF engine…");
 const input="/input/unlock-input.pdf",output="/output/unlocked.pdf";
 try{
  const engine=await loadQpdf();progress(30);setStatus("Decrypting PDF locally…");
  engine.FS.writeFile(input,new Uint8Array(await selectedFile.arrayBuffer()));
  engine.callMain([input,`--password=${pass}`,"--decrypt",output]);
  const out=engine.FS.readFile(output);
  outputBlob=new Blob([out],{type:"application/pdf"});
  resultInfo.textContent=fmt(outputBlob.size);
  resultText.textContent="Password protection removed • processed locally";
  resultEmpty.hidden=true;resultSummary.hidden=false;downloadBtn.disabled=false;progress(100);setStatus("PDF unlocked successfully.");
 }catch(e){
  console.error(e);progress(0);
  setStatus("Unlock failed. Check that the password is correct and the PDF is not damaged.");
 }finally{cleanup([input,output]);runBtn.disabled=!selectedFile}
}
function download(){if(!outputBlob)return;const url=URL.createObjectURL(outputBlob),base=(selectedFile?.name||"document.pdf").replace(/\.pdf$/i,"");const a=document.createElement("a");a.href=url;a.download="unlocked-"+base+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function reset(){selectedFile=null;outputBlob=null;fileInput.value="";password.value="";fileSize.textContent="0 KB";pageCount.textContent="0";uploadTitle.textContent="Choose File";uploadHint.innerHTML="📁 Select a PDF<br>🖱️ Drag & Drop";resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;runBtn.disabled=true;downloadBtn.disabled=true;progress(0);setStatus("Choose a PDF file to begin.")}

password.addEventListener("input",()=>runBtn.disabled=!(selectedFile&&password.value));
showPassword.addEventListener("click",()=>{const type=password.type==="password"?"text":"password";password.type=type;showPassword.innerHTML=type==="password"?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash"></i>'});
fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{if(!e.target.closest("label,input"))fileInput.click()});
upload.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click()}});
upload.addEventListener("dragover",e=>{e.preventDefault();upload.classList.add("dragging")});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{e.preventDefault();upload.classList.remove("dragging");selectFile(e.dataTransfer.files&&e.dataTransfer.files[0])});
runBtn.addEventListener("click",unlock);downloadBtn.addEventListener("click",download);resetBtn.addEventListener("click",reset);
})();