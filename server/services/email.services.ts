import fs from "node:fs";
import path from "node:path";
import Handlebars from "handlebars";
import { htmlToText } from "html-to-text";
import { createEvent } from "ics";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const TPL_DIR = path.join(process.cwd(), "server", "templates");
const PARTIALS_DIR = path.join(TPL_DIR, "partials");
const cache = new Map<string, Handlebars.TemplateDelegate>();

(function registerPartials() {
  if (!fs.existsSync(PARTIALS_DIR)) return;
  for (const f of fs.readdirSync(PARTIALS_DIR)) {
    if (f.endsWith(".hbs")) {
      const name = path.basename(f, ".hbs");
      const src = fs.readFileSync(path.join(PARTIALS_DIR, f), "utf8");
      Handlebars.registerPartial(name, src);
    }
  }
})();

Handlebars.registerHelper("uppercase", (s: unknown) =>
  String(s ?? "").toUpperCase()
);

const templates: Record<string, { subject: string; file: string }> = {
  welcome: {
    subject: "Welcome to VX Academy - Complete Your Setup",
    file: "representative_welcome",
  },
  registration_success: {
    subject: "VX Academy Registration Complete",
    file: "representative_registration_success",
  },
  onboarding_reminder: {
    subject: "Reminder: Complete Setup and Invite Frontliners",
    file: "representative_onboarding_reminder",
  },
  frontliner_registration_success: {
    subject: "VX Academy Registration Complete",
    file: "frontliner_registration_success",
  },
  certificate_available: {
    subject: "Congratulations! You've Earned Your Certificate",
    file: "frontliner_certificate_available",
  },
  provisional_certificate: {
    subject: "Certificate Issued - Retake Scheduled in 2 Months",
    file: "frontliner_provisional_certificate",
  },
  password_reset: {
    subject: "Reset Your VX Academy Password",
    file: "password_reset",
  },
  new_training_area_announcement: {
    subject: "New Training Now Live - {{trainingArea}} on VX Academy",
    file: "new_training_area_announcement",
  },
};

export async function sendByType(args: {
  type: string;
  to: string;
  data: Record<string, unknown>;
}) {
  const cfg = templates[args.type];
  if (!cfg) throw new Error(`Unknown email type: ${args.type}`);
  const base = {
    to: args.to,
    subject: cfg.subject,
    file: cfg.file,
    data: args.data,
  };
  return sendDirect(base);
}

async function sendDirect(payload: {
  to: string;
  subject: string;
  file: string;
  data: Record<string, unknown>;
}) {
  const { html, text } = renderTemplate(payload.file, payload.data);
  console.log(text);
  await sendEmail({ to: payload.to, subject: payload.subject, html, text });
}

export function renderTemplate(file: string, data: Record<string, unknown>) {
  let tpl = cache.get(file);
  if (!tpl) {
    const src = fs.readFileSync(path.join(TPL_DIR, `${file}.hbs`), "utf8");
    tpl = Handlebars.compile(src, { noEscape: true });
    cache.set(file, tpl);
  }
  const html = tpl(data);
  const text = htmlToText(html, { wordwrap: 100 });
  return { html, text };
}

const ses = new SESv2Client({ region: process.env.AWS_REGION });

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  try {
    const cmd = new SendEmailCommand({
      FromEmailAddress: "info@potential.com",
      Destination: { ToAddresses: [params.to] },
      Content: {
        Simple: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: {
            Html: { Data: params.html, Charset: "UTF-8" },
            Text: { Data: params.text, Charset: "UTF-8" },
          },
        },
      },
    });
    await ses.send(cmd);
  } catch (error) {
    console.error(error);
  }
}

export async function sendCustomTextEmail(params: {
  to: string[];
  subject: string;
  text: string;
}) {
  try {
    const cmd = new SendEmailCommand({
      FromEmailAddress: "info@potential.com",
      Destination: { ToAddresses: params.to },
      Content: {
        Simple: {
          Subject: { Data: params.subject, Charset: "UTF-8" },
          Body: {
            Text: { Data: params.text, Charset: "UTF-8" },
          },
        },
      },
    });

    const result = await ses.send(cmd);
    console.log("Custom text email sent successfully:", result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error("Error sending custom text email:", error);
    throw error;
  }
}

/*

async function sendQueued(payload: {
  to: string;
  subject: string;
  file: string;
  data: Record<string, unknown>;
}) {
  const { Queue } = await import("bullmq");
  const queue = new Queue("email-queue", {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });
  await queue.add("sendEmail", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
  });
}

*/
