/* ONETOOLBOX - MEME GENERATOR */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const canvas=document.getElementById("memeCanvas");
const ctx=canvas.getContext("2d");
const imageInput=document.getElementById("imageInput");
const emptyPreview=document.getElementById("emptyPreview");
const status=document.getElementById("status");
const sizeInfo=document.getElementById("sizeInfo");
const topText=document.getElementById("topText");
const bottomText=document.getElementById("bottomText");
const fontSize=document.getElementById("fontSize");
const fontSizeValue=document.getElementById("fontSizeValue");
const strokeWidth=document.getElementById("strokeWidth");
const strokeValue=document.getElementById("strokeValue");
const textColor=document.getElementById("textColor");
const strokeColor=document.getElementById("strokeColor");
const fontFamily=document.getElementById("fontFamily");
const position=document.getElementById("position");
const downloadPng=document.getElementById("downloadPng");
const downloadJpg=document.getElementById("downloadJpg");

let img=null;
let offsetX=0,offsetY=0;

function setStatus(text){status.textContent=text}

function draw(){
if(!img)return;

ctx.clearRect(0,0,canvas.width,canvas.height);
ctx.fillStyle="#ffffff";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.save();
ctx.translate(canvas.width/2+offsetX,canvas.height/2+offsetY);

const scale=Math.min(canvas.width/img.naturalWidth,canvas.height/img.naturalHeight);
const w=img.naturalWidth*scale;
const h=img.naturalHeight*scale;

ctx.drawImage(img,-w/2,-h/2,w,h);
ctx.restore();

const size=Number(fontSize.value);
const stroke=Number(strokeWidth.value);

ctx.font=`${size}px "${fontFamily.value}"`;
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.lineJoin="round";
ctx.lineWidth=stroke;
ctx.fillStyle=textColor.value;
ctx.strokeStyle=strokeColor.value;

const maxWidth=canvas.width-40;

function drawWrapped(text,y){
if(!text.trim())return;
const words=text.trim().split(/\s+/);
let line="";
const lines=[];

for(const word of words){
const test=line?line+" "+word:word;
if(ctx.measureText(test).width>maxWidth && line){
lines.push(line);
line=word;
}else{
line=test;
}
}
if(line)lines.push(line);

const lineHeight=size*1.05;
const start=y-(lines.length-1)*lineHeight/2;

lines.forEach((lineText,i)=>{
const yy=start+i*lineHeight;
if(stroke>0)ctx.strokeText(lineText,canvas.width/2,yy);
ctx.fillText(lineText,canvas.width/2,yy);
});
}

const p=position.value;

if(p==="classic"){
drawWrapped(topText.value,Math.max(size/1.2,55));
drawWrapped(bottomText.value,canvas.height-Math.max(size/1.2,55));
}
else if(p==="top"){
drawWrapped(topText.value,Math.max(size/1.2,55));
}
else if(p==="bottom"){
drawWrapped(bottomText.value||topText.value,canvas.height-Math.max(size/1.2,55));
}
else if(p==="center"){
drawWrapped(topText.value||bottomText.value,canvas.height/2);
}
else if(p==="top-bottom"){
drawWrapped(topText.value,Math.max(size/1.2,55));
drawWrapped(bottomText.value,canvas.height-Math.max(size/1.2,55));
}

setStatus("Meme ready");
}

function loadImage(file){
if(!file)return;

const reader=new FileReader();
reader.onload=function(e){
const image=new Image();
image.onload=function(){
img=image;
offsetX=0;offsetY=0;

canvas.width=image.naturalWidth;
canvas.height=image.naturalHeight;

emptyPreview.hidden=true;
canvas.hidden=false;
downloadPng.disabled=false;
downloadJpg.disabled=false;

sizeInfo.textContent=`${canvas.width} × ${canvas.height} px`;
setStatus("Image loaded");
draw();
};
image.src=e.target.result;
};
reader.readAsDataURL(file);
}

imageInput.addEventListener("change",function(){
loadImage(this.files[0]);
});

[topText,bottomText,fontSize,strokeWidth,textColor,strokeColor,fontFamily,position].forEach(el=>{
el.addEventListener("input",function(){
fontSizeValue.textContent=fontSize.value+"px";
strokeValue.textContent=strokeWidth.value+"px";
draw();
});
el.addEventListener("change",draw);
});

function move(dx,dy){
offsetX+=dx;
offsetY+=dy;
draw();
}

document.getElementById("moveUp").addEventListener("click",()=>move(0,-10));
document.getElementById("moveDown").addEventListener("click",()=>move(0,10));
document.getElementById("moveLeft").addEventListener("click",()=>move(-10,0));
document.getElementById("moveRight").addEventListener("click",()=>move(10,0));

document.getElementById("reset").addEventListener("click",function(){
topText.value="";
bottomText.value="";
fontSize.value=54;
strokeWidth.value=5;
textColor.value="#ffffff";
strokeColor.value="#000000";
fontFamily.value="Impact";
position.value="classic";
offsetX=0;
offsetY=0;
fontSizeValue.textContent="54px";
strokeValue.textContent="5px";
draw();
});

document.getElementById("clear").addEventListener("click",function(){
img=null;
ctx.clearRect(0,0,canvas.width,canvas.height);
canvas.hidden=true;
emptyPreview.hidden=false;
downloadPng.disabled=true;
downloadJpg.disabled=true;
imageInput.value="";
sizeInfo.textContent="—";
setStatus("Choose an image to start");
});

function download(type){
if(!img)return;
draw();

const mime=type==="jpg"?"image/jpeg":"image/png";
const ext=type==="jpg"?"jpg":"png";

const link=document.createElement("a");
link.href=canvas.toDataURL(mime,.92);
link.download=`onetoolbox-meme.${ext}`;
document.body.appendChild(link);
link.click();
link.remove();

setStatus(`Downloaded ${ext.toUpperCase()}`);
}

downloadPng.addEventListener("click",()=>download("png"));
downloadJpg.addEventListener("click",()=>download("jpg"));

});
