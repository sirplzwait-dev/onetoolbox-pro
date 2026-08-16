
/* ============================================================
   OneToolBox Common Layout JS
   Only adds a universal Back-to-Top button.
   ============================================================ */
(function () {
  "use strict";

  function initCommonLayout() {
    if (!document.body || document.getElementById("otbCommonTop")) return;

    var button = document.createElement("button");
    button.id = "otbCommonTop";
    button.type = "button";
    button.setAttribute("aria-label", "Back to top");
    button.setAttribute("title", "Back to top");
    button.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
    document.body.appendChild(button);

    function update() {
      button.classList.toggle("show", window.scrollY > 320);
    }

    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonLayout);
  } else {
    initCommonLayout();
  }
})();
