import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3', // Add for strict TLS support
    rejectUnauthorized: false
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("❌ Mail test failed:", err);
  } else {
    console.log("✅ Mail test succeeded. Ready to send emails.");
  }
});
