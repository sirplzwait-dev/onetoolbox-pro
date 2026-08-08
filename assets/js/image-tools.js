/* =========================================================
   OneToolBox - IMAGE TOOLS JS
   Search + Full Card Click
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const cards =
        document.querySelectorAll(
            ".image-tool-card"
        );

    const searchInput =
        document.getElementById(
            "toolSearch"
        );


    /* ==========================================
       CARD CLICK
    ========================================== */

    cards.forEach(function (card) {

        const link =
            card.querySelector(
                "a[href]"
            );


        if (!link) return;


        /* Make card keyboard accessible */

        card.setAttribute(
            "tabindex",
            "0"
        );


        card.setAttribute(
            "role",
            "link"
        );


        /* Mouse / Touch */

        card.addEventListener(
            "click",
            function (event) {


                /*
                 * If user clicked the
                 * actual Open Tool link,
                 * browser handles it.
                 */

                if (
                    event.target.closest("a")
                ) {

                    return;

                }


                /*
                 * Otherwise clicking
                 * anywhere on card
                 * opens the link.
                 */

                window.location.href =
                    link.getAttribute("href");

            }
        );


        /* Keyboard */

        card.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    window.location.href =
                        link.getAttribute("href");

                }

            }
        );

    });



    /* ==========================================
       SEARCH
    ========================================== */

    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .trim()
                    .toLowerCase();


            let visibleCount = 0;


            cards.forEach(
                function (card) {

                    const title =
                        card.querySelector(
                            "h3"
                        )?.textContent || "";


                    const description =
                        card.querySelector(
                            "p"
                        )?.textContent || "";


                    const link =
                        card.querySelector(
                            "a[href]"
                        );


                    const href =
                        link
                            ? link.getAttribute(
                                "href"
                              )
                            : "";


                    const searchableText =
                        (
                            title +
                            " " +
                            description +
                            " " +
                            href
                        ).toLowerCase();


                    const matched =
                        !query ||
                        searchableText.includes(
                            query
                        );


                    if (matched) {

                        card.classList.remove(
                            "is-hidden"
                        );

                        visibleCount++;

                    }

                    else {

                        card.classList.add(
                            "is-hidden"
                        );

                    }

                }
            );


            /* ==================================
               NO RESULTS
            ================================== */

            let noResults =
                document.getElementById(
                    "imageToolsNoResults"
                );


            if (!noResults) {

                noResults =
                    document.createElement(
                        "div"
                    );


                noResults.id =
                    "imageToolsNoResults";


                noResults.className =
                    "image-tools-no-results";


                noResults.innerHTML = `

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <h3>
                        No image tool found
                    </h3>

                    <p>
                        Try another search term.
                    </p>

                `;


                const grid =
                    document.querySelector(
                        ".image-tools-grid"
                    );


                if (grid) {

                    grid.insertAdjacentElement(
                        "afterend",
                        noResults
                    );

                }

            }


            if (visibleCount === 0) {

                noResults.classList.add(
                    "show"
                );

            }

            else {

                noResults.classList.remove(
                    "show"
                );

            }

        }
    );

});