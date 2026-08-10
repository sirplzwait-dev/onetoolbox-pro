// ==========================================================
// OneToolBox Pro - AI Background Remover
// Final Version
// Netlify Function + Background Color
// ==========================================================


// ==========================================================
// ELEMENTS
// ==========================================================

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


// ==========================================================
// VARIABLES
// ==========================================================

let selectedFile = null;

// Transparent removed-background image
let removedImage = null;

// Currently selected background
let selectedBackground = "transparent";

// Final generated PNG
let finalImageData = null;


// ==========================================================
// BACKGROUND OPTIONS
// ==========================================================

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


// ==========================================================
// SAFE DISPLAY HELPERS
// ==========================================================

function showElement(element) {

    if (element) {
        element.style.display = "";
    }

}


function hideElement(element) {

    if (element) {
        element.style.display = "none";
    }

}


// ==========================================================
// SELECT IMAGE BUTTON
// ==========================================================

selectBtn?.addEventListener(
    "click",
    () => {

        if (imageInput) {
            imageInput.click();
        }

    }
);


// ==========================================================
// IMAGE INPUT
// ==========================================================

imageInput?.addEventListener(
    "change",
    event => {

        if (
            !event.target.files ||
            !event.target.files.length
        ) {
            return;
        }

        const file =
            event.target.files[0];

        loadImage(file);

    }
);


// ==========================================================
// LOAD IMAGE
// ==========================================================

function loadImage(file) {

    if (!file) {
        return;
    }


    // Check image
    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select a valid image file."
        );

        return;
    }


    selectedFile = file;

    removedImage = null;

    finalImageData = null;

    selectedBackground =
        "transparent";


    // ------------------------------------------------------
    // Show original image
    // ------------------------------------------------------

    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            const imageURL =
                event.target.result;


            if (beforeImg) {

                beforeImg.src =
                    imageURL;

                beforeImg.style.display =
                    "block";

            }


            if (afterImg) {

                afterImg.src = "";

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


            if (statusText) {

                statusText.textContent =
                    "Ready";

            }


            // File size

            if (fileSize) {

                fileSize.textContent =
                    formatFileSize(
                        file.size
                    );

            }


            // Resolution

            const img =
                new Image();


            img.onload =
                function () {

                    if (resolution) {

                        resolution.textContent =
                            img.width +
                            " × " +
                            img.height;

                    }

                };


            img.src =
                imageURL;

        };


    reader.readAsDataURL(file);


    // ------------------------------------------------------
    // Reset background controls
    // ------------------------------------------------------

    removeBackgroundControls();


}


// ==========================================================
// FORMAT FILE SIZE
// ==========================================================

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 KB";
    }


    if (bytes < 1024) {

        return bytes + " B";

    }


    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }


    return (
        bytes /
        (1024 * 1024)
    ).toFixed(2) + " MB";

}


// ==========================================================
// DRAG & DROP
// ==========================================================

uploadArea?.addEventListener(
    "dragover",
    event => {

        event.preventDefault();

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


        if (
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files.length
        ) {

            loadImage(
                event.dataTransfer.files[0]
            );

        }

    }
);


// ==========================================================
// PASTE IMAGE
// ==========================================================

