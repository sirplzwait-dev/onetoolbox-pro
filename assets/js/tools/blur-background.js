"use strict";


/* =====================================================
   ONETOOLBOX - BLUR BACKGROUND
===================================================== */


document.addEventListener(
    "DOMContentLoaded",
    () => {

        initBlurBackground();

    }
);



function initBlurBackground() {


    /* ================================================
       ELEMENTS
    ================================================ */

    const imageInput =
        document.getElementById(
            "imageInput"
        );


    const uploadArea =
        document.getElementById(
            "uploadArea"
        );


    const uploadIcon =
        document.getElementById(
            "uploadIcon"
        );


    const uploadText =
        document.getElementById(
            "uploadText"
        );


    const uploadInfo =
        document.getElementById(
            "uploadInfo"
        );


    const originalPreview =
        document.getElementById(
            "originalPreview"
        );


    const originalSize =
        document.getElementById(
            "originalSize"
        );


    const originalDimension =
        document.getElementById(
            "originalDimension"
        );


    const originalFormat =
        document.getElementById(
            "originalFormat"
        );


    const resetBtn =
        document.getElementById(
            "resetBtn"
        );


    const blurRange =
        document.getElementById(
            "blurRange"
        );


    const blurValue =
        document.getElementById(
            "blurValue"
        );


    const optionButtons =
        document.querySelectorAll(
            ".option-btn"
        );


    const colorModeButtons =
        document.querySelectorAll(
            ".color-mode-btn"
        );


    const formatButtons =
        document.querySelectorAll(
            ".format-btn"
        );


    const qualityRange =
        document.getElementById(
            "qualityRange"
        );


    const qualityValue =
        document.getElementById(
            "qualityValue"
        );


    const applyBlurBtn =
        document.getElementById(
            "applyBlurBtn"
        );


    const resetSettings =
        document.getElementById(
            "resetSettings"
        );


    const processingStatus =
        document.getElementById(
            "processingStatus"
        );


    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const resultImage =
        document.getElementById(
            "resultImage"
        );


    const resultText =
        document.getElementById(
            "resultText"
        );


    const newSize =
        document.getElementById(
            "newSize"
        );


    const newDimension =
        document.getElementById(
            "newDimension"
        );


    const newFormat =
        document.getElementById(
            "newFormat"
        );


    const downloadBtn =
        document.getElementById(
            "downloadBtn"
        );



    /* ================================================
       VARIABLES
    ================================================ */

    let originalFile = null;

    let originalImage = null;

    let originalURL = null;

    let resultURL = null;

    let segmentationData = null;

    let outputFormat = "png";

    let blurType = "gaussian";

    let colorMode = "color";

    let model = null;



    /* ================================================
       FORMAT SIZE
    ================================================ */

    function formatSize(bytes) {

        if (!bytes) {
            return "0 KB";
        }


        if (bytes < 1024) {
            return bytes + " B";
        }


        if (
            bytes <
            1024 * 1024
        ) {

            return (
                bytes / 1024
            ).toFixed(2) +
            " KB";
        }


        return (
            bytes /
            (1024 * 1024)
        ).toFixed(2) +
        " MB";
    }



    /* ================================================
       FORMAT
    ================================================ */

    function getFormat(file) {

        if (!file) {
            return "-";
        }


        const name =
            file.name.toLowerCase();


        if (
            name.endsWith(".png")
        ) {

            return "PNG";
        }


        if (
            name.endsWith(".webp")
        ) {

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



    /* ================================================
       URL CLEANUP
    ================================================ */

    function revokeURL(url) {

        if (!url) {
            return;
        }


        try {

            URL.revokeObjectURL(
                url
            );

        } catch (_) {}
    }



    /* ================================================
       IMAGE LOAD
    ================================================ */

    function loadImage(file) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const url =
                    URL.createObjectURL(
                        file
                    );


                const img =
                    new Image();


                img.onload =
                    () => {

                        URL.revokeObjectURL(
                            url
                        );


                        resolve(
                            img
                        );
                    };


                img.onerror =
                    () => {

                        URL.revokeObjectURL(
                            url
                        );


                        reject(
                            new Error(
                                "Image loading failed."
                            )
                        );
                    };


                img.src =
                    url;
            }
        );
    }



    /* ================================================
       SELECT IMAGE
    ================================================ */

    async function selectImage(
        file
    ) {

        if (!file) {
            return;
        }


        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !validTypes.includes(
                file.type
            )
        ) {

            alert(
                "Please choose JPG, PNG or WebP."
            );

            imageInput.value =
                "";

            return;
        }


        try {

            originalFile =
                file;


            originalImage =
                await loadImage(
                    file
                );


            revokeURL(
                originalURL
            );


            originalURL =
                URL.createObjectURL(
                    file
                );


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
                originalImage.naturalWidth +
                " × " +
                originalImage.naturalHeight +
                " px";


            originalFormat.textContent =
                getFormat(
                    file
                );


            segmentationData =
                null;


            clearResult();


            applyBlurBtn.disabled =
                false;


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Unable to open image."
            );
        }
    }



    /* ================================================
       FILE INPUT
    ================================================ */

    imageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (file) {

                selectImage(
                    file
                );
            }
        }
    );



    /* ================================================
       DRAG & DROP
    ================================================ */

    uploadArea.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );
        }
    );


    uploadArea.addEventListener(
        "dragleave",
        () => {

            uploadArea.classList.remove(
                "dragging"
            );
        }
    );


    uploadArea.addEventListener(
        "drop",
        event => {

            event.preventDefault();


            uploadArea.classList.remove(
                "dragging"
            );


            const file =
                event.dataTransfer.files[0];


            if (file) {

                selectImage(
                    file
                );
            }
        }
    );



    /* ================================================
       PASTE
    ================================================ */

    document.addEventListener(
        "paste",
        event => {

            const items =
                event.clipboardData?.items;


            if (!items) {
                return;
            }


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

                        selectImage(
                            file
                        );
                    }


                    break;
                }
            }
        }
    );



    /* ================================================
       BLUR RANGE
    ================================================ */

    blurRange.addEventListener(
        "input",
        () => {

            blurValue.textContent =
                blurRange.value +
                " px";
        }
    );



    /* ================================================
       BLUR TYPE
    ================================================ */

    optionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    optionButtons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    blurType =
                        button.dataset.blur;
                }
            );
        }
    );



    /* ================================================
       COLOR MODE
    ================================================ */

    colorModeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    colorModeButtons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    colorMode =
                        button.dataset.mode;
                }
            );
        }
    );



    /* ================================================
       OUTPUT FORMAT
    ================================================ */

    formatButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    formatButtons.forEach(
                        btn =>
                            btn.classList.remove(
                                "active"
                            )
                    );


                    button.classList.add(
                        "active"
                    );


                    outputFormat =
                        button.dataset.format;


                    newFormat.textContent =
                        outputFormat.toUpperCase();
                }
            );
        }
    );



    /* ================================================
       QUALITY
    ================================================ */

    qualityRange.addEventListener(
        "input",
        () => {

            qualityValue.textContent =
                qualityRange.value +
                "%";
        }
    );



    /* ================================================
       LOAD BODYPIX
    ================================================ */

    async function loadModel() {

        if (model) {
            return model;
        }


        if (
            typeof bodyPix ===
            "undefined"
        ) {

            throw new Error(
                "BodyPix library not loaded."
            );
        }


        showStatus(
            "Loading AI model...",
            "First time may take a little longer."
        );


        model =
            await bodyPix.load(
                {
                    architecture:
                        "MobileNetV1",

                    outputStride:
                        16,

                    multiplier:
                        0.75,

                    quantBytes:
                        2
                }
            );


        return model;
    }



    /* ================================================
       SEGMENT PERSON
    ================================================ */

    async function segmentPerson() {

        const net =
            await loadModel();


        showStatus(
            "Detecting subject...",
            "Finding the main person in the photo."
        );


        segmentationData =
            await net.segmentPerson(
                originalImage,
                {
                    flipHorizontal:
                        false,

                    internalResolution:
                        "medium",

                    segmentationThreshold:
                        0.7
                }
            );


        return segmentationData;
    }



    /* ================================================
       APPLY BLUR
    ================================================ */

    applyBlurBtn.addEventListener(
        "click",
        async () => {

            if (!originalFile) {

                alert(
                    "Please choose a photo first."
                );

                return;
            }


            const oldHTML =
                applyBlurBtn.innerHTML;


            applyBlurBtn.disabled =
                true;


            applyBlurBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';


            try {

                await segmentPerson();


                showStatus(
                    "Applying blur...",
                    "Creating your blurred background."
                );


                const blob =
                    await createBlurredImage();


                showResult(
                    blob
                );


                hideStatus();


            } catch (error) {

                console.error(
                    "Blur error:",
                    error
                );


                alert(
                    "Unable to blur the background.\n\n" +
                    "Please try another clear photo."
                );


                hideStatus();

            } finally {

                applyBlurBtn.disabled =
                    false;


                applyBlurBtn.innerHTML =
                    oldHTML;
            }
        }
    );



    /* ================================================
       CREATE BLURRED IMAGE
    ================================================ */

    async function createBlurredImage() {

        const width =
            originalImage.naturalWidth;


        const height =
            originalImage.naturalHeight;


        /*
         * Limit huge images for browser
         * performance.
         */

        const maxSize =
            2200;


        let scale =
            Math.min(
                1,
                maxSize /
                Math.max(
                    width,
                    height
                )
            );


        const canvasWidth =
            Math.round(
                width * scale
            );


        const canvasHeight =
            Math.round(
                height * scale
            );


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.width =
            canvasWidth;


        canvas.height =
            canvasHeight;


        const ctx =
            canvas.getContext(
                "2d"
            );


        /*
         * Background layer
         */

        ctx.save();


        let blurAmount =
            Number(
                blurRange.value
            );


        /*
         * Different blur types
         */

        if (
            blurType ===
            "box"
        ) {

            blurAmount =
                Math.max(
                    1,
                    blurAmount *
                    0.75
                );
        }


        if (
            blurType ===
            "motion"
        ) {

            blurAmount =
                Math.max(
                    1,
                    blurAmount *
                    1.25
                );
        }


        /*
         * Blur background
         */

        ctx.filter =
            "blur(" +
            blurAmount +
            "px)";


        /*
         * Expand slightly to prevent
         * transparent edges.
         */

        const extra =
            blurAmount * 2;


        ctx.drawImage(
            originalImage,
            -extra,
            -extra,
            canvasWidth +
                extra * 2,
            canvasHeight +
                extra * 2
        );


        ctx.restore();


        /*
         * Grayscale option
         */

        if (
            colorMode ===
            "grayscale"
        ) {

            ctx.save();


            ctx.filter =
                "grayscale(100%)";


            ctx.globalAlpha =
                0.65;


            ctx.drawImage(
                originalImage,
                0,
                0,
                canvasWidth,
                canvasHeight
            );


            ctx.restore();
        }


        /*
         * Subject layer
         */

        const subjectCanvas =
            document.createElement(
                "canvas"
            );


        subjectCanvas.width =
            canvasWidth;


        subjectCanvas.height =
            canvasHeight;


        const subjectCtx =
            subjectCanvas.getContext(
                "2d"
            );


        const maskWidth =
            segmentationData.width;


        const maskHeight =
            segmentationData.height;


        const mask =
            segmentationData.data;


        /*
         * Draw subject only
         */

        const sourceCanvas =
            document.createElement(
                "canvas"
            );


        sourceCanvas.width =
            maskWidth;


        sourceCanvas.height =
            maskHeight;


        const sourceCtx =
            sourceCanvas.getContext(
                "2d"
            );


        sourceCtx.drawImage(
            originalImage,
            0,
            0,
            maskWidth,
            maskHeight
        );


        const sourceData =
            sourceCtx.getImageData(
                0,
                0,
                maskWidth,
                maskHeight
            );


        /*
         * Make non-person pixels
         * transparent.
         */

        for (
            let i = 0;
            i < mask.length;
            i++
        ) {

            const pixel =
                i * 4;


            if (
                mask[i] === 0
            ) {

                sourceData.data[
                    pixel + 3
                ] = 0;

            } else {

                /*
                 * Slight edge softness.
                 */

                sourceData.data[
                    pixel + 3
                ] = 255;
            }
        }


        sourceCtx.putImageData(
            sourceData,
            0,
            0
        );


        /*
         * Draw sharp subject
         */

        subjectCtx.drawImage(
            sourceCanvas,
            0,
            0,
            canvasWidth,
            canvasHeight
        );


        /*
         * Composite subject
         */

        ctx.drawImage(
            subjectCanvas,
            0,
            0
        );


        /*
         * Convert to Blob
         */

        const mime =
            outputFormat === "jpg"
                ? "image/jpeg"
                : "image/png";


        /*
         * JPG must have a solid
         * background.
         */

        if (
            outputFormat ===
            "jpg"
        ) {

            const jpgCanvas =
                document.createElement(
                    "canvas"
                );


            jpgCanvas.width =
                canvasWidth;


            jpgCanvas.height =
                canvasHeight;


            const jpgCtx =
                jpgCanvas.getContext(
                    "2d"
                );


            jpgCtx.fillStyle =
                "#ffffff";


            jpgCtx.fillRect(
                0,
                0,
                canvasWidth,
                canvasHeight
            );


            jpgCtx.drawImage(
                canvas,
                0,
                0
            );


            return canvasToBlob(
                jpgCanvas,
                mime,
                Number(
                    qualityRange.value
                ) / 100
            );
        }


        return canvasToBlob(
            canvas,
            mime,
            Number(
                qualityRange.value
            ) / 100
        );
    }



    /* ================================================
       CANVAS TO BLOB
    ================================================ */

    function canvasToBlob(
        canvas,
        type,
        quality
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                canvas.toBlob(
                    blob => {

                        if (!blob) {

                            reject(
                                new Error(
                                    "Image conversion failed."
                                )
                            );

                            return;
                        }


                        resolve(
                            blob
                        );

                    },
                    type,
                    quality
                );
            }
        );
    }



    /* ================================================
       SHOW RESULT
    ================================================ */

    function showResult(
        blob
    ) {

        revokeURL(
            resultURL
        );


        resultURL =
            URL.createObjectURL(
                blob
            );


        resultImage.src =
            resultURL;


        resultImage.style.display =
            "block";


        resultText.style.display =
            "none";


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
            outputFormat.toUpperCase();


        let fileName =
            originalFile.name.replace(
                /\.(jpg|jpeg|png|webp)$/i,
                ""
            );


        if (!fileName) {

            fileName =
                "blur-background";
        }


        downloadBtn.href =
            resultURL;


        downloadBtn.download =
            fileName +
            "-blurred." +
            outputFormat;


        downloadBtn.classList.remove(
            "disabled"
        );
    }



    /* ================================================
       CLEAR RESULT
    ================================================ */

    function clearResult() {

        revokeURL(
            resultURL
        );


        resultURL =
            null;


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
            outputFormat.toUpperCase();


        downloadBtn.href =
            "#";


        downloadBtn.removeAttribute(
            "download"
        );


        downloadBtn.classList.add(
            "disabled"
        );
    }



    /* ================================================
       STATUS
    ================================================ */

    function showStatus(
        title,
        message
    ) {

        processingStatus.style.display =
            "flex";


        statusMessage.textContent =
            title +
            " — " +
            message;
    }


    function hideStatus() {

        processingStatus.style.display =
            "none";
    }



    /* ================================================
       RESET SETTINGS
    ================================================ */

    resetSettings.addEventListener(
        "click",
        () => {

            blurRange.value =
                15;


            blurValue.textContent =
                "15 px";


            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            blurType =
                "gaussian";


            colorMode =
                "color";


            outputFormat =
                "png";


            optionButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.blur ===
                        "gaussian"
                    );
                }
            );


            colorModeButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.mode ===
                        "color"
                    );
                }
            );


            formatButtons.forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.format ===
                        "png"
                    );
                }
            );


            clearResult();
        }
    );



    /* ================================================
       FULL RESET
    ================================================ */

    resetBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            event.stopPropagation();

            resetAll();
        }
    );


    function resetAll() {

        originalFile =
            null;


        originalImage =
            null;


        segmentationData =
            null;


        revokeURL(
            originalURL
        );


        revokeURL(
            resultURL
        );


        originalURL =
            null;


        resultURL =
            null;


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


        uploadInfo.style.display =
            "block";


        originalSize.textContent =
            "0 KB";


        originalDimension.textContent =
            "0 × 0 px";


        originalFormat.textContent =
            "-";


        applyBlurBtn.disabled =
            true;


        clearResult();

        hideStatus();
    }

}