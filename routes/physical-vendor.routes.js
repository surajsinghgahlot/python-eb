import PhyisicalVendorController from "../controllers/PhyisicalVendor.js";
import express from "express";
import validation from "../helpers/middleware/validation.js";
import { verifyJwtAdmin, verifyJwtPV } from "../helpers/Auth.js";
import { upload, uploadExcel } from "../helpers/third-party/multipart.js";

let router = express.Router();

router.get("/profile", verifyJwtPV, PhyisicalVendorController.profile);

router
  .route("/category/:id?")
  .all(verifyJwtPV)
  .get(PhyisicalVendorController.categoryList)
  .post(PhyisicalVendorController.addCategory)
  .put(PhyisicalVendorController.updateCategory);

router.get(
  "/category/:id?",
  verifyJwtAdmin,
  PhyisicalVendorController.deleteCategory
);

router
  .route("/vendors/:id?")
  .all(verifyJwtAdmin)
  .get(PhyisicalVendorController.vendorList)
  .post(PhyisicalVendorController.addVendor)
  .put(PhyisicalVendorController.updateVendor);

router
  .route("/physical-goods/:id?")
  .all(verifyJwtPV)
  .get(PhyisicalVendorController.physicalGoodList)
  .post(
    validation.addPhysicalGoodVendor,
    upload.array("images"),
    PhyisicalVendorController.addPhysicalGood
  )
  .put(upload.array("images"), PhyisicalVendorController.updatePhysicalGood);

router.post(
  "/physical-goods-bulk-upload",
  verifyJwtPV,
  uploadExcel.single("image"),
  PhyisicalVendorController.bulkUploadPhysicalGoods
);

router.get(
  "/pg-vendor-orders/:id?",
  verifyJwtPV,
  PhyisicalVendorController.pgVendorOrderList
);

router.put(
  "/pg-vendor-orders/update/:id?",
  verifyJwtPV,
  upload.array("documents"),
  PhyisicalVendorController.updatePGVendorOrder
);

router.put(
  "/pg-vendor-orders/confirmation/:id?",
  verifyJwtPV,
  PhyisicalVendorController.orderConfirmation
);

router.put(
  "/pg-vendor-orders/tracking_status/:id?",
  verifyJwtPV,
  upload.array("image"),
  PhyisicalVendorController.trackingStatusUpdate
);

router.put(
  "/pg-vendor-orders/image/remove/:id?",
  verifyJwtPV,
  PhyisicalVendorController.removeDoumentImage
);

router.post(
  "/bulk_upload",
  verifyJwtAdmin,
  PhyisicalVendorController.bulkUploadCategory
);

router.delete(
  "/delete_multiple",
  // verifyJwtAdmin,
  PhyisicalVendorController.deleteMultipleCategories
);


export default router;
