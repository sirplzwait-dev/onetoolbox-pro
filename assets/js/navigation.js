/*==================================================
  OneToolBox Enterprise
  navigation.js
==================================================*/

"use strict";

const Navigation = {

    init() {

        this.mobileMenu();

        this.activeMenu();

        this.dropdown();

    },

    /*==========================================
      Mobile Menu
    ==========================================*/

    mobileMenu() {

        document.addEventListener("click", e => {

            const menuBtn = e.target.closest("#mobileMenuBtn");
            const mobileMenu = document.getElementById("mobileMenu");

            if (!mobileMenu) return;

            if (menuBtn) {

                mobileMenu.classList.toggle("active");

                return;

            }

            if (!e.target.closest(".mobile-menu")) {

                mobileMenu.classList.remove("active");

            }

        });

    },

    /*==========================================
      Active Menu
    ==========================================*/

    activeMenu() {

        const current =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();

        document
            .querySelectorAll(".nav a,.mobile-menu a")
            .forEach(link => {

                const page =
                    link
                        .getAttribute("href")
                        .split("/")
                        .pop()
                        .toLowerCase();

                if (page === current) {

                    link.classList.add("active");

                }

            });

    },

    /*==========================================
      Dropdown
    ==========================================*/

    dropdown() {

        document.addEventListener("click", e => {

            const dropdown =
                e.target.closest(".dropdown");

            document
                .querySelectorAll(".dropdown")
                .forEach(item => {

                    if (item !== dropdown) {

                        item.classList.remove("active");

                    }

                });

            if (dropdown) {

                dropdown.classList.toggle("active");

            }

        });

    }

};
document.querySelectorAll(".dropdown > a")
.forEach(btn=>{

btn.addEventListener("click",()=>{

btn.parentElement.classList.toggle("active");

});

});
