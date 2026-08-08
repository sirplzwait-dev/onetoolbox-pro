// =====================================
// OneToolBox - IMAGE COMPRESSOR
// Complete JavaScript
// =====================================


// =====================================
// ELEMENTS
// =====================================

const imageInput =
    document.getElementById("imageInput");

const uploadArea =
    document.getElementById("uploadArea");

const resetBtn =
    document.getElementById("resetBtn");

const originalPreview =
    document.getElementById("originalPreview");

const originalTitle =
    document.getElementById("originalTitle");

const uploadIcon =
    document.getElementById("uploadIcon");

const uploadText =
    document.getElementById("uploadText");

const uploadInfo =
    document.getElementById("uploadInfo");

const originalSize =
    document.getElementById("originalSize");

const compressedPreview =
    document.getElementById("compressedPreview");

const compressedSize =
    document.getElementById("compressedSize");

const savedPercent =
    document.getElementById("savedPercent");

const compressBtn =
    document.getElementById("compressBtn");

const downloadBtn =
    document.getElementById("downloadBtn");

const customSize =
    document.getElementById("customSize");

const progressBar =
    document.getElementById("progressBar");

const progressText =
    document.getElementById("progressText");


// =====================================
// VARIABLES
// =====================================

let selectedFile = null;

let compressedBlob = null;

let originalBytes = 0;

let fileType = "image/jpeg";


// =====================================
// SIZE SELECT
// =====================================

document
    .querySelectorAll(".size-btn input")
    .forEach(function (input) {

        input.addEventListener(
            "change",
            function () {

                if (
                    input.value === "custom"
                ) {

                    customSize.style.display =
                        "block";

                    customSize.focus();

                }

                else {

                    customSize.style.display =
                        "none";

                    customSize.value = "";

                }

            }
        );

    });


// =====================================
// SELECT IMAGE
// =====================================

if (imageInput) {

    imageInput.addEventListener(
        "change",
        function (event) {

            const file =
                event.target.files[0];

            loadImage(file);

        }
    );

}


// =====================================
// LOAD IMAGE
// =====================================

function loadImage(file) {

    if (!file) return;


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

    originalBytes =
        file.size;

    fileType =
        file.type || "image/jpeg";


    // Original size

    originalSize.innerText =
        formatSize(file.size);


    // Preview

    const url =
        URL.createObjectURL(file);


    originalPreview.src =
        url;


    originalPreview.style.display =
        "block";


    // Upload UI

    originalTitle.innerText =
        "Original Image";


    uploadIcon.style.display =
        "none";


    uploadText.style.display =
        "none";


    uploadInfo.style.display =
        "none";


    // Reset previous result

    compressedBlob = null;

    compressedPreview.src = "";

    compressedSize.innerText =
        "0 KB";

    savedPercent.innerText =
        "0%";

    progressBar.style.width =
        "0%";

    progressText.innerText =
        "0%";

    downloadBtn.disabled =
        true;

}


// =====================================
// DRAG & DROP
// =====================================

if (uploadArea) {

    uploadArea.addEventListener(
        "dragenter",
        function (event) {

            event.preventDefault();

            uploadArea.classList.add(
                "drag-active"
            );

        }
    );


    uploadArea.addEventListener(
        "dragover",
        function (event) {

            event.preventDefault();

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
        function (event) {

            event.preventDefault();

            uploadArea.classList.remove(
                "drag-active"
            );


            const file =
                event.dataTransfer.files[0];


            loadImage(file);

        }
    );

}


// =====================================
// PASTE IMAGE
// =====================================

document.addEventListener(
    "paste",
    function (event) {

        const items =
            event.clipboardData
                ? event.clipboardData.items
                : [];


        for (
            const item of items
        ) {

            if (
                item.type &&
                item.type.includes("image")
            ) {

                const file =
                    item.getAsFile();


                loadImage(file);

                break;

            }

        }

    }
);


// =====================================
// COMPRESS BUTTON
// =====================================

if (compressBtn) {

    compressBtn.addEventListener(
        "click",
        function () {

            if (!selectedFile) {

                alert(
                    "Please upload an image first."
                );

                return;

            }


            const selected =
                document.querySelector(
                    ".size-btn input:checked"
                );


            if (!selected) {

                alert(
                    "Please select a target size."
                );

                return;

            }


            let target;


            // Custom size

            if (
                selected.value === "custom"
            ) {

                const customValue =
                    Number(
                        customSize.value
                    );


                if (
                    !customValue ||
                    customValue <= 0
                ) {

                    alert(
                        "Please enter a valid target size in KB."
                    );

                    customSize.focus();

                    return;

                }


                target =
                    customValue * 1024;

            }


            // Preset size

            else {

                target =
                    Number(
                        selected.value
                    );

            }


            if (
                !target ||
                target <= 0
            ) {

                alert(
                    "Please select a valid target size."
                );

                return;

            }


            compressBtn.disabled =
                true;

            compressBtn.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Compressing...';


            progressBar.style.width =
                "0%";

            progressText.innerText =
                "0%";


            compressImage(target);

        }
    );

}


// =====================================
// COMPRESSION ENGINE
// =====================================

function compressImage(target) {

    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            const img =
                new Image();


            img.onload =
                function () {

                    const canvas =
                        document.createElement(
                            "canvas"
                        );


                    const ctx =
                        canvas.getContext(
                            "2d"
                        );


                    let scale =
                        1;


                    let quality =
                        0.95;


                    let attempts =
                        0;


                    function process() {

                        attempts++;


                        canvas.width =
                            Math.max(
                                1,
                                Math.round(
                                    img.width * scale
                                )
                            );


                        canvas.height =
                            Math.max(
                                1,
                                Math.round(
                                    img.height * scale
                                )
                            );


                        ctx.clearRect(
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );


                        /*
                         * White background for
                         * formats without alpha.
                         */

                        if (
                            fileType ===
                            "image/jpeg"
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


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );


                        canvas.toBlob(
                            function (blob) {

                                if (!blob) {

                                    finishCompressionError();

                                    return;

                                }


                                /*
                                 * Progress estimation
                                 */

                                let progress =
                                    Math.min(
                                        95,
                                        Math.max(
                                            5,
                                            Math.round(
                                                (1 - quality) * 100
                                            )
                                        )
                                    );


                                if (
                                    scale < 1
                                ) {

                                    progress =
                                        Math.min(
                                            95,
                                            progress + 10
                                        );

                                }


                                progressBar.style.width =
                                    progress + "%";


                                progressText.innerText =
                                    progress + "%";


                                /*
                                 * Target reached
                                 */

                                if (
                                    blob.size <= target
                                ) {

                                    compressedBlob =
                                        blob;

                                    showResult(
                                        blob
                                    );

                                    return;

                                }


                                /*
                                 * Quality reduction
                                 */

                                quality -=
                                    0.05;


                                /*
                                 * If quality is already low,
                                 * reduce dimensions.
                                 */

                                if (
                                    quality <= 0.20
                                ) {

                                    scale -=
                                        0.10;

                                    quality =
                                        0.90;

                                }


                                /*
                                 * Stop if dimensions
                                 * become too small.
                                 */

                                if (
                                    scale <= 0.10
                                ) {

                                    compressedBlob =
                                        blob;

                                    showResult(
                                        blob
                                    );

                                    return;

                                }


                                /*
                                 * Safety limit
                                 */

                                if (
                                    attempts >= 60
                                ) {

                                    compressedBlob =
                                        blob;

                                    showResult(
                                        blob
                                    );

                                    return;

                                }


                                setTimeout(
                                    process,
                                    80
                                );

                            },

                            /*
                             * Keep original image type
                             * where possible.
                             */

                            fileType,

                            quality

                        );

                    }


                    process();

                };


            img.onerror =
                function () {

                    finishCompressionError();

                };


            img.src =
                event.target.result;

        };


    reader.onerror =
        function () {

            finishCompressionError();

        };


    reader.readAsDataURL(
        selectedFile
    );

}


