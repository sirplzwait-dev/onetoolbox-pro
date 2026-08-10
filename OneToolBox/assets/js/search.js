/* Global OneToolBox Search — actual-file index */
(function(){
"use strict";
let TOOL_INDEX=[];
const normalize=s=>String(s||"").replace(/\\/g,"/").replace(/^\.?\//,"/");
const init=async()=>{
 const input=document.getElementById("globalSearch");
 if(!input) return;
 let box=document.getElementById("globalSearchResults");
 if(!box){
   box=document.createElement("div");
   box.id="globalSearchResults";
   box.className="global-search-results";
   input.parentElement?.appendChild(box);
 }
 try{
   const r=await fetch("/data/search.json",{cache:"force-cache"});
   TOOL_INDEX= r.ok ? await r.json() : [];
 }catch(e){ TOOL_INDEX=[]; }

 const search=q=>{
   q=q.trim().toLowerCase();
   if(!q){box.innerHTML="";box.classList.remove("show");return;}
   const result=TOOL_INDEX.filter(x=>{
     const hay=[x.name,x.category,x.keywords].join(" ").toLowerCase();
     return hay.includes(q);
   }).slice(0,12);
   box.innerHTML=result.length?result.map(x=>`<a class="global-search-item" href="${normalize(x.url)}"><strong>${x.name}</strong><small>${x.category}</small></a>`).join(""):`<div class="global-search-empty">No tool found</div>`;
   box.classList.add("show");
 };
 input.addEventListener("input",()=>search(input.value));
 input.addEventListener("keydown",e=>{
   if(e.key==="Enter"){
     const first=box.querySelector("a");
     if(first){e.preventDefault();location.href=first.getAttribute("href");}
   }
   if(e.key==="Escape"){input.value="";box.classList.remove("show");}
 });
 document.addEventListener("click",e=>{
   if(!e.target.closest(".header-search")) box.classList.remove("show");
 });
};
document.addEventListener("DOMContentLoaded",init);
})();