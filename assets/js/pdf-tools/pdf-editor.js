// OneToolBox PDF Editor FINAL v13
(()=>{"use strict";
const $=id=>document.getElementById(id);
const pdfInput=$("pdfInput"),uploadPanel=$("uploadPanel"),editor=$("editor"),pagesHost=$("pagesHost");
const status=$("status"),progress=$("progress");
let pdf=null,pdfDoc=null,file=null,currentPage=1,tool="select",zoom=1,output=null;
let pageEls={},objects=[],history=[],imageSrc=null,signatureSrc=null,drag=null;

if(window.pdfjsLib){
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

function setStatus(text,p=0){
  if(status) status.textContent=text;
  if(progress) progress.textContent=Math.round(p)+"%";
}
function copyBytes(buffer){return new Uint8Array(buffer.slice(0));}
function saveState(){history.push(JSON.stringify(objects));if(history.length>30)history.shift();}
function pageCount(){return pdf?pdf.numPages:0;}

async function loadPDF(f){
  if(!f)return;
  if(f.type!=="application/pdf"&&!/\.pdf$/i.test(f.name)){
    alert("Please select a PDF file.");return;
  }
  file=f;
  setStatus("Loading PDF…",5);
  try{
    const raw=await f.arrayBuffer();

    // Never reuse a buffer given to PDF.js.
    const jsData=copyBytes(raw);
    const libData=copyBytes(raw);

    if(!window.pdfjsLib)throw new Error("PDF.js library not loaded.");
    if(!window.PDFLib)throw new Error("PDF-LIB library not loaded.");

    pdf=await pdfjsLib.getDocument({data:jsData,disableWorker:true}).promise;
    pdfDoc=await PDFLib.PDFDocument.load(copyBytes(libData));

    if(!pdf.numPages)throw new Error("No pages found.");

    uploadPanel.classList.add("hidden");
    editor.classList.remove("hidden");
    currentPage=1;zoom=1;objects=[];history=[];output=null;
    await renderAll();
    setStatus("PDF ready — choose Edit Text or another tool.",100);
  }catch(err){
    console.error(err);
    setStatus("PDF preview failed: "+err.message,0);
    alert("PDF preview load nahi hua.\n\n"+err.message);
  }
}

async function renderAll(){
  pagesHost.innerHTML="";
  pageEls={};
  for(let n=1;n<=pdf.numPages;n++){
    pageEls[n]=await renderPage(n);
  }
  updatePageUI();
}

async function renderPage(n){
  const p=await pdf.getPage(n);
  const vp=p.getViewport({scale:1.5});

  const wrap=document.createElement("div");
  wrap.className="pdf-page";
  wrap.dataset.page=n;
  wrap.style.width=vp.width+"px";
  wrap.style.height=vp.height+"px";

  const canvas=document.createElement("canvas");
  canvas.className="pdf-canvas";
  canvas.width=Math.ceil(vp.width);
  canvas.height=Math.ceil(vp.height);

  const textLayer=document.createElement("div");
  textLayer.className="text-layer";

  const overlay=document.createElement("div");
  overlay.className="overlay";

  wrap.append(canvas,textLayer,overlay);
  pagesHost.appendChild(wrap);

  await p.render({canvasContext:canvas.getContext("2d"),viewport:vp}).promise;

  try{
    const tc=await p.getTextContent();
    const util=pdfjsLib.Util;

    for(const item of tc.items){
      if(!item.str)continue;
      const tx=util.transform(vp.transform,item.transform);
      const h=Math.max(8,Math.abs(tx[3]));

      const span=document.createElement("span");
      span.textContent=item.str;
      span.dataset.original=item.str;
      span.style.left=tx[4]+"px";
      span.style.top=(tx[5]-h)+"px";
      span.style.fontSize=h+"px";
      span.style.width=Math.max(item.width||8,8)+"px";
      span.style.height=Math.max(h,10)+"px";

      span.addEventListener("mousedown",e=>{
        if(tool==="edittext")e.preventDefault();
      });
      span.addEventListener("click",e=>{
        if(tool!=="edittext")return;
        e.preventDefault();e.stopPropagation();
        editExistingText(wrap,item,tx,h);
      });
      textLayer.appendChild(span);
    }
  }catch(e){console.warn("Text layer unavailable:",e)}

  return wrap;
}

function updatePageUI(){
  Object.values(pageEls).forEach(el=>el.style.display="none");
  if(pageEls[currentPage])pageEls[currentPage].style.display="block";
  $("pageNumber").textContent=currentPage;
  $("pageTotal").textContent="/ "+pageCount();
  $("prevPage").disabled=currentPage<=1;
  $("nextPage").disabled=currentPage>=pageCount();
  refreshTextMode();
}

function refreshTextMode(){
  Object.values(pageEls).forEach(el=>{
    const layer=el.querySelector(".text-layer");
    if(layer)layer.classList.toggle("edit-mode",tool==="edittext");
  });
}

function drawObjects(n){
  const wrap=pageEls[n];if(!wrap)return;
  const overlay=wrap.querySelector(".overlay");if(!overlay)return;
  overlay.innerHTML="";

  for(const o of objects.filter(x=>x.page===n)){
    if(o.type==="text"){
      const d=document.createElement("div");
      d.className="object text-object";
      d.textContent=o.text;
      Object.assign(d.style,{left:o.x+"px",top:o.y+"px",fontSize:o.size+"px",color:o.color||"#111"});
      overlay.appendChild(d);
    }else if(o.type==="whiteout"){
      const d=document.createElement("div");
      d.className="object whiteout-object";
      Object.assign(d.style,{left:o.x+"px",top:o.y+"px",width:o.w+"px",height:o.h+"px",background:"#fff"});
      overlay.appendChild(d);
    }else if(o.type==="image"||o.type==="signature"){
      const img=document.createElement("img");
      img.className="object image-object";img.src=o.src;
      Object.assign(img.style,{left:o.x+"px",top:o.y+"px",width:o.w+"px",height:o.h+"px"});
      overlay.appendChild(img);
    }else if(o.type==="draw"){
      const c=document.createElement("canvas");
      c.className="object draw-object";
      const base=wrap.querySelector("canvas");
      c.width=base.width;c.height=base.height;
      Object.assign(c.style,{left:"0",top:"0"});
      const ctx=c.getContext("2d");
      ctx.strokeStyle="#e53935";ctx.lineWidth=3;ctx.lineCap="round";
      ctx.beginPath();ctx.moveTo(o.x1,o.y1);ctx.lineTo(o.x2,o.y2);ctx.stroke();
      overlay.appendChild(c);
    }
  }
}

function editExistingText(wrap,item,tx,h){
  const overlay=wrap.querySelector(".overlay");
  const input=document.createElement("input");
  input.className="edit-input";
  input.value=item.str;
  Object.assign(input.style,{
    left:tx[4]+"px",top:(tx[5]-h)+"px",
    width:Math.max(120,item.width+30)+"px",height:Math.max(28,h+10)+"px"
  });
  overlay.appendChild(input);
  input.focus();input.select();

  let done=false;
  const finish=save=>{
    if(done)return;done=true;
    const value=input.value.trim();
    if(save&&value&&value!==item.str){
      saveState();
      objects.push({type:"whiteout",page:+wrap.dataset.page,x:tx[4],y:tx[5]-h,w:Math.max(item.width,10),h:h+5});
      objects.push({type:"text",page:+wrap.dataset.page,text:value,x:tx[4],y:tx[5],size:h,color:"#111"});
      drawObjects(+wrap.dataset.page);
      setStatus("Text changed — click Apply changes to save.",0);
    }
    input.remove();
  };
  input.addEventListener("keydown",e=>{
    e.stopPropagation();
    if(e.key==="Enter"){e.preventDefault();finish(true)}
    if(e.key==="Escape"){e.preventDefault();finish(false)}
  });
  input.addEventListener("blur",()=>finish(true),{once:true});
}

function activate(t){
  tool=t;
  document.querySelectorAll(".tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===t));
  refreshTextMode();
  if(t==="edittext")setStatus("Edit Text ON — click existing PDF text.",0);
  else if(t==="addtext")setStatus("Add Text ON — click anywhere on the page.",0);
  else if(t==="whiteout")setStatus("Whiteout ON — drag over content.",0);
  else if(t==="draw")setStatus("Draw ON — drag on the page.",0);
  else setStatus("Tool: "+t,0);
}

document.querySelectorAll(".tool").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const t=btn.dataset.tool;
    if(t==="image"){$("imageInput").click();return}
    if(t==="signature"){$("signatureInput").click();return}
    activate(t);
  });
});

