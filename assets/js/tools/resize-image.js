// =====================================
// RESIZE IMAGE TOOL
// OneToolBox
// =====================================

const imageInput = document.getElementById("imageInput");
const uploadArea = document.getElementById("uploadArea");
const resetBtn = document.getElementById("resetBtn");

const originalPreview = document.getElementById("originalPreview");
const resizedPreview = document.getElementById("resizedPreview");
const resultText = document.getElementById("resultText");

const uploadIcon = document.getElementById("uploadIcon");
const uploadText = document.getElementById("uploadText");
const uploadInfo = document.getElementById("uploadInfo");

const originalSize = document.getElementById("originalSize");
const originalDimension = document.getElementById("originalDimension");

const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const dpiInput = document.getElementById("dpiInput");

const widthUnit = document.getElementById("widthUnit");
const heightUnit = document.getElementById("heightUnit");

const ratioLock = document.getElementById("ratioLock");

const resizeBtn = document.getElementById("resizeBtn");
const downloadBtn = document.getElementById("downloadBtn");

const newDimension = document.getElementById("newDimension");
const newSize = document.getElementById("newSize");


// =====================================
// VARIABLES
// =====================================

let image = null;
let originalFile = null;

let originalWidth = 0;
let originalHeight = 0;

let aspectRatio = 1;
let currentUnit = "px";

let resizedUrl = null;


// =====================================
// UNIT BUTTONS
// =====================================

document.querySelectorAll(".mode").forEach(button => {

    button.addEventListener("click", () => {

        document.querySelectorAll(".mode")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        currentUnit = button.dataset.unit;

        widthUnit.textContent = currentUnit;
        heightUnit.textContent = currentUnit;

        if (image) {
            showUnitValue();
        }

    });

});


// =====================================
// IMAGE SELECT
// =====================================

imageInput.addEventListener("change", function (e) {

    const file = e.target.files[0];

    if (file) {
        loadImage(file);
    }

});


// =====================================
// UPLOAD AREA CLICK
// =====================================

uploadArea.addEventListener("click", function (e) {

    if (e.target.closest(".choose-btn")) {
        return;
    }

    imageInput.click();

});


// =====================================
// LOAD IMAGE
// =====================================

function loadImage(file) {

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("Please select a valid image.");

        return;
    }

    originalFile = file;

    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = function () {

        image = img;

        originalWidth = img.naturalWidth;
        originalHeight = img.naturalHeight;

        aspectRatio = originalWidth / originalHeight;


        // Original preview
        originalPreview.src = url;

        originalPreview.style.display = "block";


        // Hide upload placeholder
        uploadIcon.style.display = "none";
        uploadText.style.display = "none";
        uploadInfo.style.display = "none";


        // Original information
        originalSize.textContent = formatSize(file.size);

        originalDimension.textContent =
            `${originalWidth} × ${originalHeight} px`;


        // Default dimensions
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;


        // Clear previous result
        resetResult();


        // Apply selected unit
        showUnitValue();

    };


    img.onerror = function () {

        alert("Unable to load image.");

        URL.revokeObjectURL(url);

    };


    img.src = url;

}


// =====================================
// WIDTH CHANGE
// =====================================

widthInput.addEventListener("input", function () {

    if (!ratioLock.checked || !image) {
        return;
    }

    const width = Number(widthInput.value);

    if (!width || width <= 0) {
        return;
    }

    const height = width / aspectRatio;


    if (currentUnit === "px") {

        heightInput.value = Math.round(height);

    } else {

        heightInput.value = height.toFixed(2);

    }

});


// =====================================
// HEIGHT CHANGE
// =====================================

heightInput.addEventListener("input", function () {

    if (!ratioLock.checked || !image) {
        return;
    }

    const height = Number(heightInput.value);

    if (!height || height <= 0) {
        return;
    }

    const width = height * aspectRatio;


    if (currentUnit === "px") {

        widthInput.value = Math.round(width);

    } else {

        widthInput.value = width.toFixed(2);

    }

});


