import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF(data, fileName) {

 const templatePath = path.join(__dirname,"../templates/guesthouse.ejs");

 const html = await ejs.renderFile(templatePath,data);

 const browser = await puppeteer.launch();

 const page = await browser.newPage();

 await page.setContent(html);

 const pdfPath = path.join(__dirname,`../pdf/${fileName}.pdf`);

 await page.pdf({
   path: pdfPath,
   format:"A4"
 });

 await browser.close();

 return pdfPath;
}

export default generatePDF;