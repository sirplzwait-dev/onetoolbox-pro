// ==========================================
// OneToolBox
// AI Background Remover
// FINAL VERSION
// Single Result + Background Color
// ==========================================

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

const fileSize =
    document.getElementById("fileSize");

const resolution =
    document.getElementById("resolution");

const statusText =
    document.getElementById("statusText");

const resultPlaceholder =
    document.getElementById("resultPlaceholder");


// ==========================================
// Variables
// ==========================================

let selectedFile = null;

let originalURL = null;

let transparentBlob = null;

let finalBlob = null;

let finalURL = null;

let processing = false;

let selectedBackground = "transparent";


// ==========================================
// Background Options
// ==========================================

const backgroundOptions = [

    {
        name: "Transparent",
        value: "transparent",
        color: "transparent"
    },

    {
        name: "White",
        value: "#ffffff",
        color: "#ffffff"
    },

    {
        name: "Black",
        value: "#000000",
        color: "#000000"
    },

    {
        name: "Red",
        value: "#ef4444",
        color: "#ef4444"
    },

    {
        name: "Blue",
        value: "#2563eb",
        color: "#2563eb"
    },

    {
        name: "Green",
        value: "#16a34a",
        color: "#16a34a"
    },

    {
        name: "Yellow",
        value: "#facc15",
        color: "#facc15"
    },

    {
        name: "Gray",
        value: "#6b7280",
        color: "#6b7280"
    }

];


// ==========================================
// Create Background Controls
// ==========================================

function createBackgroundControls() {

    const resultArea =
        document.querySelector(".result-area");

    if (!resultArea) {

        return;

    }


    // Remove old controls if already present

    const old =
        document.getElementById(
            "backgroundControls"
        );

    if (old) {

        old.remove();

    }


    // Main box

    const controls =
        document.createElement("div");

    controls.id =
        "backgroundControls";

    controls.style.marginTop =
        "18px";

    controls.style.padding =
        "16px";

    controls.style.border =
        "1px solid #e5e7eb";

    controls.style.borderRadius =
        "14px";

    controls.style.background =
        "#f8fafc";


    // Heading

    const title =
        document.createElement("h4");

    title.textContent =
        "Background";

    title.style.margin =
        "0 0 12px 0";

    title.style.fontSize =
        "16px";

    title.style.fontWeight =
        "700";


    controls.appendChild(title);


    // Buttons container

    const buttons =
        document.createElement("div");

    buttons.style.display =
        "flex";

    buttons.style.flexWrap =
        "wrap";

    buttons.style.gap =
        "10px";


    // ======================================
    // Background buttons
    // ======================================

    backgroundOptions.forEach(option => {

        const button =
            document.createElement("button");

        button.type =
            "button";

        button.className =
            "bg-option";

        button.dataset.background =
            option.value;

        button.title =
            option.name;


        button.style.width =
            "36px";

        button.style.height =
            "36px";

        button.style.borderRadius =
            "50%";

        button.style.cursor =
            "pointer";

        button.style.border =
            "3px solid transparent";

        button.style.boxSizing =
            "border-box";


        if (
            option.value ===
            "transparent"
        ) {

            button.style.background =
                "repeating-conic-gradient(#ddd 0% 25%, white 0% 50%) 50% / 12px 12px";

        }

        else {

            button.style.background =
                option.color;

        }


        button.addEventListener(
            "click",
            () => {

                selectedBackground =
                    option.value;


                document
                    .querySelectorAll(
                        ".bg-option"
                    )
                    .forEach(btn => {

                        btn.style.border =
                            "3px solid transparent";

                    });


                button.style.border =
                    "3px solid #2563eb";


                renderFinalImage();

            }
        );


        buttons.appendChild(button);

    });


    controls.appendChild(buttons);


    // ======================================
    // Custom Color
    // ======================================

    const customRow =
        document.createElement("div");

    customRow.style.display =
        "flex";

    customRow.style.alignItems =
        "center";

    customRow.style.gap =
        "10px";

    customRow.style.marginTop =
        "14px";


    const customLabel =
        document.createElement("span");

    customLabel.textContent =
        "Custom:";

    customLabel.style.fontWeight =
        "600";


    const customColor =
        document.createElement("input");

    customColor.type =
        "color";

    customColor.id =
        "customBackgroundColor";

    customColor.value =
        "#ffffff";


    customColor.style.width =
        "45px";

    customColor.style.height =
        "36px";

    customColor.style.padding =
        "2px";

    customColor.style.border =
        "1px solid #ddd";

    customColor.style.borderRadius =
        "8px";

    customColor.style.cursor =
        "pointer";


    customColor.addEventListener(
        "input",
        () => {

            selectedBackground =
                customColor.value;


            document
                .querySelectorAll(
                    ".bg-option"
                )
                .forEach(btn => {

                    btn.style.border =
                        "3px solid transparent";

                });


            renderFinalImage();

        }
    );


    customRow.appendChild(
        customLabel
    );

    customRow.appendChild(
        customColor
    );


    controls.appendChild(
        customRow
    );


    resultArea.appendChild(
        controls
    );

}


