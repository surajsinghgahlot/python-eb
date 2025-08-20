import { Types } from "mongoose";
import { generateCustomerId, prependMatch } from "../helpers/project/custom.js";
import Response from "../helpers/Response.js";
import { User, Admin, Location } from "../schema/index.js";

class VendorThirdParty {

  static adminList = async (reqData) => {
    let response;
    try {
      let condition = [
        ...prependMatch("status", "ACTIVE" ),
        {
          $project: {
            _id: 1,
            first_name : 1,
            last_name : 1,
          }
        }
      ];

      if (reqData.id) {
        condition.push(...prependMatch("_id", new Types.ObjectId(reqData.id)));
        let admin = await Admin.aggregate(condition);
        response = new Response(200, "T", admin).custom("Data fetched...");
      } else {
        condition.unshift(...prependMatch("user_type", "ADMIN"));

        let adminList = await Admin.aggregate(condition);
        response = new Response(200, "T", adminList).custom("Data fetched...");
      }
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static locationList = async (reqData) => {
    let response;
    try {
      let condition = [
        ...prependMatch("status", "ACTIVE" ),
        {
          $project: {
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            pin_code: 1,
          },
        },
      ];

      let data = await Location.aggregate(condition);
      response = new Response(200, "T", data).custom(
        "Location fetched successfully"
      );
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static checkUser = async (reqData) => {
    let response;
    try {
      if (!reqData.mobile_number) {
        response = new Response(404, "F").custom("Please provide Mobile number");
      }else{
        const findUser = await User.findOne({ mobile_number: reqData.mobile_number  });
        if(findUser){
          if(findUser.status==="ACTIVE"){
            response = new Response(200, "T").custom("User already Registered");
          }else{
            response = new Response(409, "F").custom("User Blocked");
          }
        }else{
          response = new Response(404, "F").custom("User not registered");
        }
      }
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static checkAndRegisterUser = async (reqData) => {
    let response;
    try{
      const { mobile_number, vendor_id } = reqData
      console.log(reqData,"reqDatareqDatareqDatareqData")
      const where = { mobile_number: mobile_number }
      const checkUser = await this.checkUser(where)
      if(checkUser.status){
        const vendorWhere = { ...where,vendors: { $elemMatch: { $eq: vendor_id } } }
        const findUsr =  await User.findOne(vendorWhere)
        if(findUsr){
          response = new Response(409, "F").custom("Already Registered");
        }else{          
          const updatedUser = await User.findOneAndUpdate(where, { $push : { vendors: vendor_id } })
          response = new Response(200, "T", updatedUser).custom("User Updated");
        }
      }else{
        if(checkUser.code===409){
          response = new Response(409, "F").custom("User Blocked");
        }else{
          let payload = {
            ...reqData,
            vendors : [ vendor_id ],
          }
          const newUser = await User.create(payload)
          response = new Response(200, "T", newUser).custom("User Registered");
        }
      }

    }catch (err){
      console.log(err,'errerr ')
      response = new Response().custom(err.message);
    }
    return response
  }

  static checkAndUpdateUser = async (reqData) => {
    let response;
    try{
      const { mobile_number, vendor_id } = reqData
      const where = { mobile_number: mobile_number }
      const checkUser = await this.checkUser(where)
      if(checkUser.status){
        const vendorWhere = { ...where,vendors: { $elemMatch: { $eq: vendor_id } } }
        const findVendor =  await User.findOne(vendorWhere)
        if(findVendor){
          response = new Response(409, "F").custom("Already Registered");
        }else{          
          await User.updateOne(where, reqData)
          response = new Response(200, "T").custom("User Updated");
        }
      }else{
        if(checkUser.code===409){
          response = new Response(409, "F").custom("User Blocked");
        }else{
          response = new Response(404, "F").custom("User not found");
        }
      }

    }catch (err){
      console.log(err,'errerr ')
      response = new Response().custom(err.message);
    }
    return response 
  }

}

export default VendorThirdParty;