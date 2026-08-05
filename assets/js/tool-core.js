/* ==========================================================
   OneToolBox Tool Core v1.0
   Author : OneToolBox
========================================================== */

"use strict";

const ToolCore = (() => {

const core = {};

/* ==========================================================
   State
========================================================== */

core.state = {

files: [],

results: [],

history: [],

theme: "light",

busy: false,

currentTool: null

};

/* ==========================================================
   Elements
========================================================== */

core.el = {};

/* ==========================================================
   Initialize
========================================================== */

core.init = function(){

console.log("ToolCore Initialized");

this.cache();

this.events();

};

/* ==========================================================
   Cache Elements
========================================================== */

core.cache = function(){

this.el.upload =

document.getElementById("uploadBox");

this.el.input =

document.getElementById("fileInput");

this.el.queue =

document.getElementById("imageQueue");

this.el.progress =

document.getElementById("progressFill");

this.el.progressText =

document.getElementById("progressText");

this.el.loading =

document.getElementById("loadingOverlay");

};

/* ==========================================================
   Events
========================================================== */

core.events = function(){

if(this.el.upload){

this.dragDrop();

}

if(this.el.input){

this.fileSelect();

}

this.pasteImage();

};

/* ==========================================================
   File Select
========================================================== */

core.fileSelect = function(){

this.el.input.addEventListener(

"change",

e=>{

this.addFiles(

e.target.files

);

}

);

};

/* ==========================================================
   Add Files
========================================================== */

core.addFiles = function(fileList){

[...fileList].forEach(file=>{

if(

!file.type.startsWith("image/")

){

return;

}

this.state.files.push(file);

});

this.renderQueue();

};

/* ==========================================================
   Queue
========================================================== */

core.renderQueue=function(){

if(!this.el.queue)return;

this.el.queue.innerHTML="";

this.state.files.forEach(

(file,index)=>{

const div=

document.createElement("div");

div.className="queue-item";

div.innerHTML=`

<img

src="${URL.createObjectURL(file)}"

class="queue-thumb">

<div class="queue-info">

<div class="queue-name">

${file.name}

</div>

<div class="queue-size">

${this.bytes(file.size)}

</div>

</div>

<button

data-id="${index}"

class="queue-remove">

<i class="fas fa-trash"></i>

</button>

`;

this.el.queue.append(div);

}

);

this.removeEvents();

};

/* ==========================================================
   Drag & Drop
========================================================== */

core.dragDrop = function () {

    this.el.upload.addEventListener("dragover", e => {

        e.preventDefault();

        this.el.upload.classList.add("dragover");

    });

    this.el.upload.addEventListener("dragleave", () => {

        this.el.upload.classList.remove("dragover");

    });

    this.el.upload.addEventListener("drop", e => {

        e.preventDefault();

        this.el.upload.classList.remove("dragover");

        this.addFiles(e.dataTransfer.files);

    });

};

/* ==========================================================
   Paste Image
========================================================== */

core.pasteImage = function () {

    document.addEventListener("paste", e => {

        const items = e.clipboardData.items;

        for (const item of items) {

            if (item.type.startsWith("image/")) {

                this.addFiles([item.getAsFile()]);

            }

        }

    });

};

/* ==========================================================
   Folder Upload
========================================================== */

core.enableFolderUpload = function () {

    if (!this.el.input) return;

    this.el.input.setAttribute("webkitdirectory", "");

    this.el.input.setAttribute("directory", "");

};

/* ==========================================================
   Remove Queue Item
========================================================== */

core.removeEvents = function () {

    document
        .querySelectorAll(".queue-remove")
        .forEach(btn => {

            btn.onclick = () => {

                const index = Number(

                    btn.dataset.id

                );

                this.state.files.splice(index, 1);

                this.renderQueue();

            };

        });

};

/* ==========================================================
   Clear Queue
========================================================== */

core.clearQueue = function () {

    this.state.files = [];

    this.state.results = [];

    if (this.el.queue) {

        this.el.queue.innerHTML = "";

    }

};

/* ==========================================================
   Loading
========================================================== */

core.showLoading = function (text = "Processing...") {

    if (!this.el.loading) return;

    this.el.loading.classList.remove("hidden");

    if (this.el.progressText) {

        this.el.progressText.textContent = text;

    }

};

core.hideLoading = function () {

    if (!this.el.loading) return;

    this.el.loading.classList.add("hidden");

};

/* ==========================================================
   Progress
========================================================== */

core.progress = function (value, text = "") {

    if (this.el.progress) {

        this.el.progress.style.width = value + "%";

    }

    if (this.el.progressText && text) {

        this.el.progressText.textContent = text;

    }

};

/* ==========================================================
   Bytes Formatter
========================================================== */

core.bytes = function (bytes) {

    if (bytes === 0) return "0 Bytes";

    const k = 1024;

    const units = [

        "Bytes",

        "KB",

        "MB",

        "GB",

        "TB"

    ];

    const i = Math.floor(

        Math.log(bytes) /

        Math.log(k)

    );

    return (

        (bytes / Math.pow(k, i))

            .toFixed(2) +

        " " +

        units[i]

    );

};
/* ==========================================================
   Preview Manager
========================================================== */

core.preview = {

before: null,

after: null

};

core.setPreview = function(original, compressed = null){

    const before =

    document.getElementById("beforePreview");

    const after =

    document.getElementById("afterPreview");

    if(before){

        before.src = original;

    }

    if(after && compressed){

        after.src = compressed;

    }

};

/* ==========================================================
   Image Information
========================================================== */

core.info = function(data){

    const set=(id,value)=>{

        const el=document.getElementById(id);

        if(el){

            el.textContent=value;

        }

    };

    set(

    "originalSize",

    this.bytes(data.before)

    );

    set(

    "compressedSize",

    this.bytes(data.after)

    );

    const saved=

    data.before-data.after;

    const percent=

    (

    saved/data.before*100

    ).toFixed(1);

    set(

    "savedPercent",

    percent+"%"

    );

    set(

    "compressionRatio",

    (

    data.before/

    data.after

    ).toFixed(2)+":1"

    );

    set(

    "imageResolution",

    data.width+" × "+data.height

    );

    set(

    "imageFormat",

    data.type.toUpperCase()

    );

};

/* ==========================================================
   Validation
========================================================== */

core.validate=function(file){

const types=[

"image/jpeg",

"image/png",

"image/webp",

"image/avif",

"image/gif",

"image/bmp"

];

if(

!types.includes(file.type)

){

this.toast(

"Unsupported image format",

"error"

);

return false;

}

if(

file.size>

100*1024*1024

){

this.toast(

"Maximum file size is 100 MB",

"error"

);

return false;

}

return true;

};

/* ==========================================================
   Error
========================================================== */

core.error=function(message){

console.error(message);

this.toast(

message,

"error"

);

};

/* ==========================================================
   Success
========================================================== */

core.success=function(message){

this.toast(

message,

"success"

);

};

/* ==========================================================
   Toast
========================================================== */

core.toast=function(

message,

type="info"

){

if(

window.Toast

){

Toast.show({

message,

type

});

return;

}

alert(message);

};

/* ==========================================================
   Event Bus
========================================================== */

core.eventsBus={};

core.on=function(

event,

callback

){

if(

!this.eventsBus[event]

){

this.eventsBus[event]=[];

}

this.eventsBus[event]

.push(callback);

};

core.emit=function(

event,

data

){

if(

!this.eventsBus[event]

){

return;

}

this.eventsBus[event]

.forEach(fn=>fn(data));

};

/* ==========================================================
   Unique ID
========================================================== */

core.uuid=function(){

return

"tool-"+

Date.now()+"-"+

Math.random()

.toString(36)

.substring(2,9);

};

/* ==========================================================
   Current Time
========================================================== */

core.now=function(){

return

new Date()

.toLocaleString();

};

/* ==========================================================
   Download Manager
========================================================== */

core.download = function(blob, fileName) {

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => {

        URL.revokeObjectURL(url);

    }, 1000);

};

/* ==========================================================
   Download Multiple Files
========================================================== */

core.downloadAll = function() {

    if (!this.state.results.length) {

        this.toast(

            "No compressed files available.",

            "warning"

        );

        return;

    }

    this.state.results.forEach(item => {

        this.download(

            item.blob,

            item.name

        );

    });

};

/* ==========================================================
   ZIP Download
========================================================== */

core.downloadZip = async function() {

    if (typeof JSZip === "undefined") {

        this.toast(

            "JSZip library not loaded.",

            "error"

        );

        return;

    }

    if (!this.state.results.length) {

        this.toast(

            "Nothing to download.",

            "warning"

        );

        return;

    }

    const zip = new JSZip();

    for (const item of this.state.results) {

        zip.file(

            item.name,

            item.blob

        );

    }

    this.showLoading(

        "Creating ZIP..."

    );

    const blob = await zip.generateAsync({

        type: "blob",

        compression: "DEFLATE",

        compressionOptions: {

            level: 9

        }

    });

    this.hideLoading();

    this.download(

        blob,

        "OneToolBox-Images.zip"

    );

};

/* ==========================================================
   History Manager
========================================================== */

core.saveHistory = function(record) {

    this.state.history.push(record);

    localStorage.setItem(

        "otb-history",

        JSON.stringify(

            this.state.history

        )

    );

};

core.loadHistory = function() {

    const history = localStorage.getItem(

        "otb-history"

    );

    if (history) {

        this.state.history =

            JSON.parse(history);

    }

};

core.clearHistory = function() {

    this.state.history = [];

    localStorage.removeItem(

        "otb-history"

    );

};

/* ==========================================================
   Theme Manager
========================================================== */

core.setTheme = function(mode) {

    this.state.theme = mode;

    document.documentElement

        .setAttribute(

            "data-theme",

            mode

        );

    localStorage.setItem(

        "otb-theme",

        mode

    );

};

core.loadTheme = function() {

    const theme =

        localStorage.getItem(

            "otb-theme"

        ) || "light";

    this.setTheme(theme);

};

/* ==========================================================
   Toggle Theme
========================================================== */

core.toggleTheme = function() {

    if (this.state.theme === "dark") {

        this.setTheme("light");

    } else {

        this.setTheme("dark");

    }

};
/* ==========================================================
   Keyboard Shortcuts
========================================================== */

core.shortcuts = function () {

    document.addEventListener("keydown", e => {

        /* Ctrl + O */

        if (e.ctrlKey && e.key.toLowerCase() === "o") {

            e.preventDefault();

            if (this.el.input) {

                this.el.input.click();

            }

        }

        /* Ctrl + D */

        if (e.ctrlKey && e.key.toLowerCase() === "d") {

            e.preventDefault();

            this.downloadAll();

        }

        /* Delete */

        if (e.key === "Delete") {

            this.clearQueue();

        }

        /* Escape */

        if (e.key === "Escape") {

            this.hideLoading();

        }

    });

};

/* ==========================================================
   Settings
========================================================== */

core.settings = {

quality: 80,

mode: "smart",

format: "original",

theme: "light"

};

/* ==========================================================
   Save Settings
========================================================== */

core.saveSettings = function () {

    localStorage.setItem(

        "otb-settings",

        JSON.stringify(

            this.settings

        )

    );

};

/* ==========================================================
   Load Settings
========================================================== */

core.loadSettings = function () {

    const data = localStorage.getItem(

        "otb-settings"

    );

    if (!data) return;

    this.settings = {

        ...this.settings,

        ...JSON.parse(data)

    };

};

/* ==========================================================
   Apply Settings
========================================================== */

core.applySettings = function () {

    const quality =

        document.getElementById("quality");

    if (quality) {

        quality.value =

            this.settings.quality;

    }

    const mode =

        document.getElementById(

            "compressionMode"

        );

    if (mode) {

        mode.value =

            this.settings.mode;

    }

    const format =

        document.getElementById(

            "outputFormat"

        );

    if (format) {

        format.value =

            this.settings.format;

    }

};

/* ==========================================================
   Rename File
========================================================== */

core.renameFile = function (

    name,

    suffix = "-compressed"

) {

    const dot =

        name.lastIndexOf(".");

    if (dot === -1)

        return name + suffix;

    return (

        name.substring(0, dot) +

        suffix +

        name.substring(dot)

    );

};

/* ==========================================================
   Batch Processing
========================================================== */

core.batch = async function (

    callback

) {

    if (!this.state.files.length)

        return;

    this.state.results = [];

    for (

        let i = 0;

        i < this.state.files.length;

        i++

    ) {

        this.progress(

            Math.round(

                ((i + 1) /

                    this.state.files.length) *

                    100

            ),

            `Processing ${

                i + 1

            } / ${

                this.state.files.length

            }`

        );

        const result =

            await callback(

                this.state.files[i],

                i

            );

        this.state.results.push(

            result

        );

    }

    this.progress(

        100,

        "Completed"

    );

};

/* ==========================================================
   Register Tool
========================================================== */

core.tool = null;

core.register = function (

    name,

    version = "1.0"

) {

    this.tool = {

        name,

        version

    };

    console.log(

        `${name} v${version} Loaded`

    );

};

/* ==========================================================
   Plugins
========================================================== */

core.plugins = {};

core.use = function (

    name,

    plugin

) {

    this.plugins[name] = plugin;

};

core.plugin = function (

    name

) {

    return this.plugins[name];

};
/* ==========================================================
   Worker Manager
========================================================== */

core.worker = null;

core.workerBusy = false;

core.initWorker = function () {

    if (!window.Worker) {

        console.warn("Web Worker not supported.");

        return;

    }

    this.worker = new Worker(

        "worker.js"

    );

    this.worker.onmessage = e => {

        const data = e.data;

        switch (data.type) {

            case "progress":

                this.progress(

                    data.percent,

                    data.message ||

                    "Compressing..."

                );

                break;

            case "complete":

                this.workerBusy = false;

                this.emit(

                    "worker:complete",

                    data

                );

                this.nextTask();

                break;

            case "error":

                this.workerBusy = false;

                this.error(data.message);

                this.nextTask();

                break;

        }

    };

};

/* ==========================================================
   Task Queue
========================================================== */

core.tasks = [];

core.addTask = function (payload) {

    this.tasks.push(payload);

    this.nextTask();

};

core.nextTask = function () {

    if (!this.worker)

        return;

    if (this.workerBusy)

        return;

    if (!this.tasks.length)

        return;

    this.workerBusy = true;

    const task =

    this.tasks.shift();

    this.worker.postMessage(task);

};

/* ==========================================================
   Cancel Queue
========================================================== */

core.cancelTasks = function () {

    this.tasks = [];

};

/* ==========================================================
   Restart Worker
========================================================== */

core.restartWorker = function () {

    if (this.worker) {

        this.worker.terminate();

    }

    this.workerBusy = false;

    this.initWorker();

};

/* ==========================================================
   Retry Manager
========================================================== */

core.retry = async function (

    fn,

    count = 3

) {

    let lastError = null;

    for (

        let i = 0;

        i < count;

        i++

    ) {

        try {

            return await fn();

        }

        catch (err) {

            lastError = err;

        }

    }

    throw lastError;

};

/* ==========================================================
   Performance Timer
========================================================== */

core.timer = {};

core.startTimer = function (

    name

) {

    this.timer[name] =

    performance.now();

};

core.stopTimer = function (

    name

) {

    if (

        !this.timer[name]

    ) return 0;

    const ms =

    performance.now() -

    this.timer[name];

    delete this.timer[name];

    return ms;

};

/* ==========================================================
   Memory Cleanup
========================================================== */

core.cleanup = function () {

    this.state.results.forEach(item => {

        if (

            item.url

        ) {

            URL.revokeObjectURL(

                item.url

            );

        }

    });

};

/* ==========================================================
   Browser Information
========================================================== */

core.browser = function () {

    return {

        language:

        navigator.language,

        platform:

        navigator.platform,

        cores:

        navigator.hardwareConcurrency ||

        1,

        memory:

        navigator.deviceMemory ||

        "Unknown"

    };

};

/* ==========================================================
   Idle Task
========================================================== */

core.idle = function (

    callback

) {

    if (

        window.requestIdleCallback

    ) {

        requestIdleCallback(callback);

    }

    else {

        setTimeout(

            callback,

            100

        );

    }

};

/* ==========================================================
   Initialize Core
========================================================== */

core.boot = function () {

    this.init();

    this.loadTheme();

    this.loadSettings();

    this.loadHistory();

    this.applySettings();

    this.shortcuts();

    this.initWorker();

    console.log(

        "OneToolBox ToolCore Ready"

    );

};

return core;

})();
