(() => {
  "use strict";
  if (!window.pdfjsLib || !window.jspdf) return;
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const $ = id => document.getElementById(id);
  const S = { file:null, pdf:null, blob:null, quality:70, dpi:120, running:false };
  const fmt = n => !n ? "0 KB" : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(2)} MB`;
  function prog(p,t){p=Math.max(0,Math.min(100,p));$("progressBar").style.width=p+"%";$("percent").textContent=Math.round(p)+"%";$("status").textContent=t;}
  function slider(el){const p=(+el.value-+el.min)/(+el.max-+el.min)*100;el.style.background=`linear-gradient(90deg,#2867e8 0%,#2867e8 ${p}%,#dfe7f1 ${p}%,#dfe7f1 100%)`;}
  async function load(f){
    if(!f || !/\.pdf$/i.test(f.name)){alert("Please select a PDF.");return;}
    try{S.file=f;S.blob=null;S.pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;$("fileName").textContent=f.name;$("originalSize").textContent=fmt(f.size);$("resultOriginal").textContent=fmt(f.size);$("pages").textContent=S.pdf.numPages;$("compressBtn").disabled=false;$("downloadBtn").disabled=true;prog(0,"PDF ready. You can reduce its size now.");}
    catch(e){console.error(e);alert("PDF could not be loaded.");}
  }
  $("fileInput").addEventListener("change",e=>load(e.target.files[0]));
  $("dropZone").addEventListener("dragover",e=>{e.preventDefault();$("dropZone").classList.add("over")});
  $("dropZone").addEventListener("dragleave",()=>$("dropZone").classList.remove("over"));
  $("dropZone").addEventListener("drop",e=>{e.preventDefault();$("dropZone").classList.remove("over");load(e.dataTransfer.files[0])});
  $(".psr-choose").addEventListener("click",e=>{e.preventDefault();$("fileInput").click()});
  document.querySelectorAll(".psr-levels button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".psr-levels button").forEach(x=>x.classList.remove("active"));b.classList.add("active");const q=b.dataset.level==="low"?85:b.dataset.level==="high"?50:70,d=b.dataset.level==="low"?160:b.dataset.level==="high"?90:120;S.quality=q;S.dpi=d;$("quality").value=q;$("dpi").value=d;$("qualityValue").textContent=q+"%";$("dpiValue").textContent=d+" DPI";slider($("quality"));slider($("dpi"));});
  $("quality").oninput=e=>{S.quality=+e.target.value;$("qualityValue").textContent=S.quality+"%";slider(e.target);document.querySelectorAll(".psr-levels button").forEach(x=>x.classList.remove("active"));};
  $("dpi").oninput=e=>{S.dpi=+e.target.value;$("dpiValue").textContent=S.dpi+" DPI";slider(e.target);document.querySelectorAll(".psr-levels button").forEach(x=>x.classList.remove("active"));};
  slider($("quality"));slider($("dpi"));
  async function render(n){const p=await S.pdf.getPage(n),v=p.getViewport({scale:S.dpi/72});const c=document.createElement("canvas");c.width=Math.max(1,Math.round(v.width));c.height=Math.max(1,Math.round(v.height));const ctx=c.getContext("2d",{alpha:false});ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);await p.render({canvasContext:ctx,viewport:v}).promise;return {canvas:c,widthPts:v.width/(S.dpi/72),heightPts:v.height/(S.dpi/72)};}
  async function build(quality,dpi){
    const {jsPDF}=window.jspdf;const first=await S.pdf.getPage(1);const firstVp=first.getViewport({scale:1});
    const doc=new jsPDF({unit:"pt",format:[firstVp.width,firstVp.height],orientation:firstVp.width>=firstVp.height?"landscape":"portrait",compress:true,putOnlyUsedFonts:true});
    for(let n=1;n<=S.pdf.numPages;n++){
      prog((n-1)/S.pdf.numPages*90,`Reducing page ${n} of ${S.pdf.numPages}…`);
      const oldDpi=S.dpi;S.dpi=dpi;const r=await render(n);S.dpi=oldDpi;
      if(n>1)doc.addPage([r.widthPts,r.heightPts],r.widthPts>=r.heightPts?"landscape":"portrait");
      const data=r.canvas.toDataURL("image/jpeg",quality/100);doc.addImage(data,"JPEG",0,0,r.widthPts,r.heightPts,undefined,"FAST");
    }
    // A new jsPDF document has no source PDF metadata; set no identifying document fields.
    return doc.output("blob");
  }
  $("compressBtn").onclick=async()=>{
    if(!S.pdf||S.running)return;S.running=true;$("compressBtn").disabled=true;$("downloadBtn").disabled=true;
    try{
      const original=S.file.size;let best=null;
      const attempts=[{q:S.quality,d:S.dpi},{q:Math.max(40,S.quality-15),d:Math.max(90,S.dpi-18)},{q:35,d:Math.max(72,S.dpi-30)}];
      for(let i=0;i<attempts.length;i++){
        prog(2,`Optimizing PDF (pass ${i+1} of ${attempts.length})…`);
        const blob=await build(attempts[i].q,attempts[i].d);if(!best||blob.size<best.size)best=blob;if(blob.size<original*0.98)break;
      }
      S.blob=best;$("resultSize").textContent=fmt(best.size);$("resultOriginal").textContent=fmt(original);
      const saved=(1-best.size/original)*100;$("saved").textContent=saved>0?`Size reduced by ${saved.toFixed(1)}%`:"Result is not smaller — try High compression.";
      $("downloadBtn").disabled=false;prog(100,"Compression completed successfully.");
    }catch(e){console.error(e);prog(0,"Compression failed.");alert("Compression failed: "+(e.message||e));}
    finally{S.running=false;$("compressBtn").disabled=!S.pdf;}
  };
  $("downloadBtn").onclick=()=>{if(!S.blob)return;const u=URL.createObjectURL(S.blob),a=document.createElement("a");a.href=u;a.download="reduced-pdf.pdf";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  $("resetBtn").onclick=()=>{S.file=null;S.pdf=null;S.blob=null;$("fileInput").value="";$("fileName").textContent="Upload PDF";$("originalSize").textContent="0 KB";$("resultOriginal").textContent="—";$("pages").textContent="0";$("resultSize").textContent="—";$("saved").textContent="Size reduction: —";$("compressBtn").disabled=true;$("downloadBtn").disabled=true;prog(0,"Choose a PDF to begin.");};
})();
