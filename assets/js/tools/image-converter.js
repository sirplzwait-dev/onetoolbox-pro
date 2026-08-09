// ===================================
// OneToolBox Image Converter
// ===================================

const imageInput = document.getElementById("imageInput");
const originalPreview = document.getElementById("originalPreview");
const convertedPreview = document.getElementById("convertedPreview");

const fileName = document.getElementById("fileName");
const originalSize = document.getElementById("originalSize");
const originalDimension = document.getElementById("originalDimension");
const originalFormat = document.getElementById("originalFormat");

const formatSelect = document.getElementById("formatSelect");
const qualityRange = document.getElementById("qualityRange");
const qualityValue = document.getElementById("qualityValue");

const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");

const resultText = document.getElementById("resultText");

const newFormat = document.getElementById("newFormat");
const newDimension = document.getElementById("newDimension");
const newSize = document.getElementById("newSize");

const uploadArea = document.getElementById("uploadArea");


// ===================================
// VARIABLES
// ===================================

let selectedFile = null;
let selectedImage = null;
let bgColor = "#ffffff";
let convertedUrl = null;


// ===================================
// QUALITY SLIDER
// ===================================

if (qualityRange) {

    qualityRange.addEventListener("input", function () {

        qualityValue.textContent =
            this.value + "%";

    });

}


// ===================================
// LOAD IMAGE
// ===================================

function loadImage(file) {

    if (!file) {
        return;
    }


    // Check image
    if (!file.type || !file.type.startsWith("image/")) {

        alert("Please choose a valid image file.");

        return;
    }


    selectedFile = file;


    // File information
    fileName.textContent =
        file.name;

    originalSize.textContent =
        formatSize(file.size);

    originalFormat.textContent =
        getFormatName(file.type);


    // FileReader
    const reader = new FileReader();


    reader.onload = function (event) {

        const imageData =
            event.target.result;


        // Original preview
        originalPreview.src =
            imageData;

        originalPreview.style.display =
            "block";


        // Hide upload text
        uploadIcon.style.display =
            "none";

        uploadText.style.display =
            "none";

        uploadInfo.style.display =
            "none";


        // Read dimensions
        const img =
            new Image();


        img.onload = function () {

            selectedImage = img;


            originalDimension.textContent =
                img.naturalWidth +
                " × " +
                img.naturalHeight +
                " px";

        };


        img.onerror = function () {

            alert("Unable to read this image.");

        };


        img.src =
            imageData;

    };


    reader.onerror = function () {

        alert("Unable to read the selected file.");

    };


    reader.readAsDataURL(file);

}


// ===================================
// FILE SELECT
// ===================================

if (imageInput) {

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

}


// ===================================
// DRAG & DROP
// ===================================

if (uploadArea) {

    uploadArea.addEventListener(
        "dragenter",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "dragging"
            );

        }
    );


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
        function (event) {

            event.preventDefault();

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


            const files =
                event.dataTransfer.files;


            if (
                files &&
                files.length > 0
            ) {

                loadImage(files[0]);

            }

        }
    );

}


// ===================================
// PASTE IMAGE - CTRL + V
// ===================================

document.addEventListener(
    "paste",
    function (event) {

        if (
            !event.clipboardData ||
            !event.clipboardData.items
        ) {

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


// ===================================
// BACKGROUND BUTTONS
// ===================================

document
    .querySelectorAll(".background-btn")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".background-btn")
                    .forEach(function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                bgColor =
                    button.dataset.color ||
                    "#ffffff";

            }
        );

    });


// ===================================
// CONVERT BUTTON
// ===================================

if (convertBtn) {

    convertBtn.addEventListener(
        "click",
        function () {

            convertImage();

        }
    );

}


// ===================================
// CONVERT IMAGE
// ===================================

