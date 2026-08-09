"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const imageInput = document.getElementById("imageInput");
    const uploadArea = document.getElementById("uploadArea");
    const originalPreview = document.getElementById("originalPreview");
    const uploadIcon = document.getElementById("uploadIcon");
    const uploadText = document.getElementById("uploadText");
    const uploadInfo = document.getElementById("uploadInfo");
    const resetBtn = document.getElementById("resetBtn");

    const originalSize = document.getElementById("originalSize");
    const originalDimension = document.getElementById("originalDimension");
    const originalFormat = document.getElementById("originalFormat");

    const qualityRange = document.getElementById("qualityRange");
    const qualityValue = document.getElementById("qualityValue");
    const qualityButtons = document.querySelectorAll(".quality-btn");

    const whiteBackground = document.getElementById("whiteBackground");

    const convertBtn = document.getElementById("convertBtn");
    const resetSettings = document.getElementById("resetSettings");

    const resultImage = document.getElementById("resultImage");
    const resultText = document.getElementById("resultText");

    const newSize = document.getElementById("newSize");
    const newDimension = document.getElementById("newDimension");
    const newFormat = document.getElementById("newFormat");
    const newQuality = document.getElementById("newQuality");

    const downloadBtn = document.getElementById("downloadBtn");


    /* =========================================
       VARIABLES
    ========================================= */

    let image = null;
    let imageFile = null;

    let imageURL = null;
    let resultURL = null;


    /* =========================================
       FORMAT FILE SIZE
    ========================================= */

    function formatSize(bytes) {

        if (!bytes || bytes <= 0) {
            return "0 KB";
        }

        if (bytes < 1024) {
            return bytes + " B";
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + " KB";
        }

        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }


    /* =========================================
       CLEAR RESULT
    ========================================= */

    function clearResult() {

        if (resultURL) {
            URL.revokeObjectURL(resultURL);
            resultURL = null;
        }

        resultImage.src = "";
        resultImage.style.display = "none";

        resultText.style.display = "block";

        newSize.textContent = "0 KB";

        newDimension.textContent = "0 × 0 px";

        newFormat.textContent = "JPG";

        newQuality.textContent =
            qualityRange.value + "%";

        downloadBtn.href = "#";

        downloadBtn.removeAttribute("download");

        downloadBtn.classList.add("disabled");
    }


    /* =========================================
       LOAD PNG IMAGE
    ========================================= */

    function loadImage(file) {

        if (!file) {
            return;
        }


        /* Only PNG */

        if (
            file.type !== "image/png" &&
            !file.name.toLowerCase().endsWith(".png")
        ) {

            alert("Please choose a PNG image.");

            imageInput.value = "";

            return;
        }


        imageFile = file;


        /* Remove old URL */

        if (imageURL) {
            URL.revokeObjectURL(imageURL);
        }


        imageURL = URL.createObjectURL(file);


        const img = new Image();


        img.onload = function () {

            image = img;


            /* Original Preview */

            originalPreview.src = imageURL;

            originalPreview.style.display = "block";


            /* Hide upload placeholder */

            uploadIcon.style.display = "none";

            uploadText.style.display = "none";

            uploadInfo.style.display = "none";


            /* Original Information */

            originalSize.textContent =
                formatSize(file.size);

            originalDimension.textContent =
                img.naturalWidth +
                " × " +
                img.naturalHeight +
                " px";

            originalFormat.textContent = "PNG";


            /* Clear old result */

            clearResult();
        };


        img.onerror = function () {

            alert("Unable to load this PNG image.");

        };


        img.src = imageURL;
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
       DRAG OVER
    ========================================= */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add("dragging");

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
       PASTE PNG IMAGE
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

                const item = items[i];


                if (
                    item.type === "image/png"
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
                Number(this.value);


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
       CONVERT PNG → JPG
    ========================================= */

    convertBtn.addEventListener(
        "click",
        function () {

            /* No image */

            if (!image) {

                alert(
                    "Please upload a PNG image first."
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


            canvas.width = width;

            canvas.height = height;


            const ctx =
                canvas.getContext("2d");


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
                whiteBackground.checked
            ) {

                /* White */

                ctx.fillStyle =
                    "#ffffff";

            } else {

                /* Black */

                ctx.fillStyle =
                    "#000000";
            }


            ctx.fillRect(
                0,
                0,
                width,
                height
            );


            /* =====================================
               DRAW PNG
            ===================================== */

            ctx.drawImage(
                image,
                0,
                0,
                width,
                height
            );


            /* JPG Quality */

            const quality =
                Number(
                    qualityRange.value
                ) / 100;


            /* Button Loading */

            convertBtn.disabled = true;


            const oldButtonText =
                convertBtn.innerHTML;


            convertBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';


            /* =====================================
               CANVAS → JPG
            ===================================== */

            canvas.toBlob(
                function (blob) {

                    convertBtn.disabled =
                        false;


                    convertBtn.innerHTML =
                        oldButtonText;


                    if (!blob) {

                        alert(
                            "PNG to JPG conversion failed."
                        );

                        return;
                    }


                    /* Remove old result */

                    if (resultURL) {

                        URL.revokeObjectURL(
                            resultURL
                        );

                    }


                    /* New result URL */

                    resultURL =
                        URL.createObjectURL(
                            blob
                        );


                    /* Preview */

                    resultImage.src =
                        resultURL;


                    resultImage.style.display =
                        "block";


                    resultText.style.display =
                        "none";


                    /* Result Information */

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
                        "JPG";


                    newQuality.textContent =
                        qualityRange.value +
                        "%";


                    /* =================================
                       DOWNLOAD NAME
                    ================================= */

                    let baseName =
                        imageFile.name.replace(
                            /\.png$/i,
                            ""
                        );


                    if (!baseName) {
                        baseName = "image";
                    }


                    downloadBtn.href =
                        resultURL;


                    downloadBtn.download =
                        baseName + ".jpg";


                    downloadBtn.classList.remove(
                        "disabled"
                    );

                },
                "image/jpeg",
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

            qualityRange.value = 90;

            qualityValue.textContent =
                "90%";

            newQuality.textContent =
                "90%";


            /* Background */

            whiteBackground.checked =
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
       RESET EVERYTHING
    ========================================= */

    resetBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            /* Clear variables */

            image = null;

            imageFile = null;


            /* Clear URLs */

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


            /* File input */

            imageInput.value = "";


            /* Original Preview */

            originalPreview.src = "";

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

            qualityRange.value = 90;

            qualityValue.textContent =
                "90%";

            newQuality.textContent =
                "90%";


            whiteBackground.checked =
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