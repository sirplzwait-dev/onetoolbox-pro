/*==================================================
  OneToolBox Enterprise
  utils.js
==================================================*/

"use strict";

const Utils = {

    /*==========================================
      Debounce
    ==========================================*/

    debounce(callback, delay = 300) {

        let timer;

        return (...args) => {

            clearTimeout(timer);

            timer = setTimeout(() => {

                callback(...args);

            }, delay);

        };

    },

    /*==========================================
      Throttle
    ==========================================*/

    throttle(callback, limit = 300) {

        let waiting = false;

        return (...args) => {

            if (waiting) return;

            callback(...args);

            waiting = true;

            setTimeout(() => {

                waiting = false;

            }, limit);

        };

    },

    /*==========================================
      File Size
    ==========================================*/

    formatBytes(bytes) {

        if (!bytes) return "0 Bytes";

        const units = [

            "Bytes",

            "KB",

            "MB",

            "GB",

            "TB"

        ];

        let i = 0;

        while (bytes >= 1024 && i < units.length - 1) {

            bytes /= 1024;

            i++;

        }

        return `${bytes.toFixed(2)} ${units[i]}`;

    },

    /*==========================================
      File Extension
    ==========================================*/

    extension(fileName) {

        return fileName

            .split(".")

            .pop()

            .toLowerCase();

    },

    /*==========================================
      UUID
    ==========================================*/

    uuid() {

        return crypto.randomUUID();

    },

    /*==========================================
      Copy Text
    ==========================================*/

    async copy(text) {

        try {

            await navigator.clipboard.writeText(text);

            return true;

        }

        catch {

            return false;

        }

    },

    /*==========================================
      Download
    ==========================================*/

    download(blob, fileName) {

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download = fileName;

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(url);

    },

    /*==========================================
      Date
    ==========================================*/

    today() {

        return new Date()

            .toLocaleDateString();

    },

    /*==========================================
      Time
    ==========================================*/

    now() {

        return new Date()

            .toLocaleTimeString();

    },

    /*==========================================
      Show Element
    ==========================================*/

    show(selector) {

        document

            .querySelector(selector)

            ?.classList.remove("hidden");

    },

    /*==========================================
      Hide Element
    ==========================================*/

    hide(selector) {

        document

            .querySelector(selector)

            ?.classList.add("hidden");

    },

    /*==========================================
      Toggle Element
    ==========================================*/

    toggle(selector) {

        document

            .querySelector(selector)

            ?.classList.toggle("hidden");

    },

    /*==========================================
      Loader
    ==========================================*/

    loading(show = true) {

        const loader =

            document.querySelector(".loader-page");

        if (!loader) return;

        loader.style.display =

            show

                ? "flex"

                : "none";

    },

    /*==========================================
      Scroll Top
    ==========================================*/

    top() {

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    },

    /*==========================================
      Query Selector
    ==========================================*/

    $(selector) {

        return document.querySelector(selector);

    },

    /*==========================================
      Query Selector All
    ==========================================*/

    $$(selector) {

        return document.querySelectorAll(selector);

    }

};