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

    const rotateLeft = document.getElementById("rotateLeft");
    const rotateRight = document.getElementById("rotateRight");
    const rotateRange = document.getElementById("rotateRange");
    const rotateValue = document.getElementById("rotateValue");

    const flipHorizontal = document.getElementById("flipHorizontal");
    const flipVertical = document.getElementById("flipVertical");

    const formatSelect = document.getElementById("formatSelect");
    const qualityRange = document.getElementById("qualityRange");
    const qualityValue = document.getElementById("qualityValue");

    const applyBtn = document.getElementById("applyBtn");
    const resetSettings = document.getElementById("resetSettings");

    const resultImage = document.getElementById("resultImage");
    const resultText = document.getElementById("resultText");

    const newDimension = document.getElementById("newDimension");
    const newSize = document.getElementById("newSize");
    const newFormat = document.getElementById("newFormat");
    const newRotation = document.getElementById("newRotation");

    const downloadBtn = document.getElementById("downloadBtn");


    let image = null;
    let imageFile = null;

    let imageURL = null;
    let resultURL = null;

    let rotation = 0;

    let flipX = 1;
    let flipY = 1;


    /* ================================
       FILE SIZE
    ================================= */

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


    /* ================================
       FORMAT NAME
    ================================= */

    function getFormatName(type) {

        if (type === "image/png") {
            return "PNG";
        }

        if (type === "image/webp") {
            return "WEBP";
        }

        return "JPG";
    }


    /* ================================
       UPDATE PREVIEW
    ================================= */

    function updatePreview() {

        if (!image) {
            return;
        }

        originalPreview.style.transform =
            "rotate(" + rotation + "deg) " +
            "scale(" + flipX + "," + flipY + ")";


        rotateValue.textContent =
            rotation + "°";


        newRotation.textContent =
            rotation + "°";


        rotateRange.value =
            rotation;


        document.querySelectorAll(".angle-btn")
            .forEach(function (button) {

                button.classList.toggle(
                    "active",
                    Number(button.dataset.angle) === rotation
                );

            });

    }


    /* ================================
       LOAD IMAGE
    ================================= */

    function loadImage(file) {

        if (!file) {
            return;
        }


        if (!file.type.startsWith("image/")) {

            alert("Please choose a valid image file.");

            imageInput.value = "";

            return;
        }


        imageFile = file;


        if (imageURL) {

            URL.revokeObjectURL(imageURL);

        }


        imageURL =
            URL.createObjectURL(file);


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
                formatSize(file.size);


            originalDimension.textContent =
                img.naturalWidth +
                " × " +
                img.naturalHeight +
                " px";


            originalFormat.textContent =
                getFormatName(file.type);


            rotation = 0;

            flipX = 1;

            flipY = 1;


            updatePreview();

        };


        img.onerror = function () {

            alert("Unable to load this image.");

        };


        img.src =
            imageURL;

    }


    /* ================================
       CHOOSE IMAGE
    ================================= */

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


    /* ================================
       DRAG OVER
    ================================= */

    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


    /* ================================
       DRAG LEAVE
    ================================= */

    uploadArea.addEventListener(
        "dragleave",
        function () {

            uploadArea.classList.remove(
                "dragging"
            );

        }
    );


    /* ================================
       DROP
    ================================= */

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


    /* ================================
       PASTE IMAGE
    ================================= */

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
                    item.type.startsWith("image/")
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


    /* ================================
       ROTATE LEFT
    ================================= */

    rotateLeft.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            rotation -= 90;


            if (rotation < -180) {

                rotation += 360;

            }


            updatePreview();

        }
    );


    /* ================================
       ROTATE RIGHT
    ================================= */

    rotateRight.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            rotation += 90;


            if (rotation > 180) {

                rotation -= 360;

            }


            updatePreview();

        }
    );


    /* ================================
       ROTATION SLIDER
    ================================= */

    rotateRange.addEventListener(
        "input",
        function () {

            if (!image) {
                return;
            }


            rotation =
                Number(
                    rotateRange.value
                );


            updatePreview();

        }
    );


    /* ================================
       QUICK ANGLE
    ================================= */

    document
        .querySelectorAll(".angle-btn")
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        if (!image) {

                            alert(
                                "Please upload an image first."
                            );

                            return;
                        }


                        rotation =
                            Number(
                                button.dataset.angle
                            );


                        updatePreview();

                    }
                );

            }
        );


    /* ================================
       FLIP HORIZONTAL
    ================================= */

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


    /* ================================
       FLIP VERTICAL
    ================================= */

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


    /* ================================
       QUALITY SLIDER
    ================================= */

    qualityRange.addEventListener(
        "input",
        function () {

            qualityValue.textContent =
                qualityRange.value + "%";

        }
    );


    /* ================================
       APPLY ROTATION
    ================================= */

    applyBtn.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload an image first."
                );

                return;
            }


            const radians =
                rotation *
                Math.PI /
                180;


            const width =
                image.naturalWidth;


            const height =
                image.naturalHeight;


            const cos =
                Math.abs(
                    Math.cos(radians)
                );


            const sin =
                Math.abs(
                    Math.sin(radians)
                );


            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                Math.max(
                    1,
                    Math.ceil(
                        width * cos +
                        height * sin
                    )
                );


            canvas.height =
                Math.max(
                    1,
                    Math.ceil(
                        width * sin +
                        height * cos
                    )
                );


            const ctx =
                canvas.getContext("2d");


            if (!ctx) {

                alert(
                    "Your browser cannot process this image."
                );

                return;
            }


            const outputFormat =
                formatSelect.value;


            /* JPG background white */

            if (
                outputFormat ===
                "image/jpeg"
            ) {

                ctx.fillStyle =
                    "#ffffff";


                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }


            ctx.save();


            ctx.translate(
                canvas.width / 2,
                canvas.height / 2
            );


            ctx.rotate(
                radians
            );


            ctx.scale(
                flipX,
                flipY
            );


            ctx.drawImage(
                image,
                -width / 2,
                -height / 2,
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


                    /* RESULT IMAGE */

                    resultImage.src =
                        resultURL;


                    resultImage.style.display =
                        "block";


                    resultText.style.display =
                        "none";


                    /* RESULT DETAILS */

                    newDimension.textContent =
                        canvas.width +
                        " × " +
                        canvas.height +
                        " px";


                    newSize.textContent =
                        formatSize(
                            blob.size
                        );


                    newFormat.textContent =
                        getFormatName(
                            outputFormat
                        );


                    newRotation.textContent =
                        rotation + "°";


                    /* DOWNLOAD */

                    let extension =
                        "jpg";


                    if (
                        outputFormat ===
                        "image/png"
                    ) {

                        extension = "png";

                    }
                    else if (
                        outputFormat ===
                        "image/webp"
                    ) {

                        extension = "webp";

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
                        "-rotated." +
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


    /* ================================
       RESET SETTINGS
    ================================= */

    resetSettings.addEventListener(
        "click",
        function () {

            rotation = 0;

            flipX = 1;

            flipY = 1;


            rotateRange.value =
                0;


            rotateValue.textContent =
                "0°";


            newRotation.textContent =
                "0°";


            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            formatSelect.value =
                "image/jpeg";


            updatePreview();

        }
    );


    /* ================================
       FULL RESET
    ================================= */

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


            rotation = 0;

            flipX = 1;

            flipY = 1;


            rotateRange.value =
                0;


            rotateValue.textContent =
                "0°";


            newRotation.textContent =
                "0°";


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


            downloadBtn.href =
                "#";


            downloadBtn.removeAttribute(
                "download"
            );


            downloadBtn.classList.add(
                "disabled"
            );


            document
                .querySelectorAll(".angle-btn")
                .forEach(
                    function (button) {

                        button.classList.remove(
                            "active"
                        );

                    }
                );


            const zeroButton =
                document.querySelector(
                    '.angle-btn[data-angle="0"]'
                );


            if (zeroButton) {

                zeroButton.classList.add(
                    "active"
                );

            }

        }
    );

});