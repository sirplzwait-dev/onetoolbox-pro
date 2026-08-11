import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.7.0?bundle";

"use strict";

document.addEventListener("DOMContentLoaded",()=>{
const $=id=>document.getElementById(id);
const input=$("fileInput"),choose=$("chooseBtn"),drop=$("drop"),orig=$("originalPreview");
const icon=$("uploadIcon"),title=$("uploadTitle"),info=$("uploadInfo");
const name=$("fileName"),size=$("fileSize"),dim=$("dimensions");
const process=$("processBtn"),status=$("status"),range=$("blurRange"),value=$("blurValue");
const canvas=$("resultCanvas"),empty=$("empty"),outSize=$("outputSize"),outDim=$("outputDimensions"),download=$("downloadBtn");
const reset=$("resetBtn");
let file=null,url=null,cutoutBlob=null,resultUrl=null;

const fmt=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(2)+" KB":(n/1048576).toFixed(2)+" MB";

function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src})}

choose.addEventListener("click",e=>{e.preventDefault();input.click()});
input.addEventListener("change",e=>loadFile(e.target.files[0]));

drop.addEventListener("click",e=>{
 if(e.target===drop||e.target===icon||e.target===title||e.target===info) input.click();
});
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("dragover")});
drop.addEventListener("dragleave",()=>drop.classList.remove("dragover"));
drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("dragover");loadFile(e.dataTransfer.files[0])});

document.addEventListener("paste",e=>{
 for(const item of e.clipboardData?.items||[]){
  if(item.type.startsWith("image/")){loadFile(item.getAsFile());break}
 }
});

async function loadFile(f){
 if(!f||!f.type.startsWith("image/"))return alert("Please choose a valid image.");
 file=f;
 if(url)URL.revokeObjectURL(url);
 url=URL.createObjectURL(f);
 const im=await loadImage(url);
 orig.src=url;orig.style.display="block";
 icon.style.display=title.style.display=info.style.display="none";
 name.textContent=f.name;size.textContent=fmt(f.size);dim.textContent=`${im.naturalWidth} × ${im.naturalHeight} px`;
 process.disabled=false;
 status.textContent="Image ready. Choose a blur level and click Blur Background.";
}

range.addEventListener("input",()=>value.textContent=range.value+" px");
document.querySelectorAll(".style").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".style").forEach(x=>x.classList.remove("active"));
 btn.classList.add("active");range.value=btn.dataset.blur;value.textContent=range.value+" px";
}));

process.addEventListener("click",async()=>{
 if(!file)return;
 process.disabled=true;
 status.textContent="AI is detecting the subject… First use may take longer while the model loads.";
 try{
  cutoutBlob=await removeBackground(file,{
   progress:(key,current,total)=>{
    if(total)status.textContent=`Detecting subject… ${Math.round(current/total*100)}%`;
   }
  });
  status.textContent="Creating blurred background…";
  const original=await loadImage(url);
  const cutUrl=URL.createObjectURL(cutoutBlob);
  const subject=await loadImage(cutUrl);
  const w=original.naturalWidth,h=original.naturalHeight;
  canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext("2d");
  ctx.clearRect(0,0,w,h);
  const blur=parseInt(range.value,10);

  // Draw enlarged blurred original to avoid transparent edges caused by blur.
  ctx.save();
  ctx.filter=`blur(${blur}px)`;
  const pad=blur*2;
  ctx.drawImage(original,-pad,-pad,w+pad*2,h+pad*2);
  ctx.restore();

  // Sharp foreground cutout on top.
  ctx.drawImage(subject,0,0,w,h);

  canvas.style.display="block";empty.style.display="none";
  canvas.toBlob(blob=>{
   if(resultUrl)URL.revokeObjectURL(resultUrl);
   resultUrl=URL.createObjectURL(blob);
   outSize.textContent=fmt(blob.size);
   outDim.textContent=`${w} × ${h} px`;
   download.href=resultUrl;
   download.download=file.name.replace(/\.[^/.]+$/,"")+" - OneToolBox.jpg";
   download.classList.remove("disabled");
   status.textContent="✓ Background blurred successfully.";
   process.disabled=false;
  },"image/jpeg",0.92);
  URL.revokeObjectURL(cutUrl);
 }catch(err){
  console.error(err);
  status.textContent="Blur failed. Please try another image.";
  process.disabled=false;
  alert("Background blur failed. Please try again.");
 }
});

reset.addEventListener("click",()=>{
 input.value="";
 if(url)URL.revokeObjectURL(url);if(resultUrl)URL.revokeObjectURL(resultUrl);
 file=null;url=null;resultUrl=null;cutoutBlob=null;
 orig.removeAttribute("src");orig.style.display="none";
 icon.style.display=title.style.display=info.style.display="";
 name.textContent="-";size.textContent="0 KB";dim.textContent="0 × 0 px";
 process.disabled=true;status.textContent="Upload an image first.";
 canvas.style.display="none";empty.style.display="block";
 outSize.textContent="0 KB";outDim.textContent="0 × 0 px";
 download.classList.add("disabled");download.removeAttribute("href");
});
});