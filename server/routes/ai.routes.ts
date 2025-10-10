import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { AIController } from "../controller/ai.controller";
import { AIChatController } from "../controller/ai-chat.controller";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });

/**
 * @route   GET /api/ai/bot/:botId
 * @desc    Get bot configuration (proxy to AI backend)
 * @access  Private (User, Sub-admin, Admin)
 */
router.get(
    "/bot/:botId",
    authenticateJWT,
    authorizeRoles("user", "sub_admin", "admin"),
    AIChatController.getBotConfig
);

/**
 * @route   POST /api/ai/chatbot/:botId/chat
 * @desc    Stream chat response with SSE format (for chat interface)
 * @access  Private (User, Sub-admin, Admin)
 */
router.post(
    "/chatbot/:botId/chat",
    authenticateJWT,
    authorizeRoles("user", "sub_admin", "admin"),
    AIChatController.streamChatSSE
);

/**
 * @route   POST /api/ai/chat/stream
 * @desc    Stream chat response from AI backend (PROXY ENDPOINT)
 * @details This endpoint:
 *          1. Receives chat message from frontend
 *          2. Fetches user's training context from database
 *          3. Forwards request to AI backend with training context
 *          4. Streams AI response back to frontend
 * 
 *          Benefits of using this proxy:
 *          - Hides AI backend URL from frontend
 *          - Adds authentication and authorization
 *          - Automatically includes training context
 *          - Enables logging and monitoring
 *          - Allows rate limiting
 * 
 * @access  Private (User, Sub-admin, Admin)
 */
router.post(
    "/chat/stream",
    authenticateJWT,
    authorizeRoles("user", "sub_admin", "admin"),
    AIChatController.streamChat
);

/**
 * @route   GET /api/ai/training-context/:userId
 * @desc    Get comprehensive training context for AI chatbot
 * @details This endpoint provides:
 *          - Training areas with progress (hierarchical: areas > modules > courses > units)
 *          - Certificates earned
 *          - Assessment attempts and results
 *          - Badges earned
 *          - Overall progress statistics
 * 
 *          IMPORTANT: This endpoint does NOT expose:
 *          - User names (first name, last name)
 *          - Email addresses
 *          - Phone numbers
 *          - Employee IDs
 *          - Role information
 *          - XP points
 *          - Organization details
 *          - Any other personally identifiable information
 * 
 * @access  Private (User [own data only], Sub-admin, Admin)
 */
router.get(
    "/training-context/:userId",
    authenticateJWT,
    authorizeRoles("user", "sub_admin", "admin"),
    AIController.getUserTrainingContext
);

export default router;

