import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.7.0?bundle";

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const input=$("file"), drop=$("drop"), orig=$("orig"), ico=$("ico"), ut=$("ut"), ui=$("ui");
  const name=$("name"), size=$("size"), dim=$("dim"), removeBtn=$("removeBtn"), status=$("status");
  const bgControls=$("bgControls"), applyBtn=$("applyBtn"), bgColor=$("bgColor"), hex=$("hex");
  const bgFile=$("bgFile"), colorPanel=$("colorPanel"), imagePanel=$("imagePanel");
  const canvas=$("canvas"), empty=$("empty"), outSize=$("outSize"), outDim=$("outDim"), download=$("download");
  let file=null, url=null, cutoutBlob=null, bgUrl=null, bgImg=null, bgType="color", resultUrl=null;
  $("chooseImageBtn").addEventListener("click",()=>input.click());
  $("chooseBgBtn").addEventListener("click",()=>bgFile.click());


  const fmt=n=>n<1024?n+" B":n<1048576?(n/1024).toFixed(2)+" KB":(n/1048576).toFixed(2)+" MB";

  function loadImage(src){
    return new Promise((resolve,reject)=>{
      const im=new Image();
      im.onload=()=>resolve(im); im.onerror=reject; im.src=src;
    });
  }

  async function loadFile(f){
    if(!f || !f.type.startsWith("image/")) return alert("Please choose a valid image.");
    file=f;
    if(url) URL.revokeObjectURL(url);
    url=URL.createObjectURL(f);
    const im=await loadImage(url);
    orig.src=url; orig.style.display="block";
    ico.style.display=ut.style.display=ui.style.display="none";
    name.textContent=f.name; size.textContent=fmt(f.size);
    dim.textContent=`${im.naturalWidth} × ${im.naturalHeight} px`;
    removeBtn.disabled=false;
    status.textContent="Image ready. Click Remove Background.";
  }

  input.addEventListener("change",e=>loadFile(e.target.files[0]));
  drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("dragover")});
  drop.addEventListener("dragleave",()=>drop.classList.remove("dragover"));
  drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("dragover");loadFile(e.dataTransfer.files[0])});
  document.addEventListener("paste",e=>{
    for(const item of e.clipboardData?.items||[]){
      if(item.type.startsWith("image/")){loadFile(item.getAsFile());break}
    }
  });

  removeBtn.addEventListener("click",async()=>{
    if(!file)return;
    removeBtn.disabled=true;
    applyBtn.disabled=true;
    bgControls.classList.remove("ready");
    status.textContent="AI is removing the background… First use may download the model and take longer.";
    try{
      cutoutBlob=await removeBackground(file,{
        progress:(key,current,total)=>{
          if(total) status.textContent=`Removing background… ${Math.round(current/total*100)}%`;
        }
      });
      status.textContent="✓ Background removed. Now choose a color or image.";
      bgControls.classList.add("ready");
      applyBtn.disabled=false;

      const cutUrl=URL.createObjectURL(cutoutBlob);
      const cut=await loadImage(cutUrl);
      canvas.width=cut.naturalWidth; canvas.height=cut.naturalHeight;
      const ctx=canvas.getContext("2d");
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(cut,0,0);
      canvas.style.display="block"; empty.style.display="none";
      URL.revokeObjectURL(cutUrl);
    }catch(err){
      console.error(err);
      status.textContent="Background removal failed. Please try another image or check your internet connection for the first model download.";
      alert("Background removal failed. Please try again.");
      removeBtn.disabled=false;
    }
  });

  document.querySelectorAll("#bgControls .options button").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll("#bgControls .options button").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    bgType=btn.dataset.type;
    colorPanel.classList.toggle("hidden",bgType!=="color");
    imagePanel.classList.toggle("hidden",bgType!=="image");
  }));

  function setColor(v){
    if(/^#[0-9a-f]{6}$/i.test(v)){bgColor.value=v;hex.value=v}
  }
  bgColor.addEventListener("input",()=>hex.value=bgColor.value);
  hex.addEventListener("input",()=>setColor(hex.value));
  document.querySelectorAll(".preset-grid button").forEach(b=>b.addEventListener("click",()=>setColor(b.dataset.color)));

  bgFile.addEventListener("change",async e=>{
    const f=e.target.files[0]; if(!f)return;
    if(bgUrl)URL.revokeObjectURL(bgUrl);
    bgUrl=URL.createObjectURL(f);
    bgImg=await loadImage(bgUrl);
  });

  applyBtn.addEventListener("click",async()=>{
    if(!cutoutBlob)return;
    if(bgType==="image" && !bgImg)return alert("Please choose a background image.");
    const cutUrl=URL.createObjectURL(cutoutBlob);
    const subject=await loadImage(cutUrl);
    canvas.width=subject.naturalWidth; canvas.height=subject.naturalHeight;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(bgType==="image"){
      const scale=Math.max(canvas.width/bgImg.naturalWidth,canvas.height/bgImg.naturalHeight);
      const bw=bgImg.naturalWidth*scale,bh=bgImg.naturalHeight*scale;
      ctx.drawImage(bgImg,(canvas.width-bw)/2,(canvas.height-bh)/2,bw,bh);
    }else{
      ctx.fillStyle=bgColor.value;
      ctx.fillRect(0,0,canvas.width,canvas.height);
    }

    ctx.drawImage(subject,0,0);
    canvas.style.display="block"; empty.style.display="none";

    canvas.toBlob(blob=>{
      if(resultUrl)URL.revokeObjectURL(resultUrl);
      resultUrl=URL.createObjectURL(blob);
      outSize.textContent=fmt(blob.size);
      outDim.textContent=`${canvas.width} × ${canvas.height} px`;
      download.href=resultUrl;
      download.download=file.name.replace(/\.[^/.]+$/,"")+" - OneToolBox.jpg";
      download.classList.remove("disabled");
      status.textContent="✓ New background applied successfully.";
    },"image/jpeg",0.92);

    URL.revokeObjectURL(cutUrl);
  });

  $("reset").addEventListener("click",()=>{
    input.value=""; bgFile.value="";
    if(url)URL.revokeObjectURL(url);
    if(bgUrl)URL.revokeObjectURL(bgUrl);
    if(resultUrl)URL.revokeObjectURL(resultUrl);
    file=null;url=null;bgUrl=null;resultUrl=null;cutoutBlob=null;bgImg=null;
    orig.removeAttribute("src");orig.style.display="none";
    ico.style.display=ut.style.display=ui.style.display="";
    name.textContent="-";size.textContent="0 KB";dim.textContent="0 × 0 px";
    removeBtn.disabled=true;applyBtn.disabled=true;bgControls.classList.remove("ready");
    status.textContent="Upload an image first.";
    canvas.style.display="none";empty.style.display="block";
    outSize.textContent="0 KB";outDim.textContent="0 × 0 px";
    download.classList.add("disabled");download.removeAttribute("href");
  });
});