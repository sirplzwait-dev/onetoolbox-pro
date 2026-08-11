document.addEventListener("DOMContentLoaded",()=>{
const $=id=>document.getElementById(id), c=$("creatorCanvas"),ctx=c.getContext("2d"),wrap=$("canvasWrap");
let objects=[],selected=null,drag=null,zoom=1,history=[],future=[], bg="#ffffff";

function snapshot(){history.push(JSON.stringify({objects,bg,w:c.width,h:c.height}));if(history.length>30)history.shift();future=[]}
function restore(s){const x=JSON.parse(s);objects=x.objects;bg=x.bg;c.width=x.w;c.height=x.h;selected=null;render();}

function fit(){const z=Math.min((wrap.clientWidth-28)/c.width,(wrap.clientHeight-28)/c.height);zoom=Math.max(.08,Math.min(1,z));c.style.width=c.width*zoom+"px";c.style.height=c.height*zoom+"px";$("zoomLabel").textContent=Math.round(zoom*100)+"%"}
function resizeCanvas(w,h){snapshot();c.width=w;c.height=h;$("dimensions").textContent=`${w} × ${h}`;render()}
function drawObject(o){
 ctx.save();ctx.globalAlpha=o.opacity??1;
 if(o.type==="text"){ctx.font=`900 ${o.size}px "${o.font}"`;ctx.textAlign=o.align;ctx.textBaseline="middle";ctx.lineJoin="round";ctx.lineWidth=o.stroke;ctx.strokeStyle=o.strokeColor;ctx.fillStyle=o.color;ctx.strokeText(o.text,o.x,o.y);ctx.fillText(o.text,o.x,o.y)}
 if(o.type==="rect"){ctx.fillStyle=o.color;ctx.fillRect(o.x,o.y,o.w,o.h)}
 if(o.type==="circle"){ctx.fillStyle=o.color;ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);ctx.fill()}
 if(o.type==="line"){ctx.strokeStyle=o.color;ctx.lineWidth=o.w;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x2,o.y2);ctx.stroke()}
 if(o.type==="image"&&o.img){ctx.drawImage(o.img,o.x,o.y,o.w,o.h)}
 ctx.restore();
 if(o===selected){ctx.save();ctx.strokeStyle="#2563eb";ctx.lineWidth=2;ctx.setLineDash([6,4]);const b=bounds(o);ctx.strokeRect(b.x-5,b.y-5,b.w+10,b.h+10);ctx.restore()}
}
function bounds(o){if(o.type==="text"){ctx.font=`900 ${o.size}px "${o.font}"`;let w=ctx.measureText(o.text).width;return {x:o.align==="center"?o.x-w/2:o.align==="right"?o.x-w:o.x,y:o.y-o.size/2,w,h:o.size}}if(o.type==="rect")return{x:o.x,y:o.y,w:o.w,h:o.h};if(o.type==="circle")return{x:o.x-o.r,y:o.y-o.r,w:o.r*2,h:o.r*2};if(o.type==="line")return{x:Math.min(o.x,o.x2),y:Math.min(o.y,o.y2),w:Math.abs(o.x2-o.x),h:Math.abs(o.y2-o.y)};return{x:o.x,y:o.y,w:o.w,h:o.h}}
function hit(o,x,y){const b=bounds(o);return x>=b.x-8&&x<=b.x+b.w+8&&y>=b.y-8&&y<=b.y+b.h+8}
function render(){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);objects.forEach(drawObject);fit();$("emptyState").style.display=objects.length?"none":"block";$("canvasStatus").textContent=objects.length?`${objects.length} object${objects.length>1?"s":""}`:"Start creating";$("readyDot").classList.toggle("ready",objects.length>0)}

function pointer(e){const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)/zoom,y:(e.clientY-r.top)/zoom}}
c.addEventListener("pointerdown",e=>{const p=pointer(e);for(let i=objects.length-1;i>=0;i--){if(hit(objects[i],p.x,p.y)){selected=objects[i];drag={x:p.x,y:p.y,ox:selected.x,oy:selected.y};c.setPointerCapture(e.pointerId);render();return}}selected=null;render()});
c.addEventListener("pointermove",e=>{if(!drag||!selected)return;const p=pointer(e),dx=p.x-drag.x,dy=p.y-drag.y;selected.x=drag.ox+dx;selected.y=drag.oy+dy;if(selected.type==="line"){selected.x2+=dx;selected.y2+=dy}render()});
c.addEventListener("pointerup",()=>{if(drag){snapshot();drag=null}});
function add(o){snapshot();objects.push(o);selected=o;render()}

