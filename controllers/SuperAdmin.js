import SuperAdminModel from "../models/SuperAdmin.js";
import VendorModel from "../models/Vendor.js";
import UserModel from "../models/User.js";
import { extractRequestData } from "../helpers/static/request-response.js";
import { validationResult } from "express-validator";
import addLog from "../helpers/project/addLogs.js";
import VendorThirdParty from "../models/VendorThirdParty.js";
 
class SuperAdminController {
  static async signin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.signIn(reqData);
    if(response.status){
      res.cookie('refreshToken', response.data.refreshToken , { httpOnly: true });
    }
    addLog(req, response, 'Logged in')
    return res.status(response.code).send(response);
  }

  static async adminPanelSignin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.adminPanelSignin(reqData);
    if(response.status){
      res.cookie('refreshToken', response.data.refreshToken , { httpOnly: true });
    }
    addLog(req, response, 'Shift to admin panel')
    return res.status(response.code).send(response);
  }
  static async venderPanelSignin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.venderPanelSignin(reqData);
    if(response?.status){
      res.cookie('refreshToken', response.data.refreshToken , { httpOnly: true });
    }
    addLog(req, response, 'Shift to vendor panel')
    return res.status(response.code).send(response);
  }

  static async createAdmin(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.createAdmin(reqData);
    addLog(req, response, 'Added sub admin')
    return res.status(response.code).send(response);
  }

  static async adminList(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.adminList(reqData);
    // addLog(req, response, 'Admin list')
    return res.status(response.code).send(response);
  }
  static async profile(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.profile(reqData);
    return res.status(response.code).send(response); 
  }

  static async permissionList(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.permissionList(reqData);
    return res.status(response.code).send(response);
  }

  static async editProfile(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.editProfile(reqData);
    addLog(req, response, 'Profile Updated')
    return res.status(response.code).send(response);
  }

  static async verificationOtp(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.verifyOTP(reqData);
    return res.status(response.code).send(response);
  }

  static async forgotPassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.forgotPassword(reqData);
    return res.status(response.code).send(response);
  }

  static async resendOtp(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.resendOtp(reqData);
    return res.status(response.code).send(response);
  }

  static async changePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.changePassword(reqData);
    return res.status(response.code).send(response);
  }

  static async updatePassword(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.updatePassword(reqData);
    return res.status(response.code).send(response);
  }

  static async createVendor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.createVendor(reqData);
    addLog(req, response, 'Created vendor')
    return res.status(response.code).send(response);
  }

  static async updateVendor(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.updateVendor(reqData);
    addLog(req, response, 'Updated vendor')
    return res.status(response.code).send(response);
  }

  static async vendorList(req, res) {
    const reqData = extractRequestData(req);
    const response = await VendorModel.vendorList(reqData);
    // addLog(req, response, 'Vendor list')
    return res.status(response.code).send(response);
  }

  static async createRole(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.createRole(reqData);
    addLog(req, response, 'Create role')
    return res.status(response.code).send(response);
  }

  static async updateRole(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.updateRole(reqData);
    addLog(req, response, 'Updated role')
    return res.status(response.code).send(response);
  }

  static async roleList(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.roleList(reqData);
    // addLog(req, response, 'Role list')
    return res.status(response.code).send(response);
  }

  static async updateVendorStatus(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.updateVendorStatus(reqData);
    addLog(req, response, 'Updated Vendor Status')
    return res.status(response.code).send(response);
  }

  static async createBrand(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.createBrand(reqData);
    addLog(req, response, 'Created brand')
    return res.status(response.code).send(response);
  }

  static async brandList(req, res) {
    // console.log('reqreqreqreq',req,'reqreqreqreq')
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.brandList(reqData);
    // addLog(req, response, 'Brand List')
    return res.status(response.code).send(response);
  }

  static async updateBrand(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.updateBrand(reqData);
    addLog(req, response, 'Updated brand')
    return res.status(response.code).send(response);
  }

  static async updateBrandStatus(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.updateBrandStatus(reqData);
    addLog(req, response, 'Updated brand status')
    return res.status(response.code).send(response);
  }

  static async createPermission(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.createPermission(reqData);
    return res.status(response.code).send(response);
  }



  // location 
  static async locationList(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.locationList(reqData);
    // addLog(req, response, 'Location list')
    return res.status(response.code).send(response);
  }
  static async adminLogs(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.adminLogs(reqData);
    return res.status(response.code).send(response);
  }

  static async createLocation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.createLocation(reqData);
    addLog(req, response, 'Created location')
    return res.status(response.code).send(response);
  }
  static async updateLocation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.updateLocation(reqData);
    addLog(req, response, 'Updated location')
    return res.status(response.code).send(response);
  }
  static async deleteLocation(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.deleteLocation(reqData);
    addLog(req, response, 'Deleted location')
    return res.status(response.code).send(response);
  }


  // user list 
  static async userList(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await UserModel.userList(reqData);
    // addLog(req, response, 'User list')
    return res.status(response.code).send(response);
  }
  
  static async updateUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await UserModel.updateUser(reqData);
    addLog(req, response, 'Updated User')
    return res.status(response.code).send(response);
  }

  static async userVendorWise(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await UserModel.userVendorWise(reqData);
    // addLog(req, response, 'Register User')
    return res.status(response.code).send(response);
  }

  static async adminLogs(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.adminLogs(reqData);
    return res.status(response.code).send(response);
  }
  static async userFields(req, res) {
    const reqData = extractRequestData(req);
    const response = await VendorModel.userFields(reqData);
    return res.status(response.code).send(response);
  }
  static async updateVendorUserFields(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.updateVendorUserFields(reqData);
    addLog(req, response, "Update vendor's user registration fields")
    return res.status(response.code).send(response);
  }

  static async riskLimits(req, res) {
    const reqData = extractRequestData(req);
    const response = await VendorModel.riskLimits(reqData);
    return res.status(response.code).send(response);
  }
  static async updateRiskLimit(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.updateRiskLimit(reqData);
    addLog(req, response, "Update vendor's risk limits")
    return res.status(response.code).send(response);
  }
  static async dashboard(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.dashboard(reqData);
    return res.status(response.code).send(response);
  }



  // white list 
  static async whiteList(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.whiteList(reqData);
    return res.status(response.code).send(response);
  }
  static async addWhiteList(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.addWhiteList(reqData);
    return res.status(response.code).send(response);
  }
  static async deleteWhiteList(req, res) {
    const reqData = extractRequestData(req);
    const response = await SuperAdminModel.deleteWhiteList(reqData);
    return res.status(response.code).send(response);
  }
  
  static async addVendorDatabase(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
    const reqData = extractRequestData(req);
    const response = await VendorModel.addVendorDatabase(reqData);
    addLog(req, response, "Added Vendor Database")
    return res.status(response.code).send(response);
  }


}

export default SuperAdminController;
