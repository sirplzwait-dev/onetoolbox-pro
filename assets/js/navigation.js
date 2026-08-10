/* OneToolBox Navigation */
"use strict";

const Navigation = {
  init() {
    this.mobileMenu();
    this.activeMenu();
    this.moreDropdown();
  },

  mobileMenu() {
    document.addEventListener("click", e => {
      const menuBtn = e.target.closest("#mobileMenuBtn");
      const mobileMenu = document.getElementById("mobileMenu");
      if (!mobileMenu) return;
      if (menuBtn) {
        mobileMenu.classList.toggle("active");
        return;
      }
      if (!e.target.closest(".mobile-menu")) mobileMenu.classList.remove("active");
    });
  },

  activeMenu() {
    const path = window.location.pathname.replace(/\\/g, "/").toLowerCase();
    const currentFile = path.split("/").pop() || "index.html";

    const category =
      path.includes("/image-tools") ? "image-tools.html" :
      path.includes("/pdf-tools") ? "pdf-tools.html" :
      path.includes("/video-tools") ? "video-tools.html" :
      path.includes("/audio-tools") ? "audio-tools.html" :
      path.includes("/ai-tools") ? "ai-tools.html" :
      path.includes("/document-tools") ? "document-tools.html" :
      path.includes("/calculator") ? "calculator-tools.html" :
      path.includes("/utility-tools") ? "utility-tools.html" :
      path.includes("/developer-tools") ? "developer-tools.html" :
      path.includes("/converter-tools") ? "converter-tools.html" :
      (currentFile === "index.html" ? "index.html" : "");

    document.querySelectorAll(".nav a,.mobile-menu a").forEach(link => {
      link.classList.remove("active");
      const href = (link.getAttribute("href") || "").replace(/\\/g, "/").toLowerCase();
      const page = href.split("/").pop() || "index.html";
      if (category && page === category) link.classList.add("active");
    });

    const more = document.querySelector(".more-tools");
    const moreBtn = document.querySelector(".more-tools-btn");
    const inMore = [
      "document-tools.html",
      "calculator-tools.html",
      "utility-tools.html",
      "developer-tools.html",
      "converter-tools.html"
    ].includes(category);

    more?.classList.toggle("active", inMore);
    moreBtn?.classList.toggle("active", inMore);
  },

  moreDropdown() {
    const more = document.querySelector(".more-tools");
    const btn = document.querySelector(".more-tools-btn");
    if (!more || !btn) return;

    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const open = more.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", e => {
      if (!e.target.closest(".more-tools")) {
        more.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }
};
