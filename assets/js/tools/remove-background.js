// ==========================================
// OneToolBox
// AI Background Remover
// Browser-Side IMG.LY
// ==========================================


// ==========================================
// Import IMG.LY
// ==========================================

import {
    removeBackground
} from "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.0/dist/index.mjs";


// ==========================================
// Elements
// ==========================================

const uploadArea =
    document.getElementById("uploadArea");

const imageInput =
    document.getElementById("imageInput");

const selectBtn =
    document.getElementById("selectBtn");


const beforeImg =
    document.getElementById("beforeImg");

const afterImg =
    document.getElementById("afterImg");


const removeBgBtn =
    document.getElementById("removeBgBtn");

const resetBtn =
    document.getElementById("resetBtn");

const downloadBtn =
    document.getElementById("downloadBtn");


const loader =
    document.getElementById("loader");

const processingText =
    document.getElementById("processingText");

const processingMessage =
    document.getElementById("processingMessage");


const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");


const fileSize =
    document.getElementById("fileSize");

const resolution =
    document.getElementById("resolution");

const statusText =
    document.getElementById("statusText");

const resultPlaceholder =
    document.getElementById("resultPlaceholder");


// ==========================================
// State
// ==========================================

let selectedFile = null;

let originalObjectURL = null;

let resultObjectURL = null;

let processing = false;


// ==========================================
// Select Image
// ==========================================

selectBtn?.addEventListener(
    "click",
    () => {

        if (processing) {
            return;
        }

        imageInput?.click();

    }
);


// ==========================================
// File Selection
// ==========================================

imageInput?.addEventListener(
    "change",
    event => {

        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        loadImage(file);

    }
);


// ==========================================
// Load Image
// ==========================================

function loadImage(file) {

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image file."
        );

        return;
    }


    selectedFile = file;


    // Revoke previous URL

    if (originalObjectURL) {

        URL.revokeObjectURL(
            originalObjectURL
        );

    }


    originalObjectURL =
        URL.createObjectURL(file);


    beforeImg.src =
        originalObjectURL;


    beforeImg.style.display =
        "block";


    afterImg.src = "";

    afterImg.style.display =
        "none";


    resultPlaceholder.style.display =
        "none";


    downloadBtn.style.display =
        "none";


    fileSize.textContent =
        formatFileSize(file.size);


    statusText.textContent =
        "Ready";


    progressBar.style.width =
        "0%";


    progressText.textContent =
        "Ready";


    const image =
        new Image();


    image.onload = () => {

        resolution.textContent =
            `${image.width} × ${image.height}`;

    };


    image.src =
        originalObjectURL;

}


// ==========================================
// File Size
// ==========================================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            (bytes / 1024).toFixed(1) +
            " KB"
        );

    }


    return (
        (bytes / (1024 * 1024)).toFixed(2) +
        " MB"
    );

}


// ==========================================
// Drag & Drop
// ==========================================

uploadArea?.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        if (processing) {
            return;
        }

        uploadArea.classList.add(
            "dragover"
        );

    }
);


