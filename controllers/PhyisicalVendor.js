import PhysicalVendor from "../models/PhysicalVendor.js";
import { extractRequestData } from "../helpers/static/request-response.js";
import { validationResult } from "express-validator";
import addLog from "../helpers/project/addLogs.js";

class PhysicalVendorController {
  static async profile(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.profile(reqData);
    return res.status(response.code).send(response);
  }

  static async categoryList(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.categoryList(reqData);
    return res.status(response.code).send(response);
  }

  static async addCategory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.addCategory(reqData);
    return res.status(response.code).send(response);
  }

  static async updateCategory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.updateCategory(reqData);
    return res.status(response.code).send(response);
  }

  static async deleteCategory(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.deleteCategory(reqData);
    return res.status(response.code).send(response);
  }

  static async vendorList(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.vendorList(reqData);
    return res.status(response.code).send(response);
  }

  static async addVendor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.addVendor(reqData);
    return res.status(response.code).send(response);
  }

  static async updateVendor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.updateVendor(reqData);
    return res.status(response.code).send(response);
  }

  static async addPhysicalGood(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.addPhysicalGood(reqData);
    addLog(req, response, "New Physical Good");
    return res.status(response.code).json(response);
  }

  static async physicalGoodList(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.physicalGoodList(reqData);
    return res.status(response.code).json(response);
  }

  static async updatePhysicalGood(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.updatePhysicalGood(reqData);
    addLog(req, response, "Edit Physical Good");
    return res.status(response.code).json(response);
  }

  static async bulkUploadPhysicalGoods(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.bulkUploadPhysicalGoods(reqData);
    addLog(req, response, "Add Bulk Physical Good");
    return res.status(response.code).json(response);
  }

  static async pgVendorOrderList(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.pgVendorOrderList(reqData);
    return res.status(response.code).json(response);
  }

  static async createpgVendorOrder(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.createpgVendorOrder(reqData);
    return res.status(response.code).json(response);
  }

  static async updatePGVendorOrder(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.updatePGVendorOrder(reqData);
    return res.status(response.code).json(response);
  }

  static async orderConfirmation(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.orderConfirmation(reqData);
    return res.status(response.code).json(response);
  }

  static async trackingStatusUpdate(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.trackingStatusUpdate(reqData);
    return res.status(response.code).json(response);
  }

  static async removeDoumentImage(req, res) {
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.removeImages(reqData);
    return res.status(response.code).json(response);
  }

  static async bulkUploadCategory(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.bulkAddCategories(reqData);
    return res.status(response.code).send(response);
  }

  static async deleteMultipleCategories(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await PhysicalVendor.deleteMultipleCategory(reqData);
    return res.status(response.code).send(response);
  }

}

export default PhysicalVendorController;
