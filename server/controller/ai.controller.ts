import type { Request, Response } from "express";
import { AIService } from "../services/ai.services";
import type { CustomError } from "../middleware/errorHandling";

// Helper function to create custom errors
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

// Validation function
const validateUserId = (userId: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!userId || typeof userId !== "number" || userId <= 0) {
        errors.push("Valid user ID is required");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

export class AIController {
    /**
     * Get user training context for AI chatbot
     * GET /api/ai/training-context/:userId
     * 
     * This endpoint provides comprehensive training information for the AI to assist users
     * without exposing sensitive personal information (names, emails, phone numbers, etc.)
     */
    static async getUserTrainingContext(req: Request, res: Response) {
        const userId = parseInt(req.params.userId || "0");

        // Validate input
        const validation = validateUserId(userId);
        if (!validation.isValid) {
            throw createError("Validation failed", 400, validation.errors);
        }

        try {
            const result = await AIService.getUserTrainingContext(userId);

            if (!result.success) {
                throw createError(result.message, 404);
            }

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            console.error("Error getting user training context for AI:", error);
            throw createError(
                "Failed to retrieve user training context",
                500,
                error instanceof Error ? [error.message] : ["Unknown error occurred"]
            );
        }
    }
}