$("imageInput").addEventListener("change",e=>{
  const f=e.target.files?.[0];if(!f)return;
  imageSrc=URL.createObjectURL(f);activate("image");
  setStatus("Click the PDF to place image.",0);
});
$("signatureInput").addEventListener("change",e=>{
  const f=e.target.files?.[0];if(!f)return;
  signatureSrc=URL.createObjectURL(f);activate("signature");
  setStatus("Click the PDF to place signature.",0);
});

pagesHost.addEventListener("click",e=>{
  const wrap=e.target.closest(".pdf-page");if(!wrap)return;
  const pg=+wrap.dataset.page;
  if(e.target.closest(".text-layer"))return;
  const r=wrap.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;

  if(tool==="addtext"){
    saveState();
    objects.push({type:"text",page:pg,text:"Type here",x,y:y+20,size:18,color:"#111"});
    drawObjects(pg);
    setStatus("Text added. Choose Edit Text to edit existing text.",0);
  }else if(tool==="image"&&imageSrc){
    saveState();objects.push({type:"image",page:pg,src:imageSrc,x:x-75,y:y-50,w:150,h:100});
    drawObjects(pg);setStatus("Image added.",0);
  }else if(tool==="signature"&&signatureSrc){
    saveState();objects.push({type:"signature",page:pg,src:signatureSrc,x:x-75,y:y-40,w:150,h:80});
    drawObjects(pg);setStatus("Signature added.",0);
  }
});