$("addText").onclick=()=>{add({type:"text",text:$("textInput").value||"Your Text",x:c.width/2,y:c.height/2,size:+$("fontSize").value,font:$("fontFamily").value,color:$("textColor").value,strokeColor:$("strokeColor").value,stroke:+$("strokeWidth").value,align:$("textAlign").value,opacity:1})};
$("addShape").onclick=()=>{const s=document.querySelector(".shape-grid button.active")?.dataset.shape||"rect";const color=$("shapeColor").value,op=+$("shapeOpacity").value/100;if(s==="rect")add({type:"rect",x:c.width/2-180,y:c.height/2-90,w:360,h:180,color,opacity:op});if(s==="circle")add({type:"circle",x:c.width/2,y:c.height/2,r:110,color,opacity:op});if(s==="line")add({type:"line",x:c.width/2-150,y:c.height/2,x2:c.width/2+150,y2:c.height/2,w:12,color,opacity:op})};
document.querySelectorAll(".shape-grid button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".shape-grid button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
$("deleteSelected").onclick=()=>{if(!selected)return;snapshot();objects=objects.filter(o=>o!==selected);selected=null;render()};
$("textInput").oninput=()=>{if(selected?.type==="text"){selected.text=$("textInput").value;render()}};
$("fontSize").oninput=()=>{$("sizeVal").textContent=$("fontSize").value+"px";if(selected?.type==="text"){selected.size=+$("fontSize").value;render()}};
$("strokeWidth").oninput=()=>{$("strokeVal").textContent=$("strokeWidth").value+"px";if(selected?.type==="text"){selected.stroke=+$("strokeWidth").value;render()}};
$("shapeOpacity").oninput=()=>{$("opacityVal").textContent=$("shapeOpacity").value+"%";if(selected&&selected.type!=="text"){selected.opacity=+$("shapeOpacity").value/100;render()}};
["fontFamily","textColor","strokeColor","textAlign"].forEach(id=>$(id).onchange=()=>{if(selected?.type==="text"){selected.font=$("fontFamily").value;selected.color=$("textColor").value;selected.strokeColor=$("strokeColor").value;selected.align=$("textAlign").value;render()}});
$("applyBg").onclick=()=>{snapshot();bg=$("bgColor").value;const p=$("canvasPreset").value;const sizes={square:[1080,1080],post:[1080,1350],story:[1080,1920],landscape:[1280,720]};let [w,h]=sizes[p]||[+$("customW").value,+$("customH").value];c.width=w;c.height=h;$("dimensions").textContent=`${w} × ${h}`;render()};
$("canvasPreset").onchange=()=>{$("customSize").classList.toggle("show",$("canvasPreset").value==="custom")};
$("imageInput").onchange=e=>loadBase(e.target.files[0]);$("overlayInput").onchange=e=>loadOverlay(e.target.files[0]);
function loadBase(file){if(!file)return;const im=new Image();im.onload=()=>{snapshot();objects=[];bg="#fff";c.width=im.naturalWidth;c.height=im.naturalHeight;objects.push({type:"image",img:im,x:0,y:0,w:im.naturalWidth,h:im.naturalHeight});$("dimensions").textContent=`${c.width} × ${c.height}`;selected=null;render()};im.src=URL.createObjectURL(file)}
function loadOverlay(file){if(!file)return;const im=new Image();im.onload=()=>{const w=Math.min(im.naturalWidth,400),h=im.naturalHeight*(w/im.naturalWidth);add({type:"image",img:im,x:(c.width-w)/2,y:(c.height-h)/2,w,h})};im.src=URL.createObjectURL(file)}
["dragenter","dragover"].forEach(ev=>$("dropZone").addEventListener(ev,e=>{e.preventDefault();$("dropZone").classList.add("drag")}));
["dragleave","drop"].forEach(ev=>$("dropZone").addEventListener(ev,e=>{e.preventDefault();$("dropZone").classList.remove("drag")}));
$("dropZone").addEventListener("drop",e=>loadBase(e.dataTransfer.files[0]));
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".tool-pane").forEach(x=>x.classList.remove("active"));t.classList.add("active");$("pane-"+t.dataset.tab).classList.add("active")});
$("zoomIn").onclick=()=>{zoom=Math.min(2,zoom+.1);c.style.width=c.width*zoom+"px";c.style.height=c.height*zoom+"px";$("zoomLabel").textContent=Math.round(zoom*100)+"%"};
$("zoomOut").onclick=()=>{zoom=Math.max(.1,zoom-.1);c.style.width=c.width*zoom+"px";c.style.height=c.height*zoom+"px";$("zoomLabel").textContent=Math.round(zoom*100)+"%"};
$("fit").onclick=fit;window.onresize=()=>{if(c.width)fit()};
$("undo").onclick=()=>{if(history.length){future.push(JSON.stringify({objects,bg,w:c.width,h:c.height}));restore(history.pop())}};
$("redo").onclick=()=>{if(future.length){history.push(JSON.stringify({objects,bg,w:c.width,h:c.height}));restore(future.pop())}};
$("reset").onclick=()=>{objects=[];selected=null;bg="#ffffff";c.width=1080;c.height=1080;$("dimensions").textContent="1080 × 1080";render()};
function download(type){const a=document.createElement("a");a.download=`image-creator-OneToolBox.${type}`;a.href=c.toDataURL(type==="jpg"?"image/jpeg":"image/png",.94);a.click()}
$("downloadPng").onclick=()=>download("png");$("downloadJpg").onclick=()=>download("jpg");
render();
});