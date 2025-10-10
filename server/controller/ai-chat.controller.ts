import type { Request, Response } from "express";
import { AIChatService } from "../services/ai-chat.services";
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

export class AIChatController {
    /**
     * Get bot configuration from AI backend
     * GET /api/ai/bot/:botId
     */
    static async getBotConfig(req: Request, res: Response) {
        try {
            const botId = req.params.botId;

            if (!botId || typeof botId !== "string") {
                throw createError("Bot ID is required", 400);
            }

            // Get user from JWT (set by passport middleware)
            const user = req.user as any;
            if (!user || !user.id) {
                throw createError("User not authenticated", 401);
            }

            // Fetch bot config from AI backend
            const botConfig = await AIChatService.getBotConfig(botId);

            res.status(200).json(botConfig);
        } catch (error) {
            console.error("Error fetching bot config:", error);

            if (error instanceof Error && (error as CustomError).statusCode) {
                const customError = error as CustomError;
                const statusCode = customError.statusCode || 500;
                res.status(statusCode).json({
                    success: false,
                    message: customError.message,
                    errors: customError.errors,
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch bot configuration",
                    errors: [error instanceof Error ? error.message : "Unknown error"],
                });
            }
        }
    }

    /**
     * Stream chat response from AI backend with SSE format
     * POST /agent/chatbot/:botId/chat
     * 
     * This endpoint provides Server-Sent Events streaming for the chat interface
     */
    static async streamChatSSE(req: Request, res: Response) {
        try {
            const { message, sessionId, systemPrompt, botName } = req.body;
            const botId = req.params.botId;

            // Validate required fields
            if (!message || typeof message !== "string" || message.trim() === "") {
                throw createError("Message is required", 400);
            }

            if (!botId || typeof botId !== "string") {
                throw createError("Bot ID is required", 400);
            }

            // Get user from JWT (set by passport middleware)
            const user = req.user as any;
            if (!user || !user.id) {
                throw createError("User not authenticated", 401);
            }

            // Use bot configuration from request or defaults
            const botConfig = {
                system: systemPrompt || "You are a helpful AI assistant for VX Academy training platform.",
                name: botName || "Nouf - VX AI Concierge"
            };

            // Fetch user's training context
            let trainingContext = null;
            try {
                const contextResult = await AIService.getUserTrainingContext(user.id);
                if (contextResult.success && contextResult.data) {
                    trainingContext = contextResult.data;
                }
            } catch (error) {
                console.error("Error fetching training context:", error);
            }

            // Set headers for SSE
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // Send to AI backend
            const aiResponse = await AIChatService.sendMessageToAI({
                userId: user.id,
                message,
                botId,
                systemPrompt: botConfig.system,
                botName: botConfig.name,
                trainingContext,
            });

            // Stream the response and format as SSE
            aiResponse.on("data", (chunk: Buffer) => {
                const content = chunk.toString();
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            });

            aiResponse.on("end", () => {
                res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
                res.end();
            });

            aiResponse.on("error", (error: Error) => {
                res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
                res.end();
            });
        } catch (error) {
            console.error("Error in streamChatSSE:", error);

            if (!res.headersSent) {
                if (error instanceof Error && (error as CustomError).statusCode) {
                    const customError = error as CustomError;
                    const statusCode = customError.statusCode || 500;
                    res.status(statusCode).json({
                        success: false,
                        message: customError.message,
                        errors: customError.errors,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to process chat request",
                        errors: [error instanceof Error ? error.message : "Unknown error"],
                    });
                }
            } else {
                res.end();
            }
        }
    }

    /**
     * Stream chat response from AI backend
     * POST /api/ai/chat/stream
     * 
     * This endpoint acts as a proxy between the frontend and AI backend.
     * It fetches the user's training context and forwards everything to the AI backend.
     */
    static async streamChat(req: Request, res: Response) {
        try {
            const { message, botId, systemPrompt, botName } = req.body;

            // Validate required fields
            if (!message || typeof message !== "string" || message.trim() === "") {
                throw createError("Message is required", 400);
            }

            if (!botId || typeof botId !== "string") {
                throw createError("Bot ID is required", 400);
            }

            if (!systemPrompt || typeof systemPrompt !== "string") {
                throw createError("System prompt is required", 400);
            }

            if (!botName || typeof botName !== "string") {
                throw createError("Bot name is required", 400);
            }

            // Get user from JWT (set by passport middleware)
            const user = req.user as any;
            if (!user || !user.id) {
                throw createError("User not authenticated", 401);
            }

            // Fetch user's training context
            let trainingContext = null;
            try {
                const contextResult = await AIService.getUserTrainingContext(user.id);
                if (contextResult.success && contextResult.data) {
                    trainingContext = contextResult.data;
                }
            } catch (error) {
                console.error("Error fetching training context:", error);
                // Continue without context rather than failing
            }

            console.log("trainingContext", trainingContext);

            // Send to AI backend with original system prompt
            // The trainingContext will be sent separately for the AI backend to handle
            const aiResponse = await AIChatService.sendMessageToAI({
                userId: user.id,
                message,
                botId,
                systemPrompt, // Send original system prompt, not enhanced
                botName,
                trainingContext, // Send full training context separately
            });

            // Set headers for streaming
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            res.setHeader("Transfer-Encoding", "chunked");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            // Stream the response from AI backend to client
            aiResponse.pipe(res);
        } catch (error) {
            console.error("Error in streamChat:", error);

            // If headers not sent, send error response
            if (!res.headersSent) {
                if (error instanceof Error && (error as CustomError).statusCode) {
                    const customError = error as CustomError;
                    const statusCode = customError.statusCode || 500;
                    res.status(statusCode).json({
                        success: false,
                        message: customError.message,
                        errors: customError.errors,
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: "Failed to process chat request",
                        errors: [error instanceof Error ? error.message : "Unknown error"],
                    });
                }
            } else {
                // If streaming already started, just end the response
                res.end();
            }
        }
    }
}

