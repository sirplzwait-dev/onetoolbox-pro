"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
    ========================================= */

    const imageInput =
        document.getElementById("imageInput");

    const uploadArea =
        document.getElementById("uploadArea");

    const uploadIcon =
        document.getElementById("uploadIcon");

    const uploadText =
        document.getElementById("uploadText");

    const uploadInfo =
        document.getElementById("uploadInfo");

    const originalPreview =
        document.getElementById("originalPreview");

    const resetBtn =
        document.getElementById("resetBtn");


    const originalSize =
        document.getElementById("originalSize");

    const originalDimension =
        document.getElementById("originalDimension");

    const originalFormat =
        document.getElementById("originalFormat");


    const enhancementRange =
        document.getElementById("enhancementRange");

    const brightnessRange =
        document.getElementById("brightnessRange");

    const contrastRange =
        document.getElementById("contrastRange");

    const saturationRange =
        document.getElementById("saturationRange");

    const sharpnessRange =
        document.getElementById("sharpnessRange");


    const enhancementValue =
        document.getElementById("enhancementValue");

    const brightnessValue =
        document.getElementById("brightnessValue");

    const contrastValue =
        document.getElementById("contrastValue");

    const saturationValue =
        document.getElementById("saturationValue");

    const sharpnessValue =
        document.getElementById("sharpnessValue");


    const presetButtons =
        document.querySelectorAll(".preset-btn");


    const enhanceBtn =
        document.getElementById("enhanceBtn");

    const resetSettings =
        document.getElementById("resetSettings");


    const resultImage =
        document.getElementById("resultImage");

    const resultText =
        document.getElementById("resultText");


    const newSize =
        document.getElementById("newSize");

    const newDimension =
        document.getElementById("newDimension");

    const newFormat =
        document.getElementById("newFormat");

    const newEnhancement =
        document.getElementById("newEnhancement");


    const downloadBtn =
        document.getElementById("downloadBtn");


    /* =========================================
       VARIABLES
    ========================================= */

    let originalImage = null;

    let originalFile = null;

    let originalURL = null;

    let resultURL = null;


    /* =========================================
       PRESETS
    ========================================= */

    const presets = {

        natural: {
            enhancement: 25,
            brightness: 5,
            contrast: 5,
            saturation: 5,
            sharpness: 10
        },

        enhanced: {
            enhancement: 50,
            brightness: 8,
            contrast: 12,
            saturation: 10,
            sharpness: 25
        },

        vivid: {
            enhancement: 65,
            brightness: 5,
            contrast: 18,
            saturation: 28,
            sharpness: 30
        },

        sharp: {
            enhancement: 60,
            brightness: 3,
            contrast: 15,
            saturation: 5,
            sharpness: 60
        }

    };


    /* =========================================
       FILE SIZE
    ========================================= */

    function formatSize(bytes) {

        if (!bytes || bytes <= 0) {
            return "0 KB";
        }

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (
                bytes / 1024
            ).toFixed(2) + " KB";
        }

        return (
            bytes / (1024 * 1024)
        ).toFixed(2) + " MB";
    }


    /* =========================================
       FILE FORMAT
    ========================================= */

    function getFormat(file) {

        if (!file) {
            return "-";
        }

        const name =
            file.name.toLowerCase();

        if (name.endsWith(".png")) {
            return "PNG";
        }

        if (name.endsWith(".webp")) {
            return "WebP";
        }

        if (
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg")
        ) {
            return "JPG";
        }

        return "Image";
    }


    /* =========================================
       UPDATE VALUES
    ========================================= */

    function updateValues() {

        enhancementValue.textContent =
            enhancementRange.value + "%";

        brightnessValue.textContent =
            brightnessRange.value;

        contrastValue.textContent =
            contrastRange.value;

        saturationValue.textContent =
            saturationRange.value;

        sharpnessValue.textContent =
            sharpnessRange.value;

        newEnhancement.textContent =
            enhancementRange.value + "%";
    }


    /* =========================================
       RESET RESULT
    ========================================= */

    function clearResult() {

        if (resultURL) {

            URL.revokeObjectURL(
                resultURL
            );

            resultURL = null;
        }


        resultImage.src = "";

        resultImage.style.display =
            "none";


        resultText.style.display =
            "block";


        newSize.textContent =
            "0 KB";

        newDimension.textContent =
            "0 × 0 px";

        newFormat.textContent =
            "JPG";

        newEnhancement.textContent =
            enhancementRange.value + "%";


        downloadBtn.href =
            "#";

        downloadBtn.removeAttribute(
            "download"
        );

        downloadBtn.classList.add(
            "disabled"
        );
    }


    /* =========================================
       LOAD IMAGE
    ========================================= */

    function loadImage(file) {

        if (!file) {
            return;
        }


        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        const name =
            file.name.toLowerCase();


        const validExtension =
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp");


        if (
            !allowedTypes.includes(
                file.type
            ) &&
            !validExtension
        ) {

            alert(
                "Please choose JPG, JPEG, PNG or WebP image."
            );

            imageInput.value = "";

            return;
        }


        originalFile =
            file;


        if (originalURL) {

            URL.revokeObjectURL(
                originalURL
            );
        }


        originalURL =
            URL.createObjectURL(
                file
            );


        const img =
            new Image();


        img.onload =
            function () {

                originalImage =
                    img;


                originalPreview.src =
                    originalURL;


                originalPreview.style.display =
                    "block";


                uploadIcon.style.display =
                    "none";


                uploadText.style.display =
                    "none";


                uploadInfo.style.display =
                    "none";


                originalSize.textContent =
                    formatSize(
                        file.size
                    );


                originalDimension.textContent =
                    img.naturalWidth +
                    " × " +
                    img.naturalHeight +
                    " px";


                originalFormat.textContent =
                    getFormat(file);


                clearResult();

            };


        img.onerror =
            function () {

                alert(
                    "Unable to load this image."
                );

            };


        img.src =
            originalURL;
    }


    /* =========================================
       FILE INPUT
    ========================================= */

    imageInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];

            if (file) {
                loadImage(file);
            }

        }
    );


    /* =========================================
       DRAG & DROP
    ========================================= */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    uploadArea.addEventListener(
        "drop",
        function (event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {
                loadImage(file);
            }

        }
    );


    /* =========================================
       PASTE IMAGE
    ========================================= */

    document.addEventListener(
        "paste",
        function (event) {

            if (!event.clipboardData) {
                return;
            }


            const items =
                event.clipboardData.items;


            for (
                let i = 0;
                i < items.length;
                i++
            ) {

                const item =
                    items[i];


                if (
                    item.type ===
                        "image/jpeg" ||
                    item.type ===
                        "image/png" ||
                    item.type ===
                        "image/webp"
                ) {

                    const file =
                        item.getAsFile();


                    if (file) {
                        loadImage(file);
                    }


                    break;
                }

            }

        }
    );


    /* =========================================
       RANGE EVENTS
    ========================================= */

    [
        enhancementRange,
        brightnessRange,
        contrastRange,
        saturationRange,
        sharpnessRange
    ].forEach(
        function (range) {

            range.addEventListener(
                "input",
                function () {

                    updateValues();

                    /*
                     * Live preview
                     * after image is loaded.
                     */

                    if (originalImage) {
                        createLivePreview();
                    }

                }
            );

        }
    );


    /* =========================================
       APPLY PRESET
    ========================================= */

    function applyPreset(name) {

        const preset =
            presets[name];


        if (!preset) {
            return;
        }


        enhancementRange.value =
            preset.enhancement;

        brightnessRange.value =
            preset.brightness;

        contrastRange.value =
            preset.contrast;

        saturationRange.value =
            preset.saturation;

        sharpnessRange.value =
            preset.sharpness;


        updateValues();


        presetButtons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",

                    button.dataset.preset ===
                    name
                );

            }
        );


        if (originalImage) {
            createLivePreview();
        }

    }


    /* =========================================
       PRESET BUTTONS
    ========================================= */

    presetButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    applyPreset(
                        button.dataset.preset
                    );

                }
            );

        }
    );


    /* =========================================
       CLAMP
    ========================================= */

    function clamp(
        value,
        min,
        max
    ) {

        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );

    }


    /* =========================================
       IMAGE ENHANCEMENT
    ========================================= */

    function processImage(
        sourceImage,
        canvas
    ) {

        const ctx =
            canvas.getContext(
                "2d",
                {
                    willReadFrequently: true
                }
            );


        const width =
            sourceImage.naturalWidth ||
            sourceImage.width;


        const height =
            sourceImage.naturalHeight ||
            sourceImage.height;


        canvas.width =
            width;


        canvas.height =
            height;


        ctx.drawImage(
            sourceImage,
            0,
            0,
            width,
            height
        );


        const imageData =
            ctx.getImageData(
                0,
                0,
                width,
                height
            );


        const data =
            imageData.data;


        const enhancement =
            Number(
                enhancementRange.value
            ) / 100;


        const brightness =
            Number(
                brightnessRange.value
            );


        const contrast =
            Number(
                contrastRange.value
            );


        const saturation =
            Number(
                saturationRange.value
            );


        const sharpness =
            Number(
                sharpnessRange.value
            );


        /*
         * Contrast factor
         */

        const contrastFactor =
            (259 *
                (contrast + 255)) /
            (255 *
                (259 - contrast));


        /*
         * Enhancement multiplier
         */

        const enhanceFactor =
            1 +
            (enhancement * 0.15);


        /*
         * Process RGB
         */

        for (
            let i = 0;
            i < data.length;
            i += 4
        ) {

            let r =
                data[i];

            let g =
                data[i + 1];

            let b =
                data[i + 2];


            /*
             * Brightness
             */

            r += brightness * 1.8;
            g += brightness * 1.8;
            b += brightness * 1.8;


            /*
             * Contrast
             */

            r =
                contrastFactor *
                (r - 128) +
                128;

            g =
                contrastFactor *
                (g - 128) +
                128;

            b =
                contrastFactor *
                (b - 128) +
                128;


            /*
             * Basic enhancement
             */

            r =
                128 +
                (r - 128) *
                enhanceFactor;

            g =
                128 +
                (g - 128) *
                enhanceFactor;

            b =
                128 +
                (b - 128) *
                enhanceFactor;


            /*
             * Saturation
             */

            const gray =
                0.299 * r +
                0.587 * g +
                0.114 * b;


            const saturationFactor =
                1 +
                (saturation / 100);


            r =
                gray +
                (r - gray) *
                saturationFactor;

            g =
                gray +
                (g - gray) *
                saturationFactor;

            b =
                gray +
                (b - gray) *
                saturationFactor;


            /*
             * Clamp
             */

            data[i] =
                clamp(
                    Math.round(r),
                    0,
                    255
                );


            data[i + 1] =
                clamp(
                    Math.round(g),
                    0,
                    255
                );


            data[i + 2] =
                clamp(
                    Math.round(b),
                    0,
                    255
                );

        }


        ctx.putImageData(
            imageData,
            0,
            0
        );


        /*
         * Sharpness
         *
         * Simple unsharp-style
         * overlay.
         */

        if (sharpness > 0) {

            applySharpness(
                canvas,
                sharpness
            );

        }


        return canvas;
    }


    /* =========================================
       SHARPNESS
    ========================================= */

    function applySharpness(
        canvas,
        amount
    ) {

        const ctx =
            canvas.getContext(
                "2d"
            );


        const width =
            canvas.width;

        const height =
            canvas.height;


        const original =
            ctx.getImageData(
                0,
                0,
                width,
                height
            );


        const data =
            original.data;


        /*
         * Keep sharpening controlled.
         */

        const strength =
            amount / 100;


        /*
         * Copy source pixels.
         */

        const source =
            new Uint8ClampedArray(
                data
            );


        /*
         * Avoid excessive
         * processing on huge images.
         */

        for (
            let y = 1;
            y < height - 1;
            y++
        ) {

            for (
                let x = 1;
                x < width - 1;
                x++
            ) {

                const index =
                    (y * width + x) *
                    4;


                const top =
                    index -
                    width * 4;


                const bottom =
                    index +
                    width * 4;


                const left =
                    index - 4;


                const right =
                    index + 4;


                for (
                    let channel = 0;
                    channel < 3;
                    channel++
                ) {

                    const center =
                        source[
                            index +
                            channel
                        ];


                    const surrounding =
                        (
                            source[
                                top +
                                channel
                            ] +

                            source[
                                bottom +
                                channel
                            ] +

                            source[
                                left +
                                channel
                            ] +

                            source[
                                right +
                                channel
                            ]
                        ) / 4;


                    const sharpened =
                        center +
                        (
                            center -
                            surrounding
                        ) *
                        strength;


                    data[
                        index +
                        channel
                    ] =
                        clamp(
                            Math.round(
                                sharpened
                            ),
                            0,
                            255
                        );

                }

            }

        }


        ctx.putImageData(
            original,
            0,
            0
        );

    }


    /* =========================================
       LIVE PREVIEW
    ========================================= */

    let previewTimer =
        null;


    function createLivePreview() {

        if (!originalImage) {
            return;
        }


        /*
         * Delay processing slightly so
         * slider movement remains smooth.
         */

        clearTimeout(
            previewTimer
        );


        previewTimer =
            setTimeout(
                function () {

                    try {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        processImage(
                            originalImage,
                            canvas
                        );


                        const preview =
                            canvas.toDataURL(
                                "image/jpeg",
                                0.82
                            );


                        resultImage.src =
                            preview;


                        resultImage.style.display =
                            "block";


                        resultText.style.display =
                            "none";

                    } catch (error) {

                        console.error(
                            "Preview error:",
                            error
                        );

                    }

                },
                80
            );

    }


    /* =========================================
       ENHANCE BUTTON
    ========================================= */

    enhanceBtn.addEventListener(
        "click",
        function () {

            if (!originalImage) {

                alert(
                    "Please upload a photo first."
                );

                return;
            }


            const oldText =
                enhanceBtn.innerHTML;


            enhanceBtn.disabled =
                true;


            enhanceBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Enhancing...';


            /*
             * Use timeout so browser
             * can update button first.
             */

            setTimeout(
                function () {

                    try {

                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        processImage(
                            originalImage,
                            canvas
                        );


                        canvas.toBlob(
                            function (blob) {

                                if (!blob) {

                                    alert(
                                        "Unable to create enhanced image."
                                    );

                                    enhanceBtn.disabled =
                                        false;

                                    enhanceBtn.innerHTML =
                                        oldText;

                                    return;
                                }


                                /*
                                 * Remove old result.
                                 */

                                if (resultURL) {

                                    URL.revokeObjectURL(
                                        resultURL
                                    );

                                }


                                resultURL =
                                    URL.createObjectURL(
                                        blob
                                    );


                                /*
                                 * Preview.
                                 */

                                resultImage.src =
                                    resultURL;


                                resultImage.style.display =
                                    "block";


                                resultText.style.display =
                                    "none";


                                /*
                                 * Information.
                                 */

                                newSize.textContent =
                                    formatSize(
                                        blob.size
                                    );


                                newDimension.textContent =
                                    originalImage.naturalWidth +
                                    " × " +
                                    originalImage.naturalHeight +
                                    " px";


                                newFormat.textContent =
                                    "JPG";


                                newEnhancement.textContent =
                                    enhancementRange.value +
                                    "%";


                                /*
                                 * Download.
                                 */

                                let baseName =
                                    originalFile.name
                                        .replace(
                                            /\.(jpg|jpeg|png|webp)$/i,
                                            ""
                                        );


                                if (!baseName) {

                                    baseName =
                                        "enhanced-photo";

                                }


                                downloadBtn.href =
                                    resultURL;


                                downloadBtn.download =
                                    baseName +
                                    "-enhanced.jpg";


                                downloadBtn.classList.remove(
                                    "disabled"
                                );


                                enhanceBtn.disabled =
                                    false;


                                enhanceBtn.innerHTML =
                                    oldText;

                            },
                            "image/jpeg",
                            0.95
                        );


                    } catch (error) {

                        console.error(
                            "Enhancement error:",
                            error
                        );


                        alert(
                            "Photo enhancement failed. Please try a smaller image."
                        );


                        enhanceBtn.disabled =
                            false;


                        enhanceBtn.innerHTML =
                            oldText;

                    }

                },
                50
            );

        }
    );


    /* =========================================
       RESET SETTINGS
    ========================================= */

    resetSettings.addEventListener(
        "click",
        function () {

            applyPreset(
                "enhanced"
            );

        }
    );


    /* =========================================
       FULL RESET
    ========================================= */

    resetBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            resetAll();

        }
    );


    /* =========================================
       RESET FUNCTION
    ========================================= */

    function resetAll() {

        originalImage = null;

        originalFile = null;


        if (originalURL) {

            URL.revokeObjectURL(
                originalURL
            );

            originalURL = null;

        }


        if (resultURL) {

            URL.revokeObjectURL(
                resultURL
            );

            resultURL = null;

        }


        imageInput.value =
            "";


        originalPreview.src =
            "";

        originalPreview.style.display =
            "none";


        uploadIcon.style.display =
            "block";


        uploadText.style.display =
            "block";


        uploadText.textContent =
            "Upload Photo";


        uploadInfo.style.display =
            "block";


        originalSize.textContent =
            "0 KB";


        originalDimension.textContent =
            "0 × 0 px";


        originalFormat.textContent =
            "-";


        /*
         * Reset settings
         */

        enhancementRange.value =
            50;

        brightnessRange.value =
            0;

        contrastRange.value =
            0;

        saturationRange.value =
            0;

        sharpnessRange.value =
            0;


        updateValues();


        /*
         * Preset active state
         */

        presetButtons.forEach(
            function (button) {

                button.classList.toggle(
                    "active",

                    button.dataset.preset ===
                    "enhanced"
                );

            }
        );


        clearResult();

    }


    /* =========================================
       INITIAL VALUE
    ========================================= */

    updateValues();

});