"use strict";

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const input = document.getElementById("imageInput");
    const uploadArea = document.getElementById("uploadArea");
    const imageList = document.getElementById("imageList");

    const uploadIcon = document.getElementById("uploadIcon");
    const uploadTitle = document.getElementById("uploadTitle");
    const uploadDescription =
        document.getElementById("uploadDescription");

    const clearBtn =
        document.getElementById("clearAllBtn");

    const imageCount =
        document.getElementById("imageCount");

    const totalSize =
        document.getElementById("totalSize");

    const generateBtn =
        document.getElementById("generatePdfBtn");

    const resetBtn =
        document.getElementById("resetSettingsBtn");

    const marginRange =
        document.getElementById("marginRange");

    const marginValue =
        document.getElementById("marginValue");

    const qualityRange =
        document.getElementById("qualityRange");

    const qualityValue =
        document.getElementById("qualityValue");

    const fileNameInput =
        document.getElementById("pdfFileName");

    const pdfPreview =
        document.getElementById("pdfPreview");

    const pdfPlaceholder =
        document.getElementById("pdfPlaceholder");

    const pdfPages =
        document.getElementById("pdfPages");

    const pdfSize =
        document.getElementById("pdfSize");

    const pdfResultName =
        document.getElementById("pdfResultName");

    const downloadBtn =
        document.getElementById("downloadPdfBtn");


    /* =====================================================
       CHECK
    ===================================================== */

    if (!input) {
        console.error("imageInput not found");
        return;
    }

    if (!imageList) {
        console.error("imageList not found");
        return;
    }


    /* =====================================================
       DATA
    ===================================================== */

    let images = [];

    let pdfUrl = null;

    let settings = {

        pageSize: "A4",

        orientation: "portrait",

        fit: "contain",

        margin: 10,

        quality: 90,

        compression: "medium",

        background: "#ffffff"

    };


    /* =====================================================
       PREVIEW BOX
    ===================================================== */

    let previewBox =
        document.getElementById("jsImagePreview");

    if (!previewBox) {

        previewBox =
            document.createElement("div");

        previewBox.id =
            "jsImagePreview";

        previewBox.style.cssText = `
            display:none;
            width:100%;
            margin:15px 0;
            padding:8px;
            box-sizing:border-box;
            border:1px solid #dbe3ec;
            border-radius:12px;
            background:#fff;
        `;

        const previewImg =
            document.createElement("img");

        previewImg.id =
            "jsPreviewImage";

        previewImg.style.cssText = `
            display:block;
            width:100%;
            height:220px;
            object-fit:contain;
            border-radius:8px;
            background:#f8fafc;
        `;

        previewBox.appendChild(previewImg);

        if (uploadIcon) {

            uploadIcon.insertAdjacentElement(
                "afterend",
                previewBox
            );

        } else {

            uploadArea.prepend(
                previewBox
            );

        }

    }


    const previewImage =
        document.getElementById(
            "jsPreviewImage"
        );


    /* =====================================================
       FORMAT SIZE
    ===================================================== */

    function formatSize(bytes) {

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
            bytes / (1024 * 1024)
        ).toFixed(2) + " MB";

    }


    /* =====================================================
       READ IMAGE
    ===================================================== */

    function readImage(file) {

        return new Promise(function (resolve, reject) {

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    const img =
                        new Image();

                    img.onload =
                        function () {

                            resolve({

                                id:
                                    Date.now() +
                                    "_" +
                                    Math.random()
                                        .toString(36)
                                        .substring(2),

                                name:
                                    file.name,

                                size:
                                    file.size,

                                type:
                                    file.type,

                                src:
                                    event.target.result,

                                width:
                                    img.naturalWidth,

                                height:
                                    img.naturalHeight

                            });

                        };

                    img.onerror =
                        reject;

                    img.src =
                        event.target.result;

                };

            reader.onerror =
                reject;

            reader.readAsDataURL(
                file
            );

        });

    }


    /* =====================================================
       ADD FILES
    ===================================================== */

    async function addFiles(fileList) {

        const files =
            Array.from(
                fileList || []
            );

        if (!files.length) {
            return;
        }

        for (
            const file of files
        ) {

            if (
                !file.type ||
                !file.type.startsWith("image/")
            ) {
                continue;
            }

            try {

                const image =
                    await readImage(file);

                images.push(image);

            } catch (error) {

                console.error(
                    "Image error:",
                    error
                );

            }

        }

        renderImages();

        input.value = "";

    }


    /* =====================================================
       CHOOSE IMAGE
    ===================================================== */

    input.addEventListener(
        "change",
        function (event) {

            addFiles(
                event.target.files
            );

        }
    );


    /* =====================================================
       SHOW PREVIEW
    ===================================================== */

    function showPreview(image) {

        if (!image) {

            previewBox.style.display =
                "none";

            previewImage.removeAttribute(
                "src"
            );

            return;
        }

        previewImage.src =
            image.src;

        previewBox.style.display =
            "block";

    }


    /* =====================================================
       RENDER IMAGES
    ===================================================== */

    function renderImages() {

        imageList.innerHTML = "";

        if (!images.length) {

            imageList.style.display =
                "none";

            showPreview(null);

            if (uploadIcon) {

                uploadIcon.style.display =
                    "block";

            }

            if (uploadTitle) {

                uploadTitle.textContent =
                    "Upload Images";

            }

            if (uploadDescription) {

                uploadDescription.textContent =
                    "Select multiple images, drag & drop or paste.";

            }

            updateInfo();

            return;
        }


        showPreview(
            images[0]
        );


        if (uploadIcon) {

            uploadIcon.style.display =
                "none";

        }


        if (uploadTitle) {

            uploadTitle.textContent =
                images.length +
                " Image" +
                (
                    images.length > 1
                        ? "s"
                        : ""
                ) +
                " Selected";

        }


        if (uploadDescription) {

            uploadDescription.textContent =
                "Click a thumbnail to preview it.";

        }


        imageList.style.display =
            "flex";


        images.forEach(
            function (image, index) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "image-item";

                item.dataset.id =
                    image.id;

                item.innerHTML = `

                    <img
                        class="image-thumb"
                        src="${image.src}"
                        alt=""
                    >

                    <div
                        class="image-item-info"
                    >

                        <div
                            class="image-item-name"
                            title="${image.name}"
                        >
                            ${index + 1}.
                            ${image.name}
                        </div>

                        <div
                            class="image-item-size"
                        >
                            ${formatSize(image.size)}
                            •
                            ${image.width}
                            ×
                            ${image.height}px
                        </div>

                    </div>

                    <button
                        type="button"
                        class="remove-image-btn"
                        data-id="${image.id}"
                    >
                        ×
                    </button>

                `;

                imageList.appendChild(
                    item
                );

            }
        );


        updateInfo();

    }


    /* =====================================================
       THUMBNAIL CLICK / REMOVE
    ===================================================== */

    imageList.addEventListener(
        "click",
        function (event) {

            const removeBtn =
                event.target.closest(
                    ".remove-image-btn"
                );


            if (removeBtn) {

                event.preventDefault();
                event.stopPropagation();

                const id =
                    removeBtn.dataset.id;

                images =
                    images.filter(
                        function (image) {

                            return (
                                image.id != id
                            );

                        }
                    );

                renderImages();

                return;
            }


            const item =
                event.target.closest(
                    ".image-item"
                );


            if (!item) {
                return;
            }


            const image =
                images.find(
                    function (image) {

                        return (
                            image.id ==
                            item.dataset.id
                        );

                    }
                );


            if (image) {

                showPreview(
                    image
                );

            }

        }
    );


    /* =====================================================
       CLEAR ALL
    ===================================================== */

    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            function () {

                images = [];

                input.value = "";

                renderImages();

                resetPDFPreview();

            }
        );

    }


    /* =====================================================
       DRAG & DROP
    ===================================================== */

    if (uploadArea) {

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
            function () {

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

                addFiles(
                    event.dataTransfer.files
                );

            }
        );

    }


    /* =====================================================
       UPDATE IMAGE INFO
    ===================================================== */

    function updateInfo() {

        if (imageCount) {

            imageCount.textContent =
                images.length;

        }


        let total = 0;

        images.forEach(
            function (image) {

                total +=
                    image.size;

            }
        );


        if (totalSize) {

            totalSize.textContent =
                formatSize(total);

        }


        if (generateBtn) {

            generateBtn.disabled =
                images.length === 0;

        }

    }


    /* =====================================================
       ACTIVE BUTTON
    ===================================================== */

    function activate(
        selector,
        attribute,
        value
    ) {

        document
            .querySelectorAll(selector)
            .forEach(
                function (button) {

                    button.classList.toggle(
                        "active",
                        button.getAttribute(
                            attribute
                        ) === value
                    );

                }
            );

    }


    /* =====================================================
       PAGE SIZE BUTTONS
    ===================================================== */

    document
        .querySelectorAll(
            ".pdf-option"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        settings.pageSize =
                            button.dataset.pageSize;

                        activate(
                            ".pdf-option",
                            "data-page-size",
                            settings.pageSize
                        );

                    }
                );

            }
        );


    /* =====================================================
       ORIENTATION
    ===================================================== */

    document
        .querySelectorAll(
            ".orientation-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        settings.orientation =
                            button.dataset.orientation;

                        activate(
                            ".orientation-btn",
                            "data-orientation",
                            settings.orientation
                        );

                    }
                );

            }
        );


    /* =====================================================
       FIT
    ===================================================== */

    document
        .querySelectorAll(
            ".fit-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        settings.fit =
                            button.dataset.fit;

                        activate(
                            ".fit-btn",
                            "data-fit",
                            settings.fit
                        );

                    }
                );

            }
        );


    /* =====================================================
       MARGIN
    ===================================================== */

    if (marginRange) {

        marginRange.addEventListener(
            "input",
            function () {

                settings.margin =
                    Number(
                        marginRange.value
                    );

                if (marginValue) {

                    marginValue.textContent =
                        settings.margin +
                        " mm";

                }

            }
        );

    }


    /* =====================================================
       QUALITY
    ===================================================== */

    if (qualityRange) {

        qualityRange.addEventListener(
            "input",
            function () {

                settings.quality =
                    Number(
                        qualityRange.value
                    );

                if (qualityValue) {

                    qualityValue.textContent =
                        settings.quality +
                        "%";

                }

            }
        );

    }


    /* =====================================================
       COMPRESSION
    ===================================================== */

    document
        .querySelectorAll(
            ".compression-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        settings.compression =
                            button.dataset.compression;


                        activate(
                            ".compression-btn",
                            "data-compression",
                            settings.compression
                        );


                        if (
                            settings.compression ===
                            "low"
                        ) {

                            settings.quality =
                                60;

                        }
                        else if (
                            settings.compression ===
                            "medium"
                        ) {

                            settings.quality =
                                80;

                        }
                        else {

                            settings.quality =
                                95;

                        }


                        if (qualityRange) {

                            qualityRange.value =
                                settings.quality;

                        }


                        if (qualityValue) {

                            qualityValue.textContent =
                                settings.quality +
                                "%";

                        }

                    }
                );

            }
        );


    /* =====================================================
       BACKGROUND
    ===================================================== */

    document
        .querySelectorAll(
            ".background-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        settings.background =
                            button.dataset.background;

                        activate(
                            ".background-btn",
                            "data-background",
                            settings.background
                        );

                    }
                );

            }
        );


    /* =====================================================
       PAGE SIZE
    ===================================================== */

    function getPageSize() {

        const sizes = {

            A4:
                [210, 297],

            A3:
                [297, 420],

            LETTER:
                [215.9, 279.4],

            LEGAL:
                [215.9, 355.6]

        };


        if (
            settings.pageSize ===
            "AUTO"
        ) {

            if (
                images[0] &&
                images[0].width >
                images[0].height
            ) {

                return [
                    297,
                    210
                ];

            }

            return [
                210,
                297
            ];

        }


        return (
            sizes[
                settings.pageSize
            ] ||
            sizes.A4
        );

    }


    /* =====================================================
       PREPARE IMAGE
    ===================================================== */

    function prepareImage(image) {

        return new Promise(
            function (resolve) {

                const img =
                    new Image();

                img.onload =
                    function () {

                        let width =
                            img.naturalWidth;

                        let height =
                            img.naturalHeight;


                        let maxWidth =
                            2200;


                        if (
                            settings.compression ===
                            "low"
                        ) {

                            maxWidth =
                                1400;

                        }
                        else if (
                            settings.compression ===
                            "high"
                        ) {

                            maxWidth =
                                3200;

                        }


                        if (
                            width >
                            maxWidth
                        ) {

                            const ratio =
                                maxWidth /
                                width;

                            width =
                                Math.round(
                                    width *
                                    ratio
                                );

                            height =
                                Math.round(
                                    height *
                                    ratio
                                );

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


                        ctx.fillStyle =
                            settings.background;


                        ctx.fillRect(
                            0,
                            0,
                            width,
                            height
                        );


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );


                        resolve({

                            data:
                                canvas.toDataURL(
                                    "image/jpeg",
                                    settings.quality /
                                    100
                                ),

                            width:
                                width,

                            height:
                                height

                        });

                    };


                img.src =
                    image.src;

            }
        );

    }


    /* =====================================================
       DRAW IMAGE
    ===================================================== */

    function drawImage(
        pdf,
        image,
        pageWidth,
        pageHeight
    ) {

        const availableWidth =
            pageWidth -
            settings.margin *
            2;


        const availableHeight =
            pageHeight -
            settings.margin *
            2;


        const imageRatio =
            image.width /
            image.height;


        const pageRatio =
            availableWidth /
            availableHeight;


        let width;
        let height;


        if (
            settings.fit ===
            "cover"
        ) {

            if (
                imageRatio >
                pageRatio
            ) {

                height =
                    availableHeight;

                width =
                    height *
                    imageRatio;

            }
            else {

                width =
                    availableWidth;

                height =
                    width /
                    imageRatio;

            }

        }
        else {

            if (
                imageRatio >
                pageRatio
            ) {

                width =
                    availableWidth;

                height =
                    width /
                    imageRatio;

            }
            else {

                height =
                    availableHeight;

                width =
                    height *
                    imageRatio;

            }

        }


        const x =
            (
                pageWidth -
                width
            ) / 2;


        const y =
            (
                pageHeight -
                height
            ) / 2;


        pdf.addImage(
            image.data,
            "JPEG",
            x,
            y,
            width,
            height,
            undefined,
            "FAST"
        );

    }


    /* =====================================================
       GENERATE PDF
    ===================================================== */

    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            async function () {

                if (!images.length) {

                    alert(
                        "Please choose images first."
                    );

                    return;

                }


                if (
                    !window.jspdf ||
                    !window.jspdf.jsPDF
                ) {

                    alert(
                        "jsPDF library load nahi hui."
                    );

                    return;

                }


                const oldText =
                    generateBtn.innerHTML;


                generateBtn.disabled =
                    true;


                generateBtn.innerHTML =
                    '<i class="fa-solid fa-spinner fa-spin"></i> Creating PDF...';


                try {

                    let [
                        pageWidth,
                        pageHeight
                    ] =
                        getPageSize();


                    if (
                        settings.orientation ===
                        "landscape"
                    ) {

                        [
                            pageWidth,
                            pageHeight
                        ] =
                        [
                            pageHeight,
                            pageWidth
                        ];

                    }


                    const pdf =
                        new window.jspdf.jsPDF({

                            orientation:
                                settings.orientation,

                            unit:
                                "mm",

                            format:
                                [
                                    pageWidth,
                                    pageHeight
                                ],

                            compress:
                                true

                        });


                    for (
                        let i = 0;
                        i < images.length;
                        i++
                    ) {

                        if (i > 0) {

                            pdf.addPage(
                                [
                                    pageWidth,
                                    pageHeight
                                ],
                                settings.orientation
                            );

                        }


                        const prepared =
                            await prepareImage(
                                images[i]
                            );


                        drawImage(
                            pdf,
                            prepared,
                            pageWidth,
                            pageHeight
                        );

                    }


                    const blob =
                        pdf.output(
                            "blob"
                        );


                    if (pdfUrl) {

                        URL.revokeObjectURL(
                            pdfUrl
                        );

                    }


                    pdfUrl =
                        URL.createObjectURL(
                            blob
                        );


                    if (pdfPreview) {

                        pdfPreview.src =
                            pdfUrl;

                        pdfPreview.style.display =
                            "block";

                    }


                    if (pdfPlaceholder) {

                        pdfPlaceholder.style.display =
                            "none";

                    }


                    if (pdfPages) {

                        pdfPages.textContent =
                            images.length;

                    }


                    if (pdfSize) {

                        pdfSize.textContent =
                            formatSize(
                                blob.size
                            );

                    }


                    let filename =
                        fileNameInput &&
                        fileNameInput.value.trim()
                            ? fileNameInput.value.trim()
                            : "onetoolbox-images";


                    filename =
                        filename.replace(
                            /\.pdf$/i,
                            ""
                        );


                    filename +=
                        ".pdf";


                    if (pdfResultName) {

                        pdfResultName.textContent =
                            filename;

                    }


                    if (downloadBtn) {

                        downloadBtn.href =
                            pdfUrl;

                        downloadBtn.download =
                            filename;

                        downloadBtn.classList.remove(
                            "disabled"
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "PDF Error:",
                        error
                    );

                    alert(
                        "PDF create karte waqt error aaya."
                    );

                }
                finally {

                    generateBtn.disabled =
                        images.length === 0;

                    generateBtn.innerHTML =
                        oldText;

                }

            }
        );

    }


    /* =====================================================
       RESET SETTINGS
    ===================================================== */

    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            function () {

                settings = {

                    pageSize:
                        "A4",

                    orientation:
                        "portrait",

                    fit:
                        "contain",

                    margin:
                        10,

                    quality:
                        90,

                    compression:
                        "medium",

                    background:
                        "#ffffff"

                };


                activate(
                    ".pdf-option",
                    "data-page-size",
                    "A4"
                );


                activate(
                    ".orientation-btn",
                    "data-orientation",
                    "portrait"
                );


                activate(
                    ".fit-btn",
                    "data-fit",
                    "contain"
                );


                activate(
                    ".compression-btn",
                    "data-compression",
                    "medium"
                );


                activate(
                    ".background-btn",
                    "data-background",
                    "#ffffff"
                );


                if (marginRange) {

                    marginRange.value =
                        10;

                }


                if (marginValue) {

                    marginValue.textContent =
                        "10 mm";

                }


                if (qualityRange) {

                    qualityRange.value =
                        90;

                }


                if (qualityValue) {

                    qualityValue.textContent =
                        "90%";

                }

            }
        );

    }


    /* =====================================================
       RESET PDF
    ===================================================== */

    function resetPDFPreview() {

        if (pdfUrl) {

            URL.revokeObjectURL(
                pdfUrl
            );

            pdfUrl =
                null;

        }


        if (pdfPreview) {

            pdfPreview.removeAttribute(
                "src"
            );

            pdfPreview.style.display =
                "none";

        }


        if (pdfPlaceholder) {

            pdfPlaceholder.style.display =
                "flex";

        }


        if (pdfPages) {

            pdfPages.textContent =
                "0";

        }


        if (pdfSize) {

            pdfSize.textContent =
                "0 KB";

        }


        if (pdfResultName) {

            pdfResultName.textContent =
                "-";

        }


        if (downloadBtn) {

            downloadBtn.href =
                "#";

            downloadBtn.classList.add(
                "disabled"
            );

        }

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    renderImages();

    updateInfo();

    resetPDFPreview();


    console.log(
        "Image to PDF JS loaded successfully."
    );

});