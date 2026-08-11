/* ONETOOLBOX - IMAGE COLLAGE MAKER */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const imageInput=document.getElementById("imageInput");
const layout=document.getElementById("layout");
const gap=document.getElementById("gap");
const radius=document.getElementById("radius");
const background=document.getElementById("background");
const fit=document.getElementById("fit");
const gapValue=document.getElementById("gapValue");
const radiusValue=document.getElementById("radiusValue");
const imageCount=document.getElementById("imageCount");
const imageList=document.getElementById("imageList");
const canvas=document.getElementById("collageCanvas");
const ctx=canvas.getContext("2d");
const emptyPreview=document.getElementById("emptyPreview");
const status=document.getElementById("status");
const sizeInfo=document.getElementById("sizeInfo");
const downloadPng=document.getElementById("downloadPng");
const downloadJpg=document.getElementById("downloadJpg");
const imageCountSlider=document.getElementById("imageCountSlider");
const imageCountSliderValue=document.getElementById("imageCountSliderValue");

let images=[];
let ratio="1:1";

const MAX=9;
let targetCount=4;
const SIZE=1200;

function setStatus(t){status.textContent=t}

function ratioSize(){
const map={"1:1":[1,1],"4:3":[4,3],"16:9":[16,9],"9:16":[9,16]};
const r=map[ratio]||[1,1];
let w=SIZE,h=Math.round(SIZE*r[1]/r[0]);
if(h>1600){h=1600;w=Math.round(h*r[0]/r[1])}
return {w,h};
}

function updateLabels(){
imageCountSliderValue.textContent=targetCount;
gapValue.textContent=gap.value+"px";
radiusValue.textContent=radius.value+"px";
imageCount.textContent=images.length;
}

function loadFiles(files){
const selected=Array.from(files).slice(0,Math.max(0,targetCount-images.length));
if(!selected.length){setStatus(`You selected ${targetCount} photos. Add ${Math.max(0,targetCount-images.length)} more image${targetCount-images.length===1?"":"s"}.`);return;}

let pending=selected.length;
selected.forEach(file=>{
const reader=new FileReader();
reader.onload=e=>{
const img=new Image();
img.onload=()=>{
images.push({img,name:file.name,id:crypto.randomUUID?crypto.randomUUID():Date.now()+Math.random()});
pending--;
if(pending===0){renderList();draw();}
};
img.src=e.target.result;
};
reader.readAsDataURL(file);
});
}

imageInput.addEventListener("change",function(){
loadFiles(this.files);
imageInput.value="";
});

function renderList(){
imageList.innerHTML="";
if(!images.length){
imageList.innerHTML='<div class="image-list-empty">No images added</div>';
}else{
images.forEach((item,index)=>{
const row=document.createElement("div");
row.className="image-list-item";
const img=document.createElement("img");
img.src=item.img.src;
img.alt="";
const name=document.createElement("span");
name.textContent=(index+1)+". "+item.name;
const btn=document.createElement("button");
btn.type="button";
btn.className="remove-image";
btn.innerHTML='<i class="fa-solid fa-xmark"></i>';
btn.title="Remove image";
btn.onclick=()=>{images.splice(index,1);renderList();draw()};
row.append(img,name,btn);
imageList.appendChild(row);
});
}
updateLabels();
}

function roundedRectPath(c,x,y,w,h,r){
r=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);
c.beginPath();
c.moveTo(x+r,y);
c.arcTo(x+w,y,x+w,y+h,r);
c.arcTo(x+w,y+h,x,y+h,r);
c.arcTo(x,y+h,x,y,r);
c.arcTo(x,y,x+w,y,r);
c.closePath();
}

function drawImageCover(item,x,y,w,h){
const img=item.img;
const iw=img.naturalWidth,ih=img.naturalHeight;
const scale=fit.value==="contain"
?Math.min(w/iw,h/ih)
:Math.max(w/iw,h/ih);
const dw=iw*scale,dh=ih*scale;
const dx=x+(w-dw)/2,dy=y+(h-dh)/2;

ctx.save();
roundedRectPath(ctx,x,y,w,h,Number(radius.value));
ctx.clip();
ctx.fillStyle=background.value;
ctx.fillRect(x,y,w,h);
ctx.drawImage(img,dx,dy,dw,dh);
ctx.restore();
}

