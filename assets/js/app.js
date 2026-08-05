/*==================================================
  OneToolBox Enterprise
  app.js
  Version : 1.0
==================================================*/

"use strict";

const App = {

 init() {

    this.cache();

    this.loadComponents();

},

    cache() {

        this.headerContainer =
            document.getElementById("header-placeholder");

        this.footerContainer =
            document.getElementById("footer-placeholder");

    },

    async loadComponents() {

        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
		
		
		this.bindEvents();

        this.highlightActiveMenu();

        if (typeof Theme !== "undefined") {
            Theme.init();
        }

if (
    typeof Navigation !== "undefined" &&
    typeof Navigation.init === "function"
) {

    Navigation.init();

}

        if (typeof Search !== "undefined") {
            Search.init();
        }

    },

    async loadHeader() {

        if (!this.headerContainer) return;

        try {

            const res = await fetch("/components/header.html");

            this.headerContainer.innerHTML =
                await res.text();

        }

        catch (e) {

            console.error("Header Error :", e);

        }

    },

    async loadFooter() {

        if (!this.footerContainer) return;

        try {

            const res = await fetch("/components/footer.html");

            this.footerContainer.innerHTML =
                await res.text();

        }

        catch (e) {

            console.error("Footer Error :", e);

        }

    },

    bindEvents() {

        window.addEventListener(
            "scroll",
            this.headerShadow
        );

        window.addEventListener(
            "scroll",
            this.backToTop
        );

    },

    headerShadow() {

        const header =
            document.querySelector(".header");

        if (!header) return;

        if (window.scrollY > 20) {

            header.classList.add("scrolled");

        }

        else {

            header.classList.remove("scrolled");

        }

    },

    backToTop() {

        const btn =
            document.querySelector(".back-to-top");

        if (!btn) return;

        if (window.scrollY > 400) {

            btn.classList.add("show");

        }

        else {

            btn.classList.remove("show");

        }

    },

    highlightActiveMenu() {

        const current =
            window.location.pathname
                .split("/")
                .pop();

        document.querySelectorAll(".nav a,.mobile-menu a")
            .forEach(link => {

                const href =
                    link.getAttribute("href")
                        .split("/")
                        .pop();

                if (href === current) {

                    link.classList.add("active");

                }

            });

    }

};


/*==========================================
  DOM Ready
==========================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        App.init();

    }

);


/*==========================================
  Back To Top
==========================================*/

document.addEventListener(

    "click",

    e => {

        if (
            e.target.closest(".back-to-top")
        ) {

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        }

    }

);