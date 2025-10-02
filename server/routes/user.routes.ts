import { createAsyncRouter } from "../utils/asyncErrorHandling";
const router = createAsyncRouter();
import { userControllers } from "../controller/user.controllers";
import { authorizeRoles } from "../middleware/userTypeAuth";
import passport from "../middleware/passport";

// JWT Authentication Middleware
const authenticateJWT = passport.authenticate("jwt", { session: false });
// authenticateJWT,authorizeRoles("admin"), -> add this to the routes that you want to protect

// ==================== AUTHENTICATION FUNCTIONS ====================
router.post("/login", userControllers.login); // logout function shoudl be on client side only

// ==================== PASSWORD RESET FUNCTIONS ====================
router.post("/password-reset/request", userControllers.requestPasswordReset);
router.get(
  "/password-reset/verify/:token",
  userControllers.verifyPasswordResetToken
);
router.post("/password-reset/reset", userControllers.resetPassword);

// ==================== USER CRUD FUNCTIONS ====================
router.get("/users", userControllers.getAllUsers);
router.get("/users/with-details", userControllers.getAllUsersWithDetails);
router.get(
  "/users/by-progress-threshold",
  userControllers.getUsersByProgressThreshold
);
router.get("/users/:id", userControllers.getUserById);
router.post("/users", userControllers.create);
router.put("/users/:id", userControllers.updateUser);
router.delete("/users/:id", userControllers.deleteUser);

// ==================== ASSETS CRUD FUNCTIONS ====================
router.get("/assets", userControllers.getAllAssets);
router.get("/assets/:id", userControllers.getAssetById);
router.post("/assets", userControllers.createAsset);
router.put("/assets/:id", userControllers.updateAsset);
router.delete("/assets/:id", userControllers.deleteAsset);

// ==================== SUB ASSETS CRUD FUNCTIONS ====================
router.get("/sub-assets", userControllers.getAllSubAssets);
router.get(
  "/sub-assets/by-asset/:assetId",
  userControllers.getSubAssetsByAssetId
);
router.get("/sub-assets/:id", userControllers.getSubAssetById);
router.post("/sub-assets", userControllers.createSubAsset);
router.put("/sub-assets/:id", userControllers.updateSubAsset);
router.delete("/sub-assets/:id", userControllers.deleteSubAsset);

// ==================== ROLE CATEGORIES CRUD FUNCTIONS ====================
router.get("/role-categories", userControllers.getAllRoleCategories);
router.get("/role-categories/:id", userControllers.getRoleCategoryById);
router.post("/role-categories", userControllers.createRoleCategory);
router.put("/role-categories/:id", userControllers.updateRoleCategory);
router.delete("/role-categories/:id", userControllers.deleteRoleCategory);

// ==================== ROLES CRUD FUNCTIONS ====================
router.get("/roles", userControllers.getAllRoles);
router.get("/roles/:id", userControllers.getRoleById);
router.post("/roles", userControllers.createRole);
router.put("/roles/:id", userControllers.updateRole);
router.delete("/roles/:id", userControllers.deleteRole);

// ==================== SENIORITY LEVELS CRUD FUNCTIONS ====================
router.get("/seniority-levels", userControllers.getAllSeniorityLevels);
router.get("/seniority-levels/:id", userControllers.getSeniorityLevelById);
router.post("/seniority-levels", userControllers.createSeniorityLevel);
router.put("/seniority-levels/:id", userControllers.updateSeniorityLevel);
router.delete("/seniority-levels/:id", userControllers.deleteSeniorityLevel);

// ==================== ORGANIZATIONS CRUD FUNCTIONS ====================
router.get("/organizations", userControllers.getAllOrganizations);
router.get("/organizations/:id", userControllers.getOrganizationById);
router.post("/organizations", userControllers.createOrganization);
router.put("/organizations/:id", userControllers.updateOrganization);
router.delete("/organizations/:id", userControllers.deleteOrganization);

// ==================== SUB ORGANIZATIONS CRUD FUNCTIONS ====================
router.get("/sub-organizations", userControllers.getAllSubOrganizations);
router.get(
  "/sub-organizations/by-organization/:organizationId",
  userControllers.getSubOrganizationsByOrganizationId
);
router.get(
  "/sub-organizations/by-asset/:assetId/:subAssetId",
  userControllers.getSubOrganizationByAssetAndSubAsset
);
router.get("/sub-organizations/:id", userControllers.getSubOrganizationById);
router.post("/sub-organizations", userControllers.createSubOrganization);
router.put("/sub-organizations/:id", userControllers.updateSubOrganization);
router.delete("/sub-organizations/:id", userControllers.deleteSubOrganization);

// ==================== SUB-ADMIN CREATION & REGISTRATION FUNCTIONS ====================
router.post(
  "/sub-admins/register/:id",
  userControllers.completeSubAdminRegistration
);
router.get(
  "/sub-admins/registration/:id",
  userControllers.getSubAdminRegistrationDetails
);
router.get("/sub-admins/check/:id", userControllers.checkSubAdminExists);
router.post("/sub-admins/reminder", userControllers.sendSubAdminReminderEmail);

// ==================== NORMAL USER REGISTRATION & UPDATE FUNCTIONS ====================
router.post(
  "/users/:id/register-normal-user",
  userControllers.registerNormalUser
);
router.put("/users/:id/normal-user", userControllers.updateNormalUser);

// ==================== INVITATION FUNCTIONS ====================
router.post("/invitations", userControllers.createInvitation);
router.get("/invitations/verify/:token", userControllers.getInvitationByToken);
router.get(
  "/invitations/creator/:createdBy",
  userControllers.getInvitationsByCreator
);
router.delete(
  "/invitations/token/:token",
  userControllers.deleteInvitationByToken
);

// ==================== CERTIFICATE FUNCTIONS ====================
router.post("/certificates/generate", userControllers.generateCertificate);
router.get("/users/:id/certificates", userControllers.getUserCertificates);

// ==================== COMPREHENSIVE USER DETAILS ====================
router.get("/:id/comprehensive-details", userControllers.getUserComprehensiveDetails);

export default router;