// =====================================
// DPI CHANGE
// =====================================

dpiInput.addEventListener("input", function () {

    if (!image) {
        return;
    }

    if (currentUnit !== "px") {
        showUnitValue();
    }

});


// =====================================
// SHOW UNIT VALUE
// =====================================

function showUnitValue() {

    if (!image) {
        return;
    }

    const dpi = Number(dpiInput.value) || 300;


    // CM
    if (currentUnit === "cm") {

        widthInput.value =
            (originalWidth * 2.54 / dpi).toFixed(2);

        heightInput.value =
            (originalHeight * 2.54 / dpi).toFixed(2);

    }


    // INCH
    else if (currentUnit === "inch") {

        widthInput.value =
            (originalWidth / dpi).toFixed(2);

        heightInput.value =
            (originalHeight / dpi).toFixed(2);

    }


    // PX
    else {

        widthInput.value = originalWidth;

        heightInput.value = originalHeight;

    }

}


// =====================================
// CONVERT VALUE TO PIXEL
// =====================================

function convertToPixel(value) {

    const dpi = Number(dpiInput.value) || 300;


    // CM → PX
    if (currentUnit === "cm") {

        return Math.round(
            value * dpi / 2.54
        );

    }


    // INCH → PX
    if (currentUnit === "inch") {

        return Math.round(
            value * dpi
        );

    }


    // PX
    return Math.round(value);

}


// =====================================
// RESIZE IMAGE
// =====================================

resizeBtn.addEventListener("click", function () {

    if (!image) {

        alert("Please upload image first.");

        return;
    }


    const widthValue = Number(widthInput.value);
    const heightValue = Number(heightInput.value);


    if (
        !widthValue ||
        widthValue <= 0 ||
        !heightValue ||
        heightValue <= 0
    ) {

        alert("Please enter valid width and height.");

        return;
    }


    const width = convertToPixel(widthValue);
    const height = convertToPixel(heightValue);


    if (width < 1 || height < 1) {

        alert("Image dimensions are too small.");

        return;
    }


    // Button loading
    resizeBtn.disabled = true;

    resizeBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Resizing...';


    setTimeout(function () {

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;


        const ctx = canvas.getContext("2d");


        // JPEG needs white background
        if (
            originalFile &&
            (
                originalFile.type === "image/jpeg" ||
                originalFile.type === "image/jpg"
            )
        ) {

            ctx.fillStyle = "#ffffff";

            ctx.fillRect(
                0,
                0,
                width,
                height
            );

        }


        // High quality resizing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";


        // Draw image
        ctx.drawImage(
            image,
            0,
            0,
            width,
            height
        );


        // Output format
        const mimeType =
            getOutputType(originalFile);


        canvas.toBlob(
            function (blob) {

                if (!blob) {

                    alert(
                        "Unable to create resized image."
                    );

                    finishResizeButton();

                    return;
                }


                // Remove old URL
                if (resizedUrl) {

                    URL.revokeObjectURL(
                        resizedUrl
                    );

                }


                // New URL
                resizedUrl =
                    URL.createObjectURL(blob);


                // Preview
                resizedPreview.src =
                    resizedUrl;

                resizedPreview.style.display =
                    "block";


                resultText.style.display =
                    "none";


                // Details
                newDimension.textContent =
                    `${width} × ${height} px`;


                newSize.textContent =
                    formatSize(blob.size);


                // Download
                downloadBtn.href =
                    resizedUrl;


                downloadBtn.download =
                    "resized-image." +
                    getExtension(mimeType);


                downloadBtn.classList.remove(
                    "disabled"
                );


                downloadBtn.setAttribute(
                    "aria-disabled",
                    "false"
                );


                finishResizeButton();

            },
            mimeType,
            mimeType === "image/jpeg"
                ? 0.92
                : undefined
        );

    }, 100);

});


