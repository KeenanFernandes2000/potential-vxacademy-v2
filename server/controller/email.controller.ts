import type { Request, Response } from "express";
import { createEvent } from "ics";
import { TrainingAreaService } from "../services/training.services";
import { UserService } from "../services/user.services";
import { sendByType } from "../services/email.services";
import { CertificateHelper } from "../services/progress.services";
import type { CustomError } from "../middleware/errorHandling";

const createError = (
  message: string,
  statusCode: number,
  errors?: string[]
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  if (errors) {
    error.errors = errors;
  }
  return error;
};

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

  static async sendTrainingAreaAnnouncement(req: Request, res: Response) {
    const { trainingAreaId, userId } = req.body;
    const trainingArea = await TrainingAreaService.getTrainingAreaById(
      trainingAreaId
    );
    const user = await UserService.getUserById(userId);
    if (!trainingArea || !user) {
      throw createError("Training area or user not found", 404);
    }
    sendByType({
      type: "new_training_area_announcement",
      to: "keenan@potential.com",
      data: {
        name: user.firstName,
        trainingAreaName: trainingArea.name,
        url: `${process.env.FRONTEND_URL}/login`,
      },
    });
  }

  static async sendInitialAssessmentFailed(req: Request, res: Response) {
    const { trainingAreaId, userId } = req.body;
    const trainingArea = await TrainingAreaService.getTrainingAreaById(
      trainingAreaId
    );
    const user = await UserService.getUserById(userId);
    if (!trainingArea || !user) {
      throw createError("Training area or user not found", 404);
    }
    sendByType({
      type: "provisional_certificate",
      to: "keenan@potential.com",
      data: {
        name: user?.firstName,
        trainingAreaName: trainingArea?.name,
        url: `${process.env.FRONTEND_URL}/retake-ics`,
      },
    });
  }

  static async sendInitialAssessmentPassed(req: Request, res: Response) {
    const { trainingAreaId, userId } = req.body;
    const trainingArea = await TrainingAreaService.getTrainingAreaById(
      trainingAreaId
    );
    const user = await UserService.getUserById(userId);
    if (!trainingArea || !user) {
      throw createError("Training area or user not found", 404);
    }

    // Use the CertificateHelper to generate the certificate
    const certificateResult =
      await CertificateHelper.generateTrainingAreaCertificate(
        null, // No transaction needed for this standalone call
        userId,
        trainingAreaId
      );

    if (!certificateResult.success) {
      throw createError(certificateResult.message, 500);
    }

    sendByType({
      type: "certificate_available",
      to: "keenan@potential.com",
      data: {
        name: user.firstName,
        trainingAreaName: trainingArea?.name,
        url: `${process.env.FRONTEND_URL}/certificate/${certificateResult.certificateId}`,
      },
    });
  }
}
