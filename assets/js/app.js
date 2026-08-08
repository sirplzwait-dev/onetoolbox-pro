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

            this.loadFooter()

        ]);


        this.bindEvents();

        this.highlightActiveMenu();


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

        const button =
            document.querySelector(
                ".back-to-top"
            );


        if (!button) return;


        const icon =
            button.querySelector("i");


        if (!icon) return;


        const scrollTop =
            window.scrollY ||
            document.documentElement.scrollTop;


        const documentHeight =
            document.documentElement
                .scrollHeight;


        const windowHeight =
            window.innerHeight;


        const maxScroll =
            documentHeight -
            windowHeight;


        /* =========================
           PAGE TOP
        ========================= */

        if (scrollTop <= 50) {

            icon.className =
                "fas fa-arrow-down";


            button.setAttribute(
                "aria-label",
                "Scroll to Bottom"
            );


            button.setAttribute(
                "title",
                "Go to Bottom"
            );

        }


        /* =========================
           PAGE BOTTOM
        ========================= */

        else if (
            scrollTop >= maxScroll - 50
        ) {

            icon.className =
                "fas fa-arrow-up";


            button.setAttribute(
                "aria-label",
                "Scroll to Top"
            );


            button.setAttribute(
                "title",
                "Go to Top"
            );

        }


        /* =========================
           MIDDLE
        ========================= */

        else {

            icon.className =
                "fas fa-arrow-up";


            button.setAttribute(
                "aria-label",
                "Scroll to Top"
            );


            button.setAttribute(
                "title",
                "Go to Top"
            );

        }

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