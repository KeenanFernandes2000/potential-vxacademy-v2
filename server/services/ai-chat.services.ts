import https from "https";
import http from "http";
import { Readable } from "stream";

export interface AIChatRequest {
    userId: number;
    message: string;
    botId: string;
    sessionId?: string;
    systemPrompt: string;
    botName: string;
    trainingContext?: any;
}

export class AIChatService {
    private static AI_BACKEND_URL = process.env.AI_BACKEND_URL || "http://localhost:8001";

    /**
     * Get bot configuration from AI backend
     */
    static async getBotConfig(botId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                const url = new URL(`${this.AI_BACKEND_URL}/api/admin/bot/${botId}`);
                const isHttps = url.protocol === "https:";
                const httpModule = isHttps ? https : http;

                const options = {
                    hostname: url.hostname,
                    port: url.port || (isHttps ? 443 : 80),
                    path: url.pathname,
                    method: "GET",
                };

                const req = httpModule.request(options, (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`AI backend responded with status: ${res.statusCode}`));
                        return;
                    }

                    let data = "";
                    res.on("data", (chunk) => {
                        data += chunk;
                    });

                    res.on("end", () => {
                        try {
                            const botConfig = JSON.parse(data);
                            resolve(botConfig);
                        } catch (error) {
                            reject(new Error("Failed to parse bot configuration"));
                        }
                    });
                });

                req.on("error", (error) => {
                    console.error("Error calling AI backend:", error);
                    reject(error);
                });

                req.end();
            } catch (error) {
                console.error("Error preparing bot config request:", error);
                reject(error);
            }
        });
    }

    /**
     * Send message to AI backend and stream response
     * This acts as a proxy between frontend and AI backend
     */
    static async sendMessageToAI(request: AIChatRequest): Promise<Readable> {
        return new Promise((resolve, reject) => {
            try {
                // Use the new AI backend endpoint format: /agent/chatbot/:botId/chat
                const url = new URL(`${this.AI_BACKEND_URL}/agent/chatbot/${request.botId}/chat`);
                const isHttps = url.protocol === "https:";
                const httpModule = isHttps ? https : http;

                // Prepare JSON request body
                const requestBody = {
                    message: request.message,
                    sessionId: request.sessionId || `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    systemPrompt: request.systemPrompt,
                    botName: request.botName,
                    trainingContext: request.trainingContext || null,
                };

                const bodyString = JSON.stringify(requestBody);

                const options = {
                    hostname: url.hostname,
                    port: url.port || (isHttps ? 443 : 80),
                    path: url.pathname,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": Buffer.byteLength(bodyString),
                    },
                };

                const req = httpModule.request(options, (res) => {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject(new Error(`AI backend responded with status: ${res.statusCode}`));
                        return;
                    }

                    // Return the response stream
                    resolve(res as Readable);
                });

                req.on("error", (error) => {
                    console.error("Error calling AI backend:", error);
                    reject(error);
                });

                req.write(bodyString);
                req.end();
            } catch (error) {
                console.error("Error preparing AI request:", error);
                reject(error);
            }
        });
    }
}

