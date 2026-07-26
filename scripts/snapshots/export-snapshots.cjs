/* Final: render each tuned HTML to a PDF (A4), convert to PNG, and place into public/images/templates/. */

const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname);
const PROJECT_ROOT = path.resolve(ROOT, "..", "..");
const PUBLIC_TPL = path.join(PROJECT_ROOT, "public", "images", "templates");
const PDF_DIR = path.join(ROOT, "pdf");

const TEMPLATE_TO_THUMB = {
  "v1.0": "1", "v2.0": "5", "v3.0": "3", "v4.0": "2", "v5.0": "8",
  "v6.0": "6", "v7.0": "7", "v8.0": "4", "v9.0": "9",
};

const LETTER_W = 816;  // 8.5" * 96dpi
const LETTER_H = 1056; // 11" * 96dpi

(async () => {
  fs.mkdirSync(PDF_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: "shell",
    executablePath: "/Users/boss/.cache/puppeteer/chrome-headless-shell/mac_arm-147.0.7727.57/chrome-headless-shell-mac-arm64/chrome-headless-shell",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  const page = await browser.newPage();

  // Use the per-template-tuned HTMLs
  const files = [];
  for (const v of Object.keys(TEMPLATE_TO_THUMB)) {
    const f = `07-26_Senior_PM_Generic_${v}_Senior_Product_Manager_AI_Platform_${v}.html`;
    if (fs.existsSync(path.join(ROOT, f))) files.push(f);
  }
  console.log(`Rendering ${files.length} templates to A4 PDF...`);

  for (const f of files) {
    const m = f.match(/_v([0-9]+)\.0\.html$/);
    const version = `v${m[1]}.0`;
    const thumb = TEMPLATE_TO_THUMB[version];
    const url = "file://" + path.join(ROOT, f);
    const pdfPath = path.join(PDF_DIR, `template-${thumb}.pdf`);

    await page.goto(url, { waitUntil: "networkidle0" });
    await page.evaluate(async () => {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;
    });
    // Hide interactive controls before print
    await page.evaluate(() => {
      const hide = (sel) => document.querySelectorAll(sel).forEach((n) => (n.style.display = "none"));
      hide(".controls"); hide(".tpl-sw-bar"); hide(".fmt-bar"); hide(".no-print");
      document.body.style.background = "#ffffff";
    });

    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log(`  v${version} -> ${pdfPath}`);
  }

  await browser.close();
  console.log("\nConverting PDFs to 816x1056 PNGs...");
  for (const f of fs.readdirSync(PDF_DIR).filter((n) => n.endsWith(".pdf"))) {
    const thumb = f.replace("template-", "").replace(".pdf", "");
    const pdfPath = path.join(PDF_DIR, f);
    const pngPath = path.join(PDF_DIR, f.replace(".pdf", ".png"));
    // pdftoppm to A4, then center on letter canvas with white margins
    const a4PngBase = path.join(PDF_DIR, `tmp-${thumb}`);
    execSync(`pdftoppm -png -r 150 -singlefile "${pdfPath}" "${a4PngBase}"`);
    // The PDF is A4 (595x842 pt). At 150dpi: A4 = 1240x1754 px
    // Center on 816x1056 (letter) = scale A4 down
    // A4 ratio: 1240/1754 = 0.707, Letter ratio: 816/1056 = 0.773
    // Letter is wider/shorter ratio. We pad with white margins.
    // Use sips to fit onto 816x1056 canvas
    const a4Png = `${a4PngBase}.png`;
    // First scale A4 image so its width fits the letter (816). Then pad top/bottom.
    execSync(`sips -z 1056 816 "${a4Png}" --out "${pngPath}" 2>/dev/null || \
              sips --resampleHeight 1056 --resampleWidth 816 "${a4Png}" --out "${pngPath}" 2>/dev/null`);
    // Copy to public dir
    fs.copyFileSync(pngPath, path.join(PUBLIC_TPL, `${thumb}.png`));
    console.log(`  ${f} -> ${thumb}.png (816x1056)`);
  }
  console.log("\nDone. Snapshot files in public/images/templates/");
})();
