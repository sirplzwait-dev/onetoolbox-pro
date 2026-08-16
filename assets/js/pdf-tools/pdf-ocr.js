(()=>{"use strict";
const $=id=>document.getElementById(id);
pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
const S={pdf:null,page:1,pages:0,ocrText:[],running:false};

function setProgress(p,msg){p=Math.max(0,Math.min(100,p));$("progressBar").style.width=p+"%";$("percent").textContent=Math.round(p)+"%";$("status").textContent=msg}
function formatBytes(n){if(!n)return"0 KB";if(n<1024*1024)return(n/1024).toFixed(1)+" KB";return(n/1024/1024).toFixed(2)+" MB"}

async function renderPage(){
 if(!S.pdf)return;
 const page=await S.pdf.getPage(S.page), scale=1.65, vp=page.getViewport({scale});
 const c=$("pdfCanvas");c.width=vp.width;c.height=vp.height;await page.render({canvasContext:c.getContext("2d"),viewport:vp}).promise;
 c.hidden=false;$("pageLabel").textContent=`Page ${S.page} / ${S.pages}`;
 $("prev").disabled=S.page<=1;$("next").disabled=S.page>=S.pages;
}

async function loadPDF(file){
 if(!file||file.type!=="application/pdf")return;
 setProgress(5,"Loading PDF…");
 const data=await file.arrayBuffer();
 S.pdf=await pdfjsLib.getDocument({data}).promise;S.page=1;S.pages=S.pdf.numPages;S.ocrText=[];
 $("fileTitle").textContent=file.name;$("fileSize").textContent=formatBytes(file.size);$("pageCount").textContent=S.pages;
 $("ocr").disabled=false;$("result").value="";
 await renderPage();setProgress(0,"Ready");
}

$("choose").onclick=()=>$("file").click();
$("file").onchange=e=>loadPDF(e.target.files[0]);
$("prev").onclick=async()=>{if(S.page>1){S.page--;await renderPage()}};
$("next").onclick=async()=>{if(S.page<S.pages){S.page++;await renderPage()}};

["dragover","dragenter"].forEach(ev=>$("drop").addEventListener(ev,e=>{e.preventDefault();$("drop").classList.add("over")}));
["dragleave","drop"].forEach(ev=>$("drop").addEventListener(ev,e=>{e.preventDefault();$("drop").classList.remove("over")}));
$("drop").addEventListener("drop",e=>loadPDF(e.dataTransfer.files[0]));

$("ocr").onclick=async()=>{
 if(!S.pdf||S.running)return;
 S.running=true;$("ocr").disabled=true;$("result").value="";
 try{
   const selectedLang=$("lang").value;
   const lang=selectedLang==="eng+hin"?["eng","hin"]:selectedLang;
   let worker;
   if(window.Tesseract){
     worker=await Tesseract.createWorker(lang, 1, {logger:m=>{
       if(m.status==="recognizing text"){
         const base=(S.page-1)/S.pages*100;
         setProgress(base+(m.progress*100/S.pages),"Recognizing text…");
       }else if(m.status==="loading language model") setProgress(8,"Loading OCR language…");
     }});
   }else throw new Error("OCR library could not be loaded. Check internet/CDN connection.");
   for(let n=1;n<=S.pages;n++){
     S.page=n;await renderPage();
     const canvas=$("pdfCanvas");
     const result=await worker.recognize(canvas);
     S.ocrText[n-1]=result.data.text.trim();
     $("result").value=S.ocrText.map((t,i)=>`--- Page ${i+1} ---\n${t}`).join("\n\n");
     setProgress((n/S.pages)*100,`OCR completed: page ${n} of ${S.pages}`);
   }
   await worker.terminate();
   $("downloadTxt").disabled=false;$("copy").disabled=false;
   setProgress(100,"OCR completed");
 }catch(e){console.error(e);setProgress(0,"OCR failed");alert("OCR failed: "+e.message)}
 finally{S.running=false;$("ocr").disabled=!S.pdf}
};

$("copy").onclick=async()=>{const text=$("result").value;try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const ta=document.createElement("textarea");ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove()}$("status").textContent="Text copied"}catch(e){$("status").textContent="Copy failed. Please select the text manually."}};
$("downloadTxt").onclick=()=>{
 const blob=new Blob([$("result").value],{type:"text/plain;charset=utf-8"}),u=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=u;a.download="ocr-text.txt";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)
};
$("reset").onclick=()=>{S.pdf=null;S.page=1;S.pages=0;S.ocrText=[];$("file").value="";$("fileTitle").textContent="Choose PDF file";$("fileSize").textContent="0 KB";$("pageCount").textContent="0";$("pageLabel").textContent="Page 0 / 0";$("result").value="";$("ocr").disabled=true;$("downloadTxt").disabled=true;$("copy").disabled=true;$("pdfCanvas").hidden=true;setProgress(0,"Ready")};
$
})();