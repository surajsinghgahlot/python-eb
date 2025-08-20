import VendorThirdPartyController from "../controllers/VendorThirdParty.js";
import PhysicalVendorController from "../controllers/PhyisicalVendor.js";
import express from "express";
import { verifyJwtVendor } from "../helpers/Auth.js";
import validation from "../helpers/middleware/validation.js";

let router = express.Router();

router.get("/admin_names",
   verifyJwtVendor,
    VendorThirdPartyController.adminList);

router.get(
  "/location-list/:id?",
  verifyJwtVendor,
  VendorThirdPartyController.locationList
);

router.get(
  "/check-user",
  VendorThirdPartyController.checkUser
);

router.post(
  "/register-user",
  VendorThirdPartyController.checkAndRegisterUser
);

router.post(
  "/update-user",
  VendorThirdPartyController.checkAndUpdateUser
);

router.get(
  "/physical-goods/:id?",
  verifyJwtVendor,
  PhysicalVendorController.physicalGoodList
);

router.get(
  "/pg-vendor-orders/:id?",
  verifyJwtVendor,
  PhysicalVendorController.pgVendorOrderList
);

router.post(
  "/pg-vendor-orders/create",
  verifyJwtVendor,
  validation.createPGVendorOrder,
  PhysicalVendorController.createpgVendorOrder
);

export default router;
