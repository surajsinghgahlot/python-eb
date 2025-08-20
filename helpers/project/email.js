import fs from "fs";
import { join, resolve } from "path";
import { sendEmail } from "./nodemailer.js";
const ROOT_DIR = resolve();


const generateHtmlContent = async (dataMap, filePath) => {
    const htmlTemplate = await fs.readFileSync(filePath, "utf8");
    let processedTemplate = htmlTemplate;
  
    for (const [key, value] of Object.entries(dataMap)) {
      const placeholder = `{{${key}}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
    }
    return processedTemplate;
};


export async function sendOTPEmail(otp, toEmail) {

    const subject = `OTP Verification`

    const filePath = join(ROOT_DIR, "views/otp_email.html");

    const htmlContent = await generateHtmlContent({ otp : otp } , filePath)

    return sendEmail(toEmail, htmlContent, subject)
}
