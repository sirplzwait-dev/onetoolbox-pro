/* ONETOOLBOX - IMAGE OCR */
"use strict";

document.addEventListener("DOMContentLoaded",function(){

const imageInput=document.getElementById("imageInput");
const imagePreview=document.getElementById("imagePreview");
const emptyPreview=document.getElementById("emptyPreview");
const imageInfo=document.getElementById("imageInfo");
const language=document.getElementById("language");
const scale=document.getElementById("scale");
const extractBtn=document.getElementById("extractBtn");
const resetBtn=document.getElementById("resetBtn");
const resultText=document.getElementById("resultText");
const resultStatus=document.getElementById("resultStatus");
const copyBtn=document.getElementById("copyBtn");
const downloadBtn=document.getElementById("downloadBtn");
const clearBtn=document.getElementById("clearBtn");
const progressBar=document.getElementById("progressBar");
const progressLabel=document.getElementById("progressLabel");
const progressPercent=document.getElementById("progressPercent");

let imageData="";
let originalName="ocr-result";

function setProgress(percent,label){
 const p=Math.max(0,Math.min(100,Math.round(percent)));
 progressBar.style.width=p+"%";
 progressPercent.textContent=p+"%";
 progressLabel.textContent=label;
}

function setResultState(hasText){
 copyBtn.disabled=!hasText;
 downloadBtn.disabled=!hasText;
 resultStatus.textContent=hasText?"Ready":"Waiting";
}

imageInput.addEventListener("change",function(){
 const file=this.files[0];
 if(!file)return;

 const reader=new FileReader();
 reader.onload=function(e){
   imageData=e.target.result;
   originalName=(file.name||"ocr-result").replace(/\.[^.]+$/,"");
   imagePreview.src=imageData;
   imagePreview.hidden=false;
   emptyPreview.hidden=true;
   extractBtn.disabled=false;
   resultText.value="";
   setResultState(false);
   resultStatus.textContent="Image loaded";
   imageInfo.textContent=`${formatBytes(file.size)} • ${file.type.replace("image/","").toUpperCase()}`;
   setProgress(0,"Ready");
 };
 reader.readAsDataURL(file);
});

function formatBytes(bytes){
 if(!bytes)return "0 B";
 const units=["B","KB","MB","GB"];
 const i=Math.floor(Math.log(bytes)/Math.log(1024));
 return (bytes/Math.pow(1024,i)).toFixed(i?1:0)+" "+units[i];
}

function scaledImageDataURL(src,multiplier){
 return new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=function(){
     const canvas=document.createElement("canvas");
     canvas.width=Math.max(1,Math.round(img.naturalWidth*multiplier));
     canvas.height=Math.max(1,Math.round(img.naturalHeight*multiplier));
     const ctx=canvas.getContext("2d");
     ctx.drawImage(img,0,0,canvas.width,canvas.height);
     resolve(canvas.toDataURL("image/png"));
   };
   img.onerror=reject;
   img.src=src;
 });
}

async function extractText(){
 if(!imageData)return;

 if(typeof Tesseract==="undefined"){
   alert("OCR library could not load. Please check your internet connection and reload the page.");
   return;
 }

 extractBtn.disabled=true;
 copyBtn.disabled=true;
 downloadBtn.disabled=true;
 resultStatus.textContent="Processing...";
 resultText.value="";
 setProgress(1,"Starting OCR...");

 try{
   const lang=language.value;
   const multiplier=Number(scale.value);
   const processed=await scaledImageDataURL(imageData,multiplier);

   const result=await Tesseract.recognize(processed,lang,{
     logger:function(message){
       if(message.status){
         const pct=message.progress ? message.progress*100 : 0;
         let label=message.status.replace(/_/g," ");
         label=label.charAt(0).toUpperCase()+label.slice(1);
         setProgress(pct,label);
       }
     }
   });

   const text=(result.data.text||"").trim();
   resultText.value=text;

   if(text){
     setProgress(100,"Completed");
     resultStatus.textContent="Completed";
     setResultState(true);
   }else{
     setProgress(100,"No text found");
     resultStatus.textContent="No text found";
     setResultState(false);
   }
 }catch(error){
   console.error(error);
   setProgress(0,"OCR failed");
   resultStatus.textContent="Error";
   alert("OCR could not process this image. Try a clearer image or another language.");
 }finally{
   extractBtn.disabled=!imageData;
 }
}

extractBtn.addEventListener("click",extractText);

copyBtn.addEventListener("click",async function(){
 const text=resultText.value.trim();
 if(!text)return;

 try{
   await navigator.clipboard.writeText(text);
   copyBtn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
   setTimeout(()=>copyBtn.innerHTML='<i class="fa-regular fa-copy"></i> Copy Text',1400);
 }catch(error){
   resultText.focus();
   resultText.select();
   document.execCommand("copy");
   copyBtn.innerHTML='<i class="fa-solid fa-check"></i> Copied';
   setTimeout(()=>copyBtn.innerHTML='<i class="fa-regular fa-copy"></i> Copy Text',1400);
 }
});

downloadBtn.addEventListener("click",function(){
 const text=resultText.value;
 if(!text.trim())return;

 const blob=new Blob([text],{type:"text/plain;charset=utf-8"});
 const url=URL.createObjectURL(blob);
 const link=document.createElement("a");
 link.href=url;
 link.download=originalName+"-ocr.txt";
 document.body.appendChild(link);
 link.click();
 link.remove();
 URL.revokeObjectURL(url);
});

clearBtn.addEventListener("click",function(){
 resultText.value="";
 setResultState(false);
 resultStatus.textContent="Waiting";
 setProgress(0,"Ready");
});

resetBtn.addEventListener("click",function(){
 imageInput.value="";
 imageData="";
 originalName="ocr-result";
 imagePreview.removeAttribute("src");
 imagePreview.hidden=true;
 emptyPreview.hidden=false;
 imageInfo.textContent="—";
 extractBtn.disabled=true;
 resultText.value="";
 setResultState(false);
 resultStatus.textContent="Waiting";
 setProgress(0,"Ready");
 language.value="eng";
 scale.value="1.5";
});

});