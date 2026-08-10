# OneToolBox PDF To Word - Fixed

Replace the old PDF To Word page/script with these files.

## Main fix
The old page depended on `all-pdf-tools.js` to load the Word library. This version loads the browser UMD build of `docx` directly and performs the PDF text extraction with PDF.js.

## Files
- pdf-to-word.html
- pdf-to-word-fixed.css
- pdf-to-word-fixed.js

## Important
The HTML assumes the same OneToolBox folder structure:
pages/pdf-tools/pdf-to-word.html
assets/css/pdf-to-word-fixed.css
assets/js/pdf-to-word-fixed.js

It also uses your existing:
- navigation.js
- app.js
- reset.css
- variables.css
- layout.css
- components.css
- all-pdf-tools.css

The browser `docx` library is loaded from jsDelivr. If you want the tool to work without Internet/CDN access, download/pin that library locally and replace the CDN script with the local file.

Note: PDF-to-Word browser conversion extracts selectable PDF text. Complex PDF layouts, scanned PDFs, tables, and positioned text may not become an exact editable Word layout.
