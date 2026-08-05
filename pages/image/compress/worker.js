/* =========================================================
   OneToolBox Image Compressor Worker
   Background Compression Engine
========================================================= */

self.onmessage = async (event) => {

    const {

        imageBitmap,

        width,

        height,

        mime,

        targetBytes

    } = event.data;

    try {

        const canvas = new OffscreenCanvas(

            width,

            height

        );

        const ctx = canvas.getContext("2d");

        ctx.drawImage(

            imageBitmap,

            0,

            0,

            width,

            height

        );

        let low = 0.05;

        let high = 1;

        let bestBlob = null;

        let bestQuality = 0.8;

        /* ----------------------------------------
           Binary Search
        ----------------------------------------- */

        for (

            let i = 0;

            i < 15;

            i++

        ) {

            const quality =

                (low + high) / 2;

            const blob =

                await canvas.convertToBlob({

                    type: mime,

                    quality

                });

            bestBlob = blob;

            bestQuality = quality;

            self.postMessage({

                type: "progress",

                percent:

                    Math.round(

                        ((i + 1) / 15) * 100

                    )

            });

            if (

                blob.size >

                targetBytes

            ) {

                high = quality;

            } else {

                low = quality;

            }

        }

        /* ----------------------------------------
           Finished
        ----------------------------------------- */

        self.postMessage({

            type: "complete",

            blob: bestBlob,

            quality: bestQuality,

            size: bestBlob.size

        });

    }

    catch (err) {

        self.postMessage({

            type: "error",

            message: err.message

        });

    }

};