document.addEventListener(
    "paste",
    event => {

        if (
            !event.clipboardData ||
            !event.clipboardData.items
        ) {
            return;
        }


        const items =
            event.clipboardData.items;


        for (
            const item of items
        ) {

            if (
                item.type &&
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


// ==========================================================
// COMPRESS IMAGE
// ==========================================================

async function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                event => {

                    const img =
                        new Image();


                    img.onload =
                        () => {

                            let width =
                                img.width;

                            let height =
                                img.height;


                            // Maximum size
                            const MAX =
                                1600;


                            if (
                                width > height &&
                                width > MAX
                            ) {

                                height =
                                    Math.round(
                                        height *
                                        MAX /
                                        width
                                    );

                                width =
                                    MAX;

                            }

                            else if (
                                height > MAX
                            ) {

                                width =
                                    Math.round(
                                        width *
                                        MAX /
                                        height
                                    );

                                height =
                                    MAX;

                            }


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


                            ctx.drawImage(
                                img,
                                0,
                                0,
                                width,
                                height
                            );


                            // JPEG keeps request smaller
                            const dataURL =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.85
                                );


                            resolve(
                                dataURL
                            );

                        };


                    img.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Unable to read image."
                                )
                            );

                        };


                    img.src =
                        event.target.result;

                };


            reader.onerror =
                () => {

                    reject(
                        new Error(
                            "Unable to read file."
                        )
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


// ==========================================================
// REMOVE BACKGROUND
// ==========================================================

removeBgBtn?.addEventListener(
    "click",
    async () => {

        if (!selectedFile) {

            alert(
                "Please select an image first."
            );

            return;
        }


        // --------------------------------------------------
        // UI: Processing
        // --------------------------------------------------

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
                "Preparing AI...";

        }


        removeBgBtn.disabled =
            true;


        try {

            // ------------------------------------------------
            // Compress
            // ------------------------------------------------

            const base64Image =
                await compressImage(
                    selectedFile
                );


            if (statusText) {

                statusText.textContent =
                    "Removing Background...";

            }


            // ------------------------------------------------
            // Netlify Function
            // ------------------------------------------------

            const response =
                await fetch(
                    "/.netlify/functions/remove-background",
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            image:
                                base64Image

                        })

                    }
                );


            console.log(
                "Function Status:",
                response.status
            );


            // ------------------------------------------------
            // Read response safely
            // ------------------------------------------------

            const responseText =
                await response.text();


            console.log(
                "Function Response:",
                responseText
            );


            let result;


            try {

                result =
                    JSON.parse(
                        responseText
                    );

            }

            catch (jsonError) {

                throw new Error(
                    "Server returned an invalid response."
                );

            }


            // ------------------------------------------------
            // Server Error
            // ------------------------------------------------

            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Background removal failed."
                );

            }


            if (
                !result ||
                !result.success
            ) {

                throw new Error(
                    result?.error ||
                    "Background removal failed."
                );

            }


            // ------------------------------------------------
            // Get Removed Image
            // ------------------------------------------------

            if (!result.image) {

                throw new Error(
                    "No image was returned by server."
                );

            }


            removedImage =
                result.image;


            // ------------------------------------------------
            // Default = Transparent
            // ------------------------------------------------

            selectedBackground =
                "transparent";


            // ------------------------------------------------
            // Render Final Image
            // ------------------------------------------------

            await renderFinalImage();


            // ------------------------------------------------
            // Create Controls
            // ------------------------------------------------

            createBackgroundControls();


            // ------------------------------------------------
            // Success
            // ------------------------------------------------

            if (statusText) {

                statusText.textContent =
                    "Completed";

            }


        }

        catch (error) {

            console.error(
                "Remove Background Error:",
                error
            );


            if (statusText) {

                statusText.textContent =
                    "Failed";

            }


            alert(
                error.message ||
                "Background removal failed."
            );

        }

        finally {

            if (loader) {

                loader.style.display =
                    "none";

            }


            if (processingText) {

                processingText.style.display =
                    "none";

            }


            removeBgBtn.disabled =
                false;

        }

    }
);


// ==========================================================
// CONVERT IMAGE TO DATA URL
// ==========================================================

function loadImageElement(src) {

    return new Promise(
        (resolve, reject) => {

            const img =
                new Image();


            img.onload =
                () => resolve(img);


            img.onerror =
                () =>
                    reject(
                        new Error(
                            "Unable to load result image."
                        )
                    );


            img.src =
                src;

        }
    );

}


// ==========================================================
// RENDER FINAL IMAGE
// ==========================================================

async function renderFinalImage() {

    if (!removedImage) {
        return;
    }


    const img =
        await loadImageElement(
            removedImage
        );


    // ------------------------------------------------------
    // Canvas
    // ------------------------------------------------------

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        img.naturalWidth ||
        img.width;

    canvas.height =
        img.naturalHeight ||
        img.height;


    const ctx =
        canvas.getContext(
            "2d"
        );


    // ------------------------------------------------------
    // Background
    // ------------------------------------------------------

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


    // ------------------------------------------------------
    // Draw transparent cutout
    // ------------------------------------------------------

    ctx.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ------------------------------------------------------
    // PNG
    // ------------------------------------------------------

    finalImageData =
        canvas.toDataURL(
            "image/png"
        );


    // ------------------------------------------------------
    // Show ONLY final image
    // ------------------------------------------------------

    if (afterImg) {

        afterImg.src =
            finalImageData;

        afterImg.style.display =
            "block";

    }


    // ------------------------------------------------------
    // Hide placeholder
    // ------------------------------------------------------

    if (resultPlaceholder) {

        resultPlaceholder.style.display =
            "none";

    }


    // ------------------------------------------------------
    // Download
    // ------------------------------------------------------

    if (downloadBtn) {

        downloadBtn.href =
            finalImageData;

        downloadBtn.download =
            "removed-background.png";

        downloadBtn.style.display =
            "flex";

    }

}


