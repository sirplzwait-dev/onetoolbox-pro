/* OneToolBox Global Search — shared on every page */
"use strict";
const Search = {
  data: [],
  ready: false,
  async init() {
    const inputs = [document.getElementById("globalSearch"), document.getElementById("mobileGlobalSearch")].filter(Boolean);
    if (!inputs.length) return;
    const box = document.getElementById("searchResult") || this.createBox(inputs[0]);
    try {
      const res = await fetch("/data/search.json", {cache:"no-store"});
      this.data = res.ok ? await res.json() : [];
    } catch(e) { console.warn("Search data could not be loaded", e); this.data=[]; }
    this.ready = true;
    inputs.forEach(input => {
      input.addEventListener("input", () => this.search(input.value, box));
      input.addEventListener("focus", () => { if(input.value.trim()) this.search(input.value, box); });
      input.addEventListener("keydown", e => {
        if(e.key === "Enter") {
          const first = box.querySelector("a.search-item, a.global-search-item");
          if(first){ e.preventDefault(); location.href = first.getAttribute("href"); }
        }
        if(e.key === "Escape") { input.value=""; this.hide(box); }
      });
    });
    document.addEventListener("click", e => {
      if(!e.target.closest(".header-search") && !e.target.closest(".mobile-search-wrap")) this.hide(box);
    });
  },
  createBox(input){
    const box=document.createElement("div");
    box.id="searchResult"; box.className="search-result"; box.hidden=true;
    input.parentElement.appendChild(box); return box;
  },
  search(value, box){
    const q=String(value||"").trim().toLowerCase();
    if(!q){this.hide(box);return;}
    const result=this.data.filter(x=>{
      const hay=[x.title,x.name,x.category,x.keywords,x.description].filter(Boolean).join(" ").toLowerCase();
      return q.split(/\s+/).every(word=>hay.includes(word));
    }).slice(0,15);
    box.innerHTML=result.length ? result.map(x=>{
      const name=x.title||x.name||"Tool";
      const url=String(x.url||"");
      return `<a class="search-item" href="${url}"><strong>${this.escape(name)}</strong><small>${this.escape(x.category||"")}</small></a>`;
    }).join("") : `<div class="search-empty">No tool found</div>`;
    box.hidden=false; box.classList.add("show");
  },
  hide(box){ if(!box)return; box.hidden=true; box.classList.remove("show"); },
  escape(s){return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));}
};
