"use strict";

/*
=====================================================
ONETOOLBOX
CHANGE BACKGROUND
=====================================================
*/


/* ==================================================
   LOAD IMG.LY DYNAMICALLY
================================================== */

let removeBackgroundLibrary = null;

let libraryPromise = null;


async function loadBackgroundRemovalLibrary() {

    if (removeBackgroundLibrary) {
        return removeBackgroundLibrary;
    }


    if (libraryPromise) {
        return libraryPromise;
    }


    libraryPromise = import(
        "https://esm.sh/@imgly/background-removal@1.7.0"
    )
    .then(module => {

        const fn =
            module.default ||
            module.removeBackground;


        if (typeof fn !== "function") {

            throw new Error(
                "Background removal function was not found."
            );
        }


        removeBackgroundLibrary = fn;

        return fn;
    })
    .catch(error => {

        libraryPromise = null;

        console.error(
            "IMG.LY loading error:",
            error
        );

        throw error;
    });


    return libraryPromise;
}



/* ==================================================
   DOM READY
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initChangeBackground();

    }
);



/* ==================================================
   MAIN
================================================== */

function initChangeBackground() {


    /* ==============================================
       ELEMENTS
    ============================================== */

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


    const removeBackgroundBtn =
        document.getElementById(
            "removeBackgroundBtn"
        );


    const processingStatus =
        document.getElementById(
            "processingStatus"
        );


    const statusTitle =
        document.getElementById(
            "statusTitle"
        );


    const statusMessage =
        document.getElementById(
            "statusMessage"
        );


    const backgroundSettings =
        document.getElementById(
            "backgroundSettings"
        );


    const backgroundTypeButtons =
        document.querySelectorAll(
            ".background-type-btn"
        );


    const colorSettings =
        document.getElementById(
            "colorSettings"
        );


    const backgroundImageSettings =
        document.getElementById(
            "backgroundImageSettings"
        );


    const transparentInfo =
        document.getElementById(
            "transparentInfo"
        );


    const backgroundColor =
        document.getElementById(
            "backgroundColor"
        );


    const backgroundColorText =
        document.getElementById(
            "backgroundColorText"
        );


    const colorButtons =
        document.querySelectorAll(
            ".color-btn"
        );


    const backgroundImageInput =
        document.getElementById(
            "backgroundImageInput"
        );


    const backgroundImagePreview =
        document.getElementById(
            "backgroundImagePreview"
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


    const applyBackgroundBtn =
        document.getElementById(
            "applyBackgroundBtn"
        );


    const resetSettings =
        document.getElementById(
            "resetSettings"
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



    /* ==============================================
       VARIABLES
    ============================================== */

    let originalFile =
        null;


    let originalImage =
        null;


    let removedBackgroundBlob =
        null;


    let backgroundImage =
        null;


    let originalPreviewURL =
        null;


    let backgroundImageURL =
        null;


    let resultURL =
        null;


    let backgroundType =
        "color";


    let outputFormat =
        "png";


    let selectedColor =
        "#ffffff";


    let imageWidth =
        0;


    let imageHeight =
        0;



    /* ==============================================
       HELPERS
    ============================================== */

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
            bytes /
            (1024 * 1024)
        ).toFixed(2) + " MB";
    }



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



    function revokeURL(url) {

        if (url) {

            try {
                URL.revokeObjectURL(url);
            } catch (_) {}

        }
    }



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



    /* ==============================================
       STATUS
    ============================================== */

    function showStatus(
        title,
        message
    ) {

        processingStatus.style.display =
            "flex";


        statusTitle.textContent =
            title;


        statusMessage.textContent =
            message;
    }



    function hideStatus() {

        processingStatus.style.display =
            "none";
    }



    /* ==============================================
       LOAD IMAGE
    ============================================== */

    function loadImageFromURL(
        url
    ) {

        return new Promise(
            (
                resolve,
                reject
            ) => {

                const img =
                    new Image();


                img.onload =
                    () => {

                        resolve(
                            img
                        );
                    };


                img.onerror =
                    () => {

                        reject(
                            new Error(
                                "Image could not be loaded."
                            )
                        );
                    };


                img.src =
                    url;
            }
        );
    }



    function loadImageFromFile(
        file
    ) {

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
                                "Unable to load image."
                            )
                        );
                    };


                img.src =
                    url;
            }
        );
    }



    /* ==============================================
       SELECT PHOTO
    ============================================== */

    async function selectPhoto(
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


        const fileName =
            file.name.toLowerCase();


        const validExtension =
            fileName.endsWith(".jpg") ||
            fileName.endsWith(".jpeg") ||
            fileName.endsWith(".png") ||
            fileName.endsWith(".webp");


        if (
            !validTypes.includes(
                file.type
            ) &&
            !validExtension
        ) {

            alert(
                "Please choose JPG, JPEG, PNG or WebP."
            );

            imageInput.value =
                "";

            return;
        }


        try {

            originalFile =
                file;


            originalImage =
                await loadImageFromFile(
                    file
                );


            imageWidth =
                originalImage.naturalWidth;


            imageHeight =
                originalImage.naturalHeight;


            revokeURL(
                originalPreviewURL
            );


            originalPreviewURL =
                URL.createObjectURL(
                    file
                );


            originalPreview.src =
                originalPreviewURL;


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
                imageWidth +
                " × " +
                imageHeight +
                " px";


            originalFormat.textContent =
                getFormat(
                    file
                );


            removedBackgroundBlob =
                null;


            clearResult();


            backgroundSettings.style.display =
                "none";


            applyBackgroundBtn.disabled =
                true;


            removeBackgroundBtn.disabled =
                false;


            hideStatus();

        } catch (error) {

            console.error(
                error
            );


            alert(
                "Unable to open this image."
            );
        }
    }



    /* ==============================================
       CHOOSE PHOTO
    ============================================== */

    imageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (file) {

                selectPhoto(
                    file
                );
            }
        }
    );



    /* ==============================================
       DRAG DROP
    ============================================== */

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

                selectPhoto(
                    file
                );
            }
        }
    );



    /* ==============================================
       PASTE
    ============================================== */

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

                        selectPhoto(
                            file
                        );
                    }


                    break;
                }
            }
        }
    );



    /* ==============================================
       REMOVE BACKGROUND
    ============================================== */

    removeBackgroundBtn.addEventListener(
        "click",
        async () => {

            if (!originalFile) {

                alert(
                    "Please choose a photo first."
                );

                return;
            }


            const oldHTML =
                removeBackgroundBtn.innerHTML;


            removeBackgroundBtn.disabled =
                true;


            removeBackgroundBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';


            showStatus(
                "Loading AI model",
                "First time may take a little longer..."
            );


            try {

                const removeBackground =
                    await loadBackgroundRemovalLibrary();


                showStatus(
                    "Removing background",
                    "Please wait while your photo is processed..."
                );


                const result =
                    await removeBackground(
                        originalFile,
                        {
                            progress:
                                (
                                    key,
                                    current,
                                    total
                                ) => {

                                    if (
                                        total > 0
                                    ) {

                                        const percent =
                                            Math.round(
                                                (
                                                    current /
                                                    total
                                                ) *
                                                100
                                            );


                                        statusMessage.textContent =
                                            "Processing " +
                                            percent +
                                            "%...";
                                    }
                                }
                        }
                    );


                if (!result) {

                    throw new Error(
                        "No result received."
                    );
                }


                removedBackgroundBlob =
                    result;


                backgroundSettings.style.display =
                    "block";


                setBackgroundType(
                    "color"
                );


                applyBackgroundBtn.disabled =
                    false;


                /*
                 * Show removed subject
                 */

                revokeURL(
                    resultURL
                );


                resultURL =
                    URL.createObjectURL(
                        result
                    );


                resultImage.src =
                    resultURL;


                resultImage.style.display =
                    "block";


                resultText.style.display =
                    "none";


                newSize.textContent =
                    formatSize(
                        result.size
                    );


                newDimension.textContent =
                    imageWidth +
                    " × " +
                    imageHeight +
                    " px";


                newFormat.textContent =
                    "PNG";


                downloadBtn.classList.add(
                    "disabled"
                );


                showStatus(
                    "Background removed",
                    "Now choose your new background."
                );


                setTimeout(
                    hideStatus,
                    1800
                );


            } catch (error) {

                console.error(
                    "Background removal error:",
                    error
                );


                showStatus(
                    "Processing failed",
                    "Please check your internet connection and try again."
                );


                alert(
                    "Background removal failed.\n\n" +
                    "Please make sure you are connected to the internet and try again."
                );

            } finally {

                removeBackgroundBtn.disabled =
                    false;


                removeBackgroundBtn.innerHTML =
                    oldHTML;
            }
        }
    );



    /* ==============================================
       BACKGROUND TYPE
    ============================================== */

    backgroundTypeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    setBackgroundType(
                        button.dataset.type
                    );
                }
            );
        }
    );



    function setBackgroundType(
        type
    ) {

        backgroundType =
            type;


        backgroundTypeButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.type ===
                    type
                );
            }
        );


        colorSettings.style.display =
            type === "color"
                ? "block"
                : "none";


        backgroundImageSettings.style.display =
            type === "image"
                ? "block"
                : "none";


        transparentInfo.style.display =
            type === "transparent"
                ? "block"
                : "none";


        if (
            type === "transparent"
        ) {

            outputFormat =
                "png";


            updateFormatButtons();
        }
    }



    /* ==============================================
       COLOR
    ============================================== */

    backgroundColor.addEventListener(
        "input",
        () => {

            selectedColor =
                backgroundColor.value;


            backgroundColorText.value =
                selectedColor;


            updateColorButtons();
        }
    );


    backgroundColorText.addEventListener(
        "input",
        () => {

            let value =
                backgroundColorText.value.trim();


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

                selectedColor =
                    value;


                backgroundColor.value =
                    value;


                updateColorButtons();
            }
        }
    );



    /* ==============================================
       QUICK COLORS
    ============================================== */

    colorButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    selectedColor =
                        button.dataset.color;


                    backgroundColor.value =
                        selectedColor;


                    backgroundColorText.value =
                        selectedColor;


                    updateColorButtons();
                }
            );
        }
    );


    function updateColorButtons() {

        colorButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.color.toLowerCase() ===
                    selectedColor.toLowerCase()
                );
            }
        );
    }



    /* ==============================================
       BACKGROUND IMAGE
    ============================================== */

    backgroundImageInput.addEventListener(
        "change",
        async event => {

            const file =
                event.target.files[0];


            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please choose a valid image."
                );

                backgroundImageInput.value =
                    "";

                return;
            }


            try {

                backgroundImage =
                    await loadImageFromFile(
                        file
                    );


                revokeURL(
                    backgroundImageURL
                );


                backgroundImageURL =
                    URL.createObjectURL(
                        file
                    );


                backgroundImagePreview.src =
                    backgroundImageURL;


                backgroundImagePreview.style.display =
                    "block";

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Unable to load background image."
                );
            }
        }
    );



    /* ==============================================
       FORMAT
    ============================================== */

    formatButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const format =
                        button.dataset.format;


                    if (
                        backgroundType ===
                        "transparent" &&
                        format ===
                        "jpg"
                    ) {

                        alert(
                            "Transparent background requires PNG."
                        );

                        return;
                    }


                    outputFormat =
                        format;


                    updateFormatButtons();
                }
            );
        }
    );


    function updateFormatButtons() {

        formatButtons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.format ===
                    outputFormat
                );
            }
        );
    }



    /* ==============================================
       QUALITY
    ============================================== */

    qualityRange.addEventListener(
        "input",
        () => {

            qualityValue.textContent =
                qualityRange.value +
                "%";
        }
    );



    /* ==============================================
       APPLY BACKGROUND
    ============================================== */

    applyBackgroundBtn.addEventListener(
        "click",
        async () => {

            if (
                !removedBackgroundBlob
            ) {

                alert(
                    "Please remove the background first."
                );

                return;
            }


            if (
                backgroundType === "image" &&
                !backgroundImage
            ) {

                alert(
                    "Please choose a background image."
                );

                return;
            }


            const oldHTML =
                applyBackgroundBtn.innerHTML;


            applyBackgroundBtn.disabled =
                true;


            applyBackgroundBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Applying...';


            try {

                const blob =
                    await createFinalImage();


                showFinalResult(
                    blob
                );


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "Unable to create final image."
                );

            } finally {

                applyBackgroundBtn.disabled =
                    false;


                applyBackgroundBtn.innerHTML =
                    oldHTML;
            }
        }
    );



    /* ==============================================
       CREATE FINAL IMAGE
    ============================================== */

    async function createFinalImage() {

        const subjectURL =
            URL.createObjectURL(
                removedBackgroundBlob
            );


        const subjectImage =
            await loadImageFromURL(
                subjectURL
            );


        revokeURL(
            subjectURL
        );


        const width =
            subjectImage.naturalWidth;


        const height =
            subjectImage.naturalHeight;


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

            throw new Error(
                "Canvas not supported."
            );
        }


        /*
         * COLOR
         */

        if (
            backgroundType ===
            "color"
        ) {

            ctx.fillStyle =
                selectedColor;


            ctx.fillRect(
                0,
                0,
                width,
                height
            );
        }


        /*
         * IMAGE
         */

        if (
            backgroundType ===
            "image"
        ) {

            drawCoverImage(
                ctx,
                backgroundImage,
                width,
                height
            );
        }


        /*
         * TRANSPARENT
         */

        if (
            backgroundType ===
            "transparent"
        ) {

            ctx.clearRect(
                0,
                0,
                width,
                height
            );
        }


        /*
         * Subject
         */

        ctx.drawImage(
            subjectImage,
            0,
            0,
            width,
            height
        );


        /*
         * MIME
         */

        const mime =
            outputFormat === "jpg"
                ? "image/jpeg"
                : "image/png";


        /*
         * JPEG cannot contain
         * transparency.
         */

        if (
            outputFormat === "jpg"
        ) {

            /*
             * Transparent → white.
             */

            if (
                backgroundType ===
                "transparent"
            ) {

                const jpgCanvas =
                    document.createElement(
                        "canvas"
                    );


                jpgCanvas.width =
                    width;


                jpgCanvas.height =
                    height;


                const jpgCtx =
                    jpgCanvas.getContext(
                        "2d"
                    );


                jpgCtx.fillStyle =
                    "#ffffff";


                jpgCtx.fillRect(
                    0,
                    0,
                    width,
                    height
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
        }


        return canvasToBlob(
            canvas,
            mime,
            Number(
                qualityRange.value
            ) / 100
        );
    }



    /* ==============================================
       COVER BACKGROUND
    ============================================== */

    function drawCoverImage(
        ctx,
        img,
        canvasWidth,
        canvasHeight
    ) {

        const imgWidth =
            img.naturalWidth;


        const imgHeight =
            img.naturalHeight;


        const scale =
            Math.max(
                canvasWidth / imgWidth,
                canvasHeight / imgHeight
            );


        const drawWidth =
            imgWidth *
            scale;


        const drawHeight =
            imgHeight *
            scale;


        const x =
            (
                canvasWidth -
                drawWidth
            ) / 2;


        const y =
            (
                canvasHeight -
                drawHeight
            ) / 2;


        ctx.drawImage(
            img,
            x,
            y,
            drawWidth,
            drawHeight
        );
    }



    /* ==============================================
       CANVAS → BLOB
    ============================================== */

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
                                    "Canvas conversion failed."
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



    /* ==============================================
       SHOW RESULT
    ============================================== */

    function showFinalResult(
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
            imageWidth +
            " × " +
            imageHeight +
            " px";


        newFormat.textContent =
            outputFormat.toUpperCase();


        let baseName =
            originalFile.name.replace(
                /\.(jpg|jpeg|png|webp)$/i,
                ""
            );


        if (!baseName) {

            baseName =
                "background-changed";
        }


        downloadBtn.href =
            resultURL;


        downloadBtn.download =
            baseName +
            "-background." +
            outputFormat;


        downloadBtn.classList.remove(
            "disabled"
        );
    }



    /* ==============================================
       RESET SETTINGS
    ============================================== */

    resetSettings.addEventListener(
        "click",
        () => {

            backgroundType =
                "color";


            outputFormat =
                "png";


            selectedColor =
                "#ffffff";


            backgroundColor.value =
                "#ffffff";


            backgroundColorText.value =
                "#ffffff";


            qualityRange.value =
                90;


            qualityValue.textContent =
                "90%";


            backgroundImage =
                null;


            backgroundImageInput.value =
                "";


            revokeURL(
                backgroundImageURL
            );


            backgroundImageURL =
                null;


            backgroundImagePreview.src =
                "";


            backgroundImagePreview.style.display =
                "none";


            setBackgroundType(
                "color"
            );


            updateFormatButtons();

            updateColorButtons();

            clearResult();
        }
    );



    /* ==============================================
       FULL RESET
    ============================================== */

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


        removedBackgroundBlob =
            null;


        backgroundImage =
            null;


        revokeURL(
            originalPreviewURL
        );


        revokeURL(
            backgroundImageURL
        );


        revokeURL(
            resultURL
        );


        originalPreviewURL =
            null;


        backgroundImageURL =
            null;


        resultURL =
            null;


        imageInput.value =
            "";


        backgroundImageInput.value =
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


        backgroundSettings.style.display =
            "none";


        applyBackgroundBtn.disabled =
            true;


        backgroundImagePreview.src =
            "";


        backgroundImagePreview.style.display =
            "none";


        backgroundType =
            "color";


        outputFormat =
            "png";


        selectedColor =
            "#ffffff";


        backgroundColor.value =
            "#ffffff";


        backgroundColorText.value =
            "#ffffff";


        qualityRange.value =
            90;


        qualityValue.textContent =
            "90%";


        setBackgroundType(
            "color"
        );


        updateFormatButtons();

        updateColorButtons();

        clearResult();

        hideStatus();
    }



    /* ==============================================
       INITIAL STATE
    ============================================== */

    setBackgroundType(
        "color"
    );


    updateFormatButtons();

    updateColorButtons();

}