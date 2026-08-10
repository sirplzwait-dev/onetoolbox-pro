/* ONETOOLBOX - IMAGE WATERMARK */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const canvas=document.getElementById("watermarkCanvas");
const ctx=canvas.getContext("2d");
const imageInput=document.getElementById("imageInput");
const logoInput=document.getElementById("logoInput");
const emptyPreview=document.getElementById("emptyPreview");
const status=document.getElementById("status");
const sizeInfo=document.getElementById("sizeInfo");
const textType=document.getElementById("textType");
const logoType=document.getElementById("logoType");
const textControls=document.getElementById("textControls");
const logoControls=document.getElementById("logoControls");
const watermarkText=document.getElementById("watermarkText");
const fontFamily=document.getElementById("fontFamily");
const fontSize=document.getElementById("fontSize");
const fontSizeValue=document.getElementById("fontSizeValue");
const textColor=document.getElementById("textColor");
const opacity=document.getElementById("opacity");
const opacityValue=document.getElementById("opacityValue");
const rotation=document.getElementById("rotation");
const rotationValue=document.getElementById("rotationValue");
const scale=document.getElementById("scale");
const scaleValue=document.getElementById("scaleValue");
const downloadPng=document.getElementById("downloadPng");
const downloadJpg=document.getElementById("downloadJpg");

let sourceImage=null;
let logoImage=null;
let mode="text";
let wm={x:.5,y:.5};
let dragging=false;
let dragOffset={x:0,y:0};

function setStatus(t){status.textContent=t}

function activateType(type){
 mode=type;
 textType.classList.toggle("active",type==="text");
 logoType.classList.toggle("active",type==="logo");
 textControls.hidden=type!=="text";
 logoControls.hidden=type!=="logo";
 draw();
}

textType.addEventListener("click",()=>activateType("text"));
logoType.addEventListener("click",()=>activateType("logo"));

function loadSource(file){
 if(!file)return;
 const reader=new FileReader();
 reader.onload=e=>{
   const img=new Image();
   img.onload=()=>{
     sourceImage=img;
     canvas.width=img.naturalWidth;
     canvas.height=img.naturalHeight;
     wm={x:.5,y:.5};
     emptyPreview.hidden=true;
     canvas.hidden=false;
     downloadPng.disabled=false;
     downloadJpg.disabled=false;
     sizeInfo.textContent=`${canvas.width} × ${canvas.height} px`;
     setStatus("Image loaded");
     draw();
   };
   img.src=e.target.result;
 };
 reader.readAsDataURL(file);
}
imageInput.addEventListener("change",()=>loadSource(imageInput.files[0]));

logoInput.addEventListener("change",e=>{
 const file=e.target.files[0];
 if(!file)return;
 const reader=new FileReader();
 reader.onload=ev=>{
   const img=new Image();
   img.onload=()=>{logoImage=img;activateType("logo");setStatus("Logo loaded");draw()};
   img.src=ev.target.result;
 };
 reader.readAsDataURL(file);
});

function draw(){
 if(!sourceImage)return;

 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(sourceImage,0,0,canvas.width,canvas.height);

 if(mode==="text"){
   const text=watermarkText.value.trim();
   if(!text)return;

   const size=Number(fontSize.value);
   const angle=Number(rotation.value)*Math.PI/180;
   const alpha=Number(opacity.value)/100;
   const factor=Number(scale.value)/100;

   ctx.save();
   ctx.globalAlpha=alpha;
   ctx.translate(canvas.width*wm.x,canvas.height*wm.y);
   ctx.rotate(angle);
   ctx.scale(factor,factor);
   ctx.font=`700 ${size}px "${fontFamily.value}"`;
   ctx.textAlign="center";
   ctx.textBaseline="middle";
   ctx.lineJoin="round";
   ctx.lineWidth=Math.max(2,size*.08);
   ctx.strokeStyle="rgba(0,0,0,.65)";
   ctx.strokeText(text,0,0);
   ctx.fillStyle=textColor.value;
   ctx.fillText(text,0,0);
   ctx.restore();
 }else if(mode==="logo" && logoImage){
   const factor=Number(scale.value)/100;
   const maxW=Math.min(canvas.width*.35,400)*factor;
   const maxH=Math.min(canvas.height*.35,300)*factor;
   const ratio=Math.min(maxW/logoImage.naturalWidth,maxH/logoImage.naturalHeight);
   const w=logoImage.naturalWidth*ratio;
   const h=logoImage.naturalHeight*ratio;
   const angle=Number(rotation.value)*Math.PI/180;

   ctx.save();
   ctx.globalAlpha=Number(opacity.value)/100;
   ctx.translate(canvas.width*wm.x,canvas.height*wm.y);
   ctx.rotate(angle);
   ctx.drawImage(logoImage,-w/2,-h/2,w,h);
   ctx.restore();
 }
}

