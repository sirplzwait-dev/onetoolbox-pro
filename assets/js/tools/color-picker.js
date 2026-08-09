"use strict";


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initColorPicker();

    }
);


function initColorPicker() {


    /* =========================================
       ELEMENTS
    ========================================= */

    const colorInput =
        document.getElementById(
            "colorInput"
        );

    const pickerCircle =
        document.getElementById(
            "pickerCircle"
        );

    const pickerHint =
        document.getElementById(
            "pickerHint"
        );

    const hexValue =
        document.getElementById(
            "hexValue"
        );

    const rgbValue =
        document.getElementById(
            "rgbValue"
        );

    const hslValue =
        document.getElementById(
            "hslValue"
        );

    const cssValue =
        document.getElementById(
            "cssValue"
        );

    const largeColor =
        document.getElementById(
            "largeColor"
        );

    const largeHex =
        document.getElementById(
            "largeHex"
        );

    const infoHex =
        document.getElementById(
            "infoHex"
        );

    const redValue =
        document.getElementById(
            "redValue"
        );

    const greenValue =
        document.getElementById(
            "greenValue"
        );

    const blueValue =
        document.getElementById(
            "blueValue"
        );

    const brightnessValue =
        document.getElementById(
            "brightnessValue"
        );

    const shadeGrid =
        document.getElementById(
            "shadeGrid"
        );

    const randomColorBtn =
        document.getElementById(
            "randomColorBtn"
        );

    const resetBtn =
        document.getElementById(
            "resetBtn"
        );

    const copyStatus =
        document.getElementById(
            "copyStatus"
        );



    /* =========================================
       CURRENT COLOR
    ========================================= */

    let currentColor =
        "#2563EB";



    /* =========================================
       HEX VALIDATION
    ========================================= */

    function normalizeHex(value) {

        if (!value) {
            return null;
        }


        value =
            value.trim();


        if (
            !value.startsWith("#")
        ) {

            value =
                "#" + value;
        }


        if (
            /^#[0-9a-fA-F]{6}$/.test(
                value
            )
        ) {

            return value.toUpperCase();
        }


        if (
            /^#[0-9a-fA-F]{3}$/.test(
                value
            )
        ) {

            return (
                "#" +
                value[1] +
                value[1] +
                value[2] +
                value[2] +
                value[3] +
                value[3]
            ).toUpperCase();
        }


        return null;
    }



    /* =========================================
       HEX → RGB
    ========================================= */

    function hexToRgb(hex) {

        const clean =
            hex.replace(
                "#",
                ""
            );


        return {
            r: parseInt(
                clean.substring(0, 2),
                16
            ),

            g: parseInt(
                clean.substring(2, 4),
                16
            ),

            b: parseInt(
                clean.substring(4, 6),
                16
            )
        };
    }



    /* =========================================
       RGB → HSL
    ========================================= */

    function rgbToHsl(
        r,
        g,
        b
    ) {

        r /= 255;
        g /= 255;
        b /= 255;


        const max =
            Math.max(
                r,
                g,
                b
            );


        const min =
            Math.min(
                r,
                g,
                b
            );


        let h = 0;

        let s = 0;

        const l =
            (max + min) / 2;


        const d =
            max - min;


        if (d !== 0) {

            s =
                l > 0.5
                    ? d /
                      (
                          2 -
                          max -
                          min
                      )
                    : d /
                      (
                          max +
                          min
                      );


            switch (max) {

                case r:

                    h =
                        (
                            g -
                            b
                        ) /
                        d +
                        (
                            g < b
                                ? 6
                                : 0
                        );

                    break;


                case g:

                    h =
                        (
                            b -
                            r
                        ) /
                        d +
                        2;

                    break;


                case b:

                    h =
                        (
                            r -
                            g
                        ) /
                        d +
                        4;

                    break;
            }


            h /= 6;
        }


        return {

            h: Math.round(
                h * 360
            ),

            s: Math.round(
                s * 100
            ),

            l: Math.round(
                l * 100
            )

        };
    }



    /* =========================================
       RGB → HEX
    ========================================= */

    function rgbToHex(
        r,
        g,
        b
    ) {

        return (
            "#" +
            [r, g, b]
                .map(
                    value =>
                        Math.max(
                            0,
                            Math.min(
                                255,
                                Math.round(
                                    value
                                )
                            )
                        )
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        )
                )
                .join("")
        ).toUpperCase();
    }



    /* =========================================
       UPDATE COLOR
    ========================================= */

    function updateColor(
        hex
    ) {

        const normalized =
            normalizeHex(
                hex
            );


        if (!normalized) {
            return;
        }


        currentColor =
            normalized;


        const rgb =
            hexToRgb(
                normalized
            );


        const hsl =
            rgbToHsl(
                rgb.r,
                rgb.g,
                rgb.b
            );


        const rgbText =
            `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;


        const hslText =
            `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;


        /* Color input */

        colorInput.value =
            normalized;


        /* Picker */

        pickerCircle.style.background =
            normalized;


        pickerHint.textContent =
            normalized;


        /* Values */

        hexValue.value =
            normalized;


        rgbValue.value =
            rgbText;


        hslValue.value =
            hslText;


        cssValue.value =
            `color: ${normalized};`;


        /* Large */

        largeColor.style.background =
            normalized;


        largeHex.textContent =
            normalized;


        /* Info */

        infoHex.textContent =
            normalized;


        redValue.textContent =
            rgb.r;


        greenValue.textContent =
            rgb.g;


        blueValue.textContent =
            rgb.b;


        const brightness =
            Math.round(
                (
                    rgb.r * 299 +
                    rgb.g * 587 +
                    rgb.b * 114
                ) / 1000
            );


        brightnessValue.textContent =
            brightness;


        /* Shades */

        generateShades(
            rgb
        );
    }



    /* =========================================
       COLOR INPUT
    ========================================= */

    colorInput.addEventListener(
        "input",
        () => {

            updateColor(
                colorInput.value
            );

        }
    );



    /* =========================================
       HEX MANUAL INPUT
    ========================================= */

    hexValue.addEventListener(
        "change",
        () => {

            const normalized =
                normalizeHex(
                    hexValue.value
                );


            if (!normalized) {

                hexValue.value =
                    currentColor;

                return;
            }


            updateColor(
                normalized
            );
        }
    );



    /* =========================================
       RANDOM COLOR
    ========================================= */

    randomColorBtn.addEventListener(
        "click",
        () => {

            const r =
                Math.floor(
                    Math.random() * 256
                );


            const g =
                Math.floor(
                    Math.random() * 256
                );


            const b =
                Math.floor(
                    Math.random() * 256
                );


            updateColor(
                rgbToHex(
                    r,
                    g,
                    b
                )
            );
        }
    );



    /* =========================================
       COPY
    ========================================= */

    document
        .querySelectorAll(
            ".copy-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    async () => {

                        const type =
                            button.dataset.copy;


                        let value =
                            "";


                        if (
                            type === "hex"
                        ) {

                            value =
                                hexValue.value;
                        }


                        if (
                            type === "rgb"
                        ) {

                            value =
                                rgbValue.value;
                        }


                        if (
                            type === "hsl"
                        ) {

                            value =
                                hslValue.value;
                        }


                        if (
                            type === "css"
                        ) {

                            value =
                                cssValue.value;
                        }


                        try {

                            await navigator.clipboard.writeText(
                                value
                            );


                            showCopyStatus();


                        } catch (error) {

                            fallbackCopy(
                                value
                            );
                        }

                    }
                );
            }
        );



    /* =========================================
       COPY FALLBACK
    ========================================= */

    function fallbackCopy(
        value
    ) {

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            value;


        textarea.style.position =
            "fixed";


        textarea.style.left =
            "-9999px";


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );


            showCopyStatus();

        } catch (_) {}


        textarea.remove();
    }



    /* =========================================
       COPY STATUS
    ========================================= */

    function showCopyStatus() {

        copyStatus.style.display =
            "block";


        setTimeout(
            () => {

                copyStatus.style.display =
                    "none";

            },
            1400
        );
    }



    /* =========================================
       SHADES & TINTS
    ========================================= */

    function generateShades(
        rgb
    ) {

        shadeGrid.innerHTML =
            "";


        /*
         * Dark shades
         */

        const percentages = [
            100,
            90,
            80,
            70,
            60,
            50,
            40,
            30,
            20,
            10
        ];


        percentages.forEach(
            percent => {

                const factor =
                    percent / 100;


                const r =
                    Math.round(
                        rgb.r * factor
                    );


                const g =
                    Math.round(
                        rgb.g * factor
                    );


                const b =
                    Math.round(
                        rgb.b * factor
                    );


                const hex =
                    rgbToHex(
                        r,
                        g,
                        b
                    );


                createShade(
                    hex
                );
            }
        );
    }



    function createShade(
        hex
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "shade-item";


        item.style.background =
            hex;


        item.textContent =
            hex;


        item.title =
            "Click to select " +
            hex;


        item.addEventListener(
            "click",
            () => {

                updateColor(
                    hex
                );
            }
        );


        shadeGrid.appendChild(
            item
        );
    }



    /* =========================================
       RESET
    ========================================= */

    resetBtn.addEventListener(
        "click",
        () => {

            updateColor(
                "#2563EB"
            );
        }
    );



    /* =========================================
       INITIAL
    ========================================= */

    updateColor(
        currentColor
    );

}