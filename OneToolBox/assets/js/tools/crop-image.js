/* =========================================================
   OneToolBox
   IMAGE CROPPER - COMPLETE JS
========================================================= */

"use strict";


/* =========================================================
   VARIABLES
========================================================= */

let cropper = null;

let resultUrl = null;

let currentRotation = 0;

let currentZoom = 1;

let scaleX = 1;

let scaleY = 1;

let backgroundColor = "#ffffff";


/* =========================================================
   ELEMENTS
========================================================= */

const imageInput =
    document.getElementById("imageInput");

const uploadArea =
    document.getElementById("uploadArea");

const cropImage =
    document.getElementById("cropImage");

const uploadIcon =
    document.getElementById("uploadIcon");

const uploadText =
    document.getElementById("uploadText");

const uploadInfo =
    document.getElementById("uploadInfo");


const fileName =
    document.getElementById("fileName");

const originalSize =
    document.getElementById("originalSize");

const originalResolution =
    document.getElementById("originalResolution");

const originalFormat =
    document.getElementById("originalFormat");


const resultImage =
    document.getElementById("resultImage");

const resultText =
    document.getElementById("resultText");

const newSize =
    document.getElementById("newSize");

const newResolution =
    document.getElementById("newResolution");

const newFormat =
    document.getElementById("newFormat");

const downloadBtn =
    document.getElementById("downloadBtn");


const resetBtn =
    document.getElementById("resetBtn");

const resetCrop =
    document.getElementById("resetCrop");

const cropBtn =
    document.getElementById("cropBtn");


const rotationRange =
    document.getElementById("rotationRange");

const rotationValue =
    document.getElementById("rotationValue");

const resetRotation =
    document.getElementById("resetRotation");


const zoomRange =
    document.getElementById("zoomRange");

const zoomIn =
    document.getElementById("zoomIn");

const zoomOut =
    document.getElementById("zoomOut");


const qualityRange =
    document.getElementById("qualityRange");

const qualityValue =
    document.getElementById("qualityValue");


const formatSelect =
    document.getElementById("formatSelect");


const moveMode =
    document.getElementById("moveMode");

const cropMode =
    document.getElementById("cropMode");


/* =========================================================
   SAFETY CHECK
========================================================= */

if (!imageInput || !cropImage) {

    console.error(
        "Image Cropper: required HTML elements are missing."
    );

}


/* =========================================================
   FILE SIZE
========================================================= */

function formatSize(bytes) {

    if (!bytes || bytes <= 0) {

        return "0 KB";

    }


    if (bytes < 1024) {

        return bytes + " Bytes";

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


/* =========================================================
   FORMAT NAME
========================================================= */

function formatName(type) {

    if (!type) {

        return "-";

    }


    return type
        .replace("image/", "")
        .toUpperCase();

}


/* =========================================================
   FILE EXTENSION
========================================================= */

function getExtension(type) {

    if (type === "image/jpeg") {

        return "jpg";

    }


    if (type === "image/webp") {

        return "webp";

    }


    return "png";

}


/* =========================================================
   LOAD IMAGE
========================================================= */

function loadImage(file) {

    if (!file) {

        return;

    }


    if (
        !file.type ||
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select a valid image."
        );

        return;

    }


    fileName.textContent =
        file.name;


    originalSize.textContent =
        formatSize(file.size);


    originalFormat.textContent =
        formatName(file.type);


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            cropImage.onload =
                function() {

                    originalResolution.textContent =
                        cropImage.naturalWidth +
                        " × " +
                        cropImage.naturalHeight +
                        " px";


                    createCropper();

                };


            cropImage.src =
                event.target.result;


            cropImage.style.display =
                "block";


            uploadIcon.style.display =
                "none";


            uploadText.style.display =
                "none";


            uploadInfo.style.display =
                "none";

        };


    reader.onerror =
        function() {

            alert(
                "Unable to read this image."
            );

        };


    reader.readAsDataURL(file);

}


/* =========================================================
   CREATE CROPPER
========================================================= */

