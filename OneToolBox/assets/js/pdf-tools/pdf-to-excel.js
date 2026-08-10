(() => {
"use strict";

const $ = id => document.getElementById(id);

const fileInput = $("fileInput");
const upload = $("upload");
const runBtn = $("run");
const downloadBtn = $("download");
const resetBtn = $("reset");

const fileSize = $("fileSize");
const pageCount = $("pageCount");
const uploadTitle = $("uploadTitle");
const uploadHint = $("uploadHint");
const status = $("status");
const bar = $("bar");
const pct = $("pct");
const resultInfo = $("resultInfo");
const resultEmpty = $("resultEmpty");
const resultSummary = $("resultSummary");
const resultText = $("resultText");
const mode = $("mode");

let selectedFile = null;
let workbookBlob = null;
let workbookName = "converted-pdf.xlsx";

function formatSize(bytes){
  if (!bytes) return "0 KB";
  if(bytes < 1024) return bytes + " Bytes";
  if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + " KB";
  return (bytes/1024/1024).toFixed(2) + " MB";
}

function progress(value){
  const n = Math.max(0,Math.min(100,Math.round(value)));
  bar.style.width = n + "%";
  pct.textContent = n + "%";
}

function setStatus(text){
  status.textContent = text;
}

function resetResult(){
  workbookBlob = null;
  resultInfo.textContent = "—";
  resultEmpty.hidden = false;
  resultSummary.hidden = true;
  downloadBtn.disabled = true;
  progress(0);
}

async function readPdf(file){
  if(!window.pdfjsLib){
    throw new Error("PDF could not be opened.");
  }

  const buffer = await file.arrayBuffer();

  return pdfjsLib.getDocument({
    data:new Uint8Array(buffer)
  }).promise;
}

function groupTextItems(items){
  const rows = [];

  for(const item of items){
    const text = (item.str || "").trim();
    if(!text) continue;

    const x = item.transform ? item.transform[4] : 0;
    const y = item.transform ? item.transform[5] : 0;

    let row = rows.find(r => Math.abs(r.y - y) < 5);

    if(!row){
      row = {y,items:[]};
      rows.push(row);
    }

    row.items.push({text,x,y});
  }

  rows.sort((a,b) => b.y - a.y);

  return rows.map(row => {
    row.items.sort((a,b) => a.x - b.x);
    return row.items.map(item => item.text).join(" ").trim();
  }).filter(Boolean);
}

async function selectFile(file){
  if(!file) return;

  if(file.type !== "application/pdf" &&
     !file.name.toLowerCase().endsWith(".pdf")){
    setStatus("Please choose a PDF file.");
    return;
  }

  selectedFile = file;
  resetResult();

  fileSize.textContent = formatSize(file.size);
  pageCount.textContent = "…";
  uploadTitle.textContent = file.name;
  uploadHint.innerHTML = "PDF selected • Click here to replace";

  setStatus("Reading PDF…");
  progress(5);

  try{
    const pdf = await readPdf(file);

    pageCount.textContent = pdf.numPages;

    setStatus("PDF ready. Click PDF To Excel.");
    progress(10);
    runBtn.disabled = false;

  }catch(error){
    console.error(error);
    selectedFile = null;
    pageCount.textContent = "0";
    runBtn.disabled = true;
    setStatus("Could not read this PDF.");
    progress(0);
  }
}

async function convertToExcel(){
  if(!selectedFile) return;

  if(!window.XLSX){
    setStatus("Excel file could not be created. Please refresh and try again.");
    return;
  }

  runBtn.disabled = true;
  downloadBtn.disabled = true;
  setStatus("Converting PDF…");
  progress(12);

  try{
    const pdf = await readPdf(selectedFile);
    const sheets = [];

    for(let pageNo=1; pageNo<=pdf.numPages; pageNo++){
      setStatus(`Reading page ${pageNo} of ${pdf.numPages}…`);

      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      const lines = groupTextItems(content.items || []);

      let rows;

      if(mode.value === "table"){
        rows = lines.map(line => {
          // Split common PDF table separators.
          const parts = line.split(/\t|\s{2,}|\|/).map(x => x.trim()).filter(Boolean);
          return parts.length ? parts : [line];
        });
      }else{
        rows = [
          ["Page", "Text"],
          ...lines.map(line => [pageNo, line])
        ];
      }

      if(!rows.length){
        rows = [["Page","Text"],[pageNo,""]];
      }

      sheets.push({
        name:`Page ${pageNo}`,
        rows
      });

      progress(12 + (pageNo/pdf.numPages)*68);
    }

    setStatus("Creating Excel file…");
    progress(86);

    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet,index)=>{
      let rows = sheet.rows;

      // Ensure a sensible table header in detected-table mode.
      if(mode.value === "table"){
        const maxCols = Math.max(...rows.map(r=>r.length),1);
        rows = [
          Array.from({length:maxCols},(_,i)=>`Column ${i+1}`),
          ...rows.map(r=>{
            const copy = r.slice();
            while(copy.length < maxCols) copy.push("");
            return copy;
          })
        ];
      }

      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Basic readable widths.
      const maxCols = Math.max(...rows.map(r=>r.length),1);
      ws["!cols"] = Array.from({length:maxCols},(_,col)=>({
        wch: Math.min(
          45,
          Math.max(
            10,
            ...rows.slice(0,100).map(r => String(r[col] ?? "").length + 2)
          )
        )
      }));

      XLSX.utils.book_append_sheet(
        wb,
        ws,
        sheet.name.slice(0,31)
      );
    });

    // A summary sheet first.
    const summary = XLSX.utils.aoa_to_sheet([
      ["OneToolBox PDF To Excel"],
      ["File", selectedFile.name],
      ["Pages", pdf.numPages],
      ["Format", mode.value === "table" ? "Detected Table" : "Text Rows"]
    ]);
    summary["!cols"] = [{wch:24},{wch:55}];

    wb.SheetNames.unshift("Summary");
    wb.Sheets["Summary"] = summary;

    const array = XLSX.write(wb,{
      bookType:"xlsx",
      type:"array"
    });

    workbookBlob = new Blob(
      [array],
      {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
    );

    workbookName =
      selectedFile.name.replace(/\.pdf$/i,"") + "-converted.xlsx";

    resultInfo.textContent = formatSize(workbookBlob.size);
    resultText.textContent =
      `${pdf.numPages} page${pdf.numPages > 1 ? "s" : ""} converted`;

    resultEmpty.hidden = true;
    resultSummary.hidden = false;

    progress(100);
    setStatus("Excel file is ready.");
    downloadBtn.disabled = false;

  }catch(error){
    console.error(error);
    setStatus("Conversion could not be completed. Please try another PDF.");
    progress(0);
  }finally{
    runBtn.disabled = !selectedFile;
  }
}

function downloadExcel(){
  if(!workbookBlob) return;

  const url = URL.createObjectURL(workbookBlob);
  const a = document.createElement("a");

  a.href = url;
  a.download = workbookName;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function resetAll(){
  selectedFile = null;
  workbookBlob = null;

  fileInput.value = "";
  fileSize.textContent = "0 KB";
  pageCount.textContent = "0";
  uploadTitle.textContent = "Choose File";
  uploadHint.innerHTML = "📁 Select your PDF<br>🖱️ Drag & Drop";

  resultInfo.textContent = "—";
  resultEmpty.hidden = false;
  resultSummary.hidden = true;

  runBtn.disabled = true;
  downloadBtn.disabled = true;

  progress(0);
  setStatus("Choose a PDF file to begin.");
}

fileInput.addEventListener("change",e=>{
  selectFile(e.target.files && e.target.files[0]);
});

upload.addEventListener("click",e=>{
  if(e.target.closest("label,input")) return;
  fileInput.click();
});

upload.addEventListener("keydown",e=>{
  if(e.key==="Enter" || e.key===" "){
    e.preventDefault();
    fileInput.click();
  }
});

upload.addEventListener("dragover",e=>{
  e.preventDefault();
  upload.classList.add("dragging");
});

upload.addEventListener("dragleave",()=>{
  upload.classList.remove("dragging");
});

upload.addEventListener("drop",e=>{
  e.preventDefault();
  upload.classList.remove("dragging");

  const file = e.dataTransfer.files && e.dataTransfer.files[0];
  if(file) selectFile(file);
});

runBtn.addEventListener("click",convertToExcel);
downloadBtn.addEventListener("click",downloadExcel);
resetBtn.addEventListener("click",resetAll);

})();
