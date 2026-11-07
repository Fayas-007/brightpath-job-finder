const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

const sendEmail = async (to, subject, html, text) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER or SMTP_PASS is missing in .env");
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"BrightPath Support" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text, // plain-text fallback
    });
  } catch (error) {
    console.error("Email send failed:", error.code, error.message);
    if (error.response) console.error("SMTP response:", error.response);

    if (error.code === "EAUTH") {
      throw new Error(
        "SMTP login rejected. For Gmail, use an App Password in SMTP_PASS."
      );
    }
    throw new Error("Failed to send email.");
  }
};

module.exports = sendEmail;