uploadArea?.addEventListener(
    "dragleave",
    () => {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


uploadArea?.addEventListener(
    "drop",
    event => {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragover"
        );


        if (processing) {
            return;
        }


        const file =
            event.dataTransfer.files?.[0];


        if (!file) {
            return;
        }


        loadImage(file);

    }
);


// ==========================================
// Paste Image
// ==========================================

document.addEventListener(
    "paste",
    event => {

        if (processing) {
            return;
        }


        const items =
            event.clipboardData?.items;


        if (!items) {
            return;
        }


        for (const item of items) {

            if (
                item.type &&
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


// ==========================================
// Progress Handler
// ==========================================

function updateProgress(
    key,
    current,
    total
) {

    if (!progressBar) {
        return;
    }


    if (
        typeof current === "number" &&
        typeof total === "number" &&
        total > 0
    ) {

        const percent =
            Math.min(
                100,
                Math.max(
                    0,
                    (current / total) * 100
                )
            );


        progressBar.style.width =
            `${percent.toFixed(0)}%`;


        progressText.textContent =
            `${percent.toFixed(0)}%`;

    }


    if (key === "compute") {

        processingMessage.textContent =
            "AI is removing the background...";

    }

    else if (key === "fetch") {

        processingMessage.textContent =
            "Loading AI model...";

    }

    else {

        processingMessage.textContent =
            "Preparing AI...";

    }

}


// ==========================================
// Remove Background
// ==========================================

removeBgBtn?.addEventListener(
    "click",
    async () => {

        if (processing) {
            return;
        }


        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;
        }


        processing = true;


        removeBgBtn.disabled =
            true;


        selectBtn.disabled =
            true;


        resetBtn.disabled =
            true;


        loader.style.display =
            "block";


        processingText.style.display =
            "block";


        resultPlaceholder.style.display =
            "none";


        downloadBtn.style.display =
            "none";


        statusText.textContent =
            "Starting AI...";


        processingMessage.textContent =
            "Preparing AI model...";


        progressBar.style.width =
            "0%";


        progressText.textContent =
            "Starting...";


        try {


            // ==================================
            // IMG.LY Processing
            // ==================================

            const resultBlob =
                await removeBackground(
                    selectedFile,
                    {

                        // Model files are loaded
                        // from IMG.LY CDN

                        publicPath:
                            "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.0.0/dist/",


                        // Progress

                        progress:
                            (
                                key,
                                current,
                                total
                            ) => {

                                updateProgress(
                                    key,
                                    current,
                                    total
                                );

                            },


                        // PNG output

                        output: {

                            format: "image/png",

                            type: "foreground",

                            quality: 1

                        },


                        // Debug disabled

                        debug: false

                    }
                );


            // ==================================
            // Check Result
            // ==================================

            if (!resultBlob) {

                throw new Error(
                    "AI did not return an image."
                );

            }


            // ==================================
            // Revoke Old Result
            // ==================================

            if (resultObjectURL) {

                URL.revokeObjectURL(
                    resultObjectURL
                );

            }


            // ==================================
            // Create Result URL
            // ==================================

            resultObjectURL =
                URL.createObjectURL(
                    resultBlob
                );


            // ==================================
            // Show Result
            // ==================================

            afterImg.src =
                resultObjectURL;


            afterImg.style.display =
                "block";


            resultPlaceholder.style.display =
                "none";


            downloadBtn.href =
                resultObjectURL;


            downloadBtn.download =
                "removed-background.png";


            downloadBtn.style.display =
                "flex";


            progressBar.style.width =
                "100%";


            progressText.textContent =
                "100%";


            processingMessage.textContent =
                "Background removed successfully!";


            statusText.textContent =
                "Completed";


        }


        catch (error) {

            console.error(
                "IMG.LY Background Removal Error:",
                error
            );


            statusText.textContent =
                "Failed";


            processingMessage.textContent =
                "Background removal failed.";


            progressText.textContent =
                "Error";


            alert(
                "Background removal failed.\n\n" +
                (
                    error?.message ||
                    "Unknown error"
                )
            );

        }


        finally {

            processing = false;


            removeBgBtn.disabled =
                false;


            selectBtn.disabled =
                false;


            resetBtn.disabled =
                false;


            loader.style.display =
                "none";


            processingText.style.display =
                "block";

        }

    }
);


// ==========================================
// Reset
// ==========================================

resetBtn?.addEventListener(
    "click",
    () => {

        if (processing) {
            return;
        }


        selectedFile = null;


        if (imageInput) {

            imageInput.value = "";

        }


        if (originalObjectURL) {

            URL.revokeObjectURL(
                originalObjectURL
            );

            originalObjectURL =
                null;

        }


        if (resultObjectURL) {

            URL.revokeObjectURL(
                resultObjectURL
            );

            resultObjectURL =
                null;

        }


        beforeImg.src = "";

        beforeImg.style.display =
            "none";


        afterImg.src = "";

        afterImg.style.display =
            "none";


        resultPlaceholder.style.display =
            "block";


        downloadBtn.style.display =
            "none";


        fileSize.textContent =
            "0 KB";


        resolution.textContent =
            "0 × 0";


        statusText.textContent =
            "Waiting...";


        processingMessage.textContent =
            "Preparing AI...";


        progressText.textContent =
            "Ready";


        progressBar.style.width =
            "0%";

    }
);


// ==========================================
// Page Cleanup
// ==========================================

window.addEventListener(
    "beforeunload",
    () => {

        if (originalObjectURL) {

            URL.revokeObjectURL(
                originalObjectURL
            );

        }


        if (resultObjectURL) {

            URL.revokeObjectURL(
                resultObjectURL
            );

        }

    }
);


// ==========================================
// Startup
// ==========================================

console.log(
    "OneToolBox AI Background Remover Loaded"
);