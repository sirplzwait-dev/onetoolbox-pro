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


    const compressionRange =
        document.getElementById("compressionRange");

    const compressionValue =
        document.getElementById("compressionValue");

    const compressionButtons =
        document.querySelectorAll(
            ".compression-btn"
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


    const downloadBtn =
        document.getElementById("downloadBtn");


    /* =====================================
       VARIABLES
    ===================================== */

    let image = null;

    let imageFile = null;

    let imageURL = null;

    let resultURL = null;


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
       CHECK JPG
    ===================================== */

    function isJpgFile(file) {

        if (!file) {
            return false;
        }


        const type =
            file.type.toLowerCase();


        const name =
            file.name.toLowerCase();


        return (
            type === "image/jpeg" ||
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg")
        );

    }


    /* =====================================
       LOAD IMAGE
    ===================================== */

    function loadImage(file) {

        if (!file) {
            return;
        }


        /*
         * Only JPG / JPEG
         */

        if (!isJpgFile(file)) {

            alert(
                "Please choose a JPG or JPEG image."
            );

            imageInput.value = "";

            return;
        }


        imageFile = file;


        /*
         * Remove old object URL
         */

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


            /*
             * ORIGINAL PREVIEW
             */

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


            /*
             * ORIGINAL DETAILS
             */

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
                "JPG";


            /*
             * Clear previous result
             */

            clearResult();

        };


        img.onerror = function () {

            alert(
                "Unable to load this JPG image."
            );

        };


        img.src =
            imageURL;

    }


    /* =====================================
       CLEAR RESULT
    ===================================== */

    function clearResult() {

        if (resultURL) {

            URL.revokeObjectURL(
                resultURL
            );

            resultURL = null;

        }


        resultImage.src =
            "";


        resultImage.style.display =
            "none";


        resultText.style.display =
            "block";


        newSize.textContent =
            "0 KB";


        newDimension.textContent =
            "0 × 0 px";


        newFormat.textContent =
            "PNG";


        downloadBtn.href =
            "#";


        downloadBtn.removeAttribute(
            "download"
        );


        downloadBtn.classList.add(
            "disabled"
        );

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
       PASTE JPG
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
                    item.type ===
                    "image/jpeg"
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
       COMPRESSION SLIDER
    ===================================== */

    compressionRange.addEventListener(
        "input",
        function () {

            compressionValue.textContent =
                compressionRange.value +
                "%";


            compressionButtons.forEach(
                function (button) {

                    button.classList.toggle(
                        "active",
                        Number(
                            button.dataset.quality
                        ) ===
                        Number(
                            compressionRange.value
                        )
                    );

                }
            );

        }
    );


    /* =====================================
       QUICK COMPRESSION
    ===================================== */

    compressionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const value =
                        Number(
                            button.dataset.quality
                        );


                    compressionRange.value =
                        value;


                    compressionValue.textContent =
                        value +
                        "%";


                    compressionButtons.forEach(
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


    /* =====================================
       CONVERT JPG TO PNG
    ===================================== */

    convertBtn.addEventListener(
        "click",
        function () {

            if (!image) {

                alert(
                    "Please upload a JPG image first."
                );

                return;
            }


            /*
             * Create canvas
             */

            const canvas =
                document.createElement(
                    "canvas"
                );


            canvas.width =
                image.naturalWidth;


            canvas.height =
                image.naturalHeight;


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


            /*
             * Draw JPG
             */

            ctx.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
            );


            /*
             * PNG itself is lossless.
             *
             * Browser canvas PNG export does not
             * expose a true PNG compression slider.
             *
             * We still keep the UI setting so the
             * tool remains compatible with the
             * common OneToolBox converter design.
             */

            convertBtn.disabled =
                true;


            const oldText =
                convertBtn.innerHTML;


            convertBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';


            canvas.toBlob(
                function (blob) {

                    convertBtn.disabled =
                        false;


                    convertBtn.innerHTML =
                        oldText;


                    if (!blob) {

                        alert(
                            "JPG to PNG conversion failed."
                        );

                        return;
                    }


                    /*
                     * Remove old result URL
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
                     * RESULT PREVIEW
                     */

                    resultImage.src =
                        resultURL;


                    resultImage.style.display =
                        "block";


                    resultText.style.display =
                        "none";


                    /*
                     * RESULT INFORMATION
                     */

                    newSize.textContent =
                        formatSize(
                            blob.size
                        );


                    newDimension.textContent =
                        image.naturalWidth +
                        " × " +
                        image.naturalHeight +
                        " px";


                    newFormat.textContent =
                        "PNG";


                    /*
                     * DOWNLOAD NAME
                     */

                    let baseName =
                        imageFile.name
                            .replace(
                                /\.(jpg|jpeg)$/i,
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
                        ".png";


                    downloadBtn.classList.remove(
                        "disabled"
                    );

                },

                "image/png"

            );

        }
    );


    /* =====================================
       RESET SETTINGS
    ===================================== */

    resetSettings.addEventListener(
        "click",
        function () {

            compressionRange.value =
                90;


            compressionValue.textContent =
                "90%";


            compressionButtons.forEach(
                function (button) {

                    button.classList.remove(
                        "active"
                    );

                }
            );


            const highButton =
                document.querySelector(
                    '.compression-btn[data-quality="90"]'
                );


            if (highButton) {

                highButton.classList.add(
                    "active"
                );

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


            /*
             * Revoke URLs
             */

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


            /*
             * Clear file input
             */

            imageInput.value =
                "";


            /*
             * Original preview
             */

            originalPreview.src =
                "";


            originalPreview.style.display =
                "none";


            uploadIcon.style.display =
                "block";


            uploadText.style.display =
                "block";


            uploadInfo.style.display =
                "block";


            /*
             * Original details
             */

            originalSize.textContent =
                "0 KB";


            originalDimension.textContent =
                "0 × 0 px";


            originalFormat.textContent =
                "-";


            /*
             * Settings
             */

            compressionRange.value =
                90;


            compressionValue.textContent =
                "90%";


            compressionButtons.forEach(
                function (button) {

                    button.classList.remove(
                        "active"
                    );

                }
            );


            const highButton =
                document.querySelector(
                    '.compression-btn[data-quality="90"]'
                );


            if (highButton) {

                highButton.classList.add(
                    "active"
                );

            }


            /*
             * Result
             */

            resultImage.src =
                "";


            resultImage.style.display =
                "none";


            resultText.style.display =
                "block";


            newSize.textContent =
                "0 KB";


            newDimension.textContent =
                "0 × 0 px";


            newFormat.textContent =
                "PNG";


            /*
             * Download
             */

            downloadBtn.href =
                "#";


            downloadBtn.removeAttribute(
                "download"
            );


            downloadBtn.classList.add(
                "disabled"
            );

        }
    );

});