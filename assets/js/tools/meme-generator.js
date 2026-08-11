"use strict";
document.addEventListener("DOMContentLoaded",()=>{
const $=id=>document.getElementById(id);
const canvas=$("memeCanvas"),ctx=canvas.getContext("2d");
const input=$("imageInput"),drop=$("dropZone"),empty=$("emptyPreview"),status=$("status"),sizeInfo=$("sizeInfo");
const top=$("topText"),bottom=$("bottomText"),fs=$("fontSize"),fsVal=$("fontSizeValue"),sw=$("strokeWidth"),swVal=$("strokeValue");
const tc=$("textColor"),sc=$("strokeColor"),font=$("fontFamily"),pos=$("position"),moveVal=$("moveValue");
const png=$("downloadPng"),jpg=$("downloadJpg"),holder=$("previewHolder"),zoomLabel=$("previewZoom");
let img=null,ox=0,oy=0,zoom=1,baseW=0,baseH=0;

function statusText(t){status.textContent=t}
function draw(){
 if(!img)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle="#fff";ctx.fillRect(0,0,canvas.width,canvas.height);
 const scale=Math.min(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
 const w=img.naturalWidth*scale,h=img.naturalHeight*scale;
 ctx.drawImage(img,canvas.width/2+ox-w/2,canvas.height/2+oy-h/2,w,h);
 const size=+fs.value,stroke=+sw.value;
 ctx.font=`900 ${size}px "${font.value}"`;
 ctx.textAlign="center";ctx.textBaseline="middle";ctx.lineJoin="round";ctx.lineWidth=stroke;ctx.fillStyle=tc.value;ctx.strokeStyle=sc.value;
 const max=canvas.width-34;
 function wrap(text){
   if(!text.trim())return [];
   const words=text.trim().split(/\s+/),lines=[];let line="";
   for(const word of words){const test=line?line+" "+word:word;if(ctx.measureText(test).width>max&&line){lines.push(line);line=word}else line=test}
   if(line)lines.push(line);return lines;
 }
 function textBlock(text,y){
   const lines=wrap(text),lh=size*1.06,start=y-(lines.length-1)*lh/2;
   lines.forEach((t,i)=>{const yy=start+i*lh;if(stroke)ctx.strokeText(t,canvas.width/2,yy);ctx.fillText(t,canvas.width/2,yy)})
 }
 const margin=Math.max(size*.72,45);
 if(pos.value==="classic"||pos.value==="top")textBlock(top.value,margin);
 if(pos.value==="classic"||pos.value==="bottom")textBlock(bottom.value,canvas.height-margin);
 if(pos.value==="center")textBlock(top.value||bottom.value,canvas.height/2);
 sizeInfo.textContent=`${canvas.width} × ${canvas.height} px`;moveVal.textContent=`${Math.round(ox)}, ${Math.round(oy)}`;
}
function fit(){
 if(!img)return;
 const w=holder.clientWidth-28,h=holder.clientHeight-28;
 zoom=Math.min(w/canvas.width,h/canvas.height);zoom=Math.max(.1,Math.min(1,zoom));
 canvas.style.width=(canvas.width*zoom)+"px";canvas.style.height=(canvas.height*zoom)+"px";
 zoomLabel.textContent=Math.round(zoom*100)+"%";
}
function render(){draw();fit()}
function load(file){
 if(!file||!file.type.startsWith("image/"))return;
 const reader=new FileReader();reader.onload=e=>{
  const im=new Image();im.onload=()=>{
   img=im;ox=0;oy=0;canvas.width=im.naturalWidth;canvas.height=im.naturalHeight;
   canvas.hidden=false;empty.hidden=true;png.disabled=false;jpg.disabled=false;
   $("uploadTitle").textContent="Image Ready";$("statusDot").classList.add("active");
   statusText("Meme ready — add your text");render();
  };im.src=e.target.result;
 };reader.readAsDataURL(file);
}
input.addEventListener("change",()=>load(input.files[0]));
["dragenter","dragover"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.add("drag")}));
["dragleave","drop"].forEach(e=>drop.addEventListener(e,ev=>{ev.preventDefault();drop.classList.remove("drag")}));
drop.addEventListener("drop",e=>load(e.dataTransfer.files[0]));
[top,bottom,fs,sw,tc,sc,font,pos].forEach(el=>{el.addEventListener("input",()=>{fsVal.textContent=fs.value+"px";swVal.textContent=sw.value+"px";draw()});el.addEventListener("change",draw)});
function move(x,y){ox+=x;oy+=y;draw()}
$("moveUp").onclick=()=>move(0,-10);$("moveDown").onclick=()=>move(0,10);$("moveLeft").onclick=()=>move(-10,0);$("moveRight").onclick=()=>move(10,0);
$("moveCenter").onclick=()=>{ox=0;oy=0;draw()};
$("reset").onclick=()=>{top.value="";bottom.value="";fs.value=54;sw.value=5;tc.value="#ffffff";sc.value="#000000";font.value="Impact";pos.value="classic";ox=0;oy=0;fsVal.textContent="54px";swVal.textContent="5px";draw()};
$("clear").onclick=()=>{img=null;input.value="";canvas.hidden=true;empty.hidden=false;png.disabled=true;jpg.disabled=true;$("uploadTitle").textContent="Upload Image";$("statusDot").classList.remove("active");statusText("Choose an image to start");sizeInfo.textContent="—";zoomLabel.textContent="Fit"};
$("previewZoomIn").onclick=()=>{if(!img)return;zoom=Math.min(2,zoom+.1);canvas.style.width=canvas.width*zoom+"px";canvas.style.height=canvas.height*zoom+"px";zoomLabel.textContent=Math.round(zoom*100)+"%"};
$("previewZoomOut").onclick=()=>{if(!img)return;zoom=Math.max(.1,zoom-.1);canvas.style.width=canvas.width*zoom+"px";canvas.style.height=canvas.height*zoom+"px";zoomLabel.textContent=Math.round(zoom*100)+"%"};
$("previewFit").onclick=fit;
window.addEventListener("resize",()=>{if(img)fit()});
function download(type){
 if(!img)return;draw();const a=document.createElement("a"),mime=type==="jpg"?"image/jpeg":"image/png";
 a.href=canvas.toDataURL(mime,.94);a.download=`${(img.name||"meme").replace(/\.[^.]+$/,"")}-OneToolBox.${type}`;a.click();statusText(`Downloaded ${type.toUpperCase()}`);
}
png.onclick=()=>download("png");jpg.onclick=()=>download("jpg");
});