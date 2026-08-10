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


    const qualityRange =
        document.getElementById("qualityRange");

    const qualityValue =
        document.getElementById("qualityValue");

    const qualityButtons =
        document.querySelectorAll(".quality-btn");


    const whiteBackground =
        document.getElementById("whiteBackground");


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

    let heicFile = null;

    let convertedBlob = null;

    let resultURL = null;

    let previewURL = null;

    let imageWidth = 0;

    let imageHeight = 0;


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
       CHECK HEIC FILE
    ========================================= */

    function isHEIC(file) {

        if (!file) {
            return false;
        }

        const name =
            file.name.toLowerCase();

        const type =
            (file.type || "").toLowerCase();

        return (
            name.endsWith(".heic") ||
            name.endsWith(".heif") ||
            type === "image/heic" ||
            type === "image/heif"
        );
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

        convertedBlob = null;

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
       SHOW HEIC PREVIEW
    ========================================= */

    async function createHEICPreview(file) {

        /*
         * HEIC cannot normally be displayed
         * directly by the browser.
         *
         * We use heic2any to create a JPG
         * preview.
         */

        if (
            typeof heic2any ===
            "undefined"
        ) {

            throw new Error(
                "HEIC decoder library is not loaded."
            );
        }


        const previewBlob =
            await heic2any({
                blob: file,
                toType: "image/jpeg",
                quality: 0.85
            });


        /*
         * heic2any can return an array
         * for some HEIC files.
         */

        const blob =
            Array.isArray(previewBlob)
                ? previewBlob[0]
                : previewBlob;


        if (previewURL) {

            URL.revokeObjectURL(
                previewURL
            );
        }


        previewURL =
            URL.createObjectURL(
                blob
            );


        return new Promise(
            function (resolve, reject) {

                const img =
                    new Image();


                img.onload =
                    function () {

                        imageWidth =
                            img.naturalWidth;

                        imageHeight =
                            img.naturalHeight;


                        originalPreview.src =
                            previewURL;


                        originalPreview.style.display =
                            "block";


                        uploadIcon.style.display =
                            "none";


                        uploadText.style.display =
                            "none";


                        uploadInfo.style.display =
                            "none";


                        originalDimension.textContent =
                            imageWidth +
                            " × " +
                            imageHeight +
                            " px";


                        resolve();

                    };


                img.onerror =
                    function () {

                        reject(
                            new Error(
                                "Unable to create HEIC preview."
                            )
                        );

                    };


                img.src =
                    previewURL;

            }
        );
    }


    /* =========================================
       LOAD HEIC
    ========================================= */

    async function loadHEIC(file) {

        if (!file) {
            return;
        }


        if (!isHEIC(file)) {

            alert(
                "Please choose a HEIC or HEIF image."
            );

            imageInput.value = "";

            return;
        }


        heicFile =
            file;


        originalSize.textContent =
            formatSize(file.size);


        originalFormat.textContent =
            "HEIC";


        clearResult();


        /*
         * Loading state
         */

        uploadText.textContent =
            "Reading HEIC...";

        uploadInfo.style.display =
            "none";


        try {

            await createHEICPreview(
                file
            );

        } catch (error) {

            console.error(
                "HEIC Preview Error:",
                error
            );


            alert(
                "This HEIC image could not be read. Please try another HEIC/HEIF image."
            );


            resetAll();

            return;
        }


        uploadText.textContent =
            "HEIC Image Ready";
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

                loadHEIC(file);

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

                loadHEIC(file);

            }
        }
    );


    /* =========================================
       PASTE
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
                        "image/heic" ||
                    item.type ===
                        "image/heif"
                ) {

                    const file =
                        item.getAsFile();


                    if (file) {

                        loadHEIC(file);

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
       QUICK QUALITY
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
       CONVERT HEIC → JPG
    ========================================= */

    convertBtn.addEventListener(
        "click",
        async function () {

            if (!heicFile) {

                alert(
                    "Please upload a HEIC image first."
                );

                return;
            }


            if (
                typeof heic2any ===
                "undefined"
            ) {

                alert(
                    "HEIC converter library is not loaded. Please check your internet connection."
                );

                return;
            }


            const quality =
                Number(
                    qualityRange.value
                ) / 100;


            const oldButton =
                convertBtn.innerHTML;


            convertBtn.disabled =
                true;


            convertBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';


            try {

                /*
                 * HEIC → JPEG
                 */

                const converted =
                    await heic2any({

                        blob: heicFile,

                        toType:
                            "image/jpeg",

                        quality:
                            quality

                    });


                const jpegBlob =
                    Array.isArray(converted)
                        ? converted[0]
                        : converted;


                if (!jpegBlob) {

                    throw new Error(
                        "Conversion returned empty data."
                    );
                }


                /*
                 * Load converted JPEG
                 */

                const tempURL =
                    URL.createObjectURL(
                        jpegBlob
                    );


                const img =
                    new Image();


                await new Promise(
                    function (
                        resolve,
                        reject
                    ) {

                        img.onload =
                            resolve;

                        img.onerror =
                            reject;

                        img.src =
                            tempURL;

                    }
                );


                /*
                 * Canvas
                 *
                 * This lets us control
                 * the JPG background.
                 */

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.width =
                    img.naturalWidth;


                canvas.height =
                    img.naturalHeight;


                const ctx =
                    canvas.getContext(
                        "2d"
                    );


                if (!ctx) {

                    URL.revokeObjectURL(
                        tempURL
                    );

                    throw new Error(
                        "Canvas is not supported."
                    );
                }


                /*
                 * White background
                 */

                if (
                    whiteBackground.checked
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


                /*
                 * Draw converted image
                 */

                ctx.drawImage(
                    img,
                    0,
                    0
                );


                /*
                 * Final JPG
                 */

                const finalBlob =
                    await new Promise(
                        function (
                            resolve
                        ) {

                            canvas.toBlob(
                                resolve,
                                "image/jpeg",
                                quality
                            );

                        }
                    );


                URL.revokeObjectURL(
                    tempURL
                );


                if (!finalBlob) {

                    throw new Error(
                        "Unable to create JPG."
                    );
                }


                convertedBlob =
                    finalBlob;


                /*
                 * Result URL
                 */

                if (resultURL) {

                    URL.revokeObjectURL(
                        resultURL
                    );
                }


                resultURL =
                    URL.createObjectURL(
                        finalBlob
                    );


                /*
                 * Result Preview
                 */

                resultImage.src =
                    resultURL;


                resultImage.style.display =
                    "block";


                resultText.style.display =
                    "none";


                /*
                 * Information
                 */

                newSize.textContent =
                    formatSize(
                        finalBlob.size
                    );


                newDimension.textContent =
                    img.naturalWidth +
                    " × " +
                    img.naturalHeight +
                    " px";


                newFormat.textContent =
                    "JPG";


                newQuality.textContent =
                    qualityRange.value +
                    "%";


                /*
                 * Download
                 */

                let baseName =
                    heicFile.name.replace(
                        /\.(heic|heif)$/i,
                        ""
                    );


                if (!baseName) {

                    baseName =
                        "converted-image";
                }


                downloadBtn.href =
                    resultURL;


                downloadBtn.download =
                    baseName +
                    ".jpg";


                downloadBtn.classList.remove(
                    "disabled"
                );


            } catch (error) {

                console.error(
                    "HEIC Conversion Error:",
                    error
                );


                alert(
                    "HEIC conversion failed. Please try another HEIC image."
                );

            }


            convertBtn.disabled =
                false;


            convertBtn.innerHTML =
                oldButton;

        }
    );


    /* =========================================
       RESET SETTINGS
    ========================================= */

    resetSettings.addEventListener(
        "click",
        function () {

            qualityRange.value =
                90;


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

        heicFile = null;

        convertedBlob = null;


        if (resultURL) {

            URL.revokeObjectURL(
                resultURL
            );

            resultURL = null;
        }


        if (previewURL) {

            URL.revokeObjectURL(
                previewURL
            );

            previewURL = null;
        }


        imageWidth = 0;

        imageHeight = 0;


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
            "Upload HEIC Image";


        uploadInfo.style.display =
            "block";


        originalSize.textContent =
            "0 KB";


        originalDimension.textContent =
            "0 × 0 px";


        originalFormat.textContent =
            "-";


        qualityRange.value =
            90;


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


        clearResult();
    }

});