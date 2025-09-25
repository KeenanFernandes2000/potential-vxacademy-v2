import type { Request, Response } from "express";
import { createEvent } from "ics";

export class EmailController {
  static async generateIcsFile(req: Request, res: Response) {
    const deadlineDate = new Date();
    deadlineDate.setMonth(deadlineDate.getMonth() + 2);

    const event = {
      title: "VX Academy Training Retake",
      description: "Retake your training to maintain certification.",
      location: "VX Academy Online",
      start: [
        deadlineDate.getFullYear(),
        deadlineDate.getMonth() + 1, // months are 1-based
        deadlineDate.getDate(),
      ] as [number, number, number],
      duration: { days: 1 },
      alarms: [
        {
          action: "display" as const,
          description: "Reminder",
          trigger: "-P28D",
        }, // 1 month
        {
          action: "display" as const,
          description: "Reminder",
          trigger: "-P7D",
        }, // 1 week
        {
          action: "display" as const,
          description: "Reminder",
          trigger: "-P1D",
        }, // 1 day
      ],
    };

    createEvent(event, (error, value) => {
      if (error) return res.status(500).send("Error generating invite");

      const fixed = value
        .replace(/TRIGGER;VALUE=DATE-TIME:-P28D/g, "TRIGGER:-P28D")
        .replace(/TRIGGER;VALUE=DATE-TIME:-P7D/g, "TRIGGER:-P7D")
        .replace(/TRIGGER;VALUE=DATE-TIME:-P1D/g, "TRIGGER:-P1D");

      res.setHeader("Content-Type", "text/calendar; charset=utf-8");
      res.setHeader("Content-Disposition", "attachment; filename=retake.ics");

      res.send(fixed);
    });
  }
}