function createCropper() {

    if (
        typeof Cropper ===
        "undefined"
    ) {

        alert(
            "Cropper.js could not be loaded."
        );

        return;

    }


    if (cropper) {

        cropper.destroy();

        cropper = null;

    }


    currentRotation = 0;

    currentZoom = 1;

    scaleX = 1;

    scaleY = 1;


    rotationRange.value =
        "0";


    rotationValue.textContent =
        "0°";


    zoomRange.value =
        "1";


    cropper =
        new Cropper(
            cropImage,
            {

                viewMode: 1,

                dragMode: "crop",

                autoCropArea: .85,

                responsive: true,

                restore: false,

                background: false,

                movable: true,

                zoomable: true,

                rotatable: true,

                scalable: true,

                cropBoxMovable: true,

                cropBoxResizable: true,

                guides: true,

                center: true,

                highlight: true,

                toggleDragModeOnDblclick: false,

                ready: function() {

                    setRatio(
                        "free"
                    );

                }

            }
        );

}


/* =========================================================
   FILE INPUT
========================================================= */

imageInput.addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files &&
            event.target.files[0];


        if (file) {

            loadImage(file);

        }

    }
);


/* =========================================================
   DRAG & DROP
========================================================= */

uploadArea.addEventListener(
    "dragover",
    function(event) {

        event.preventDefault();

        uploadArea.classList.add(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "dragleave",
    function() {

        uploadArea.classList.remove(
            "dragging"
        );

    }
);


uploadArea.addEventListener(
    "drop",
    function(event) {

        event.preventDefault();

        uploadArea.classList.remove(
            "dragging"
        );


        const file =
            event.dataTransfer.files &&
            event.dataTransfer.files[0];


        if (file) {

            loadImage(file);

        }

    }
);


/* =========================================================
   PASTE IMAGE
========================================================= */

document.addEventListener(
    "paste",
    function(event) {

        if (
            !event.clipboardData ||
            !event.clipboardData.items
        ) {

            return;

        }


        for (
            const item
            of event.clipboardData.items
        ) {

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


/* =========================================================
   ASPECT RATIO
========================================================= */

document
    .querySelectorAll(".ratio-btn")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".ratio-btn"
                        )
                        .forEach(
                            function(btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                    this.classList.add(
                        "active"
                    );


                    setRatio(
                        this.dataset.ratio
                    );

                }
            );

        }
    );


function setRatio(value) {

    if (!cropper) {

        return;

    }


    if (value === "free") {

        cropper.setAspectRatio(
            NaN
        );

        return;

    }


    const ratio =
        Number(value);


    if (
        Number.isFinite(ratio) &&
        ratio > 0
    ) {

        cropper.setAspectRatio(
            ratio
        );

    }

}


/* =========================================================
   ROTATE LEFT
========================================================= */

document
    .getElementById("rotateLeft")
    .addEventListener(
        "click",
        function() {

            if (!cropper) {

                return;

            }


            cropper.rotate(-90);


            currentRotation -= 90;


            if (
                currentRotation < -180
            ) {

                currentRotation = 180;

            }


            updateRotationUI();

        }
    );


/* =========================================================
   ROTATE RIGHT
========================================================= */

document
    .getElementById("rotateRight")
    .addEventListener(
        "click",
        function() {

            if (!cropper) {

                return;

            }


            cropper.rotate(90);


            currentRotation += 90;


            if (
                currentRotation > 180
            ) {

                currentRotation = -180;

            }


            updateRotationUI();

        }
    );


/* =========================================================
   ROTATION SLIDER

   IMPORTANT:
   Rotate only by difference so it doesn't
   accumulate incorrectly.
========================================================= */

rotationRange.addEventListener(
    "input",
    function() {

        if (!cropper) {

            return;

        }


        const target =
            Number(this.value);


        const difference =
            target -
            currentRotation;


        cropper.rotate(
            difference
        );


        currentRotation =
            target;


        updateRotationUI();

    }
);


function updateRotationUI() {

    rotationRange.value =
        currentRotation;


    rotationValue.textContent =
        currentRotation +
        "°";

}


/* =========================================================
   RESET ROTATION
========================================================= */

resetRotation.addEventListener(
    "click",
    function() {

        if (!cropper) {

            return;

        }


        const difference =
            -currentRotation;


        cropper.rotate(
            difference
        );


        currentRotation =
            0;


        updateRotationUI();

    }
);


/* =========================================================
   FLIP HORIZONTAL
========================================================= */

document
    .getElementById("flipHorizontal")
    .addEventListener(
        "click",
        function() {

            if (!cropper) {

                return;

            }


            scaleX *= -1;


            cropper.scaleX(
                scaleX
            );

        }
    );


/* =========================================================
   FLIP VERTICAL
========================================================= */

document
    .getElementById("flipVertical")
    .addEventListener(
        "click",
        function() {

            if (!cropper) {

                return;

            }


            scaleY *= -1;


            cropper.scaleY(
                scaleY
            );

        }
    );


/* =========================================================
   MOVE MODE
========================================================= */

moveMode.addEventListener(
    "click",
    function() {

        if (!cropper) {

            return;

        }


        cropper.setDragMode(
            "move"
        );


        moveMode.classList.add(
            "active"
        );


        cropMode.classList.remove(
            "active"
        );

    }
);


/* =========================================================
   CROP MODE
========================================================= */

cropMode.addEventListener(
    "click",
    function() {

        if (!cropper) {

            return;

        }


        cropper.setDragMode(
            "crop"
        );


        cropMode.classList.add(
            "active"
        );


        moveMode.classList.remove(
            "active"
        );

    }
);


/* =========================================================
   ZOOM IN
========================================================= */

zoomIn.addEventListener(
    "click",
    function() {

        if (!cropper) {

            return;

        }


        currentZoom =
            Math.min(
                3,
                currentZoom + .1
            );


        cropper.zoomTo(
            currentZoom
        );


        zoomRange.value =
            currentZoom.toFixed(2);

    }
);


/* =========================================================
   ZOOM OUT
========================================================= */

zoomOut.addEventListener(
    "click",
    function() {

        if (!cropper) {

            return;

        }


        currentZoom =
            Math.max(
                .1,
                currentZoom - .1
            );


        cropper.zoomTo(
            currentZoom
        );


        zoomRange.value =
            currentZoom.toFixed(2);

    }
);


/* =========================================================
   ZOOM SLIDER
========================================================= */

zoomRange.addEventListener(
    "input",
    function() {

        if (!cropper) {

            return;

        }


        currentZoom =
            Number(this.value);


        cropper.zoomTo(
            currentZoom
        );

    }
);


/* =========================================================
   QUALITY
========================================================= */

qualityRange.addEventListener(
    "input",
    function() {

        qualityValue.textContent =
            this.value +
            "%";

    }
);


/* =========================================================
   BACKGROUND
========================================================= */

document
    .querySelectorAll(".background-btn")
    .forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    document
                        .querySelectorAll(
                            ".background-btn"
                        )
                        .forEach(
                            function(btn) {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                    this.classList.add(
                        "active"
                    );


                    backgroundColor =
                        this.dataset.color;

                }
            );

        }
    );