function drawGrid(count,w,h,g){
const cols=count===1?1:count===2?2:count<=4?2:3;
const rows=Math.ceil(count/cols);
const cellW=(w-g*(cols+1))/cols;
const cellH=(h-g*(rows+1))/rows;

images.forEach((item,i)=>{
const col=i%cols,row=Math.floor(i/cols);
drawImageCover(item,g+col*(cellW+g),g+row*(cellH+g),cellW,cellH);
});
}

function drawVertical(w,h,g){
const n=images.length;
const cellH=(h-g*(n+1))/n;
images.forEach((item,i)=>{
drawImageCover(item,g,g+i*(cellH+g),w-2*g,cellH);
});
}

function drawHorizontal(w,h,g){
const n=images.length;
const cellW=(w-g*(n+1))/n;
images.forEach((item,i)=>{
drawImageCover(item,g+i*(cellW+g),g,cellW,h-2*g);
});
}

function drawFeatured(w,h,g){
if(images.length===1){drawImageCover(images[0],g,g,w-2*g,h-2*g);return}

const bigH=(h-g*3)*.62;
drawImageCover(images[0],g,g,w-2*g,bigH);

const n=images.length-1;
const cellW=(w-g*(n+1))/n;
const y=g+bigH+g;

images.slice(1).forEach((item,i)=>{
drawImageCover(item,g+i*(cellW+g),y,cellW,h-y-g);
});
}

function draw(){
updateLabels();

if(images.length<targetCount){
canvas.hidden=true;
emptyPreview.hidden=false;
downloadPng.disabled=true;
downloadJpg.disabled=true;
sizeInfo.textContent="—";
setStatus(images.length===0?`Add ${targetCount} images to start`:`Add ${targetCount-images.length} more image${targetCount-images.length===1?"":"s"}`);
return;
}

const s=ratioSize();
canvas.width=s.w;
canvas.height=s.h;

ctx.clearRect(0,0,s.w,s.h);
ctx.fillStyle=background.value;
ctx.fillRect(0,0,s.w,s.h);

const g=Number(gap.value);
if(layout.value==="vertical")drawVertical(s.w,s.h,g);
else if(layout.value==="horizontal")drawHorizontal(s.w,s.h,g);
else if(layout.value==="featured")drawFeatured(s.w,s.h,g);
else drawGrid(images.length,s.w,s.h,g);

canvas.hidden=false;
emptyPreview.hidden=true;
downloadPng.disabled=false;
downloadJpg.disabled=false;
sizeInfo.textContent=`${s.w} × ${s.h} px`;
setStatus(`${images.length} of ${targetCount} images • Collage ready`);
}

imageCountSlider.addEventListener("input",()=>{
targetCount=Number(imageCountSlider.value);
if(images.length>targetCount) images=images.slice(0,targetCount);
renderList();
draw();
});

document.querySelectorAll(".ratio-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
document.querySelectorAll(".ratio-btn").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
ratio=btn.dataset.ratio;
draw();
});
});

[layout,gap,radius,background,fit].forEach(el=>{
el.addEventListener("input",draw);
el.addEventListener("change",draw);
});

document.getElementById("reset").addEventListener("click",()=>{
layout.value="grid";
targetCount=4;
imageCountSlider.value=4;
gap.value=12;
radius.value=12;
background.value="#ffffff";
fit.value="cover";
document.querySelectorAll(".ratio-btn").forEach(b=>b.classList.toggle("active",b.dataset.ratio==="1:1"));
ratio="1:1";
draw();
});

document.getElementById("clear").addEventListener("click",()=>{
images=[];
renderList();
draw();
});

function download(type){
if(images.length<2)return;
draw();
const mime=type==="jpg"?"image/jpeg":"image/png";
const ext=type==="jpg"?"jpg":"png";
const link=document.createElement("a");
link.href=canvas.toDataURL(mime,.92);
link.download=`onetoolbox-collage.${ext}`;
document.body.appendChild(link);
link.click();
link.remove();
setStatus(`Downloaded ${ext.toUpperCase()}`);
}

downloadPng.addEventListener("click",()=>download("png"));
downloadJpg.addEventListener("click",()=>download("jpg"));

renderList();
updateLabels();

});