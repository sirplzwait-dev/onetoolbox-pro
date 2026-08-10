/* JSON Formatter — tool-specific script */
(() => {
 const input=document.getElementById('toolInput'), file=document.getElementById('fileInput'), box=document.getElementById('uploadBox');
 const info=document.getElementById('fileInfo'), result=document.getElementById('resultBox'), resultText=document.getElementById('resultText');
 const run=document.getElementById('runBtn'), reset=document.getElementById('resetBtn'), dl=document.getElementById('downloadBtn');
 let currentFile=null, output='';
 function showFile(f){ currentFile=f; info.hidden=false; info.textContent=`${f.name} • ${(f.size/1024).toFixed(1)} KB • ${f.type||'unknown type'}`; }
 file.addEventListener('change',e=>e.target.files[0]&&showFile(e.target.files[0]));
 box.addEventListener('dragover',e=>{e.preventDefault();box.classList.add('drag')}); box.addEventListener('dragleave',()=>box.classList.remove('drag')); box.addEventListener('drop',e=>{e.preventDefault();box.classList.remove('drag'); if(e.dataTransfer.files[0])showFile(e.dataTransfer.files[0]);});
 run.addEventListener('click',async()=>{
   let text=input.value.trim();
   if(!text && currentFile) text=await currentFile.text().catch(()=>`File selected: ${currentFile.name}`);
   if(!text && !currentFile){result.hidden=false;resultText.textContent='Please choose a file or enter input first.';return;}
   output=text||currentFile.name;
   result.hidden=false; resultText.textContent=output;
 });
 reset.addEventListener('click',()=>{input.value='';file.value='';currentFile=null;info.hidden=true;result.hidden=true;resultText.textContent='';});
 dl.addEventListener('click',()=>{const blob=new Blob([output],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='json-formatter-result.txt';a.click();URL.revokeObjectURL(a.href);});
})();
