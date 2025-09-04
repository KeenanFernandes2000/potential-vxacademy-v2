import express from "express";
const router = express.Router();
import { userControllers } from "../controller/user.controllers";
import asyncHandler from "../utils/asyncErrorHandling";
import passport from "../middleware/passport";
import { authorizeRoles } from "../middleware/userTypeAuth";

// ==================== AUTHENTICATION FUNCTIONS ====================
router.post("/login", userControllers.login); // logout function shoudl be on client side only

// JWT Authentication Middleware
// const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== USER CRUD FUNCTIONS ====================
router.get("/", asyncHandler(userControllers.getAllUsers));
router.get("/:id", asyncHandler(userControllers.getUserById));
router.post("/", asyncHandler(userControllers.create));
router.put("/:id", asyncHandler(userControllers.updateUser));
router.delete("/:id", asyncHandler(userControllers.deleteUser));

// ==================== ASSETS CRD FUNCTIONS ====================
router.get("/assets", asyncHandler(userControllers.getAllAssets));
router.post("/assets", asyncHandler(userControllers.createAsset));
router.delete("/assets/:id", asyncHandler(userControllers.deleteAsset));

// ==================== ROLE CATEGORIES CRD FUNCTIONS ====================
router.get(
  "/role-categories",
  asyncHandler(userControllers.getAllRoleCategories)
);
router.post(
  "/role-categories",
  asyncHandler(userControllers.createRoleCategory)
);
router.delete(
  "/role-categories/:id",
  asyncHandler(userControllers.deleteRoleCategory)
);

// ==================== ROLES CRD FUNCTIONS ====================
router.get("/roles", asyncHandler(userControllers.getAllRoles));
router.post("/roles", asyncHandler(userControllers.createRole));
router.delete("/roles/:id", asyncHandler(userControllers.deleteRole));

// ==================== SENIORITY LEVELS CRD FUNCTIONS ====================
router.get(
  "/seniority-levels",
  asyncHandler(userControllers.getAllSeniorityLevels)
);
router.post(
  "/seniority-levels",
  asyncHandler(userControllers.createSeniorityLevel)
);
router.delete(
  "/seniority-levels/:id",
  asyncHandler(userControllers.deleteSeniorityLevel)
);

export default router;