function convertImage() {

    if (!selectedFile) {

        alert(
            "Please choose an image first."
        );

        return;

    }


    if (!selectedImage) {

        alert(
            "Image is still loading. Please try again."
        );

        return;

    }


    const outputType =
        formatSelect.value;


    // AVIF support check is handled by canvas.toBlob.
    // Some browsers may not support AVIF output.


    // Button loading
    convertBtn.disabled =
        true;

    convertBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Converting...';


    // Canvas
    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        selectedImage.naturalWidth;

    canvas.height =
        selectedImage.naturalHeight;


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        alert(
            "Your browser does not support canvas."
        );

        finishConvertButton();

        return;

    }


    /*
     * JPG does not support transparency.
     * Therefore apply selected background.
     */

    if (
        outputType ===
        "image/jpeg"
    ) {

        ctx.fillStyle =
            bgColor;

        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    // Draw image
    ctx.drawImage(
        selectedImage,
        0,
        0
    );


    // Quality
    const quality =
        Number(
            qualityRange.value
        ) / 100;


    // Convert canvas
    canvas.toBlob(
        function (blob) {

            if (!blob) {

                alert(
                    "This browser cannot create " +
                    getFormatName(outputType) +
                    " output. Please choose JPG, PNG or WEBP."
                );

                finishConvertButton();

                return;

            }


            // Remove previous URL
            if (convertedUrl) {

                URL.revokeObjectURL(
                    convertedUrl
                );

            }


            // Create new URL
            convertedUrl =
                URL.createObjectURL(
                    blob
                );


            // Show converted preview
            convertedPreview.src =
                convertedUrl;

            convertedPreview.style.display =
                "block";


            resultText.style.display =
                "none";


            // Result information
            newFormat.textContent =
                getFormatName(
                    outputType
                );


            newDimension.textContent =
                selectedImage.naturalWidth +
                " × " +
                selectedImage.naturalHeight +
                " px";


            newSize.textContent =
                formatSize(
                    blob.size
                );


            // Download
            downloadBtn.href =
                convertedUrl;


            downloadBtn.download =
                "converted." +
                getExtension(
                    outputType
                );


            downloadBtn.classList.remove(
                "disabled"
            );


            downloadBtn.setAttribute(
                "aria-disabled",
                "false"
            );


            finishConvertButton();

        },
        outputType,
        quality
    );

}


// ===================================
// FINISH CONVERT BUTTON
// ===================================

function finishConvertButton() {

    convertBtn.disabled =
        false;


    convertBtn.innerHTML =
        '<i class="fa-solid fa-arrows-rotate"></i> Convert Image';

}


// ===================================
// RESET
// ===================================

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        resetConverter
    );

}


function resetConverter() {

    // Remove generated object URL
    if (convertedUrl) {

        URL.revokeObjectURL(
            convertedUrl
        );

        convertedUrl =
            null;

    }


    // Clear variables
    selectedFile =
        null;

    selectedImage =
        null;


    // Clear file input
    if (imageInput) {

        imageInput.value =
            "";

    }


    // Original preview
    originalPreview.src =
        "";

    originalPreview.style.display =
        "none";


    // Converted preview
    convertedPreview.src =
        "";

    convertedPreview.style.display =
        "none";


    // Upload placeholder
    uploadIcon.style.display =
        "";

    uploadText.style.display =
        "";

    uploadInfo.style.display =
        "";


    // Result placeholder
    resultText.style.display =
        "";


    // Original information
    fileName.textContent =
        "-";

    originalSize.textContent =
        "0 KB";

    originalDimension.textContent =
        "0 × 0 px";

    originalFormat.textContent =
        "-";


    // Result information
    newFormat.textContent =
        "-";

    newDimension.textContent =
        "0 × 0 px";

    newSize.textContent =
        "0 KB";


    // Disable download
    downloadBtn.href =
        "#";

    downloadBtn.classList.add(
        "disabled"
    );

    downloadBtn.setAttribute(
        "aria-disabled",
        "true"
    );


    // Reset quality
    qualityRange.value =
        "90";

    qualityValue.textContent =
        "90%";


    // Reset format
    formatSelect.value =
        "image/jpeg";


    // Reset background
    bgColor =
        "#ffffff";


    document
        .querySelectorAll(".background-btn")
        .forEach(function (button) {

            button.classList.remove(
                "active"
            );

        });


    const whiteButton =
        document.querySelector(
            '.background-btn[data-color="#ffffff"]'
        );


    if (whiteButton) {

        whiteButton.classList.add(
            "active"
        );

    }


    finishConvertButton();

}


// ===================================
// FORMAT NAME
// ===================================

function getFormatName(type) {

    if (!type) {

        return "-";

    }


    return type
        .replace(
            "image/",
            ""
        )
        .toUpperCase();

}


// ===================================
// FILE EXTENSION
// ===================================

function getExtension(type) {

    switch (type) {

        case "image/jpeg":
            return "jpg";

        case "image/png":
            return "png";

        case "image/webp":
            return "webp";

        case "image/avif":
            return "avif";

        default:
            return "png";

    }

}


// ===================================
// FILE SIZE FORMAT
// ===================================

function formatSize(bytes) {

    if (!bytes || bytes < 1024) {

        return (
            bytes || 0
        ) + " Bytes";

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