// =====================================
// RESULT
// =====================================

function showResult(blob) {

    compressedBlob =
        blob;


    compressedPreview.src =
        URL.createObjectURL(
            blob
        );


    compressedSize.innerText =
        formatSize(
            blob.size
        );


    let saved =
        100 -
        (
            (blob.size /
                originalBytes) *
            100
        );


    /*
     * Avoid negative value
     */

    saved =
        Math.max(
            0,
            saved
        );


    savedPercent.innerText =
        saved.toFixed(1) +
        "%";


    progressBar.style.width =
        "100%";


    progressText.innerText =
        "100%";


    downloadBtn.disabled =
        false;


    compressBtn.disabled =
        false;


    compressBtn.innerHTML =
        '<i class="fa-solid fa-compress"></i> Compress Image';

}


// =====================================
// DOWNLOAD
// =====================================

if (downloadBtn) {

    downloadBtn.addEventListener(
        "click",
        function () {

            if (
                !compressedBlob ||
                !selectedFile
            ) {

                return;

            }


            const url =
                URL.createObjectURL(
                    compressedBlob
                );


            const a =
                document.createElement(
                    "a"
                );


            a.href =
                url;


            /*
             * Use original extension
             */

            let extension =
                "jpg";


            if (
                fileType ===
                "image/png"
            ) {

                extension =
                    "png";

            }

            else if (
                fileType ===
                "image/webp"
            ) {

                extension =
                    "webp";

            }


            a.download =
                "compressed-image." +
                extension;


            document.body.appendChild(
                a
            );


            a.click();


            a.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );

        }
    );

}


// =====================================
// RESET
// =====================================

if (resetBtn) {

    resetBtn.addEventListener(
        "click",
        function () {

            selectedFile =
                null;


            compressedBlob =
                null;


            originalBytes =
                0;


            if (imageInput) {

                imageInput.value =
                    "";

            }


            originalPreview.src =
                "";

            originalPreview.style.display =
                "none";


            compressedPreview.src =
                "";


            originalTitle.innerText =
                "Upload Image";


            uploadIcon.style.display =
                "block";


            uploadText.style.display =
                "block";


            uploadInfo.style.display =
                "block";


            originalSize.innerText =
                "0 KB";


            compressedSize.innerText =
                "0 KB";


            savedPercent.innerText =
                "0%";


            progressBar.style.width =
                "0%";


            progressText.innerText =
                "0%";


            customSize.value =
                "";


            customSize.style.display =
                "none";


            downloadBtn.disabled =
                true;


            compressBtn.disabled =
                false;


            compressBtn.innerHTML =
                '<i class="fa-solid fa-compress"></i> Compress Image';


            document
                .querySelectorAll(
                    ".size-btn input"
                )
                .forEach(
                    function (input) {

                        input.checked =
                            input.value ===
                            "51200";

                    }
                );


            uploadArea.classList.remove(
                "drag-active"
            );

        }
    );

}


// =====================================
// ERROR
// =====================================

function finishCompressionError() {

    alert(
        "Unable to process this image. Please try another image."
    );


    compressBtn.disabled =
        false;


    compressBtn.innerHTML =
        '<i class="fa-solid fa-compress"></i> Compress Image';


    progressBar.style.width =
        "0%";


    progressText.innerText =
        "0%";

}


// =====================================
// FORMAT SIZE
// =====================================

function formatSize(bytes) {

    if (
        bytes < 1024
    ) {

        return (
            bytes + " Bytes"
        );

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