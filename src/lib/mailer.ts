import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM = process.env.SMTP_FROM || "DoConBoshqar <no-reply@doconboshqar.uz>";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
    });
  }
  return transporter;
}

/**
 * Email yuboradi. Agar SMTP_* environment o'zgaruvchilari sozlanmagan bo'lsa
 * (masalan, lokal development muhitida), xabar konsolga chiqariladi — bu
 * orqali email xizmatisiz ham "parolni tiklash" oqimini sinab ko'rish mumkin.
 */
export async function sendMail(to: string, subject: string, html: string) {
  const t = getTransporter();

  if (!t) {
    // eslint-disable-next-line no-console
    console.log("\n===== EMAIL (SMTP sozlanmagan, konsolga chiqarildi) =====");
    // eslint-disable-next-line no-console
    console.log(`Kimga: ${to}\nMavzu: ${subject}\n\n${html.replace(/<[^>]+>/g, " ")}`);
    console.log("===========================================================\n");
    return;
  }

  await t.sendMail({ from: SMTP_FROM, to, subject, html });
}
