import { env } from "process";
import nodemailer from "nodemailer";

const {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_USERNAME,
  EMAIL_SMTP_PASSWORD,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
} = env;

// -------- Send mail to users --------- //

function sendEmail(toEmail, htmlContent, emailSubject) {
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

  const output = smtpTrans.sendMail(mailOptionsNoAttachment);
  let response;
  if (output) {
    response = output;
  } else {
    response = false;
  }
  console.log(response);
  return response;
}

// ------------- send mail to Admin ---------- //

async function sendEmailToAdmin(toEmail, message, emailSubject) {
  const smtpTrans = nodemailer.createTransport({
    host: EMAIL_SMTP_HOST,
    secureConnection: EMAIL_SMTP_SECURE,
    port: EMAIL_SMTP_PORT,
    secure: true,
    auth: {
      user: EMAIL_SMTP_USERNAME,
      pass: EMAIL_SMTP_PASSWORD,
    },
    defaults: {
      from: '"do not reply" <noreply@makksdehydrators.com>'
  }
  }); 

  const mailOptionsNoAttachment = {
    from:'"do not reply" <noreply@makksdehydrators.com>',
    to: "sales@makksdehydrators.com",
    // to: toEmail,
    subject: emailSubject,
    html: message,
  };


  const output = await smtpTrans.sendMail(mailOptionsNoAttachment);
  let response;
  if (output) {
    response = output;
  } else {
    response = false;
  }
  console.log(response);
  return response;
}

export { sendEmail, sendEmailToAdmin };
