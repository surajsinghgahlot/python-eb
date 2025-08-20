import VendorThirdParty_m from "../models/VendorThirdParty.js";
import VendorModel from "../models/Vendor.js";
import { extractRequestData } from "../helpers/static/request-response.js";
import { validationResult } from "express-validator";

class VendorThirdParty {

  static async adminList(req, res) {
    const reqData = extractRequestData(req);
    const response = await VendorThirdParty_m.adminList(reqData);
    return res.status(response.code).send(response);
  }
  static async locationList(req, res) {
    const reqData = extractRequestData(req);
    const response = await VendorThirdParty_m.locationList(reqData);
    return res.status(response.code).send(response);
  }

  static async checkUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorThirdParty_m.checkUser(reqData);
    return res.status(response.code).send(response);
  }

  static async checkAndRegisterUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorThirdParty_m.checkAndRegisterUser(reqData);
    return res.status(response.code).send(response);
  }

  static async checkAndUpdateUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorThirdParty_m.checkAndUpdateUser(reqData);
    return res.status(response.code).send(response);
  }


}

export default VendorThirdParty;