/* =========================================================
   RESET CROP
========================================================= */

resetCrop.addEventListener(
    "click",
    function() {

        if (!cropper) {

            alert(
                "Please upload an image first."
            );

            return;

        }


        cropper.reset();


        currentRotation = 0;

        currentZoom = 1;

        scaleX = 1;

        scaleY = 1;


        rotationRange.value =
            "0";


        rotationValue.textContent =
            "0°";


        zoomRange.value =
            "1";


        const activeRatio =
            document.querySelector(
                ".ratio-btn.active"
            );


        if (activeRatio) {

            setRatio(
                activeRatio.dataset.ratio
            );

        }

    }
);


/* =========================================================
   CROP BUTTON
========================================================= */

cropBtn.addEventListener(
    "click",
    function() {

        if (!cropper) {

            alert(
                "Please upload an image first."
            );

            return;

        }


        cropBtn.disabled = true;


        cropBtn.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Cropping...';


        const type =
            formatSelect.value;


        const quality =
            Number(
                qualityRange.value
            ) / 100;


        const canvas =
            cropper.getCroppedCanvas({

                imageSmoothingEnabled: true,

                imageSmoothingQuality:
                    "high",

                fillColor:
                    type === "image/jpeg"
                        ? getJpgBackground()
                        : "transparent"

            });


        if (!canvas) {

            alert(
                "Unable to crop image."
            );


            finishCrop();

            return;

        }


        if (
            type === "image/jpeg"
        ) {

            const finalCanvas =
                document.createElement(
                    "canvas"
                );


            finalCanvas.width =
                canvas.width;


            finalCanvas.height =
                canvas.height;


            const ctx =
                finalCanvas.getContext(
                    "2d"
                );


            ctx.fillStyle =
                getJpgBackground();


            ctx.fillRect(
                0,
                0,
                finalCanvas.width,
                finalCanvas.height
            );


            ctx.drawImage(
                canvas,
                0,
                0
            );


            exportCanvas(
                finalCanvas,
                type,
                quality
            );

        }
        else {

            exportCanvas(
                canvas,
                type,
                quality
            );

        }

    }
);