[watermarkText,fontFamily,fontSize,textColor,opacity,rotation,scale].forEach(el=>{
 el.addEventListener("input",()=>{
   fontSizeValue.textContent=fontSize.value+"px";
   opacityValue.textContent=opacity.value+"%";
   rotationValue.textContent=rotation.value+"°";
   scaleValue.textContent=scale.value+"%";
   draw();
 });
 el.addEventListener("change",draw);
});

document.querySelectorAll(".position-grid button").forEach(btn=>{
 btn.addEventListener("click",()=>{
   const p=btn.dataset.pos;
   const map={
     tl:[.16,.16],tc:[.5,.16],tr:[.84,.16],
     ml:[.16,.5],mc:[.5,.5],mr:[.84,.5],
     bl:[.16,.84],bc:[.5,.84],br:[.84,.84]
   };
   if(map[p])wm={x:map[p][0],y:map[p][1]};
   draw();
 });
});

function pointerPoint(e){
 const r=canvas.getBoundingClientRect();
 return {
   x:(e.clientX-r.left)*(canvas.width/r.width),
   y:(e.clientY-r.top)*(canvas.height/r.height)
 };
}
function watermarkPoint(){
 return {x:canvas.width*wm.x,y:canvas.height*wm.y};
}
function hitWatermark(p){
 const c=watermarkPoint();
 const size=Math.max(40,Number(fontSize.value)*Number(scale.value)/100);
 const radius=mode==="logo" && logoImage
   ? Math.max(50,Math.min(canvas.width,canvas.height)*.2*Number(scale.value)/100)
   : size*2;
 return Math.hypot(p.x-c.x,p.y-c.y)<radius;
}

canvas.addEventListener("pointerdown",e=>{
 if(!sourceImage)return;
 const p=pointerPoint(e);
 if(hitWatermark(p)){
   dragging=true;
   const c=watermarkPoint();
   dragOffset={x:p.x-c.x,y:p.y-c.y};
   canvas.setPointerCapture(e.pointerId);
   setStatus("Dragging watermark");
 }
});
canvas.addEventListener("pointermove",e=>{
 if(!dragging)return;
 const p=pointerPoint(e);
 wm.x=Math.max(0,Math.min(1,(p.x-dragOffset.x)/canvas.width));
 wm.y=Math.max(0,Math.min(1,(p.y-dragOffset.y)/canvas.height));
 draw();
});
canvas.addEventListener("pointerup",()=>{dragging=false;setStatus("Watermark ready")});
canvas.addEventListener("pointercancel",()=>dragging=false);

document.getElementById("reset").addEventListener("click",()=>{
 watermarkText.value="OneToolBox";
 fontFamily.value="Arial";
 fontSize.value=52;
 textColor.value="#ffffff";
 opacity.value=70;
 rotation.value=0;
 scale.value=100;
 wm={x:.5,y:.5};
 fontSizeValue.textContent="52px";
 opacityValue.textContent="70%";
 rotationValue.textContent="0°";
 scaleValue.textContent="100%";
 activateType("text");
 setStatus(sourceImage?"Watermark reset":"Choose an image to start");
 draw();
});

document.getElementById("clear").addEventListener("click",()=>{
 sourceImage=null;
 logoImage=null;
 canvas.hidden=true;
 emptyPreview.hidden=false;
 downloadPng.disabled=true;
 downloadJpg.disabled=true;
 imageInput.value="";
 logoInput.value="";
 sizeInfo.textContent="—";
 setStatus("Choose an image to start");
});

function download(type){
 if(!sourceImage)return;
 draw();
 const mime=type==="jpg"?"image/jpeg":"image/png";
 const ext=type==="jpg"?"jpg":"png";
 const link=document.createElement("a");
 link.href=canvas.toDataURL(mime,.92);
 link.download=`onetoolbox-watermark.${ext}`;
 document.body.appendChild(link);
 link.click();
 link.remove();
 setStatus(`Downloaded ${ext.toUpperCase()}`);
}
downloadPng.addEventListener("click",()=>download("png"));
downloadJpg.addEventListener("click",()=>download("jpg"));

});