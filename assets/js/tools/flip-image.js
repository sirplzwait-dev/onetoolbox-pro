"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================
       ELEMENTS
    ===================================== */

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


    const flipHorizontal =
        document.getElementById("flipHorizontal");

    const flipVertical =
        document.getElementById("flipVertical");

    const flipBoth =
        document.getElementById("flipBoth");

    const resetFlip =
        document.getElementById("resetFlip");


    const flipStatus =
        document.getElementById("flipStatus");

    const formatSelect =
        document.getElementById("formatSelect");

    const qualityRange =
        document.getElementById("qualityRange");

    const qualityValue =
        document.getElementById("qualityValue");


    const applyBtn =
        document.getElementById("applyBtn");

    const resetSettings =
        document.getElementById("resetSettings");


    const resultImage =
        document.getElementById("resultImage");

    const resultText =
        document.getElementById("resultText");


    const newDimension =
        document.getElementById("newDimension");

    const newSize =
        document.getElementById("newSize");

    const newFormat =
        document.getElementById("newFormat");

    const newFlip =
        document.getElementById("newFlip");


    const downloadBtn =
        document.getElementById("downloadBtn");


    /* =====================================
       VARIABLES
    ===================================== */

    let image = null;

    let imageFile = null;

    let imageURL = null;

    let resultURL = null;


    let flipX = 1;

    let flipY = 1;


    /* =====================================
       FILE SIZE
    ===================================== */

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


    /* =====================================
       FORMAT NAME
    ===================================== */

    function getFormatName(type) {

        if (type === "image/png") {
            return "PNG";
        }

        if (type === "image/webp") {
            return "WEBP";
        }

        return "JPG";
    }


    /* =====================================
       CURRENT FLIP STATUS
    ===================================== */

    function getFlipStatus() {

        if (flipX === 1 && flipY === 1) {
            return "Original";
        }

        if (flipX === -1 && flipY === 1) {
            return "Horizontal";
        }

        if (flipX === 1 && flipY === -1) {
            return "Vertical";
        }

        return "Horizontal + Vertical";
    }


    /* =====================================
       UPDATE PREVIEW
    ===================================== */

    function updatePreview() {

        if (!image) {
            return;
        }


        originalPreview.style.transform =
            "scale(" +
            flipX +
            "," +
            flipY +
            ")";


        const status =
            getFlipStatus();


        flipStatus.textContent =
            status;


        newFlip.textContent =
            status;


        /* Active buttons */

        flipHorizontal.classList.toggle(
            "active",
            flipX === -1
        );


        flipVertical.classList.toggle(
            "active",
            flipY === -1
        );


        flipBoth.classList.toggle(
            "active",
            flipX === -1 &&
            flipY === -1
        );


        resetFlip.classList.toggle(
            "active",
            flipX === 1 &&
            flipY === 1
        );

    }


    /* =====================================
       LOAD IMAGE
    ===================================== */

    function loadImage(file) {

        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert(
                "Please choose a valid image file."
            );

            imageInput.value = "";

            return;
        }


        imageFile = file;


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


            originalPreview.src =
                imageURL;


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
                getFormatName(
                    file.type
                );


            flipX = 1;

            flipY = 1;


            updatePreview();

        };


        img.onerror = function () {

            alert(
                "Unable to load this image."
            );

        };


        img.src =
            imageURL;

    }


    /* =====================================
       CHOOSE IMAGE
    ===================================== */

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


    /* =====================================
       DRAG OVER
    ===================================== */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();


            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    /* =====================================
       DRAG LEAVE
    ===================================== */

    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    /* =====================================
       DROP
    ===================================== */

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


    /* =====================================
       PASTE IMAGE
    ===================================== */

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
                    item.type.startsWith(
                        "image/"
                    )
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


    /* =====================================
       HORIZONTAL FLIP
    ===================================== */

    flipHorizontal.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            flipX *= -1;


            updatePreview();

        }
    );


    /* =====================================
       VERTICAL FLIP
    ===================================== */

    flipVertical.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            flipY *= -1;


            updatePreview();

        }
    );


    /* =====================================
       FLIP BOTH
    ===================================== */

    flipBoth.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            flipX *= -1;

            flipY *= -1;


            updatePreview();

        }
    );


    /* =====================================
       ORIGINAL
    ===================================== */

    resetFlip.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            flipX = 1;

            flipY = 1;


            updatePreview();

        }
    );


    /* =====================================
       QUALITY
    ===================================== */

    qualityRange.addEventListener(
        "input",
        function () {

            qualityValue.textContent =
                qualityRange.value +
                "%";

        }
    );


    /* =====================================
       APPLY FLIP
    ===================================== */

    applyBtn.addEventListener(
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


            const outputFormat =
                formatSelect.value;


            /*
             * White background for JPG
             */

            if (
                outputFormat ===
                "image/jpeg"
            ) {

                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(
                    0,
                    0,
                    width,
                    height
                );

            }


            ctx.save();


            /*
             * Horizontal flip
             */

            if (flipX === -1) {

                ctx.translate(
                    width,
                    0
                );

                ctx.scale(
                    -1,
                    1
                );

            }


            /*
             * Vertical flip
             */

            if (flipY === -1) {

                ctx.translate(
                    0,
                    height
                );

                ctx.scale(
                    1,
                    -1
                );

            }


            ctx.drawImage(
                image,
                0,
                0,
                width,
                height
            );


            ctx.restore();


            const quality =
                Number(
                    qualityRange.value
                ) / 100;


            canvas.toBlob(
                function (blob) {

                    if (!blob) {

                        alert(
                            "Image processing failed."
                        );

                        return;
                    }


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
                     * RESULT IMAGE
                     */

                    resultImage.src =
                        resultURL;


                    resultImage.style.display =
                        "block";


                    resultText.style.display =
                        "none";


                    /*
                     * RESULT DETAILS
                     */

                    newDimension.textContent =
                        width +
                        " × " +
                        height +
                        " px";


                    newSize.textContent =
                        formatSize(
                            blob.size
                        );


                    newFormat.textContent =
                        getFormatName(
                            outputFormat
                        );


                    newFlip.textContent =
                        getFlipStatus();


                    /*
                     * DOWNLOAD EXTENSION
                     */

                    let extension =
                        "jpg";


                    if (
                        outputFormat ===
                        "image/png"
                    ) {

                        extension =
                            "png";

                    }
                    else if (
                        outputFormat ===
                        "image/webp"
                    ) {

                        extension =
                            "webp";

                    }


                    let baseName =
                        imageFile.name
                            .replace(
                                /\.[^/.]+$/,
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
                        "-flipped." +
                        extension;


                    downloadBtn.classList.remove(
                        "disabled"
                    );

                },

                outputFormat,

                quality

            );

        }
    );


    /* =====================================
       RESET SETTINGS
    ===================================== */

    resetSettings.addEventListener(
        "click",
        function () {

            flipX = 1;

            flipY = 1;


            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            formatSelect.value =
                "image/jpeg";


            if (image) {

                updatePreview();

            }
            else {

                flipStatus.textContent =
                    "Original";

            }

        }
    );


    /* =====================================
       FULL RESET
    ===================================== */

    resetBtn.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            event.stopPropagation();


            image = null;

            imageFile = null;


            if (imageURL) {

                URL.revokeObjectURL(
                    imageURL
                );

                imageURL = null;

            }


            if (resultURL) {

                URL.revokeObjectURL(
                    resultURL
                );

                resultURL = null;

            }


            imageInput.value =
                "";


            /*
             * ORIGINAL
             */

            originalPreview.src =
                "";


            originalPreview.style.display =
                "none";


            originalPreview.style.transform =
                "none";


            uploadIcon.style.display =
                "block";


            uploadText.style.display =
                "block";


            uploadInfo.style.display =
                "block";


            originalSize.textContent =
                "0 KB";


            originalDimension.textContent =
                "0 × 0 px";


            originalFormat.textContent =
                "-";


            /*
             * SETTINGS
             */

            flipX = 1;

            flipY = 1;


            flipStatus.textContent =
                "Original";


            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            formatSelect.value =
                "image/jpeg";


            /*
             * RESULT
             */

            resultImage.src =
                "";


            resultImage.style.display =
                "none";


            resultText.style.display =
                "block";


            newDimension.textContent =
                "0 × 0 px";


            newSize.textContent =
                "0 KB";


            newFormat.textContent =
                "-";


            newFlip.textContent =
                "Original";


            /*
             * DOWNLOAD
             */

            downloadBtn.href =
                "#";


            downloadBtn.removeAttribute(
                "download"
            );


            downloadBtn.classList.add(
                "disabled"
            );


            /*
             * BUTTON STATES
             */

            flipHorizontal.classList.remove(
                "active"
            );

            flipVertical.classList.remove(
                "active"
            );

            flipBoth.classList.remove(
                "active"
            );

            resetFlip.classList.add(
                "active"
            );

        }
    );


});