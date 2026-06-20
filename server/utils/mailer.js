import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

console.log("SMTP HOST:", process.env.BREVO_SMTP_HOST);

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export default transporter;
