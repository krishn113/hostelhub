import ejs from "ejs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Returns a launched Puppeteer browser instance.
 *
 * - Development: uses the locally-installed `puppeteer` package (bundled Chromium).
 * - Production / Vercel: uses `puppeteer-core` + `@sparticuz/chromium`
 *   which is a minimal Chromium binary designed for serverless environments.
 */
async function getBrowser() {
  if (process.env.NODE_ENV === "development") {
    // Full puppeteer ships its own Chromium — fine for local dev
    const { default: puppeteer } = await import("puppeteer");
    return puppeteer.launch({
      headless: "shell",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });
  }

  // Vercel / production: use the serverless-optimised Chromium binary
  const [{ default: puppeteer }, { default: chromium }] = await Promise.all([
    import("puppeteer-core"),
    import("@sparticuz/chromium"),
  ]);

  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });
}

async function generatePDF(data, fileName) {

  const templatePath = path.join(__dirname,"../templates/guesthouse.ejs");
  const logoPath = path.join(process.cwd(), "public", "logo.png");

  const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath, "base64")}`;

  const safeData = {
    guestName: "",
    gender: "",
    address: "",
    contactNumber: "",
    numGuests: "",
    numRooms: "",
    occupancyType: "",
    arrivalDate: "",
    departureDate: "",
    arrivalTime: "",
    departureTime: "",
    purpose: "",
    roomToBeBooked: "",
    paymentByGuest: "",
    applicantName: "",
    applicantDepartment: "",
    applicantEntryNo: "",
    applicantMobileNo: "",
    createdAt: new Date(),
    logoBase64,
    ...data
  };

  const html = await ejs.renderFile(templatePath, safeData);

  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "domcontentloaded" });

  // Vercel has a read-only filesystem except for /tmp.
  // In production write there; locally keep the pdf/ directory for easy inspection.
  const pdfPath = process.env.NODE_ENV === "production"
    ? path.join("/tmp", `${fileName}.pdf`)
    : path.join(__dirname, `../pdf/${fileName}.pdf`);

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true
  });

  await browser.close();

  return pdfPath;
}

export default generatePDF;