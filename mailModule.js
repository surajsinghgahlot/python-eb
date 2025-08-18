import { env } from "process";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
dotenv.config({ path: ".env" });

const {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_USERNAME,
  EMAIL_SMTP_PASSWORD,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
} = env;

// -------- Send mail to users --------- //

async function sendEmail(toEmail, htmlContent, emailSubject) {
  const smtpTrans = nodemailer.createTransport({
    host: EMAIL_SMTP_HOST,
    secureConnection: EMAIL_SMTP_SECURE,
    port: EMAIL_SMTP_PORT,
    secure: true,
    auth: {
      user: EMAIL_SMTP_USERNAME,
      pass: EMAIL_SMTP_PASSWORD,
    },
  });

  const mailOptionsNoAttachment = {
    from: EMAIL_SMTP_USERNAME,
    to: toEmail,
    subject: emailSubject,
    html: htmlContent,
  };

  console.log(mailOptionsNoAttachment,'mailOptionsNoAttachment')
  return await smtpTrans.sendMail(mailOptionsNoAttachment);
}


export { sendEmail };
