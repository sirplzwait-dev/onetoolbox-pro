/* OneToolBox Global Search — single source of truth */
(() => {
  "use strict";

  const clean = (s) => String(s || "").trim().toLowerCase();
  const normalize = (u) => {
    if (!u) return "/";
    u = String(u).replace(/\\/g, "/");
    if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/")) return u;
    return "/" + u.replace(/^\.?\//, "");
  };

  async function loadIndex() {
    try {
      const r = await fetch("/data/search.json?v=2", { cache: "no-store" });
      if (!r.ok) throw new Error("search index " + r.status);
      const data = await r.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error("OneToolBox search index error:", e);
      return [];
    }
  }

  function mount() {
    const input = document.getElementById("globalSearch");
    if (!input) return;

    // Remove duplicate/old result containers.
    document.querySelectorAll("#searchResult, #searchResults, .search-results, .search-result").forEach(el => {
      if (el.id !== "otb-global-search-results") el.remove();
    });

    let box = document.getElementById("otb-global-search-results");
    if (!box) {
      box = document.createElement("div");
      box.id = "otb-global-search-results";
      box.className = "otb-global-search-results";
      input.parentElement.style.position = "relative";
      input.parentElement.appendChild(box);
    }

    loadIndex().then(index => {
      const search = () => {
        const q = clean(input.value);
        if (!q) {
          box.innerHTML = "";
          box.classList.remove("show");
          return;
        }

        const terms = q.split(/\s+/).filter(Boolean);
        const results = index.map(item => {
          const hay = clean([item.name, item.title, item.category, item.keywords].join(" "));
          const score = terms.reduce((n, term) => n + (hay.includes(term) ? 1 : 0), 0);
          return { item, score };
        }).filter(x => x.score === terms.length)
          .sort((a,b) => b.score-a.score)
          .slice(0, 12)
          .map(x => x.item);

        if (!results.length) {
          box.innerHTML = '<div class="otb-search-empty">No tool found</div>';
        } else {
          box.innerHTML = results.map(item => {
            const url = normalize(item.url);
            const name = String(item.name || item.title || "Tool").replace(/[<>&"]/g, "");
            const cat = String(item.category || "").replace(/[<>&"]/g, "");
            return `<a class="otb-search-item" href="${url}" data-tool-url="${url}">
              <strong>${name}</strong><small>${cat}</small>
            </a>`;
          }).join("");
        }
        box.classList.add("show");
      };

      input.addEventListener("input", search);
      input.addEventListener("keydown", e => {
        if (e.key === "Escape") {
          input.value = "";
          search();
          input.blur();
        } else if (e.key === "Enter") {
          const first = box.querySelector(".otb-search-item");
          if (first) {
            e.preventDefault();
            window.location.assign(first.dataset.toolUrl);
          }
        }
      });
    });

    document.addEventListener("click", e => {
      if (!e.target.closest(".header-search")) box.classList.remove("show");
    });
  }

  document.addEventListener("DOMContentLoaded", mount);
})();