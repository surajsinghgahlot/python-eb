import SuperAdminController from "../controllers/SuperAdmin.js";
import express from "express";
import validation from "../helpers/middleware/validation.js";
import {
  generateAccessToken,
  isSuperAdmin,
  logout,
  verifyJwtAdmin,
} from "../helpers/Auth.js";
import { checkPermission } from "../helpers/project/custom.js";
import { upload } from "../helpers/third-party/multipart.js";

let router = express.Router();

router.post("/signin", SuperAdminController.signin);

router.post("/logout", logout);

router.post("/token", generateAccessToken);

router.post(
  "/create",
  verifyJwtAdmin,
  checkPermission,
  validation.adminCreate,
  SuperAdminController.createAdmin
);
router.get("/admin_list/:id?", verifyJwtAdmin, checkPermission, SuperAdminController.adminList);

router.get("/profile", verifyJwtAdmin, SuperAdminController.profile);
router.get("/dashboard", verifyJwtAdmin, SuperAdminController.dashboard);

router.get(
  "/permission_list",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.permissionList
);
router.put(
  "/update/:id",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.editProfile
);

router.post(
  "/forgot_passward",
  validation.forgotPassword,
  SuperAdminController.forgotPassword
);

router.post(
  "/verification_otp",
  validation.verificationOtp,
  SuperAdminController.verificationOtp
);

router.post(
  "/resend_otp",
  validation.resendOtp,
  SuperAdminController.resendOtp
);
router.post(
  "/change_password",
  validation.changePass,
  SuperAdminController.changePassword
);
router.post(
  "/update_password",
  validation.updatePass,
  SuperAdminController.updatePassword
);

router.post(
  "/create_vendor",
  verifyJwtAdmin,
  upload.single("image"),
  checkPermission,
  validation.vendorCreate,
  SuperAdminController.createVendor
);
router.post(
  "/vendor-database/:id?",
  verifyJwtAdmin,
  validation.addVendorDatabase,
  SuperAdminController.addVendorDatabase
);
router.put(
  "/update_vendor/:id?",
  verifyJwtAdmin,
  upload.single("image"),
  checkPermission,
  SuperAdminController.updateVendor
);

router.get(
  "/vendor_list/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.vendorList
);

router.post(
  "/create_role",
  verifyJwtAdmin,
  checkPermission,
  validation.addRole,
  SuperAdminController.createRole
);

router.put(
  "/update_role/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.updateRole
);

router.get(
  "/role_list/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.roleList
);

router.post(
  "/vendor_status",
  verifyJwtAdmin,
  checkPermission,
  // validation.updateRoleStatus,
  SuperAdminController.updateVendorStatus
);

router.post(
  "/create_brand",
  verifyJwtAdmin,
  upload.single("image"),
  checkPermission,
  validation.addBrand,
  SuperAdminController.createBrand
);

router.get(
  "/brand_list/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.brandList
);

router.post(
  "/status_brand",
  verifyJwtAdmin,
  checkPermission,
  validation.updateRoleStatus,
  SuperAdminController.updateBrandStatus
);

router.put(
  "/update_brand/:id?",
  verifyJwtAdmin,
  upload.single("image"),
  checkPermission,
  SuperAdminController.updateBrand
);

router.post(
  "/create_permission",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.createPermission
);

router.post(
  "/vendor-panel-signin",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.venderPanelSignin
);
router.post(
  "/admin-panel-signin",
  verifyJwtAdmin,
  // checkPermission,
  SuperAdminController.adminPanelSignin
);


// location 
router.post(
  "/create-location",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.createLocation
);

router.get(
  "/location-list/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.locationList
);

router.put(
  "/update-location/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.updateLocation
);

router.delete(
  "/delete-location/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.deleteLocation
);

router.get(
  "/user-list/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.userList
);

router.get(
  "/user-vendorwise/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.userVendorWise
);

router.put(
  "/update-user/:id?",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.updateUser
);

router.get(
  "/admin-logs",
  verifyJwtAdmin,
  SuperAdminController.adminLogs
);

router.get(
  "/user-fields",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.userFields
);
router.put(
  "/user-fields/:id",
  verifyJwtAdmin,
  checkPermission,
  validation.userFields,
  SuperAdminController.updateVendorUserFields
);

router.get(
  "/risk-limits/:id",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.riskLimits
);
router.put(
  "/update-risk-limit/:id",
  verifyJwtAdmin,
  checkPermission,
  SuperAdminController.updateRiskLimit
);



// ========================================================================================
// domain whitelist
// ========================================================================================
router.route("/whitelist/:id?")
  .all(verifyJwtAdmin)
  .get(SuperAdminController.whiteList)
  .post(SuperAdminController.addWhiteList)
  .delete(SuperAdminController.deleteWhiteList);



export default router;
