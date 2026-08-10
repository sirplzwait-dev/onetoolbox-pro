# OneToolBox functional fix

The previous generated package used the same placeholder Run/Download logic for many tools.
That is why unrelated tools behaved identically.

This package replaces that placeholder behavior for browser-safe calculators, converters,
developer helpers, utility tools, text/document helpers and selected AI-local helpers.

Existing Image Tools and PDF Tools are preserved.

Important: tools that genuinely require a media codec (FFmpeg), OCR engine, cloud AI API,
or proprietary document engine are not falsely marked successful. Their UI reports the
missing dependency instead of pretending the operation completed.

HTML, CSS and JS remain separate. `assets/js/tool-engine.js` is the shared implementation,
while each tool keeps its own small JS file.