// ==========================================
// File Size
// ==========================================

function formatFileSize(bytes) {

    if (!bytes) {

        return "0 KB";

    }


    if (
        bytes <
        1024 * 1024
    ) {

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
// Select Button
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

    if (!file) {

        return;

    }


    if (
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select a valid image."
        );

        return;

    }


    selectedFile =
        file;


    // Revoke old URL

    if (originalURL) {

        URL.revokeObjectURL(
            originalURL
        );

    }


    if (finalURL) {

        URL.revokeObjectURL(
            finalURL
        );

        finalURL =
            null;

    }


    transparentBlob =
        null;

    finalBlob =
        null;


    // Create URL

    originalURL =
        URL.createObjectURL(file);


    // ======================================
    // Original preview
    // ======================================

    if (beforeImg) {

        beforeImg.src =
            originalURL;

        beforeImg.style.display =
            "block";

    }


    // ======================================
    // Hide result
    // ======================================

    if (afterImg) {

        afterImg.src =
            "";

        afterImg.style.display =
            "none";

    }


    if (downloadBtn) {

        downloadBtn.style.display =
            "none";

    }


    if (resultPlaceholder) {

        resultPlaceholder.style.display =
            "none";

    }


    // ======================================
    // Info
    // ======================================

    if (fileSize) {

        fileSize.textContent =
            formatFileSize(file.size);

    }


    const img =
        new Image();


    img.onload = () => {

        if (resolution) {

            resolution.textContent =
                `${img.width} × ${img.height}`;

        }

    };


    img.src =
        originalURL;


    if (statusText) {

        statusText.textContent =
            "Ready";

    }

}


// ==========================================
// Drag & Drop
// ==========================================

