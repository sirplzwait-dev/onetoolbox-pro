/*==================================================
  OneToolBox Enterprise
  app.js
  Version : 1.1
==================================================*/

"use strict";


const App = {

    /* ==========================================
       INIT
    ========================================== */

    init() {

        this.cache();

        this.loadComponents();

    },


    /* ==========================================
       CACHE
    ========================================== */

    cache() {

        this.headerContainer =
            document.getElementById("header-placeholder");

        this.footerContainer =
            document.getElementById("footer-placeholder");

    },


    /* ==========================================
       LOAD COMPONENTS
    ========================================== */

    async loadComponents() {

        await Promise.all([

            this.loadHeader(),

            this.loadFooter(),

            this.ensureSharedAssets()

        ]);


        this.bindEvents();

        this.highlightActiveMenu();

        this.ensureScrollButton();

        /* Global language: header/footer are now injected, so translate
           the complete page and keep newly added tool UI in sync. */
        if (
            typeof OneToolBoxLanguage !== "undefined" &&
            typeof OneToolBoxLanguage.init === "function"
        ) {
            OneToolBoxLanguage.init();
        }


        /* Theme */

        if (typeof Theme !== "undefined") {

            Theme.init();

        }


        /* Navigation */

        if (
            typeof Navigation !== "undefined" &&
            typeof Navigation.init === "function"
        ) {

            Navigation.init();

        }


        /* Search */

        if (typeof Search !== "undefined") {

            Search.init();

        }


        /* Scroll button */

        this.updateScrollButton();

    },


    /* ==========================================
       SHARED ASSETS — EVERY PAGE
    ========================================== */

    async ensureSharedAssets() {

        const loadScript = (src) => new Promise((resolve) => {
            if ([...document.scripts].some(s => s.src && s.src.includes(src))) {
                resolve();
                return;
            }

            const script = document.createElement("script");
            script.src = src;
            script.onload = resolve;
            script.onerror = () => {
                console.warn("OneToolBox shared script unavailable:", src);
                resolve();
            };
            document.head.appendChild(script);
        });

        const loadCss = (href) => {
            if ([...document.querySelectorAll('link[rel="stylesheet"]')].some(l => l.href && l.href.includes(href))) return;
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = href;
            document.head.appendChild(link);
        };

        loadCss("/assets/css/dark.css");
        loadCss("/assets/css/language.css");

        await loadScript("/assets/js/theme.js");
        await loadScript("/assets/js/language.js?v=20260816-global-lang-1");
        await loadScript("/assets/js/search.js");
    },


    /* ==========================================
       LOAD HEADER
    ========================================== */

    async loadHeader() {

        if (!this.headerContainer) return;

        try {

            const res =
                await fetch("/components/header.html");

            this.headerContainer.innerHTML =
                await res.text();

        }

        catch (e) {

            console.error(
                "Header Error :",
                e
            );

        }

    },


    /* ==========================================
       LOAD FOOTER
    ========================================== */

    async loadFooter() {

        if (!this.footerContainer) return;

        try {

            const res =
                await fetch("/components/footer.html");

            this.footerContainer.innerHTML =
                await res.text();

        }

        catch (e) {

            console.error(
                "Footer Error :",
                e
            );

        }

    },


    /* ==========================================
       GLOBAL SCROLL TOGGLE BUTTON
       Added automatically on every page
    ========================================== */

    ensureScrollButton() {

        let button =
            document.querySelector(".back-to-top");

        if (!button) {

            button = document.createElement("button");

            button.type = "button";
            button.id = "scrollToggle";
            button.className = "back-to-top";

            button.setAttribute(
                "aria-label",
                "Scroll to Bottom"
            );

            button.setAttribute(
                "title",
                "Go to Bottom"
            );

            button.innerHTML =
                '<i class="fas fa-arrow-down"></i>';

            document.body.appendChild(button);

        }

        this.updateScrollButton();

    },


    /* ==========================================
       EVENTS
    ========================================== */

    bindEvents() {


        /* Header shadow */

        window.addEventListener(
            "scroll",
            this.headerShadow
        );


        /* Scroll toggle */

        window.addEventListener(
            "scroll",
            () => {
                this.updateScrollButton();
            },
            { passive:true }
        );


        /* Scroll button click */

        document.addEventListener(
            "click",
            (e) => {

                const button =
                    e.target.closest(
                        ".back-to-top"
                    );


                if (!button) return;


                const scrollTop =
                    window.scrollY ||
                    document.documentElement.scrollTop;


                /* =========================
                   TOP → BOTTOM
                ========================= */

                if (scrollTop <= 50) {

                    window.scrollTo({

                        top:
                            document.documentElement
                                .scrollHeight,

                        behavior:"smooth"

                    });

                }


                /* =========================
                   BOTTOM → TOP
                ========================= */

                else {

                    window.scrollTo({

                        top:0,

                        behavior:"smooth"

                    });

                }

            }
        );

    },


    /* ==========================================
       HEADER SHADOW
    ========================================== */

    headerShadow() {

        const header =
            document.querySelector(
                ".header"
            );


        if (!header) return;


        if (window.scrollY > 20) {

            header.classList.add(
                "scrolled"
            );

        }

        else {

            header.classList.remove(
                "scrolled"
            );

        }

    },


    /* ==========================================
       SCROLL TOGGLE BUTTON
       TOP = ↓
       DOWN = ↑
    ========================================== */

    updateScrollButton() {

        const button = document.querySelector(".back-to-top");
        if (!button) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const shouldShow = scrollTop > 120;

        /* Show only after the page has moved down. */
        button.classList.toggle("show", shouldShow);

        const icon = button.querySelector("i");
        if (icon) icon.className = "fas fa-arrow-up";

        button.setAttribute("aria-label", "Scroll to Top");
        button.setAttribute("title", "Go to Top");
    },


    /* ==========================================
       ACTIVE MENU
    ========================================== */

    highlightActiveMenu() {

        const current =
            window.location.pathname
                .split("/")
                .pop();


        document
            .querySelectorAll(
                ".nav a,.mobile-menu a"
            )
            .forEach(link => {


                const href =
                    link
                        .getAttribute("href")
                        .split("/")
                        .pop();


                if (href === current) {

                    link.classList.add(
                        "active"
                    );

                }

            });

    }

};


/* ==========================================
   DOM READY
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        App.init();

    }
);