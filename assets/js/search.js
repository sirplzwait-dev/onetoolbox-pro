/* OneToolBox Global Search */
"use strict";

const Search = {
  data: [],
  loaded: false,
  cacheKey: "otb-search-data-v1",
  cacheTtl: 86400000,

  async init() {
    await this.loadData();
    this.bind();
  },

  async loadData() {
    try {
      const cached = JSON.parse(localStorage.getItem(this.cacheKey) || "null");
      if (cached && Array.isArray(cached.data) && Date.now() - cached.time < this.cacheTtl) {
        this.data = cached.data;
        this.loaded = true;
        return;
      }
    } catch (_) {}
    try {
      const response = await fetch("/data/search.json", { cache: "force-cache" });
      if (!response.ok) throw new Error(`Search data HTTP ${response.status}`);
      const data = await response.json();
      this.data = Array.isArray(data) ? data : [];
      this.loaded = true;
      try { localStorage.setItem(this.cacheKey, JSON.stringify({time:Date.now(),data:this.data})); } catch (_) {}
    } catch (error) {
      console.warn("Search data unavailable:", error);
      this.data = [];
    }
  },

  inputs() {
    return [...document.querySelectorAll("#globalSearch, #mobileGlobalSearch")];
  },

  bind() {
    this.inputs().forEach(input => {
      input.addEventListener("input", () => this.search(input.value, input));
      input.addEventListener("focus", () => {
        if (input.value.trim()) this.search(input.value, input);
      });
      input.addEventListener("keydown", e => {
        if (e.key === "Escape") {
          input.value = "";
          this.hide();
          input.blur();
        }
        if (e.key === "Enter") {
          const first = document.querySelector(".search-result:not([hidden]) .search-item");
          if (first) window.location.href = first.href;
        }
      });
    });

    document.addEventListener("click", e => {
      if (!e.target.closest(".header-search, .mobile-search-wrap, .search-result")) this.hide();
    });
  },

  normalize(value) {
    return String(value || "").toLowerCase().trim();
  },

  search(keyword) {
    const q = this.normalize(keyword);
    if (!q) return this.hide();

    const terms = q.split(/\s+/).filter(Boolean);
    const result = this.data.filter(item => {
      const haystack = this.normalize([
        item.title,
        item.name,
        item.category,
        item.keywords,
        item.description
      ].join(" "));
      return terms.every(term => haystack.includes(term));
    }).slice(0, 12);

    this.render(result, q);
  },

  render(result, query) {
    const boxes = document.querySelectorAll(".search-result");
    boxes.forEach(box => {
      box.hidden = false;
      if (!result.length) {
        box.innerHTML = `<div class="search-empty">No tool found for “${this.escape(query)}”</div>`;
        return;
      }
      box.innerHTML = `<div class="search-heading">Tools</div>` + result.map(item => {
        const title = item.title || item.name || "Untitled Tool";
        return `<a href="${item.url}" class="search-item"><strong>${this.escape(title)}</strong><small>${this.escape(item.category || "Tool")}</small></a>`;
      }).join("");
    });
  },

  hide() {
    document.querySelectorAll(".search-result").forEach(box => {
      box.hidden = true;
      box.innerHTML = "";
    });
  },

  escape(value) {
    return String(value).replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  }
};