uploadArea?.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

        if (!processing) {

            uploadArea.classList.add(
                "dragover"
            );

        }

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


        if (file) {

            loadImage(file);

        }

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


        for (
            const item of items
        ) {

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


// ==========================================
// Render Final Image
// ==========================================

async function renderFinalImage() {

    if (!transparentBlob) {

        return;

    }


    try {

        const image =
            new Image();


        const imageURL =
            URL.createObjectURL(
                transparentBlob
            );


        await new Promise(
            (resolve, reject) => {

                image.onload =
                    resolve;

                image.onerror =
                    reject;

                image.src =
                    imageURL;

            }
        );


        URL.revokeObjectURL(
            imageURL
        );


        // ==================================
        // Canvas
        // ==================================

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


        // ==================================
        // Background
        // ==================================

        if (
            selectedBackground !==
            "transparent"
        ) {

            ctx.fillStyle =
                selectedBackground;

            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        }


        // ==================================
        // Draw cutout
        // ==================================

        ctx.drawImage(
            image,
            0,
            0
        );


        // ==================================
        // Convert PNG
        // ==================================

        finalBlob =
            await new Promise(
                resolve => {

                    canvas.toBlob(
                        resolve,
                        "image/png"
                    );

                }
            );


        // ==================================
        // Final URL
        // ==================================

        if (finalURL) {

            URL.revokeObjectURL(
                finalURL
            );

        }


        finalURL =
            URL.createObjectURL(
                finalBlob
            );


        // ==================================
        // Show ONLY final image
        // ==================================

        if (beforeImg) {

            beforeImg.style.display =
                "none";

        }


        if (afterImg) {

            afterImg.src =
                finalURL;

            afterImg.style.display =
                "block";

        }


        // ==================================
        // Download
        // ==================================

        if (downloadBtn) {

            downloadBtn.href =
                finalURL;

            downloadBtn.download =
                "onetoolbox-background.png";

            downloadBtn.style.display =
                "flex";

        }

    }

    catch (error) {

        console.error(
            "Render error:",
            error
        );

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


        processing =
            true;


        removeBgBtn.disabled =
            true;


        if (selectBtn) {

            selectBtn.disabled =
                true;

        }


        if (resetBtn) {

            resetBtn.disabled =
                true;

        }


        if (loader) {

            loader.style.display =
                "block";

        }


        if (processingText) {

            processingText.style.display =
                "block";

        }


        if (statusText) {

            statusText.textContent =
                "Removing Background...";

        }


        try {

            // ==================================
            // IMG.LY AI
            // ==================================

            transparentBlob =
                await removeBackground(
                    selectedFile,
                    {

                        debug: false,

                        progress:
                            (
                                key,
                                current,
                                total
                            ) => {

                                if (
                                    key ===
                                    "fetch"
                                ) {

                                    if (
                                        statusText
                                    ) {

                                        statusText.textContent =
                                            "Loading AI Model...";

                                    }

                                }

                                else if (
                                    key ===
                                    "compute"
                                ) {

                                    if (
                                        statusText
                                    ) {

                                        statusText.textContent =
                                            "Removing Background...";

                                    }

                                }

                            }

                    }
                );


            if (!transparentBlob) {

                throw new Error(
                    "AI did not return an image."
                );

            }


            // ==================================
            // Default background
            // ==================================

            selectedBackground =
                "transparent";


            // ==================================
            // Create controls
            // ==================================

            createBackgroundControls();


            // ==================================
            // Render
            // ==================================

            await renderFinalImage();


            // ==================================
            // Completed
            // ==================================

            if (statusText) {

                statusText.textContent =
                    "Completed";

            }


            if (processingText) {

                processingText.style.display =
                    "block";

            }


            console.log(
                "OneToolBox: Background removed successfully."
            );

        }

        catch (error) {

            console.error(
                "OneToolBox Error:",
                error
            );


            if (statusText) {

                statusText.textContent =
                    "Failed";

            }


            alert(
                "Background removal failed.\n\n" +
                (
                    error?.message ||
                    "Unknown error"
                )
            );

        }

        finally {

            processing =
                false;


            removeBgBtn.disabled =
                false;


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


        selectedFile =
            null;


        transparentBlob =
            null;


        finalBlob =
            null;


        if (imageInput) {

            imageInput.value =
                "";

        }


        if (originalURL) {

            URL.revokeObjectURL(
                originalURL
            );

            originalURL =
                null;

        }


        if (finalURL) {

            URL.revokeObjectURL(
                finalURL
            );

            finalURL =
                null;

        }


        if (beforeImg) {

            beforeImg.src =
                "";

            beforeImg.style.display =
                "none";

        }


        if (afterImg) {

            afterImg.src =
                "";

            afterImg.style.display =
                "none";

        }


        if (resultPlaceholder) {

            resultPlaceholder.style.display =
                "block";

        }


        if (downloadBtn) {

            downloadBtn.style.display =
                "none";

            downloadBtn.removeAttribute(
                "href"
            );

        }


        if (fileSize) {

            fileSize.textContent =
                "0 KB";

        }


        if (resolution) {

            resolution.textContent =
                "0 × 0";

        }


        if (statusText) {

            statusText.textContent =
                "Waiting...";

        }


        const controls =
            document.getElementById(
                "backgroundControls"
            );


        if (controls) {

            controls.remove();

        }

    }
);


// ==========================================
// Startup
// ==========================================

console.log(
    "OneToolBox AI Background Remover Ready"
);