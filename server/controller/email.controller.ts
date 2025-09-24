import type { Request, Response } from "express";
import { sendByType } from "../services/email.services";
import { addMonths, format, subDays } from "date-fns";

export class EmailController {
  static async sendEmail(req: Request, res: Response) {
    const { type, to, data } = req.body ?? {};
    await sendByType({
      type,
      to,
      data: {
        ...data,
      },
    });
    res.json({
      status: process.env.EMAIL_TRANSPORT === "queue" ? "queued" : "sent",
    });
  }

  static async generateDeadlineURL(req: Request, res: Response) {
    const deadline = addMonths(new Date(), 2); // deadline day
    const reminder = subDays(deadline, 1); // 24h before

    // Format for all-day events: YYYYMMDD
    const startStr = format(deadline, "yyyyMMdd");
    const endStr = format(deadline, "yyyyMMdd"); // same day (all-day)

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: "VX Academy Training Retake",
      dates: `${startStr}/${endStr}`,
      details: "Retake your training to maintain certification.",
      location: "VX Academy Online",
    });

    res.json({
      url: `https://calendar.google.com/calendar/render?${params.toString()}`,
    });
  }
}