/* =========================================================
   JPG BACKGROUND
========================================================= */

function getJpgBackground() {

    if (
        backgroundColor ===
        "transparent"
    ) {

        return "#ffffff";

    }


    return backgroundColor;

}


/* =========================================================
   EXPORT
========================================================= */

function exportCanvas(
    canvas,
    type,
    quality
) {

    canvas.toBlob(
        function(blob) {

            if (!blob) {

                alert(
                    "Unable to create image."
                );


                finishCrop();

                return;

            }


            if (resultUrl) {

                URL.revokeObjectURL(
                    resultUrl
                );

            }


            resultUrl =
                URL.createObjectURL(
                    blob
                );


            resultImage.src =
                resultUrl;


            resultImage.style.display =
                "block";


            resultText.style.display =
                "none";


            newSize.textContent =
                formatSize(
                    blob.size
                );


            newResolution.textContent =
                canvas.width +
                " × " +
                canvas.height +
                " px";


            newFormat.textContent =
                formatName(type);


            downloadBtn.href =
                resultUrl;


            downloadBtn.download =
                "cropped-image." +
                getExtension(type);


            downloadBtn.classList.remove(
                "disabled"
            );


            downloadBtn.setAttribute(
                "aria-disabled",
                "false"
            );


            finishCrop();

        },
        type,
        quality
    );

}


/* =========================================================
   FINISH CROP
========================================================= */

function finishCrop() {

    cropBtn.disabled =
        false;


    cropBtn.innerHTML =
        '<i class="fa-solid fa-crop-simple"></i> Crop Image';

}


/* =========================================================
   RESET EVERYTHING
========================================================= */

resetBtn.addEventListener(
    "click",
    function() {

        if (cropper) {

            cropper.destroy();

            cropper = null;

        }


        if (resultUrl) {

            URL.revokeObjectURL(
                resultUrl
            );

            resultUrl = null;

        }


        imageInput.value =
            "";


        cropImage.removeAttribute(
            "src"
        );


        cropImage.style.display =
            "none";


        uploadIcon.style.display =
            "";


        uploadText.style.display =
            "";


        uploadInfo.style.display =
            "";


        fileName.textContent =
            "-";


        originalSize.textContent =
            "0 KB";


        originalResolution.textContent =
            "0 × 0 px";


        originalFormat.textContent =
            "-";


        resultImage.removeAttribute(
            "src"
        );


        resultImage.style.display =
            "none";


        resultText.style.display =
            "";


        newSize.textContent =
            "0 KB";


        newResolution.textContent =
            "0 × 0 px";


        newFormat.textContent =
            "-";


        downloadBtn.removeAttribute(
            "href"
        );


        downloadBtn.removeAttribute(
            "download"
        );


        downloadBtn.classList.add(
            "disabled"
        );


        downloadBtn.setAttribute(
            "aria-disabled",
            "true"
        );


        currentRotation = 0;

        currentZoom = 1;

        scaleX = 1;

        scaleY = 1;


        rotationRange.value =
            "0";


        rotationValue.textContent =
            "0°";


        zoomRange.value =
            "1";


        qualityRange.value =
            "90";


        qualityValue.textContent =
            "90%";


        formatSelect.value =
            "image/jpeg";


        backgroundColor =
            "#ffffff";


        document
            .querySelectorAll(
                ".background-btn"
            )
            .forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


        const white =
            document.querySelector(
                '.background-btn[data-color="#ffffff"]'
            );


        if (white) {

            white.classList.add(
                "active"
            );

        }


        document
            .querySelectorAll(
                ".ratio-btn"
            )
            .forEach(
                function(btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


        const free =
            document.querySelector(
                '.ratio-btn[data-ratio="free"]'
            );


        if (free) {

            free.classList.add(
                "active"
            );

        }


        cropMode.classList.add(
            "active"
        );


        moveMode.classList.remove(
            "active"
        );


        finishCrop();

    }
);


/* =========================================================
   PREVENT DOWNLOAD LINK JUMP WHEN DISABLED
========================================================= */

downloadBtn.addEventListener(
    "click",
    function(event) {

        if (
            downloadBtn.classList.contains(
                "disabled"
            )
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================================
   INITIAL QUALITY
========================================================= */

qualityValue.textContent =
    qualityRange.value +
    "%";