pagesHost.addEventListener("pointerdown",e=>{
  if(tool!=="whiteout"&&tool!=="draw")return;
  const wrap=e.target.closest(".pdf-page");if(!wrap)return;
  const r=wrap.getBoundingClientRect();
  drag={page:+wrap.dataset.page,x:e.clientX-r.left,y:e.clientY-r.top,wrap};
  wrap.setPointerCapture?.(e.pointerId);
});
pagesHost.addEventListener("pointerup",e=>{
  if(!drag)return;
  const d=drag;drag=null;
  const r=d.wrap.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
  if(tool==="whiteout"){
    saveState();objects.push({type:"whiteout",page:d.page,x:Math.min(d.x,x),y:Math.min(d.y,y),w:Math.abs(x-d.x),h:Math.abs(y-d.y)});
  }else{
    saveState();objects.push({type:"draw",page:d.page,x1:d.x,y1:d.y,x2:x,y2:y});
  }
  drawObjects(d.page);
});

$("undoBtn").addEventListener("click",()=>{
  if(!history.length){setStatus("Nothing to undo.",0);return}
  objects=JSON.parse(history.pop());drawObjects(currentPage);setStatus("Undo complete.",0);
});
$("prevPage").addEventListener("click",()=>{if(currentPage>1){currentPage--;updatePageUI()}});
$("nextPage").addEventListener("click",()=>{if(currentPage<pageCount()){currentPage++;updatePageUI()}});
$("zoomIn").addEventListener("click",()=>{zoom=Math.min(2.2,zoom+.15);pagesHost.style.transform=`scale(${zoom})`;pagesHost.style.transformOrigin="top center"});
$("zoomOut").addEventListener("click",()=>{zoom=Math.max(.7,zoom-.15);pagesHost.style.transform=`scale(${zoom})`;pagesHost.style.transformOrigin="top center"});
$("resetView").addEventListener("click",()=>{zoom=1;pagesHost.style.transform="none"});
$("rotatePage").addEventListener("click",()=>{const el=pageEls[currentPage];if(!el)return;el.classList.toggle("rotated");setStatus("Rotation changed in preview.",0)});
$("deletePage").addEventListener("click",()=>alert("Delete page will be added after the core editor is stable."));
$("insertPage").addEventListener("click",()=>alert("Insert page will be added after the core editor is stable."));