// ==========================================================
// CREATE BACKGROUND CONTROLS
// ==========================================================


function createBackgroundControls() {

    // पहले पुराने controls हटाओ
    removeBackgroundControls();

    // Result card खोजो
    const resultArea = document.querySelector(".result-area");

    if (!resultArea) {
        console.error("Result area not found.");
        return;
    }

    // Result card
    const resultCard = resultArea.closest(".tool-card");

    if (!resultCard) {
        console.error("Result card not found.");
        return;
    }

    // ======================================================
    // BACKGROUND CONTROLS
    // ======================================================

    const controls = document.createElement("div");

    controls.id = "backgroundControls";

    // IMPORTANT:
    // पुराने result-area CSS से बाहर रखने के लिए
    // controls को result-area के बाहर रखा जा रहा है।

    controls.style.display = "block";
    controls.style.width = "100%";
    controls.style.maxWidth = "100%";
    controls.style.boxSizing = "border-box";

    controls.style.marginTop = "18px";
    controls.style.padding = "18px";

    controls.style.background = "#f8fafc";
    controls.style.border = "1px solid #e5e7eb";
    controls.style.borderRadius = "14px";

    controls.style.position = "static";
    controls.style.float = "none";
    controls.style.clear = "both";

    // ======================================================
    // TITLE
    // ======================================================

    const title = document.createElement("div");

    title.textContent = "Background";

    title.style.fontSize = "17px";
    title.style.fontWeight = "700";
    title.style.color = "#111827";
    title.style.marginBottom = "14px";

    controls.appendChild(title);

    // ======================================================
    // COLOR BUTTONS
    // ======================================================

    const buttons = document.createElement("div");

    buttons.style.display = "flex";
    buttons.style.flexWrap = "wrap";
    buttons.style.alignItems = "center";
    buttons.style.gap = "10px";

    buttons.style.width = "100%";

    // ======================================================
    // BACKGROUND COLORS
    // ======================================================

    backgroundOptions.forEach(option => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "bg-option";

        button.title = option.name;

        button.dataset.background = option.value;

        // Size
        button.style.width = "42px";
        button.style.height = "42px";
        button.style.minWidth = "42px";
        button.style.maxWidth = "42px";

        button.style.padding = "0";
        button.style.margin = "0";

        // Circle
        button.style.borderRadius = "50%";

        button.style.cursor = "pointer";

        button.style.boxSizing = "border-box";

        // Border
        button.style.border = "3px solid transparent";

        // Background
        if (option.value === "transparent") {

            button.style.background =
                "repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%) 50% / 12px 12px";

        } else {

            button.style.background =
                option.color;

        }

        // Selected
        if (
            selectedBackground ===
            option.value
        ) {

            button.style.border =
                "3px solid #2563eb";

        }

        // Click
        button.addEventListener(
            "click",
            async () => {

                selectedBackground =
                    option.value;

                // सभी buttons reset
                document
                    .querySelectorAll(
                        "#backgroundControls .bg-option"
                    )
                    .forEach(btn => {

                        btn.style.border =
                            "3px solid transparent";

                    });

                // Current selected
                button.style.border =
                    "3px solid #2563eb";

                if (statusText) {

                    statusText.textContent =
                        "Updating Background...";

                }

                try {

                    await renderFinalImage();

                    if (statusText) {

                        statusText.textContent =
                            "Completed";

                    }

                } catch (error) {

                    console.error(error);

                    if (statusText) {

                        statusText.textContent =
                            "Failed";

                    }

                }

            }
        );

        buttons.appendChild(button);

    });

    controls.appendChild(buttons);

    // ======================================================
    // CUSTOM COLOR
    // ======================================================

    const customRow =
        document.createElement("div");

    customRow.style.display = "flex";
    customRow.style.alignItems = "center";
    customRow.style.flexWrap = "wrap";

    customRow.style.gap = "10px";

    customRow.style.marginTop = "16px";

    // Label

    const customLabel =
        document.createElement("span");

    customLabel.textContent =
        "Custom:";

    customLabel.style.fontSize =
        "14px";

    customLabel.style.fontWeight =
        "600";

    customLabel.style.color =
        "#374151";

    // Color picker

    const customColor =
        document.createElement("input");

    customColor.type =
        "color";

    customColor.id =
        "customBackgroundColor";

    customColor.value =
        "#ffffff";

    customColor.title =
        "Choose custom background color";

    customColor.style.width =
        "52px";

    customColor.style.height =
        "40px";

    customColor.style.padding =
        "2px";

    customColor.style.border =
        "1px solid #d1d5db";

    customColor.style.borderRadius =
        "8px";

    customColor.style.cursor =
        "pointer";

    customColor.style.boxSizing =
        "border-box";

    // Custom color change

    customColor.addEventListener(
        "input",
        async () => {

            selectedBackground =
                customColor.value;

            // Remove selected circle
            document
                .querySelectorAll(
                    "#backgroundControls .bg-option"
                )
                .forEach(btn => {

                    btn.style.border =
                        "3px solid transparent";

                });

            if (statusText) {

                statusText.textContent =
                    "Updating Background...";

            }

            try {

                await renderFinalImage();

                if (statusText) {

                    statusText.textContent =
                        "Completed";

                }

            } catch (error) {

                console.error(error);

            }

        }
    );

    customRow.appendChild(customLabel);

    customRow.appendChild(customColor);

    controls.appendChild(customRow);

    // ======================================================
    // IMPORTANT
    // ======================================================
    // result-area ke ANDAR nahi,
    // result card ke neeche controls add honge.

    resultCard.appendChild(controls);
}



    // ------------------------------------------------------
    // Remove old controls
    // ------------------------------------------------------

    removeBackgroundControls();


    // ------------------------------------------------------
    // Main Box
    // ------------------------------------------------------

    const controls =
        document.createElement(
            "div"
        );


    controls.id =
        "backgroundControls";


    // Important layout fixes

    controls.style.width =
        "100%";

    controls.style.maxWidth =
        "100%";

    controls.style.boxSizing =
        "border-box";

    controls.style.margin =
        "18px 0 0 0";

    controls.style.padding =
        "18px";

    controls.style.border =
        "1px solid #e5e7eb";

    controls.style.borderRadius =
        "14px";

    controls.style.background =
        "#f8fafc";

    controls.style.position =
        "relative";

    controls.style.overflow =
        "hidden";


    // ======================================================
    // TITLE
    // ======================================================

    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        "Background";


    title.style.fontSize =
        "16px";

    title.style.fontWeight =
        "700";

    title.style.color =
        "#111827";

    title.style.marginBottom =
        "14px";


    controls.appendChild(
        title
    );


    // ======================================================
    // COLOR BUTTON CONTAINER
    // ======================================================

    const buttons =
        document.createElement(
            "div"
        );


    buttons.style.display =
        "flex";

    buttons.style.flexWrap =
        "wrap";

    buttons.style.alignItems =
        "center";

    buttons.style.gap =
        "10px";

    buttons.style.width =
        "100%";


    // ======================================================
    // COLORS
    // ======================================================

    backgroundOptions.forEach(
        option => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "bg-option";


            button.title =
                option.name;


            button.dataset.background =
                option.value;


            // ------------------------------------------------
            // Size
            // ------------------------------------------------

            button.style.width =
                "40px";

            button.style.height =
                "40px";

            button.style.minWidth =
                "40px";

            button.style.maxWidth =
                "40px";

            button.style.flex =
                "0 0 40px";

            button.style.padding =
                "0";

            button.style.margin =
                "0";


            // ------------------------------------------------
            // Shape
            // ------------------------------------------------

            button.style.borderRadius =
                "50%";

            button.style.cursor =
                "pointer";

            button.style.boxSizing =
                "border-box";


            // ------------------------------------------------
            // Border
            // ------------------------------------------------

            button.style.border =
                "3px solid transparent";


            // ------------------------------------------------
            // Background
            // ------------------------------------------------

            if (
                option.value ===
                "transparent"
            ) {

                button.style.background =
                    "repeating-conic-gradient(#d1d5db 0% 25%, #ffffff 0% 50%) 50% / 12px 12px";

            }

            else {

                button.style.background =
                    option.color;

            }


            // ------------------------------------------------
            // Selected transparent
            // ------------------------------------------------

            if (
                selectedBackground ===
                option.value
            ) {

                button.style.border =
                    "3px solid #2563eb";

            }


            // ------------------------------------------------
            // Click
            // ------------------------------------------------

            button.addEventListener(
                "click",
                async () => {

                    selectedBackground =
                        option.value;


                    // Remove selected border

                    document
                        .querySelectorAll(
                            "#backgroundControls .bg-option"
                        )
                        .forEach(
                            btn => {

                                btn.style.border =
                                    "3px solid transparent";

                            }
                        );


                    // Selected border

                    button.style.border =
                        "3px solid #2563eb";


                    // Status

                    if (statusText) {

                        statusText.textContent =
                            "Updating Background...";

                    }


                    try {

                        await renderFinalImage();


                        if (statusText) {

                            statusText.textContent =
                                "Completed";

                        }

                    }

                    catch (error) {

                        console.error(
                            error
                        );

                        if (statusText) {

                            statusText.textContent =
                                "Failed";

                        }

                    }

                }
            );


            buttons.appendChild(
                button
            );

        }
    );


    controls.appendChild(
        buttons
    );


    // ======================================================
    // CUSTOM COLOR
    // ======================================================

    const customRow =
        document.createElement(
            "div"
        );


    customRow.style.display =
        "flex";

    customRow.style.alignItems =
        "center";

    customRow.style.flexWrap =
        "wrap";

    customRow.style.gap =
        "10px";

    customRow.style.marginTop =
        "16px";


    // Label

    const customLabel =
        document.createElement(
            "span"
        );


    customLabel.textContent =
        "Custom:";


    customLabel.style.fontSize =
        "14px";

    customLabel.style.fontWeight =
        "600";

    customLabel.style.color =
        "#374151";


    // Color picker

    const customColor =
        document.createElement(
            "input"
        );


    customColor.type =
        "color";


    customColor.id =
        "customBackgroundColor";


    customColor.value =
        "#ffffff";


    customColor.title =
        "Choose custom background color";


    customColor.style.width =
        "50px";

    customColor.style.height =
        "38px";

    customColor.style.padding =
        "2px";

    customColor.style.border =
        "1px solid #d1d5db";

    customColor.style.borderRadius =
        "8px";

    customColor.style.cursor =
        "pointer";

    customColor.style.boxSizing =
        "border-box";


    // Custom color change

    customColor.addEventListener(
        "input",
        async () => {

            selectedBackground =
                customColor.value;


            // Remove selected border

            document
                .querySelectorAll(
                    "#backgroundControls .bg-option"
                )
                .forEach(
                    btn => {

                        btn.style.border =
                            "3px solid transparent";

                    }
                );


            if (statusText) {

                statusText.textContent =
                    "Updating Background...";

            }


            try {

                await renderFinalImage();


                if (statusText) {

                    statusText.textContent =
                        "Completed";

                }

            }

            catch (error) {

                console.error(
                    error
                );

            }

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


    // ======================================================
    // ADD BELOW RESULT
    // ======================================================

    resultArea.appendChild(
        controls
    );

}


// ==========================================================
// REMOVE BACKGROUND CONTROLS
// ==========================================================

function removeBackgroundControls() {

    const controls =
        document.getElementById(
            "backgroundControls"
        );


    if (controls) {

        controls.remove();

    }

}


// ==========================================================
// RESET
// ==========================================================

resetBtn?.addEventListener(
    "click",
    () => {

        selectedFile = null;

        removedImage = null;

        finalImageData = null;

        selectedBackground =
            "transparent";


        // File input

        if (imageInput) {

            imageInput.value =
                "";

        }


        // Original image

        if (beforeImg) {

            beforeImg.src =
                "";

            beforeImg.style.display =
                "none";

        }


        // Final image

        if (afterImg) {

            afterImg.src =
                "";

            afterImg.style.display =
                "none";

        }


        // Download

        if (downloadBtn) {

            downloadBtn.href =
                "#";

            downloadBtn.style.display =
                "none";

        }


        // Placeholder

        if (resultPlaceholder) {

            resultPlaceholder.style.display =
                "block";

        }


        // File size

        if (fileSize) {

            fileSize.textContent =
                "0 KB";

        }


        // Resolution

        if (resolution) {

            resolution.textContent =
                "0 × 0";

        }


        // Status

        if (statusText) {

            statusText.textContent =
                "Waiting...";

        }


        // Controls

        removeBackgroundControls();

    }
);


// ==========================================================
// DOWNLOAD
// ==========================================================

downloadBtn?.addEventListener(
    "click",
    event => {

        if (!finalImageData) {

            event.preventDefault();

            alert(
                "Please remove the background first."
            );

            return;

        }


        console.log(
            "Download Started"
        );

    }
);


// ==========================================================
// STARTUP
// ==========================================================

window.addEventListener(
    "load",
    () => {

        console.log(
            "OneToolBox Remove Background Ready"
        );

    }
);