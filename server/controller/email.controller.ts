import type { Request, Response } from "express";
import { createEvent } from "ics";
import {
  TrainingAreaService,
  LearningBlockService,
} from "../services/training.services";
import { UserService } from "../services/user.services";
import { sendByType, sendCustomTextEmail } from "../services/email.services";
import {
  CertificateHelper,
  LearningBlockProgressService,
} from "../services/progress.services";
import { db } from "../db/connection";
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
      to: "jayryan267@gmail.com",
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
      to: "jayryan267@gmail.com",
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

    // Get all learning blocks for the training area
    const learningBlocks =
      await LearningBlockService.getLearningBlocksByTrainingArea(
        trainingAreaId
      );

    // Auto-complete all learning blocks for the user
    if (learningBlocks.length > 0) {
      console.log(
        `Auto-completing ${learningBlocks.length} learning blocks for user ${userId} in training area ${trainingAreaId}`
      );

      const completionPromises = learningBlocks.map((learningBlock: any) =>
        LearningBlockProgressService.completeLearningBlock(
          userId,
          learningBlock.id
        )
      );

      try {
        const completionResults = await Promise.all(completionPromises);

        // Log completion results
        completionResults.forEach((result: any, index: number) => {
          const learningBlock = learningBlocks[index];
          if (learningBlock) {
            if (result.success) {
              console.log(
                `✅ Learning block ${learningBlock.id} (${learningBlock.title}) completed successfully`
              );
            } else {
              console.log(
                `❌ Learning block ${learningBlock.id} (${learningBlock.title}) failed to complete: ${result.message}`
              );
            }
          }
        });

        const successfulCompletions = completionResults.filter(
          (result: any) => result.success
        ).length;
        console.log(
          `Successfully completed ${successfulCompletions}/${learningBlocks.length} learning blocks`
        );
      } catch (error) {
        console.error("Error auto-completing learning blocks:", error);
        // Continue with certificate generation even if some learning blocks fail
      }
    } else {
      console.log(
        `No learning blocks found for training area ${trainingAreaId}`
      );
    }

    // Use the CertificateHelper to generate the certificate
    const certificateResult =
      await CertificateHelper.generateTrainingAreaCertificate(
        db, // Use the database connection directly
        userId,
        trainingAreaId
      );

    if (!certificateResult.success) {
      throw createError(certificateResult.message, 500);
    }

    sendByType({
      type: "certificate_available",
      to: "jayryan267@gmail.com",
      data: {
        name: user.firstName,
        trainingAreaName: trainingArea?.name,
        url: `${process.env.FRONTEND_URL}/certificate/${certificateResult.certificateId}`,
      },
    });
  }

  static async sendCustomTextEmail(req: Request, res: Response) {
    try {
      const { to, subject, text } = req.body;

      // Validation
      if (!to || !Array.isArray(to) || to.length === 0) {
        throw createError("Recipients must be a non-empty array", 400);
      }

      if (!subject || !text) {
        throw createError("Subject and text content are required", 400);
      }

      // Validate that all recipients are valid email addresses
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = to.filter((email) => !emailRegex.test(email));
      if (invalidEmails.length > 0) {
        throw createError(
          `Invalid email addresses: ${invalidEmails.join(", ")}`,
          400
        );
      }

      const result = await sendCustomTextEmail({
        to,
        subject,
        text,
      });

      res.json({
        success: true,
        message: "Custom text email sent successfully",
        messageId: result.messageId,
      });
    } catch (error) {
      console.error("Error in sendCustomTextEmail:", error);
      throw createError(
        error instanceof Error
          ? error.message
          : "Failed to send custom text email",
        500
      );
    }
  }
}
