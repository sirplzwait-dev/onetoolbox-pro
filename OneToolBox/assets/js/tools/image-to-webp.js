"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTS
    ========================================= */

    const imageInput =
        document.getElementById("imageInput");

    const uploadArea =
        document.getElementById("uploadArea");

    const originalPreview =
        document.getElementById("originalPreview");

    const uploadIcon =
        document.getElementById("uploadIcon");

    const uploadText =
        document.getElementById("uploadText");

    const uploadInfo =
        document.getElementById("uploadInfo");

    const resetBtn =
        document.getElementById("resetBtn");


    const originalSize =
        document.getElementById("originalSize");

    const originalDimension =
        document.getElementById("originalDimension");

    const originalFormat =
        document.getElementById("originalFormat");


    const qualityRange =
        document.getElementById("qualityRange");

    const qualityValue =
        document.getElementById("qualityValue");

    const qualityButtons =
        document.querySelectorAll(".quality-btn");


    const transparentBackground =
        document.getElementById(
            "transparentBackground"
        );


    const convertBtn =
        document.getElementById("convertBtn");

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

    const newQuality =
        document.getElementById("newQuality");


    const downloadBtn =
        document.getElementById("downloadBtn");


    /* =========================================
       VARIABLES
    ========================================= */

    let image = null;

    let imageFile = null;

    let imageURL = null;

    let resultURL = null;


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
       CHECK IMAGE TYPE
    ========================================= */

    function isSupportedImage(file) {

        if (!file) {
            return false;
        }


        const type =
            file.type.toLowerCase();


        const name =
            file.name.toLowerCase();


        return (
            type === "image/jpeg" ||
            type === "image/png" ||
            type === "image/webp" ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png") ||
            name.endsWith(".webp")
        );

    }


    /* =========================================
       GET FORMAT
    ========================================= */

    function getFormat(file) {

        if (!file) {
            return "-";
        }


        const name =
            file.name.toLowerCase();


        if (
            file.type === "image/png" ||
            name.endsWith(".png")
        ) {
            return "PNG";
        }


        if (
            file.type === "image/webp" ||
            name.endsWith(".webp")
        ) {
            return "WebP";
        }


        if (
            file.type === "image/jpeg" ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg")
        ) {
            return "JPG";
        }


        return "Image";
    }


    /* =========================================
       CLEAR RESULT
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
            "WebP";


        newQuality.textContent =
            qualityRange.value + "%";


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


        if (!isSupportedImage(file)) {

            alert(
                "Please choose a JPG, JPEG, PNG or WebP image."
            );

            imageInput.value = "";

            return;
        }


        imageFile = file;


        /* Remove previous URL */

        if (imageURL) {

            URL.revokeObjectURL(
                imageURL
            );

        }


        imageURL =
            URL.createObjectURL(
                file
            );


        const img =
            new Image();


        img.onload = function () {

            image = img;


            /* Original Preview */

            originalPreview.src =
                imageURL;


            originalPreview.style.display =
                "block";


            /* Hide Upload Placeholder */

            uploadIcon.style.display =
                "none";


            uploadText.style.display =
                "none";


            uploadInfo.style.display =
                "none";


            /* Original Information */

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


            /* Clear old result */

            clearResult();

        };


        img.onerror = function () {

            alert(
                "Unable to load this image."
            );

        };


        img.src =
            imageURL;

    }


    /* =========================================
       CHOOSE IMAGE
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
       DRAG OVER
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


    /* =========================================
       DRAG LEAVE
    ========================================= */

    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    /* =========================================
       DROP IMAGE
    ========================================= */

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
                    "image/png" ||

                    item.type ===
                    "image/jpeg" ||

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
       QUALITY SLIDER
    ========================================= */

    qualityRange.addEventListener(
        "input",
        function () {

            const value =
                Number(
                    qualityRange.value
                );


            qualityValue.textContent =
                value + "%";


            newQuality.textContent =
                value + "%";


            qualityButtons.forEach(
                function (button) {

                    button.classList.toggle(
                        "active",

                        Number(
                            button.dataset.quality
                        ) === value
                    );

                }
            );

        }
    );


    /* =========================================
       QUICK QUALITY BUTTONS
    ========================================= */

    qualityButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const value =
                        Number(
                            button.dataset.quality
                        );


                    qualityRange.value =
                        value;


                    qualityValue.textContent =
                        value + "%";


                    newQuality.textContent =
                        value + "%";


                    qualityButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


    /* =========================================
       CONVERT TO WEBP
    ========================================= */

    convertBtn.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            const width =
                image.naturalWidth;


            const height =
                image.naturalHeight;


            /* Canvas */

            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                width;


            canvas.height =
                height;


            const ctx =
                canvas.getContext(
                    "2d"
                );


            if (!ctx) {

                alert(
                    "Your browser cannot process this image."
                );

                return;
            }


            /* =====================================
               BACKGROUND
            ===================================== */

            if (
                transparentBackground.checked
            ) {

                /*
                 * Clear canvas completely.
                 *
                 * This preserves PNG/WebP
                 * transparency.
                 */

                ctx.clearRect(
                    0,
                    0,
                    width,
                    height
                );

            } else {

                /*
                 * No transparency:
                 * use white background.
                 */

                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );

            }


            /* =====================================
               DRAW IMAGE
            ===================================== */

            ctx.drawImage(
                image,
                0,
                0,
                width,
                height
            );


            /* =====================================
               QUALITY
            ===================================== */

            const quality =
                Number(
                    qualityRange.value
                ) / 100;


            /* Loading */

            convertBtn.disabled =
                true;


            const oldButtonText =
                convertBtn.innerHTML;


            convertBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';


            /* =====================================
               CANVAS TO WEBP
            ===================================== */

            canvas.toBlob(
                function (blob) {

                    convertBtn.disabled =
                        false;


                    convertBtn.innerHTML =
                        oldButtonText;


                    if (!blob) {

                        alert(
                            "WebP conversion failed. Your browser may not support WebP."
                        );

                        return;
                    }


                    /* Remove old result URL */

                    if (resultURL) {

                        URL.revokeObjectURL(
                            resultURL
                        );

                    }


                    resultURL =
                        URL.createObjectURL(
                            blob
                        );


                    /* =================================
                       RESULT PREVIEW
                    ================================= */

                    resultImage.src =
                        resultURL;


                    resultImage.style.display =
                        "block";


                    resultText.style.display =
                        "none";


                    /* =================================
                       RESULT INFO
                    ================================= */

                    newSize.textContent =
                        formatSize(
                            blob.size
                        );


                    newDimension.textContent =
                        width +
                        " × " +
                        height +
                        " px";


                    newFormat.textContent =
                        "WebP";


                    newQuality.textContent =
                        qualityRange.value +
                        "%";


                    /* =================================
                       DOWNLOAD NAME
                    ================================= */

                    let baseName =
                        imageFile.name
                            .replace(
                                /\.(jpg|jpeg|png|webp)$/i,
                                ""
                            );


                    if (!baseName) {

                        baseName =
                            "image";

                    }


                    downloadBtn.href =
                        resultURL;


                    downloadBtn.download =
                        baseName +
                        ".webp";


                    downloadBtn.classList.remove(
                        "disabled"
                    );

                },

                "image/webp",

                quality
            );

        }
    );


    /* =========================================
       RESET SETTINGS
    ========================================= */

    resetSettings.addEventListener(
        "click",
        function () {

            /* Quality */

            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            newQuality.textContent =
                "90%";


            /* Transparency */

            transparentBackground.checked =
                true;


            /* Quality Buttons */

            qualityButtons.forEach(
                function (button) {

                    button.classList.toggle(
                        "active",

                        Number(
                            button.dataset.quality
                        ) === 90
                    );

                }
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


            /* Clear variables */

            image = null;

            imageFile = null;


            /* Remove URLs */

            if (imageURL) {

                URL.revokeObjectURL(
                    imageURL
                );

            }


            if (resultURL) {

                URL.revokeObjectURL(
                    resultURL
                );

            }


            imageURL = null;

            resultURL = null;


            /* Clear input */

            imageInput.value =
                "";


            /* Original Preview */

            originalPreview.src =
                "";


            originalPreview.style.display =
                "none";


            /* Upload Placeholder */

            uploadIcon.style.display =
                "block";


            uploadText.style.display =
                "block";


            uploadInfo.style.display =
                "block";


            /* Original Information */

            originalSize.textContent =
                "0 KB";


            originalDimension.textContent =
                "0 × 0 px";


            originalFormat.textContent =
                "-";


            /* Settings */

            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            newQuality.textContent =
                "90%";


            transparentBackground.checked =
                true;


            qualityButtons.forEach(
                function (button) {

                    button.classList.toggle(
                        "active",

                        Number(
                            button.dataset.quality
                        ) === 90
                    );

                }
            );


            /* Result */

            clearResult();

        }
    );

});