(() => {
"use strict";
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),upload=$("upload"),runBtn=$("run"),downloadBtn=$("download"),resetBtn=$("reset");
const password=$("password"),confirmPassword=$("confirmPassword"),showPassword=$("showPassword");
const strengthBar=$("strengthBar"),strengthText=$("strengthText");
const fileSize=$("fileSize"),pageCount=$("pageCount"),uploadTitle=$("uploadTitle"),uploadHint=$("uploadHint"),status=$("status"),bar=$("bar"),pct=$("pct"),resultInfo=$("resultInfo"),resultEmpty=$("resultEmpty"),resultSummary=$("resultSummary"),resultText=$("resultText");
let selectedFile=null,outputBlob=null,qpdf=null,qpdfLoading=null;

function fmt(bytes){if(!bytes)return"0 KB";if(bytes<1024)return bytes+" Bytes";if(bytes<1048576)return(bytes/1024).toFixed(1)+" KB";return(bytes/1048576).toFixed(2)+" MB"}
function progress(v){const n=Math.max(0,Math.min(100,Math.round(v)));bar.style.width=n+"%";pct.textContent=n+"%"}
function setStatus(t){status.textContent=t}
function updateStrength(){
 const p=password.value;let score=0;if(p.length>=6)score++;if(p.length>=10)score++;if(/[A-Z]/.test(p))score++;if(/[0-9]/.test(p))score++;if(/[^A-Za-z0-9]/.test(p))score++;
 const labels=["—","Weak","Fair","Good","Strong","Very Strong"];strengthText.textContent=labels[score];strengthBar.style.width=(score/5*100)+"%";
}
function valid(){return !!selectedFile&&password.value.length>=4&&password.value===confirmPassword.value}
function updateButton(){runBtn.disabled=!valid()}
async function loadQpdf(){
 if(qpdf)return qpdf;if(qpdfLoading)return qpdfLoading;
 qpdfLoading=(async()=>{
  if(typeof window.Module!=="function")throw new Error("QPDF library could not be loaded.");
  const mod=await window.Module({locateFile:()=> "https://unpkg.com/@neslinesli93/qpdf-wasm@0.3.0/dist/qpdf.wasm",noInitialRun:true});
  return mod;
 })();
 qpdf=await qpdfLoading;return qpdf;
}
function cleanupQpdf(paths=[]){if(!qpdf||!qpdf.FS)return;for(const p of paths){try{qpdf.FS.unlink(p)}catch{}}}

password.addEventListener("input",()=>{updateStrength();updateButton()});
confirmPassword.addEventListener("input",updateButton);
showPassword.addEventListener("click",()=>{const type=password.type==="password"?"text":"password";password.type=type;confirmPassword.type=type;showPassword.innerHTML=type==="password"?'<i class="fa-solid fa-eye"></i>':'<i class="fa-solid fa-eye-slash"></i>'});

async function selectFile(file){
 if(!file)return;
 if(file.type!=="application/pdf"&&!file.name.toLowerCase().endsWith(".pdf")){setStatus("Please choose a PDF file.");return}
 selectedFile=file;outputBlob=null;downloadBtn.disabled=true;resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;
 fileSize.textContent=fmt(file.size);uploadTitle.textContent=file.name;uploadHint.innerHTML="PDF selected • Click here to replace";progress(5);setStatus("Reading PDF…");
 try{
  const bytes=new Uint8Array(await file.arrayBuffer());
  // Lightweight page count without pdf-lib: count /Type /Page objects as a UI estimate.
  const text=new TextDecoder("latin1").decode(bytes);const matches=text.match(/\/Type\s*\/Page\b/g);pageCount.textContent=matches?matches.length:"—";
  updateButton();progress(10);setStatus("PDF ready. Enter a password.");
 }catch{pageCount.textContent="—";updateButton();progress(0);setStatus("Could not read this PDF.")}
}

async function protect(){
 if(!valid()){setStatus("Enter matching passwords. Minimum 4 characters.");return}
 runBtn.disabled=true;downloadBtn.disabled=true;progress(5);setStatus("Loading PDF encryption engine…");
 const inputPath="/onetoolbox-protect-input.pdf",outputPath="/onetoolbox-protect-output.pdf";
 try{
  const engine=await loadQpdf();progress(25);setStatus("Encrypting PDF locally…");
  const bytes=new Uint8Array(await selectedFile.arrayBuffer());
  engine.FS.writeFile(inputPath,bytes);
  const args=[inputPath,"--encrypt",password.value,password.value,"256"];
  args.push($("allowPrint").checked?"--print=full":"--print=none");
  args.push($("allowCopy").checked?"--extract=y":"--extract=n");
  args.push($("allowModify").checked?"--modify=all":"--modify=none");
  args.push("--",outputPath);
  engine.callMain(args);
  const out=engine.FS.readFile(outputPath);
  outputBlob=new Blob([out],{type:"application/pdf"});
  resultInfo.textContent=fmt(outputBlob.size);
  resultText.textContent="AES-256 password protected • processed locally";
  resultEmpty.hidden=true;resultSummary.hidden=false;downloadBtn.disabled=false;progress(100);setStatus("PDF protected successfully.");
 }catch(e){
  console.error(e);progress(0);setStatus("Protection failed: "+(e?.message||"QPDF could not encrypt this PDF."));
 }finally{
  cleanupQpdf([inputPath,outputPath]);runBtn.disabled=!valid();
 }
}
function download(){if(!outputBlob)return;const url=URL.createObjectURL(outputBlob),a=document.createElement("a");a.href=url;a.download="protected-"+(selectedFile?.name||"document.pdf").replace(/\.pdf$/i,"")+".pdf";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function reset(){selectedFile=null;outputBlob=null;fileInput.value="";password.value="";confirmPassword.value="";fileSize.textContent="0 KB";pageCount.textContent="0";uploadTitle.textContent="Choose File";uploadHint.innerHTML="📁 Select a PDF<br>🖱️ Drag & Drop";resultInfo.textContent="—";resultEmpty.hidden=false;resultSummary.hidden=true;runBtn.disabled=true;downloadBtn.disabled=true;strengthBar.style.width="0";strengthText.textContent="—";progress(0);setStatus("Choose a PDF file to begin.")}

fileInput.addEventListener("change",e=>selectFile(e.target.files&&e.target.files[0]));
upload.addEventListener("click",e=>{if(!e.target.closest("label,input"))fileInput.click()});
upload.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();fileInput.click()}});
upload.addEventListener("dragover",e=>{e.preventDefault();upload.classList.add("dragging")});
upload.addEventListener("dragleave",()=>upload.classList.remove("dragging"));
upload.addEventListener("drop",e=>{e.preventDefault();upload.classList.remove("dragging");selectFile(e.dataTransfer.files&&e.dataTransfer.files[0])});
runBtn.addEventListener("click",protect);downloadBtn.addEventListener("click",download);resetBtn.addEventListener("click",reset);
})();