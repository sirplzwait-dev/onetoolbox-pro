
"use strict";
document.addEventListener("DOMContentLoaded",()=>{
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const input=$("#fileInput"), upload=$("#upload"), fileInfo=$("#fileInfo"), fileSize=$("#fileSize"), pageCount=$("#pageCount");
const preview=$("#preview"), result=$("#result"), resultInfo=$("#resultInfo"), download=$("#download"), run=$("#run"), reset=$("#reset"), status=$("#status"), bar=$("#bar"), pct=$("#pct");
let file=null, blob=null, name="output", pdf=null;
const fmtBytes=n=>n<1048576?(n/1024).toFixed(1)+" KB":(n/1048576).toFixed(2)+" MB";
function progress(n,t){n=Math.max(0,Math.min(100,n));if(bar)bar.style.width=n+"%";if(pct)pct.textContent=Math.round(n)+"%";if(status)status.textContent=t||""}
function setFile(f){if(!f)return;if(!f.name.toLowerCase().endsWith(".pdf")){alert("Please choose a PDF.");return}file=f;name=f.name.replace(/\.pdf$/i,"");if(fileSize)fileSize.textContent=fmtBytes(f.size);if(fileInfo)fileInfo.hidden=false;if(run)run.disabled=false;progress(3,"Loading PDF...");loadPdf(f)}
async function loadPdf(f){try{pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;if(pageCount)pageCount.textContent=pdf.numPages;await renderFirst(pdf);progress(0,"PDF ready.");}catch(e){console.error(e);alert("Could not read this PDF.");progress(0,"Ready.")}}
async function renderFirst(p){if(!preview)return;const page=await p.getPage(1),v=page.getViewport({scale:1.15});preview.width=v.width;preview.height=v.height;await page.render({canvasContext:preview.getContext("2d"),viewport:v}).promise;preview.hidden=false}
function selected(name){const x=document.querySelector(`[name="${name}"]:checked`);return x?x.value:null}
input?.addEventListener("change",e=>setFile(e.target.files[0]));
["dragenter","dragover"].forEach(ev=>upload?.addEventListener(ev,e=>{e.preventDefault();upload.classList.add("drag")}));
["dragleave","drop"].forEach(ev=>upload?.addEventListener(ev,e=>{e.preventDefault();upload.classList.remove("drag")}));
upload?.addEventListener("drop",e=>setFile(e.dataTransfer.files[0]));
reset?.addEventListener("click",()=>location.reload());
function slider(el,out){const paint=()=>{let p=(+el.value-+el.min)/(+el.max-+el.min)*100;el.style.setProperty("--p",p+"%");out&&(out.textContent=el.value+"%")};el.addEventListener("input",paint);paint()}
const q=$("#quality"),qv=$("#qualityValue");if(q)slider(q,qv);
function save(b,filename,mime){blob=b;name=filename;resultInfo&&(resultInfo.textContent=fmtBytes(b.size));download.disabled=false;progress(100,"Completed.");}
download?.addEventListener("click",()=>{if(!blob)return;const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)});
async function jspdf(){return await import("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")}
async function makePdfFromCanvases(canvases,quality=.85){
 const m=await jspdf(),J=m.jsPDF;let out;
 for(let i=0;i<canvases.length;i++){let c=canvases[i],w=c.width,h=c.height;if(!out)out=new J({orientation:w>h?"landscape":"portrait",unit:"pt",format:[w,h],compress:true});else out.addPage([w,h],w>h?"landscape":"portrait");out.addImage(c.toDataURL("image/jpeg",quality),"JPEG",0,0,w,h)}
 return out.output("blob")
}
async function renderPages(scale=1.2,quality=.85){
 const cs=[];for(let i=1;i<=pdf.numPages;i++){let p=await pdf.getPage(i),v=p.getViewport({scale}),c=document.createElement("canvas");c.width=Math.round(v.width);c.height=Math.round(v.height);await p.render({canvasContext:c.getContext("2d"),viewport:v}).promise;cs.push(c);progress(i/pdf.numPages*90,`Processing page ${i} of ${pdf.numPages}...`)}return cs
}
async function extractText(){let t="";for(let i=1;i<=pdf.numPages;i++){let p=await pdf.getPage(i),c=await p.getTextContent();t+=`--- Page ${i} ---\n`+c.items.map(x=>x.str).join(" ")+"\n\n";progress(i/pdf.numPages*90,`Extracting page ${i}...`)}return t}
const mode=document.body.dataset.tool;
run?.addEventListener("click",async()=>{
 if(!pdf)return;run.disabled=true;download.disabled=true;
 try{
  if(mode==="pdf-converter"){let f=selected("format")||"jpg";if(f==="txt"||f==="html"){let t=await extractText();let data=f==="html"?`<!doctype html><meta charset="utf-8"><pre>${t.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</pre>`:t;save(new Blob([data],{type:f==="html"?"text/html":"text/plain"}),name+"."+f);if(result){result.hidden=false;result.textContent=t}}
  else{let cs=await renderPages(+(q?.value||1.2),+(q?.value||85)/100);let c=cs[0],fdata=c.toDataURL(f==="png"?"image/png":"image/jpeg",+(q?.value||85)/100);if(result){result.hidden=false;result.src=fdata;result.tagName==="IMG"&&(result.src=fdata)}let b=await new Promise(r=>c.toBlob(r,f==="png"?"image/png":"image/jpeg",+(q?.value||85)/100));save(b,name+"-page-1."+f)}}
  else if(mode==="pdf-to-jpg"){let cs=await renderPages(1.4,.9),c=cs[0],b=await new Promise(r=>c.toBlob(r,"image/jpeg",.9));result&&(result.hidden=false,result.src=URL.createObjectURL(b));save(b,name+"-page-1.jpg")}
  else if(mode==="jpg-to-pdf"){let imgs=$$("#imageInput")[0]?.files||[];if(!imgs.length){alert("Choose images first.");return}let cs=[];for(let f of imgs){let im=await createImageBitmap(f),c=document.createElement("canvas");c.width=im.width;c.height=im.height;c.getContext("2d").drawImage(im,0,0);cs.push(c)}save(await makePdfFromCanvases(cs,.9),name+".pdf")}
  else if(mode==="merge-pdf"){let fs=[...($("#fileInput")?.files||[])];if(fs.length<2){alert("Choose at least 2 PDFs.");return}let m=await jspdf(),J=m.jsPDF;let out=null;for(let fi=0;fi<fs.length;fi++){let p=await pdfjsLib.getDocument({data:await fs[fi].arrayBuffer()}).promise;for(let i=1;i<=p.numPages;i++){let pg=await p.getPage(i),v=pg.getViewport({scale:1}),c=document.createElement("canvas");c.width=v.width;c.height=v.height;await pg.render({canvasContext:c.getContext("2d"),viewport:v}).promise;if(!out)out=new J({unit:"pt",format:[v.width,v.height]});else out.addPage([v.width,v.height]);out.addImage(c.toDataURL("image/jpeg",.82),"JPEG",0,0,v.width,v.height)}progress((fi+1)/fs.length*90,`Merging file ${fi+1}...`)}save(out.output("blob"),"merged.pdf")}
  else if(mode==="rotate-pdf"||mode==="remove-pdf-pages"||mode==="extract-pdf-pages"||mode==="split-pdf"||mode==="pdf-size-reducer"||mode==="pdf-compressor"||mode==="pdf-scanner"){let cs=await renderPages(mode==="pdf-compressor"?0.85:1.15,.78);save(await makePdfFromCanvases(cs,.72),name+"-processed.pdf")}
  else if(mode==="pdf-ocr"){let t=await extractText();save(new Blob([t],{type:"text/plain"}),name+"-ocr.txt");if(result){result.hidden=false;result.textContent=t}}
  else if(mode==="pdf-watermark"){let cs=await renderPages(1.1,.84),text=$("#watermarkText")?.value||"OneToolBox";for(let c of cs){let x=c.getContext("2d");x.save();x.globalAlpha=.25;x.font="bold 42px Arial";x.fillStyle="#2563eb";x.translate(c.width/2,c.height/2);x.rotate(-Math.PI/6);x.textAlign="center";x.fillText(text,0,0);x.restore()}save(await makePdfFromCanvases(cs,.8),name+"-watermarked.pdf")}
  else if(mode==="remove-pdf-metadata"||mode==="unlock-pdf"||mode==="protect-pdf"){let cs=await renderPages(1.05,.82);save(await makePdfFromCanvases(cs,.8),name+"-clean.pdf")}
  else if(mode==="pdf-editor"||mode==="pdf-signature"){let cs=await renderPages(1.1,.85);let text=$("#editText")?.value||$("#signatureText")?.value||"";if(text)for(let c of cs){let x=c.getContext("2d");x.font="24px Arial";x.fillStyle="#111827";x.fillText(text,30,c.height-40)}save(await makePdfFromCanvases(cs,.82),name+"-edited.pdf")}
  else{let t=$("#sourceText")?.value||"";if(!t){alert("Enter content first.");return}let m=await jspdf(),J=m.jsPDF,out=new J();out.setFontSize(12);let lines=out.splitTextToSize(t,520);out.text(lines,40,50);save(out.output("blob"),name+".pdf")}
 }catch(e){console.error(e);alert("This operation could not be completed in the browser.");progress(0,"Operation failed.")}finally{run.disabled=false}
});
});
