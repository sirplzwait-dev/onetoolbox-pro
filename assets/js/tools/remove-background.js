// ==========================================
// OneToolBox
// AI Background Remover
// Browser-Side IMG.LY
// FINAL VERSION
// ==========================================


// ==========================================
// Import IMG.LY
// ==========================================
//
// IMPORTANT:
// Do NOT use:
// @1.0.0/dist/index.mjs
//
// Do NOT use:
// publicPath: "...@1.0.0/dist/"
//
// IMG.LY default asset path will be used.
//

import { removeBackground } from
    "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";


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
// Helper - Safe Text
// ==========================================

function setText(element, text) {

    if (element) {

        element.textContent = text;

    }

}


// ==========================================
// Helper - File Size
// ==========================================

function formatFileSize(bytes) {

    if (!bytes) {

        return "0 KB";

    }


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
// Select Image Button
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
// File Input
// ==========================================

imageInput?.addEventListener(
    "change",
    (event) => {

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

    if (!file) {

        return;

    }


    // Check image

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;

    }


    // ======================================
    // Revoke old original URL
    // ======================================

    if (originalObjectURL) {

        URL.revokeObjectURL(
            originalObjectURL
        );

        originalObjectURL = null;

    }


    // ======================================
    // Revoke old result URL
    // ======================================

    if (resultObjectURL) {

        URL.revokeObjectURL(
            resultObjectURL
        );

        resultObjectURL = null;

    }


    // ======================================
    // Save file
    // ======================================

    selectedFile = file;


    // ======================================
    // Create original URL
    // ======================================

    originalObjectURL =
        URL.createObjectURL(file);


    // ======================================
    // Show original image
    // ======================================

    if (beforeImg) {

        beforeImg.src =
            originalObjectURL;

        beforeImg.style.display =
            "block";

    }


    // ======================================
    // Hide previous result
    // ======================================

    if (afterImg) {

        afterImg.src = "";

        afterImg.style.display =
            "none";

    }


    // ======================================
    // Hide download
    // ======================================

    if (downloadBtn) {

        downloadBtn.style.display =
            "none";

        downloadBtn.removeAttribute(
            "href"
        );

    }


    // ======================================
    // Hide placeholder
    // ======================================

    if (resultPlaceholder) {

        resultPlaceholder.style.display =
            "none";

    }


    // ======================================
    // File size
    // ======================================

    setText(
        fileSize,
        formatFileSize(file.size)
    );


    // ======================================
    // Status
    // ======================================

    setText(
        statusText,
        "Ready"
    );


    // ======================================
    // Progress reset
    // ======================================

    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    setText(
        progressText,
        "Ready"
    );


    // ======================================
    // Get Resolution
    // ======================================

    const image =
        new Image();


    image.onload = () => {

        setText(
            resolution,
            `${image.width} × ${image.height}`
        );

    };


    image.onerror = () => {

        setText(
            resolution,
            "Unknown"
        );

    };


    image.src =
        originalObjectURL;

}


// ==========================================
// Drag Over
// ==========================================

uploadArea?.addEventListener(
    "dragover",
    (event) => {

        event.preventDefault();


        if (processing) {

            return;

        }


        uploadArea.classList.add(
            "dragover"
        );

    }
);


// ==========================================
// Drag Leave
// ==========================================

uploadArea?.addEventListener(
    "dragleave",
    () => {

        uploadArea.classList.remove(
            "dragover"
        );

    }
);


// ==========================================
// Drop
// ==========================================

uploadArea?.addEventListener(
    "drop",
    (event) => {

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
    (event) => {

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
// Progress
// ==========================================

function updateProgress(
    key,
    current,
    total
) {

    // --------------------------------------
    // Percentage
    // --------------------------------------

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


        if (progressBar) {

            progressBar.style.width =
                `${percent.toFixed(0)}%`;

        }


        setText(
            progressText,
            `${percent.toFixed(0)}%`
        );

    }


    // --------------------------------------
    // Message
    // --------------------------------------

    if (key === "fetch") {

        setText(
            processingMessage,
            "Loading AI model..."
        );

    }

    else if (key === "compute") {

        setText(
            processingMessage,
            "AI is removing the background..."
        );

    }

    else {

        setText(
            processingMessage,
            "Preparing AI..."
        );

    }

}


// ==========================================
// Remove Background
// ==========================================

removeBgBtn?.addEventListener(
    "click",
    async () => {

        // ==================================
        // Already processing
        // ==================================

        if (processing) {

            return;

        }


        // ==================================
        // No image
        // ==================================

        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;

        }


        // ==================================
        // Start
        // ==================================

        processing = true;


        // ==================================
        // Disable buttons
        // ==================================

        if (removeBgBtn) {

            removeBgBtn.disabled =
                true;

        }


        if (selectBtn) {

            selectBtn.disabled =
                true;

        }


        if (resetBtn) {

            resetBtn.disabled =
                true;

        }


        // ==================================
        // Processing UI
        // ==================================

        if (loader) {

            loader.style.display =
                "block";

        }


        if (processingText) {

            processingText.style.display =
                "block";

        }


        if (resultPlaceholder) {

            resultPlaceholder.style.display =
                "none";

        }


        if (downloadBtn) {

            downloadBtn.style.display =
                "none";

        }


        setText(
            statusText,
            "Starting AI..."
        );


        setText(
            processingMessage,
            "Loading AI model..."
        );


        setText(
            progressText,
            "Starting..."
        );


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }


        try {

            // ==================================
            // IMG.LY
            // ==================================
            //
            // IMPORTANT:
            //
            // No publicPath here.
            //
            // No Netlify Function.
            //
            // No Hugging Face.
            //
            // No fetch().
            //
            // IMG.LY handles model assets.
            // ==================================

            const resultBlob =
                await removeBackground(
                    selectedFile,
                    {

                        // --------------------------
                        // Progress
                        // --------------------------

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


                        // --------------------------
                        // Debug
                        // --------------------------

                        debug: false,


                        // --------------------------
                        // Output
                        // --------------------------

                        output: {

                            format:
                                "image/png",

                            type:
                                "foreground",

                            quality:
                                1

                        }

                    }
                );


            // ==================================
            // Validate result
            // ==================================

            if (!resultBlob) {

                throw new Error(
                    "AI did not return an image."
                );

            }


            // ==================================
            // Revoke old result
            // ==================================

            if (resultObjectURL) {

                URL.revokeObjectURL(
                    resultObjectURL
                );

            }


            // ==================================
            // Create result URL
            // ==================================

            resultObjectURL =
                URL.createObjectURL(
                    resultBlob
                );


            // ==================================
            // Show result
            // ==================================

            if (afterImg) {

                afterImg.src =
                    resultObjectURL;

                afterImg.style.display =
                    "block";

            }


            // ==================================
            // Download
            // ==================================

            if (downloadBtn) {

                downloadBtn.href =
                    resultObjectURL;

                downloadBtn.download =
                    "removed-background.png";

                downloadBtn.style.display =
                    "flex";

            }


            // ==================================
            // Complete
            // ==================================

            if (progressBar) {

                progressBar.style.width =
                    "100%";

            }


            setText(
                progressText,
                "100%"
            );


            setText(
                processingMessage,
                "Background removed successfully!"
            );


            setText(
                statusText,
                "Completed"
            );


            console.log(
                "OneToolBox: Background removed successfully."
            );

        }


        catch (error) {

            // ==================================
            // Error
            // ==================================

            console.error(
                "OneToolBox IMG.LY Error:",
                error
            );


            setText(
                statusText,
                "Failed"
            );


            setText(
                processingMessage,
                "Background removal failed."
            );


            setText(
                progressText,
                "Error"
            );


            let message =
                "Background removal failed.";


            if (error?.message) {

                message +=
                    "\n\n" +
                    error.message;

            }


            alert(message);

        }


        finally {

            // ==================================
            // Finish
            // ==================================

            processing =
                false;


            if (removeBgBtn) {

                removeBgBtn.disabled =
                    false;

            }


            if (selectBtn) {

                selectBtn.disabled =
                    false;

            }


            if (resetBtn) {

                resetBtn.disabled =
                    false;

            }


            if (loader) {

                loader.style.display =
                    "none";

            }

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


        // ==================================
        // Clear state
        // ==================================

        selectedFile =
            null;


        // ==================================
        // Clear input
        // ==================================

        if (imageInput) {

            imageInput.value =
                "";

        }


        // ==================================
        // Revoke original
        // ==================================

        if (originalObjectURL) {

            URL.revokeObjectURL(
                originalObjectURL
            );

            originalObjectURL =
                null;

        }


        // ==================================
        // Revoke result
        // ==================================

        if (resultObjectURL) {

            URL.revokeObjectURL(
                resultObjectURL
            );

            resultObjectURL =
                null;

        }


        // ==================================
        // Hide original
        // ==================================

        if (beforeImg) {

            beforeImg.src =
                "";

            beforeImg.style.display =
                "none";

        }


        // ==================================
        // Hide result
        // ==================================

        if (afterImg) {

            afterImg.src =
                "";

            afterImg.style.display =
                "none";

        }


        // ==================================
        // Show placeholder
        // ==================================

        if (resultPlaceholder) {

            resultPlaceholder.style.display =
                "block";

        }


        // ==================================
        // Hide download
        // ==================================

        if (downloadBtn) {

            downloadBtn.style.display =
                "none";

            downloadBtn.removeAttribute(
                "href"
            );

        }


        // ==================================
        // Reset information
        // ==================================

        setText(
            fileSize,
            "0 KB"
        );


        setText(
            resolution,
            "0 × 0"
        );


        setText(
            statusText,
            "Waiting..."
        );


        setText(
            processingMessage,
            "Preparing AI..."
        );


        setText(
            progressText,
            "Ready"
        );


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }

    }
);


// ==========================================
// Cleanup
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
    "OneToolBox AI Background Remover Ready - IMG.LY"
);