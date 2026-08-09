(()=>{"use strict";
const $=id=>document.getElementById(id);
const pdfInput=$("pdfInput"),uploadPanel=$("uploadPanel"),editor=$("editor"),pagesHost=$("pagesHost"),status=$("status"),progress=$("progress");
let file=null,pdf=null,pdfBytes=null,pdfDoc=null,page=1,scale=1,tool="select",undo=[],pageCanvases=[],textMap=[],imageData=null,signatureData=null,output=null;

pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const setStatus=(s,p=0)=>{status.textContent=s;progress.textContent=Math.round(p)+"%"};
const cloneBytes=b=>new Uint8Array(b.slice(0));
const point=(el,e)=>{const r=el.getBoundingClientRect();return{x:(e.clientX-r.left)*el._sx,y:(e.clientY-r.top)*el._sy}};

async function loadFile(f){
 if(!f)return;
 file=f;setStatus("Loading PDF…",5);
 try{
   const raw=await f.arrayBuffer();
   /* PDF.js gets a disposable copy and PDF-LIB gets another. */
   const jsBytes=cloneBytes(raw);
   const libBytes=cloneBytes(raw);
   pdfBytes=libBytes;
   pdf=await pdfjsLib.getDocument({data:jsBytes,disableWorker:true}).promise;
   pdfDoc=await PDFLib.PDFDocument.load(cloneBytes(libBytes));
   if(!pdf.numPages)throw new Error("No PDF pages found");
   uploadPanel.classList.add("hidden");editor.classList.remove("hidden");
   page=1;scale=1;await renderAll();
   setStatus("Ready — choose a tool and edit directly on the PDF.",100);
 }catch(e){
   console.error(e);setStatus("PDF preview load failed: "+e.message,0);
   alert("PDF preview load nahi hua.\n\n"+e.message);
 }
}

async function renderAll(){
 pagesHost.innerHTML="";textMap=[];
 for(let n=1;n<=pdf.numPages;n++)await renderPage(n);
 showPage(page);
}
async function renderPage(n){
 const p=await pdf.getPage(n);
 const vp=p.getViewport({scale:1.5});
 const wrap=document.createElement("div");wrap.className="pdf-page";wrap.dataset.page=n;
 const canvas=document.createElement("canvas");canvas.width=vp.width;canvas.height=vp.height;
 wrap.appendChild(canvas);
 const textLayer=document.createElement("div");textLayer.className="text-layer";wrap.appendChild(textLayer);
 const overlay=document.createElement("div");overlay.className="overlay";wrap.appendChild(overlay);
 const ctx=canvas.getContext("2d");
 await p.render({canvasContext:ctx,viewport:vp}).promise;
 wrap._sx=1;wrap._sy=1;
 overlay._sx=1;overlay._sy=1;
 pagesHost.appendChild(wrap);
 textLayer.classList.toggle("edit-mode",tool==="edittext");

 try{
   const tc=await p.getTextContent();
   const util=pdfjsLib.Util;
   tc.items.forEach(item=>{
     if(!item.str)return;
     const tx=util.transform(vp.transform,item.transform);
     const fontH=Math.max(8,Math.abs(tx[3]));
     const span=document.createElement("span");
     span.textContent=item.str;
     span.style.left=tx[4]+"px";
     span.style.top=(tx[5]-fontH)+"px";
     span.style.fontSize=fontH+"px";
     span.style.width=Math.max(item.width||0,8)+"px";
     span.style.height=Math.max(fontH,10)+"px";
     span.dataset.text=item.str;
     span.addEventListener("mousedown",e=>{e.preventDefault();});
     span.addEventListener("click",e=>{
       e.preventDefault();
       e.stopPropagation();
       if(tool==="edittext") editText(n,span,item,tx,vp);
     });
     textLayer.appendChild(span);
   });
 }catch(err){console.warn("Text layer:",err)}
 pageCanvases[n]=wrap;
}
function showPage(n){
 [...pagesHost.children].forEach((el,i)=>el.style.display=(i===n-1?"block":"none"));
 $("pageNumber").textContent=n;
}
function saveUndo(){undo.push(JSON.stringify(state));if(undo.length>30)undo.shift()}
let state={adds:[],whiteouts:[],images:[],draws:[]};

function editText(pg,span,item,tx,vp){
 const pageEl=pageCanvases[pg], overlay=pageEl.querySelector(".overlay");
 const input=document.createElement("input");input.className="edit-input";
 input.value=item.str;input.style.left=tx[4]+"px";input.style.top=(tx[5]-Math.abs(tx[3]))+"px";
 input.style.width=Math.max(100,item.width+20)+"px";input.style.height=Math.max(25,Math.abs(tx[3])+8)+"px";
 overlay.appendChild(input);input.focus();input.select();
 const finish=()=>{
   const val=input.value.trim();
   if(val&&val!==item.str){
     saveUndo();
     state.whiteouts.push({page:pg,x:tx[4],y:tx[5]-Math.abs(tx[3]),w:Math.max(item.width,10),h:Math.abs(tx[3])+5});
     state.adds.push({page:pg,type:"text",text:val,x:tx[4],y:tx[5],size:Math.abs(tx[3]),color:"#111111"});
     drawState(pg);
   }
   input.remove();
 };
 input.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();finish()}if(e.key==="Escape"){input.remove()}});
 input.addEventListener("blur",finish,{once:true});
 input.addEventListener("mousedown",e=>e.stopPropagation());
 input.addEventListener("click",e=>e.stopPropagation());
}
function drawState(pg){
 const wrap=pageCanvases[pg];if(!wrap)return;
 let ov=wrap.querySelector(".overlay");ov.innerHTML="";
 state.whiteouts.filter(a=>a.page===pg).forEach(a=>{const d=document.createElement("div");d.className="object";d.style.background="#fff";d.style.left=a.x+"px";d.style.top=a.y+"px";d.style.width=a.w+"px";d.style.height=a.h+"px";ov.appendChild(d)});
 state.adds.filter(a=>a.page===pg).forEach(a=>{
   const d=document.createElement("div");d.className="object";d.textContent=a.text;d.style.left=a.x+"px";d.style.top=(a.y-a.size)+"px";d.style.fontSize=a.size+"px";d.style.color=a.color;ov.appendChild(d)
 });
 state.images.filter(a=>a.page===pg).forEach(a=>{const img=document.createElement("img");img.src=a.src;img.className="object";img.style.left=a.x+"px";img.style.top=a.y+"px";img.style.width=a.w+"px";img.style.height=a.h+"px";ov.appendChild(img)});
 state.draws.filter(a=>a.page===pg).forEach(a=>{const c=document.createElement("canvas");c.className="object";c.style.left="0";c.style.top="0";c.width=wrap.querySelector("canvas").width;c.height=wrap.querySelector("canvas").height;c.style.pointerEvents="none";const x=c.getContext("2d");x.strokeStyle=a.color;x.lineWidth=3;x.beginPath();x.moveTo(a.x1,a.y1);x.lineTo(a.x2,a.y2);x.stroke();ov.appendChild(c)});
}

document.querySelectorAll(".tool").forEach(b=>b.addEventListener("click",()=>{
 const t=b.dataset.tool;
 if(t==="image"){$("imageInput").click();return}
 if(t==="signature"){$("signatureInput").click();return}

 tool=t;
 document.querySelectorAll(".tool").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");

 document.querySelectorAll(".text-layer").forEach(x=>{
   x.classList.toggle("edit-mode",tool==="edittext");
 });

 if(tool==="edittext"){
   setStatus("Edit Text ON — now click any existing text on the PDF.",0);
 }else if(tool==="addtext"){
   setStatus("Add Text ON — click anywhere on the PDF to add text.",0);
 }else if(tool==="whiteout"){
   setStatus("Whiteout ON — drag over content to hide it.",0);
 }else{
   setStatus("Tool: "+t,0);
 }
}));
