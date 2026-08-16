/* OneToolBox Global Search — instant first-character search */
(() => {
  "use strict";
  const normalize=v=>String(v||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9\u0900-\u097f]+/gi," ").replace(/\s+/g," ").trim();
  const esc=v=>String(v||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const url=v=>/^https?:\/\//i.test(v||"")?v:"/"+String(v||"").replace(/^\/+/,"");
  let index=[], input=null, box=null, loading=null;

  async function loadIndex(){
    if(loading) return loading;
    loading=fetch("/data/search.json?v=20260816-search2",{cache:"no-store"})
      .then(r=>{if(!r.ok)throw Error("search index "+r.status);return r.json()})
      .then(d=>Array.isArray(d)?d:[]).catch(e=>{console.error("OneToolBox search",e);return []});
    index=await loading; return index;
  }

  function score(item,q){
    q=normalize(q); if(!q)return 0;
    const n=normalize(item.name), t=normalize(item.title), c=normalize(item.category), k=normalize(item.keywords);
    const all=n+" "+t+" "+c+" "+k; let s=0;
    if(n===q)s+=5000; if(t===q)s+=4500;
    if(n.startsWith(q))s+=2800; if(t.startsWith(q))s+=2400;
    if(n.includes(q))s+=1400; if(t.includes(q))s+=1200;
    if(c.includes(q))s+=600; if(k.includes(q))s+=350;
    const tokens=q.split(" ").filter(Boolean);
    let matched=0;
    for(const x of tokens){
      if(n.startsWith(x)){s+=800;matched++}
      else if(n.includes(x)){s+=450;matched++}
      else if(t.includes(x)){s+=300;matched++}
      else if(c.includes(x)){s+=180;matched++}
      else if(k.includes(x)){s+=100;matched++}
    }
    if(!matched)return 0;
    if(q.length===1)s+=1200;
    return s+matched*20;
  }

  function makeBox(){
    if(!input)return;
    box=document.getElementById("otb-global-search-results");
    if(!box){
      box=document.createElement("div");
      box.id="otb-global-search-results";
      box.className="otb-global-search-results";
      const parent=input.closest(".header-search")||input.parentElement;
      if(parent){parent.style.position="relative";parent.appendChild(box)}
    }
  }

  function render(value){
    makeBox(); if(!box)return;
    const q=String(value||"").trim();
    if(!q){box.innerHTML="";box.classList.remove("show");return}
    const results=index.map(item=>({item,s:score(item,q)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,15).map(x=>x.item);
    if(!results.length){
      box.innerHTML=`<div class="otb-search-empty">No tool found for “${esc(q)}”</div>`;
      box.classList.add("show"); return;
    }
    box.innerHTML=results.map((item,i)=>{
      const u=url(item.url), name=esc(item.name||item.title||"Tool"), cat=esc(item.category||"OneToolBox");
      return `<a class="otb-search-item" href="${u}" data-tool-url="${u}" data-search-index="${i}">
        <span class="otb-search-icon"><i class="fa-solid fa-toolbox"></i></span>
        <span class="otb-search-text"><strong>${name}</strong><small>${cat}</small></span>
        <i class="fa-solid fa-arrow-right otb-search-arrow"></i></a>`;
    }).join("");
    box.classList.add("show");
  }

  function bind(){
    input=document.getElementById("globalSearch"); if(!input)return;
    makeBox();
    if(input.dataset.globalSearchBound==="1")return;
    input.dataset.globalSearchBound="1";
    input.addEventListener("input",()=>render(input.value));
    input.addEventListener("focus",async()=>{await loadIndex(); if(input.value.trim())render(input.value)});
    input.addEventListener("keydown",e=>{
      const items=box?[...box.querySelectorAll(".otb-search-item")]:[];
      if(e.key==="Escape"){input.value="";render("");input.blur()}
      else if(e.key==="ArrowDown"&&items.length){e.preventDefault();items[0].focus()}
      else if(e.key==="Enter"&&items[0]){e.preventDefault();location.href=items[0].dataset.toolUrl}
    });
    document.addEventListener("click",e=>{if(!e.target.closest(".header-search"))box?.classList.remove("show")});
    loadIndex();
  }

  function init(){bind();setTimeout(bind,100);setTimeout(bind,500)}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
  document.addEventListener("onetoolbox:header-ready",bind);
})();