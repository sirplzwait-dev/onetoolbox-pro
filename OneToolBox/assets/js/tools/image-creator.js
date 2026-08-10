/* ONETOOLBOX IMAGE CREATOR - IMPROVED */
"use strict";

document.addEventListener("DOMContentLoaded",()=>{
const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");
const preset=document.getElementById("preset"), customSize=document.getElementById("customSize");
const bgColor=document.getElementById("bgColor"), status=document.getElementById("status"), info=document.getElementById("canvasInfo");
const textValue=document.getElementById("textValue"), objectColor=document.getElementById("objectColor");
const objectSize=document.getElementById("objectSize"), objectSizeValue=document.getElementById("objectSizeValue");
const opacity=document.getElementById("opacity"), opacityValue=document.getElementById("opacityValue"), fontFamily=document.getElementById("fontFamily");
const zoom=document.getElementById("zoom"), zoomValue=document.getElementById("zoomValue");

let objects=[], selectedId=null, undoStack=[], redoStack=[], scale=.75, drag=null, resizeDrag=null;

const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const selected=()=>objects.find(o=>o.id===selectedId)||null;
const setStatus=t=>status.textContent=t;

function snapshot(){
 undoStack.push(JSON.stringify(objects.map(o=>({...o,img:undefined}))));
 if(undoStack.length>30)undoStack.shift();
 redoStack=[];
 updateHistory();
}
function restore(list){
 objects=JSON.parse(list||"[]");
 selectedId=null;
 draw();
}
function updateHistory(){
 document.getElementById("undo").disabled=!undoStack.length;
 document.getElementById("redo").disabled=!redoStack.length;
}
function setCanvasSize(w,h){
 w=Math.max(100,Math.min(3000,Number(w)||800));
 h=Math.max(100,Math.min(3000,Number(h)||600));
 snapshot();
 canvas.width=w;canvas.height=h;objects=[];selectedId=null;
 info.textContent=`${w} × ${h} px`;
 draw();setStatus("Canvas created");
}
function applyZoom(){
 canvas.style.width=Math.round(canvas.width*scale)+"px";
 canvas.style.height=Math.round(canvas.height*scale)+"px";
}
function drawSelection(o){
 ctx.save();ctx.translate(o.x,o.y);ctx.rotate(o.rotation||0);
 ctx.strokeStyle="#2563eb";ctx.lineWidth=2;ctx.setLineDash([6,4]);
 ctx.strokeRect(-5,-5,o.w+10,o.h+10);ctx.setLineDash([]);
 ctx.fillStyle="#2563eb";ctx.fillRect(o.w-5,o.h-5,10,10);
 ctx.restore();
}
function drawObject(o,target=ctx){
 target.save();
 target.globalAlpha=(o.opacity??100)/100;
 target.translate(o.x,o.y);
 target.rotate(o.rotation||0);
 target.scale(o.flipX?-1:1,o.flipY?-1:1);

 if(o.type==="text"){
  target.fillStyle=o.color;
  target.font=`${o.size}px "${o.font}"`;
  target.textBaseline="top";
  target.fillText(o.text,0,0);
 }
 if(o.type==="rect"){
  target.fillStyle=o.color;target.fillRect(0,0,o.w,o.h);
 }
 if(o.type==="circle"){
  target.fillStyle=o.color;
  target.beginPath();target.arc(o.w/2,o.h/2,Math.min(Math.abs(o.w),Math.abs(o.h))/2,0,Math.PI*2);target.fill();
 }
 if(o.type==="line"){
  target.strokeStyle=o.color;target.lineWidth=o.size;target.lineCap="round";
  target.beginPath();target.moveTo(0,0);target.lineTo(o.w,o.h);target.stroke();
 }
 if(o.type==="image" && o.img){
  target.drawImage(o.img,0,0,o.w,o.h);
 }
 target.restore();
}
function draw(showSelection=true){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle=bgColor.value;ctx.fillRect(0,0,canvas.width,canvas.height);
 objects.forEach(o=>drawObject(o));
 if(showSelection){const o=selected();if(o)drawSelection(o)}
 applyZoom();
}
function add(o){
 snapshot();o.id=uid();objects.push(o);selectedId=o.id;draw();syncControls();setStatus("Object added");
}
function center(w,h){return{x:(canvas.width-w)/2,y:(canvas.height-h)/2}}

preset.addEventListener("change",()=>{
 if(preset.value==="custom"){customSize.style.display="grid";return}
 customSize.style.display="none";
 const [w,h]=preset.value.split("x").map(Number);setCanvasSize(w,h);
});
document.getElementById("applyCustom").addEventListener("click",()=>setCanvasSize(document.getElementById("customW").value,document.getElementById("customH").value));
bgColor.addEventListener("input",draw);

document.getElementById("addText").addEventListener("click",()=>{
 const text=textValue.value.trim()||"Your Text",size=Number(objectSize.value),p=center(Math.max(120,text.length*size*.55),size*1.2);
 add({type:"text",text,color:objectColor.value,size,font:fontFamily.value,x:p.x,y:p.y,w:Math.max(120,text.length*size*.55),h:size*1.2,rotation:0,opacity:100,flipX:false,flipY:false});
});
document.getElementById("addRect").addEventListener("click",()=>{const p=center(220,130);add({type:"rect",x:p.x,y:p.y,w:220,h:130,color:objectColor.value,rotation:0,opacity:100,flipX:false,flipY:false})});
document.getElementById("addCircle").addEventListener("click",()=>{const p=center(160,160);add({type:"circle",x:p.x,y:p.y,w:160,h:160,color:objectColor.value,rotation:0,opacity:100,flipX:false,flipY:false})});
document.getElementById("addLine").addEventListener("click",()=>{const p=center(240,5);add({type:"line",x:p.x,y:p.y,w:240,h:0,size:Number(objectSize.value)/5+2,color:objectColor.value,rotation:0,opacity:100,flipX:false,flipY:false})});

document.getElementById("addImage").addEventListener("click",()=>document.getElementById("imageInput").click());
document.getElementById("imageInput").addEventListener("change",e=>{
 const file=e.target.files[0];if(!file)return;
 const url=URL.createObjectURL(file),img=new Image();
 img.onload=()=>{
  let w=320,h=w/(img.naturalWidth/img.naturalHeight);
  if(h>260){h=260;w=h*(img.naturalWidth/img.naturalHeight)}
  const p=center(w,h);
  add({type:"image",img,x:p.x,y:p.y,w,h,rotation:0,opacity:100,flipX:false,flipY:false});
  URL.revokeObjectURL(url);e.target.value="";
 };
 img.src=url;
});

function syncControls(){
 const o=selected();
 if(!o)return;
 if(o.type==="text"){
  textValue.value=o.text;
  fontFamily.value=o.font;
  objectSize.value=o.size;objectSizeValue.textContent=o.size;
 }else{textValue.value=""}
 objectColor.value=o.color||"#2563eb";
 opacity.value=o.opacity??100;opacityValue.textContent=(o.opacity??100)+"%";
}
textValue.addEventListener("input",()=>{const o=selected();if(!o||o.type!=="text")return;o.text=textValue.value;draw()});
fontFamily.addEventListener("change",()=>{const o=selected();if(!o||o.type!=="text")return;snapshot();o.font=fontFamily.value;draw()});
objectColor.addEventListener("input",()=>{const o=selected();if(!o)return;o.color=objectColor.value;draw()});
objectSize.addEventListener("input",()=>{const o=selected();if(!o)return;o.size=Number(objectSize.value);objectSizeValue.textContent=objectSize.value;draw()});
opacity.addEventListener("input",()=>{const o=selected();if(!o)return;o.opacity=Number(opacity.value);opacityValue.textContent=opacity.value+"%";draw()});
zoom.addEventListener("input",()=>{scale=Number(zoom.value)/100;zoomValue.textContent=zoom.value+"%";applyZoom()});

function point(e){
 const r=canvas.getBoundingClientRect();
 return{x:(e.clientX-r.left)*(canvas.width/r.width),y:(e.clientY-r.top)*(canvas.height/r.height)}
}
function hit(p,o){
 const minX=Math.min(o.x,o.x+o.w),maxX=Math.max(o.x,o.x+o.w);
 const minY=Math.min(o.y,o.y+o.h),maxY=Math.max(o.y,o.y+o.h);
 return p.x>=minX-8&&p.x<=maxX+8&&p.y>=minY-8&&p.y<=maxY+8;
}
canvas.addEventListener("pointerdown",e=>{
 const p=point(e);selectedId=null;
 for(let i=objects.length-1;i>=0;i--){if(hit(p,objects[i])){selectedId=objects[i].id;break}}
 const o=selected();
 if(o){
  drag={dx:p.x-o.x,dy:p.y-o.y};
  canvas.setPointerCapture(e.pointerId);
  syncControls();setStatus("Selected");
 }
 draw();
});
canvas.addEventListener("pointermove",e=>{
 if(!drag)return;const o=selected();if(!o)return;const p=point(e);
 o.x=p.x-drag.dx;o.y=p.y-drag.dy;draw();
});
canvas.addEventListener("pointerup",()=>{
 if(drag){drag=null;snapshot();setStatus("Object moved")}
});
canvas.addEventListener("pointercancel",()=>drag=null);

function transform(fn,msg){
 const o=selected();if(!o)return;
 snapshot();fn(o);draw();syncControls();setStatus(msg);
}
document.getElementById("rotateLeft").addEventListener("click",()=>transform(o=>o.rotation=(o.rotation||0)-Math.PI/2,"Rotated left"));
document.getElementById("rotateRight").addEventListener("click",()=>transform(o=>o.rotation=(o.rotation||0)+Math.PI/2,"Rotated right"));
document.getElementById("flipH").addEventListener("click",()=>transform(o=>o.flipX=!o.flipX,"Flipped horizontally"));
document.getElementById("flipV").addEventListener("click",()=>transform(o=>o.flipY=!o.flipY,"Flipped vertically"));

document.getElementById("duplicate").addEventListener("click",()=>{
 const o=selected();if(!o)return;snapshot();
 const n={...o,id:uid(),x:o.x+20,y:o.y+20};objects.push(n);selectedId=n.id;draw();syncControls();setStatus("Duplicated");
});
document.getElementById("deleteObject").addEventListener("click",()=>{
 if(!selected())return;snapshot();objects=objects.filter(o=>o.id!==selectedId);selectedId=null;draw();setStatus("Object deleted");
});
document.getElementById("bringFront").addEventListener("click",()=>{
 const o=selected();if(!o)return;snapshot();objects=objects.filter(x=>x.id!==o.id);objects.push(o);draw();setStatus("Brought to front");
});
document.getElementById("sendBack").addEventListener("click",()=>{
 const o=selected();if(!o)return;snapshot();objects=objects.filter(x=>x.id!==o.id);objects.unshift(o);draw();setStatus("Sent to back");
});
document.getElementById("clear").addEventListener("click",()=>{if(!objects.length)return;snapshot();objects=[];selectedId=null;draw();setStatus("All objects cleared")});
document.getElementById("undo").addEventListener("click",()=>{
 if(!undoStack.length)return;
 redoStack.push(JSON.stringify(objects.map(o=>({...o,img:undefined}))));
 restore(undoStack.pop());updateHistory();setStatus("Undo");
});
document.getElementById("redo").addEventListener("click",()=>{
 if(!redoStack.length)return;
 undoStack.push(JSON.stringify(objects.map(o=>({...o,img:undefined}))));
 restore(redoStack.pop());updateHistory();setStatus("Redo");
});

function exportImage(type){
 selectedId=null;draw(false);
 const mime=type==="jpg"?"image/jpeg":"image/png",ext=type==="jpg"?"jpg":"png";
 const a=document.createElement("a");a.href=canvas.toDataURL(mime,.92);a.download=`onetoolbox-image.${ext}`;a.click();
 setStatus(`Downloaded ${ext.toUpperCase()}`);
}
document.getElementById("downloadPng").addEventListener("click",()=>exportImage("png"));
document.getElementById("downloadJpg").addEventListener("click",()=>exportImage("jpg"));

newCanvas();
function newCanvas(){canvas.width=800;canvas.height=600;info.textContent="800 × 600 px";draw();updateHistory()}
});