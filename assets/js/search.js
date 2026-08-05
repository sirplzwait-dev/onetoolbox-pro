/*==================================================
  OneToolBox Enterprise
  search.js
==================================================*/

"use strict";

const Search = {

    data: [],

    async init() {

        await this.loadData();

        this.bind();

    },

    async loadData() {

        try {

            const response = await fetch("/data/search.json");

            this.data = await response.json();

        }

        catch (error) {

            console.error("Search Data Error :", error);

        }

    },

    bind() {

        document.addEventListener("input", e => {

            if (e.target.id !== "globalSearch") return;

            this.search(e.target.value);

        });

    },

    search(keyword) {

        keyword = keyword.trim().toLowerCase();

        if (!keyword) {

            this.hide();

            return;

        }

        const result = this.data.filter(item => {

            return (

                item.title.toLowerCase().includes(keyword) ||

                item.category.toLowerCase().includes(keyword) ||

                item.keywords.toLowerCase().includes(keyword)

            );

        });

        this.render(result);

    },

    render(result) {

        let box = document.getElementById("searchResult");

        if (!box) {

            box = document.createElement("div");

            box.id = "searchResult";

            box.className = "search-result";

            document
                .querySelector(".header-search")
                ?.appendChild(box);

        }

        if (result.length === 0) {

            box.innerHTML =

            `<div class="search-empty">
                No Tool Found
            </div>`;

            return;

        }

        box.innerHTML = result.map(item =>

        `
        <a href="${item.url}" class="search-item">

            <div>

                <strong>${item.title}</strong>

                <small>${item.category}</small>

            </div>

        </a>
        `

        ).join("");

    },

    hide() {

        const box = document.getElementById("searchResult");

        if (box) {

            box.remove();

        }

    }

};