// =====================================
// FINISH BUTTON
// =====================================

function finishResizeButton() {

    resizeBtn.disabled = false;

    resizeBtn.innerHTML =
        '<i class="fa-solid fa-expand"></i> Resize Image';

}


// =====================================
// OUTPUT TYPE
// =====================================

function getOutputType(file) {

    if (!file || !file.type) {

        return "image/png";

    }


    const supportedTypes = [

        "image/jpeg",
        "image/png",
        "image/webp"

    ];


    if (
        supportedTypes.includes(file.type)
    ) {

        return file.type;

    }


    return "image/png";

}


// =====================================
// FILE EXTENSION
// =====================================

function getExtension(type) {

    if (type === "image/jpeg") {
        return "jpg";
    }

    if (type === "image/webp") {
        return "webp";
    }

    return "png";

}


// =====================================
// RESET BUTTON
// =====================================

resetBtn.addEventListener(
    "click",
    resetTool
);


function resetTool() {

    // Remove generated URL
    if (resizedUrl) {

        URL.revokeObjectURL(
            resizedUrl
        );

        resizedUrl = null;

    }


    // Clear variables
    image = null;
    originalFile = null;

    originalWidth = 0;
    originalHeight = 0;

    aspectRatio = 1;


    // Clear file
    imageInput.value = "";


    // Original preview
    originalPreview.src = "";

    originalPreview.style.display =
        "none";


    // Result preview
    resizedPreview.src = "";

    resizedPreview.style.display =
        "none";


    resultText.style.display =
        "flex";


    // Upload placeholder
    uploadIcon.style.display =
        "block";

    uploadText.style.display =
        "block";

    uploadInfo.style.display =
        "block";


    // Information
    originalSize.textContent =
        "0 KB";

    originalDimension.textContent =
        "0 × 0 px";


    newDimension.textContent =
        "0 × 0 px";

    newSize.textContent =
        "0 KB";


    // Inputs
    widthInput.value = "";
    heightInput.value = "";


    // Download
    downloadBtn.href = "#";

    downloadBtn.classList.add(
        "disabled"
    );

    downloadBtn.setAttribute(
        "aria-disabled",
        "true"
    );


    // Default unit
    currentUnit = "px";

    widthUnit.textContent = "px";
    heightUnit.textContent = "px";


    document.querySelectorAll(".mode")
        .forEach(btn =>
            btn.classList.remove("active")
        );


    const pxButton =
        document.querySelector(
            '.mode[data-unit="px"]'
        );


    if (pxButton) {

        pxButton.classList.add("active");

    }


    finishResizeButton();

}


// =====================================
// RESET RESULT ONLY
// =====================================

function resetResult() {

    if (resizedUrl) {

        URL.revokeObjectURL(
            resizedUrl
        );

        resizedUrl = null;

    }


    resizedPreview.src = "";

    resizedPreview.style.display =
        "none";


    resultText.style.display =
        "flex";


    newDimension.textContent =
        "0 × 0 px";


    newSize.textContent =
        "0 KB";


    downloadBtn.href = "#";

    downloadBtn.classList.add(
        "disabled"
    );

    downloadBtn.setAttribute(
        "aria-disabled",
        "true"
    );

}


// =====================================
// DRAG & DROP
// =====================================

uploadArea.addEventListener(
    "dragover",
    function (e) {

        e.preventDefault();

        uploadArea.classList.add(
            "drag-active"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function () {

        uploadArea.classList.remove(
            "drag-active"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function (e) {

        e.preventDefault();

        uploadArea.classList.remove(
            "drag-active"
        );


        const file =
            e.dataTransfer.files[0];


        if (file) {

            loadImage(file);

        }

    }
);


// =====================================
// FORMAT SIZE
// =====================================

function formatSize(bytes) {

    if (!bytes || bytes < 1024) {

        return (bytes || 0) +
            " Bytes";

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