
"use strict";
(() => {
  const categoryForPath = () => {
    const p = location.pathname.toLowerCase();
    if (p === "/" || p.endsWith("/index.html")) return "home";
    if (p.includes("/image-tools") || p.includes("/pages/image")) return "image";
    if (p.includes("/pdf-tools") || p.includes("/pages/pdf")) return "pdf";
    if (p.includes("/video-tools") || p.includes("/pages/video")) return "video";
    if (p.includes("/audio-tools") || p.includes("/pages/audio")) return "audio";
    if (p.includes("/ai-tools") || p.includes("/pages/ai")) return "ai";
    if (p.includes("/document-tools") || p.includes("/pages/document")) return "document";
    if (p.includes("/calculator-tools") || p.includes("/pages/calculator")) return "calculator";
    if (p.includes("/utility-tools") || p.includes("/pages/utility")) return "utility";
    if (p.includes("/developer-tools") || p.includes("/pages/developer")) return "developer";
    if (p.includes("/converter-tools") || p.includes("/pages/converter")) return "converter";
    return "";
  };

  const setActive = () => {
    const current = categoryForPath();
    document.querySelectorAll("[data-category]").forEach(a => {
      a.classList.toggle("active", a.dataset.category === current);
    });
    const more = document.querySelector(".otb-more");
    const moreBtn = document.querySelector(".otb-more-btn");
    const nested = ["document","calculator","utility","developer","converter"].includes(current);
    more?.classList.toggle("active", nested);
    moreBtn?.classList.toggle("active", nested);
  };

  const initMore = () => {
    const box = document.querySelector(".otb-more");
    const btn = document.querySelector(".otb-more-btn");
    if (!box || !btn) return;
    btn.addEventListener("click", e => {
      e.preventDefault();
      const open = box.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", e => {
      if (!box.contains(e.target)) {
        box.classList.remove("open");
        btn.setAttribute("aria-expanded","false");
      }
    });
  };

  const initMobile = () => {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("show");
      btn.setAttribute("aria-expanded", String(open));
    });
  };

  const initTheme = () => {
    const saved = localStorage.getItem("otb-theme");
    if (saved === "dark") document.body.classList.add("dark");
    const btn = document.getElementById("themeToggle");
    const icon = btn?.querySelector("i");
    const update = () => {
      const dark = document.body.classList.contains("dark");
      if (icon) icon.className = dark ? "fas fa-sun" : "fas fa-moon";
    };
    update();
    btn?.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("otb-theme",
        document.body.classList.contains("dark") ? "dark" : "light");
      update();
    });
  };

  const initSearch = async () => {
    const input = document.getElementById("globalSearch");
    const box = document.getElementById("otbSearchResults");
    if (!input || !box) return;

    let tools = [];
    try {
      const r = await fetch("/data/search.json", {cache:"no-store"});
      if (r.ok) tools = await r.json();
    } catch(e) {
      console.warn("OneToolBox search data unavailable.");
    }

    const render = query => {
      const q = query.trim().toLowerCase();
      if (!q) { box.innerHTML=""; box.classList.remove("show"); return; }

      const result = (Array.isArray(tools) ? tools : []).filter(t => {
        const text = [
          t.name, t.title, t.category,
          Array.isArray(t.keywords) ? t.keywords.join(" ") : t.keywords
        ].filter(Boolean).join(" ").toLowerCase();
        return text.includes(q);
      }).slice(0,8);

      if (!result.length) {
        box.innerHTML = '<div class="otb-search-empty">No tool found</div>';
      } else {
        box.innerHTML = result.map(t => {
          const name = t.name || t.title || "Tool";
          const cat = t.category || "";
          const url = String(t.url || "#");
          return `<a class="otb-search-item" href="${url}">
            <strong>${name}</strong><small>${cat}</small>
          </a>`;
        }).join("");
      }
      box.classList.add("show");
    };

    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        input.value="";
        render("");
        input.blur();
      }
      if (e.key === "Enter") {
        const first = box.querySelector("a");
        if (first) location.href = first.href;
      }
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".otb-header-search")) {
        box.classList.remove("show");
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    setActive();
    initMore();
    initMobile();
    initTheme();
    initSearch();
  });
})();