$("applyBtn").addEventListener("click",async()=>{
  if(!pdfDoc)return;
  const btn=$("applyBtn");btn.disabled=true;setStatus("Saving PDF…",10);
  try{
    const pages=pdfDoc.getPages();
    const font=await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

    for(let i=0;i<pages.length;i++){
      const pg=pages[i],wrap=pageEls[i+1];if(!wrap)continue;
      const canvas=wrap.querySelector(".pdf-canvas");
      const sx=pg.getWidth()/canvas.width,sy=pg.getHeight()/canvas.height;

      for(const o of objects.filter(x=>x.page===i+1)){
        if(o.type==="whiteout"){
          pg.drawRectangle({x:o.x*sx,y:pg.getHeight()-(o.y+o.h)*sy,width:o.w*sx,height:o.h*sy,color:PDFLib.rgb(1,1,1)});
        }else if(o.type==="text"){
          pg.drawText(o.text,{x:o.x*sx,y:pg.getHeight()-o.y*sy,size:Math.max(6,o.size*sx),font,color:PDFLib.rgb(.07,.07,.07)});
        }else if(o.type==="draw"){
          pg.drawLine({start:{x:o.x1*sx,y:pg.getHeight()-o.y1*sy},end:{x:o.x2*sx,y:pg.getHeight()-o.y2*sy},thickness:2.5,color:PDFLib.rgb(.9,.1,.1)});
        }else if(o.type==="image"||o.type==="signature"){
          const raw=await fetch(o.src).then(r=>r.arrayBuffer());
          const bytes=copyBytes(raw);
          let im;try{im=await pdfDoc.embedPng(bytes)}catch{im=await pdfDoc.embedJpg(bytes)}
          pg.drawImage(im,{x:o.x*sx,y:pg.getHeight()-(o.y+o.h)*sy,width:o.w*sx,height:o.h*sy});
        }
      }
      setStatus("Saving PDF…",10+((i+1)/pages.length)*80);
    }

    const bytes=await pdfDoc.save();
    output=new Blob([bytes],{type:"application/pdf"});
    $("resultPanel").classList.remove("hidden");
    $("resultInfo").textContent=`${(output.size/1024).toFixed(1)} KB • ${pages.length} page(s)`;
    setStatus("Done — edited PDF is ready.",100);
    $("resultPanel").scrollIntoView({behavior:"smooth"});
  }catch(err){
    console.error(err);setStatus("Save failed: "+err.message,0);alert("PDF save nahi hua.\n\n"+err.message);
  }finally{btn.disabled=false}
});

$("downloadBtn").addEventListener("click",()=>{
  if(!output)return;
  const url=URL.createObjectURL(output),a=document.createElement("a");
  a.href=url;a.download="edited-pdf.pdf";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$("editAgain").addEventListener("click",()=>$("resultPanel").classList.add("hidden"));
pdfInput.addEventListener("change",e=>loadPDF(e.target.files?.[0]));
uploadPanel.addEventListener("dragover",e=>{e.preventDefault();uploadPanel.style.borderColor="#2380bd"});
uploadPanel.addEventListener("dragleave",()=>uploadPanel.style.borderColor="");
uploadPanel.addEventListener("drop",e=>{e.preventDefault();uploadPanel.style.borderColor="";loadPDF(e.dataTransfer.files?.[0])});
})();
