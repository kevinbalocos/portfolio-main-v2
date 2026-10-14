import nodemailer from "nodemailer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 4;
const requests = new Map<string, { count: number; resetAt: number }>();

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
};

function clean(value: unknown, max: number): string {
  return typeof value === "string"
    ? value.replace(/[\r\n\x00-\x1F\x7F]/g, " ").trim().slice(0, max)
    : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function allowRequest(key: string, now = Date.now()): boolean {
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function buildHtml(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  brandName: string;
}): string {
  const name = escapeHtml(input.name || "Anonymous");
  const email = escapeHtml(input.email);
  const subject = escapeHtml(input.subject || "Portfolio Contact");
  const message = escapeHtml(input.message).replace(/\n/g, "<br />");
  const time = escapeHtml(input.receivedAt);
  const brand = escapeHtml(input.brandName);

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:28px 12px;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#101828">
  <div style="max-width:680px;margin:0 auto">
    <div style="padding:28px;border-radius:22px;background:linear-gradient(135deg,#1d2333,#111827 55%,#6d3ad1);color:#fff">
      <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;opacity:.72">${brand}</div>
      <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2">New Client Message</h1>
      <p style="margin:10px 0 0;opacity:.75;font-size:13px">Received ${time}</p>
    </div>
    <div style="margin-top:14px;padding:24px;border:1px solid #e5e7eb;border-radius:22px;background:#fff">
      <h2 style="margin:0 0 16px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#667085">Client information</h2>
      <p style="margin:9px 0"><strong>Name:</strong> ${name}</p>
      <p style="margin:9px 0"><strong>Email:</strong> <a style="color:#6d3ad1" href="mailto:${email}">${email}</a></p>
      <p style="margin:9px 0"><strong>Subject:</strong> ${subject}</p>
      <hr style="border:0;border-top:1px solid #e5e7eb;margin:20px 0">
      <h2 style="margin:0 0 12px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#667085">Message</h2>
      <div style="padding:18px;border-radius:14px;background:#f8f8fb;font-size:15px;line-height:1.8;overflow-wrap:anywhere">${message}</div>
      <p style="margin:18px 0 0;font-size:12px;color:#667085">Reply directly to this email to respond to the client.</p>
    </div>
  </div>
</body></html>`;
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return json({ ok: false, message: "Method not allowed." }, 405);
    }

    const origin = request.headers.get("origin");
    if (origin) {
      try {
        if (new URL(origin).host !== new URL(request.url).host) {
          return json({ ok: false, message: "Invalid request origin." }, 403);
        }
      } catch {
        return json({ ok: false, message: "Invalid request origin." }, 403);
      }
    }

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > 20_000) {
      return json({ ok: false, message: "Message is too large." }, 413);
    }

    let raw: ContactPayload;
    try {
      raw = (await request.json()) as ContactPayload;
    } catch {
      return json({ ok: false, message: "Send a valid JSON request." }, 400);
    }

    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const rateKey = forwardedFor || request.headers.get("x-real-ip") || "unknown";
    if (!allowRequest(rateKey)) {
      return json(
        { ok: false, message: "Too many messages. Please wait a few minutes and try again." },
        429,
      );
    }

    const name = clean(raw.name, 100);
    const email = clean(raw.email, 254).toLowerCase();
    const subject = clean(raw.subject, 160) || "Portfolio Contact";
    const message = typeof raw.message === "string"
      ? raw.message.replace(/\r\n?/g, "\n").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim().slice(0, 8000)
      : "";

    if (!EMAIL_PATTERN.test(email)) {
      return json({ ok: false, message: "Please enter a valid email address." }, 400);
    }
    if (!message || message.length < 2) {
      return json({ ok: false, message: "Please enter a message." }, 400);
    }

    const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim();
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER?.trim();
    const pass = (process.env.SMTP_PASS || "").replace(/\s/g, "");
    const to = process.env.TO_EMAIL?.trim() || "kevinbalocos@gmail.com";
    const fromName = process.env.FROM_NAME?.trim() || "Portfolio Contact";
    const fromEmail = process.env.FROM_EMAIL?.trim() || user;

    if (!host || !Number.isFinite(port) || port < 1 || port > 65535 || !user || !pass || !to || !fromEmail) {
      console.error("Contact email configuration is incomplete.");
      return json({ ok: false, message: "Contact email is not configured. Please try again later." }, 500);
    }

    const receivedAt = new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
    const text = [
      "NEW PORTFOLIO CONTACT MESSAGE",
      "",
      `Name: ${name || "Anonymous"}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      `Received: ${receivedAt} (Philippines time)`,
      "",
      message,
    ].join("\n");

    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        ...(port === 587 ? { requireTLS: true } : {}),
        auth: { user, pass },
        connectionTimeout: 12_000,
        greetingTimeout: 12_000,
        socketTimeout: 20_000,
      });

      await transporter.sendMail({
        from: { name: fromName, address: fromEmail },
        to,
        replyTo: { name: name || email, address: email },
        subject: `Portfolio contact: ${subject}`,
        text,
        html: buildHtml({ name, email, subject, message, receivedAt, brandName: fromName }),
      });

      return json({ ok: true, message: "Message sent successfully. Thank you for reaching out." });
    } catch (error) {
      console.error("Portfolio contact email failed:", error);
      return json({
        ok: false,
        message: "The email service could not send your message. Please check the email settings or try again later.",
      }, 502);
    }
  },
};
