/* OneToolBox Theme */
"use strict";

const Theme = {
  key: "onetoolbox-theme",

  init() {
    this.load();
    this.bind();
  },

  load() {
    const saved = localStorage.getItem(this.key);
    if (saved === "dark") document.body.classList.add("dark");
    this.updateIcon(document.body.classList.contains("dark"));
  },

  bind() {
    document.addEventListener("click", e => {
      const btn = e.target.closest("#themeToggle");
      if (!btn) return;
      this.toggle();
    });
  },

  toggle() {
    const dark = document.body.classList.toggle("dark");
    localStorage.setItem(this.key, dark ? "dark" : "light");
    this.updateIcon(dark);
  },

  updateIcon(dark) {
    const icon = document.querySelector("#themeToggle i");
    if (icon) icon.className = dark ? "fas fa-sun" : "fas fa-moon";
  }
};
