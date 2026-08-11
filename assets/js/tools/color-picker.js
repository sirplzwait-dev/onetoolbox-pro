document.addEventListener("DOMContentLoaded",()=>{
"use strict";
const $=id=>document.getElementById(id);
const fileInput=$("fileInput"),chooseBtn=$("chooseBtn"),drop=$("drop");
const canvas=$("canvas"),ctx=canvas.getContext("2d",{willReadFrequently:true});
const canvasWrap=$("canvasWrap"),zoomValue=$("zoomValue"),zoomIn=$("zoomIn"),zoomOut=$("zoomOut"),zoomReset=$("zoomReset");
const pickerArea=$("pickerArea"),uploadPreview=$("uploadPreview"),uploadIcon=$("uploadIcon");
const uploadTitle=$("uploadTitle"),uploadInfo=$("uploadInfo"),status=$("status");
const swatch=$("swatch"),hexEl=$("hex"),rgbEl=$("rgb"),hslEl=$("hsl"),magnifier=$("magnifier"),emptyPreview=$("emptyPreview");
const eyeBtn=$("eyeDropperBtn"),resetBtn=$("resetBtn");
let imageUrl=null,image=null,loaded=false,lastColor={r:255,g:255,b:255},zoom=1;


function applyZoom(){
  zoom=Math.max(.5,Math.min(4,zoom));
  canvas.style.width=(canvas.width*zoom)+"px";
  canvas.style.height=(canvas.height*zoom)+"px";
  zoomValue.textContent=Math.round(zoom*100)+"%";
}

function rgbToHsl(r,g,b){
 r/=255;g/=255;b/=255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b);
 let h=0,s=0,l=(max+min)/2;
 if(max!==min){
  const d=max-min;
  s=l>0.5?d/(2-max-min):d/(max+min);
  switch(max){
   case r:h=(g-b)/d+(g<b?6:0);break;
   case g:h=(b-r)/d+2;break;
   case b:h=(r-g)/d+4;break;
  }
  h/=6;
 }
 return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
}
function setColor(r,g,b){
 lastColor={r,g,b};
 const hex="#"+[r,g,b].map(v=>v.toString(16).padStart(2,"0")).join("").toUpperCase();
 const hsl=rgbToHsl(r,g,b);
 hexEl.textContent=hex;
 rgbEl.textContent=`rgb(${r}, ${g}, ${b})`;
 hslEl.textContent=`hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
 swatch.style.backgroundColor=hex;
}
function copyText(text){
 if(navigator.clipboard&&window.isSecureContext){
  navigator.clipboard.writeText(text).then(()=>status.textContent=`${text} copied.`);
 }else{
  const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();
  try{document.execCommand("copy");status.textContent=`${text} copied.`}catch(e){status.textContent="Copy failed. Please copy manually."}
  ta.remove();
 }
}
function pickAt(clientX,clientY){
 if(!loaded)return;
 const rect=canvas.getBoundingClientRect();
 if(!rect.width||!rect.height)return;
 const x=Math.max(0,Math.min(canvas.width-1,Math.round((clientX-rect.left)*canvas.width/rect.width)));
 const y=Math.max(0,Math.min(canvas.height-1,Math.round((clientY-rect.top)*canvas.height/rect.height)));
 const d=ctx.getImageData(x,y,1,1).data;
 setColor(d[0],d[1],d[2]);
 status.textContent=`Selected pixel: ${x}, ${y}. Click a value below to copy it.`;
 updateMagnifier(clientX,clientY,x,y);
}
function updateMagnifier(clientX,clientY,x,y){
 if(!loaded)return;
 const size=70, zoom=8;
 const sx=Math.max(0,Math.min(canvas.width-size/zoom,x-size/(zoom*2)));
 const sy=Math.max(0,Math.min(canvas.height-size/zoom,y-size/(zoom*2)));
 magnifier.style.display="block";
 const bgW=size*zoom,bgH=size*zoom;
 magnifier.style.left=Math.max(5,Math.min(drop.clientWidth-size-5,clientX-drop.getBoundingClientRect().left-size/2))+"px";
 magnifier.style.top=Math.max(5,Math.min(canvas.clientHeight-size-5,clientY-canvas.getBoundingClientRect().top-size/2))+"px";
 magnifier.style.backgroundImage=`url(${imageUrl})`;
 magnifier.style.backgroundSize=`${canvas.width*zoom}px ${canvas.height*zoom}px`;
 magnifier.style.backgroundPosition=`-${sx*zoom}px -${sy*zoom}px`;
}
function loadFile(f){
 if(!f||!f.type.startsWith("image/")){alert("Please choose a valid image.");return}
 if(imageUrl)URL.revokeObjectURL(imageUrl);
 imageUrl=URL.createObjectURL(f);
 image=new Image();
 image.onload=()=>{
  canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;
  ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(image,0,0);applyZoom();
  loaded=true;pickerArea.style.display="block";emptyPreview.style.display="none";
  uploadPreview.src=imageUrl;uploadPreview.style.display="none";
  uploadIcon.style.display="";uploadTitle.textContent="Image Ready";
  uploadInfo.textContent="Click or tap the image below to pick a color.";
  chooseBtn.innerHTML='<i class="fa-solid fa-arrows-to-dot"></i> Pick Color';
  status.textContent="Image loaded. Click or tap anywhere on the image.";
 };
 image.onerror=()=>{loaded=false;status.textContent="Could not load this image."};
 image.src=imageUrl;
}
chooseBtn.addEventListener("click",e=>{e.preventDefault();fileInput.click()});
fileInput.addEventListener("change",e=>loadFile(e.target.files[0]));
drop.addEventListener("dragover",e=>{e.preventDefault();drop.classList.add("drag")});
drop.addEventListener("dragleave",()=>drop.classList.remove("drag"));
drop.addEventListener("drop",e=>{e.preventDefault();drop.classList.remove("drag");loadFile(e.dataTransfer.files[0])});
document.addEventListener("paste",e=>{
 for(const item of e.clipboardData?.items||[]){
  if(item.type.startsWith("image/")){loadFile(item.getAsFile());break}
 }
});
canvas.addEventListener("pointermove",e=>{if(loaded){const r=canvas.getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){pickAt(e.clientX,e.clientY)}}});
canvas.addEventListener("pointerleave",()=>magnifier.style.display="none");
canvas.addEventListener("pointerdown",e=>{if(loaded)pickAt(e.clientX,e.clientY)});
canvas.addEventListener("touchstart",e=>{if(loaded&&e.touches[0]){e.preventDefault();pickAt(e.touches[0].clientX,e.touches[0].clientY)}},{passive:false});
document.getElementById("hexBtn").onclick=()=>copyText(hexEl.textContent);
document.getElementById("rgbBtn").onclick=()=>copyText(rgbEl.textContent);
document.getElementById("hslBtn").onclick=()=>copyText(hslEl.textContent);

zoomIn.addEventListener("click",()=>{zoom+=.25;applyZoom()});
zoomOut.addEventListener("click",()=>{zoom-=.25;applyZoom()});
zoomReset.addEventListener("click",()=>{zoom=1;applyZoom()});
canvasWrap.addEventListener("wheel",e=>{
 if(e.ctrlKey){e.preventDefault();zoom+=e.deltaY<0?.1:-.1;applyZoom()}
},{passive:false});
eyeBtn.addEventListener("click",async()=>{
 if(!window.EyeDropper){status.textContent="Screen color picker is not supported in this browser. Use the image picker.";return}
 try{
  const result=await new EyeDropper().open();
  const c=result.sRGBHex;
  const n=parseInt(c.slice(1),16);setColor((n>>16)&255,(n>>8)&255,n&255);
  status.textContent="Screen color selected. Click a value to copy it.";
 }catch(e){status.textContent="Screen picker cancelled."}
});
resetBtn.addEventListener("click",()=>{
 if(imageUrl)URL.revokeObjectURL(imageUrl);
 imageUrl=null;image=null;loaded=false;fileInput.value="";
 ctx.clearRect(0,0,canvas.width,canvas.height);pickerArea.style.display="none";emptyPreview.style.display="flex";zoom=1;applyZoom();
 uploadPreview.removeAttribute("src");uploadPreview.style.display="none";
 uploadIcon.style.display="";uploadTitle.textContent="Upload Image";
 uploadInfo.innerHTML="📁 Choose Image<br>🖱 Drag &amp; Drop<br>📋 Paste Image";
 chooseBtn.innerHTML='<i class="fa-solid fa-folder-open"></i> Choose Image';
 magnifier.style.display="none";status.textContent="Upload an image to start.";
 setColor(255,255,255);
});
setColor(255,255,255);
});