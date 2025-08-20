import {
  UserFields,
  Vendor,
  Brand,
  RiskLimit,
  VendorDatabase,
} from "../schema/index.js";
import Response from "../helpers/Response.js";
import bcrypt from "bcryptjs";
import {
  customLookupWithUnwind,
  paginationHelper,
  prependMatch,
} from "../helpers/project/custom.js";
import { Types } from "mongoose";
import {
  connectToDatabaseAndGetCollection,
  createVendorDatabase,
} from "../config/connectDB.js";
import {
  uploadToS3Image,
  deleteFromS3Image,
} from "../helpers/third-party/awsConfig.js";
import { encryptData } from "../helpers/project/enryptDecrypt.js";

class VendorModel {
  static createVendor = async (reqData) => {
    let response;
    try {
      let { email, password, mobile, role, brand } = reqData;
      let findVendor = await Vendor.findOne({
        $or: [{ mobile: reqData.mobile }, { email: reqData.email }],
      });
      let findBrand = await Brand.findOne({ _id: new Types.ObjectId(brand) });

      if (
        findVendor &&
        findVendor.mobile === mobile &&
        findVendor.email === email
      ) {
        response = new Response(409, "F").custom(
          "Email Id and Mobile already exists"
        );
      } else if (findVendor && findVendor.mobile === mobile) {
        response = new Response(409, "F").custom(
          "Mobile number already exists"
        );
      } else if (findVendor && findVendor.email === email) {
        response = new Response(409, "F").custom("Email Id is already in use");
      } else if (!findBrand) {
        response = new Response(409, "F").custom("Invalid Brand");
      } else {
        const encryptedPassword = await bcrypt.hash(password, 10);

        let payload = {
          ...reqData,
          redemption_type: JSON.parse(reqData.redemption_type),
          status: "INACTIVE",
          password: encryptedPassword,
          created_at: new Date(),
          added_by: reqData.authData._id,
        };

        if (reqData.file) {
          let imageUrl = await uploadToS3Image({
            file: reqData?.file,
            platform: "admin",
            folder: "vendor",
          });
          let imageUrl1 = await uploadToS3Image({
            file: reqData?.file,
            platform: "vendor",
            folder: "vendor",
            brand: brand,
          });
          payload.image = imageUrl;
        }
        payload._id = new Types.ObjectId();
        // const vendorCollection = await createVendorDatabase(payload);
        // if (vendorCollection) {
        let newUser = await Vendor.create(payload);
        await RiskLimit.create({
          vendor_id: newUser._id,
          added_by: reqData.authData._id,
        });
        response = new Response(200, "T").custom("Vendor created");
        // }else{
        //   response = new Response(409, "F").custom("Failed to Connect Vendor");
        // }
      }
    } catch (error) {
      console.log(error, "error vendor add");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static vendorList = async (reqData) => {
    let response;
    try {
      let condition = [
        ...customLookupWithUnwind("brands", "brand", "_id", "brand", true),
        {
          $sort: {
            _id: -1,
          },
        },
        ...customLookupWithUnwind("admins", "added_by", "_id", "admin", true),
        {
          $addFields: {
            "added_by.id": "$added_by",
            "added_by.name": {
              $concat: ["$admin.first_name", " ", "$admin.last_name"],
            },
          },
        },
        {
          $unwind: {
            path: "$physical_vendors",
            preserveNullAndEmptyArrays: true,
          },
        },
        ...customLookupWithUnwind(
          "physical-goods-vendors",
          "physical_vendors",
          "_id",
          "pgVendor",
          true
        ),
        {
          $addFields: {
            "pgVendor.id": "$pgVendor._id",
            "pgVendor.first_name": "$pgVendor.first_name",
            "pgVendor.last_name": "$pgVendor.last_name",
          },
        },
        {
          $group: {
            _id: "$_id",
            physical_vendors: {
              $push: {
                $cond: [
                  { $gt: [ { $size: { $objectToArray: "$pgVendor" } }, 0 ] },
                  "$pgVendor",
                  "$$REMOVE"
                ]
              }
            },
            brand: {
              $first: {
                name: "$brand.name",
                id: "$brand._id",
                image: "$brand.image",
              },
            },
            title: { $first: "$title" },
            first_name: { $first: "$first_name" },
            last_name: { $first: "$last_name" },
            vender_business_type: { $first: "$vender_business_type" },
            gst_number: { $first: "$gst_number" },
            pan_tan_number: { $first: "$pan_tan_number" },
            uan_number: { $first: "$uan_number" },
            image: { $first: "$image" },
            email: { $first: "$email" },
            address: { $first: "$address" },
            city: { $first: "$city" },
            country: { $first: "$country" },
            value_type: { $first: "$value_type" },
            coupon_limit: { $first: "$coupon_limit" },
            state: { $first: "$state" },
            pincode: { $first: "$pincode" },
            zone: { $first: "$zone" },
            mobile: { $first: "$mobile" },
            status: { $first: "$status" },
            user_name: { $first: "$user_name" },
            instance_name: { $first: "$instance_name" },
            kyc_on_registration: { $first: "$kyc_on_registration" },
            approval_on_registration: { $first: "$approval_on_registration" },
            allow_tds_deduction: { $first: "$allow_tds_deduction" },
            loyalty_program_name: { $first: "$loyalty_program_name" },
            program_otp_validity: { $first: "$program_otp_validity" },
            user_fields: { $first: "$user_fields" },
            created_at: { $first: "$created_at" },
            updated_at: { $first: "$updated_at" },
            added_by: { $first: "$added_by" },
            redemption_type: { $first: "$redemption_type" },
          },
        },
       
        // {
        //   $project: {
        //     title : 1,
        //     first_name : 1,
        //     last_name : 1,
        //     vender_business_type : 1,
        //     gst_number : 1,
        //     pan_tan_number : 1,
        //     uan_number : 1,
        //     image : 1,
        //     email : 1,
        //     address : 1,
        //     city : 1,
        //     country : 1,
        //     value_type : 1,
        //     coupon_limit : 1,
        //     state : 1,
        //     pincode : 1,
        //     zone : 1,
        //     mobile : 1,
        //     status : 1,
        //     user_name : 1,
        //     brand : { name: '$brand.name', id: '$brand._id', image : "$brand.image" },
        //     instance_name : 1,
        //     kyc_on_registration : 1,
        //     approval_on_registration : 1,
        //     allow_tds_deduction : 1,
        //     loyalty_program_name : 1,
        //     program_otp_validity : 1,
        //     user_fields : 1,
        //     created_at : 1,
        //     updated_at : 1,
        //     added_by : 1,
        //     redemption_type : 1,
        //     physical_vendors : 1,
        //   }
        // }
      ];

      if (reqData.id) {
        condition.push({
          $match: {
            _id: new Types.ObjectId(reqData.id),
          },
        });
        let vendor = await Vendor.aggregate(condition);
        response = new Response(200, "T", vendor[0]).custom("Data fetched...");
      } else {
        if (reqData.status) {
          condition.push(...prependMatch("status", reqData.status));
        }
        if (reqData.search) {
          condition.push({
            $match: {
              $or: [
                {
                  first_name: new RegExp(reqData.search, "i"),
                },
                {
                  last_name: new RegExp(reqData.search, "i"),
                },
                {
                  loyalty_program_name: new RegExp(reqData.search, "i"),
                },
                {
                  "brand.name": new RegExp(reqData.search, "i"),
                },
              ],
            },
          });
        }
        let pagination = paginationHelper(reqData?.limit, reqData?.page);
        let adminCount = await Vendor.aggregate(condition);

        pagination.totalRecord = adminCount.length;

        condition.push({
          $skip: pagination.skip,
        });

        condition.push({
          $limit: pagination.limit,
        });

        let vendorList = await Vendor.aggregate(condition);
        response = new Response(200, "T", vendorList).custom("Data fetched...");
        response.pagination = pagination;
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateVendorStatus = async (reqData) => {
    let response;
    try {
      let findVendor = await Vendor.findById(reqData.id);
      console.log(findVendor, "findVendor");

      if (!findVendor) {
        response = new Response(404, "F").custom("Vendor Not Found");
      } else {
        if (findVendor?.database_id) {
          console.log("this is vendor database id");

          let updateStatus = await Vendor.findByIdAndUpdate(
            reqData.id,
            { status: reqData.status },
            { new: true }
          );

          let VendorCollection = await connectToDatabaseAndGetCollection(
            findVendor._id,
            "admins"
          );

          if (VendorCollection) {
            await VendorCollection.updateOne(
              { _id: findVendor._id, user_type: "SUPERADMIN" },
              { status: reqData.status }
            );
          } else {
            const findBrand = await Brand.findOne({ _id: findVendor.brand });
            let VendorCollectionBrand = await connectToDatabaseAndGetCollection(
              findVendor._id,
              "brands"
            );
            await VendorCollectionBrand.create(findBrand);
            let newVendor = await VendorCollection.create({
              ...updateStatus,
              user_type: "SUPERADMIN",
            });
            console.log(newVendor, "newVendor");
          }

          response = new Response(200, "T", updateStatus).custom(
            `Status updated to ${reqData.status}`
          );
        } else {
          response = new Response(409, "F").custom(
            "Vendor Server Is Not Ready"
          );
        }
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateVendor = async (reqData) => {
    let response;
    try {
      let findVendorC = await Vendor.findById(reqData.id);

      if (!findVendorC) {
        response = new Response(404, "F").custom("Vendor Not Found");
      } else {
        const payload = {
          title: reqData.title,
          first_name: reqData.first_name,
          last_name: reqData.last_name,
          vender_business_type: reqData.vender_business_type,
          address: reqData.address,
          city: reqData.city,
          country: reqData.country,
          state: reqData.state,
          pincode: reqData.pincode,
          zone: reqData.zone,
          coupon_limit: reqData.coupon_limit,
          loyalty_program_name: reqData.loyalty_program_name,
          updated_at: new Date(),
        };
        if (reqData?.redemption_type)
          payload.redemption_type = JSON.parse(reqData.redemption_type);
        if (reqData?.physical_vendors)
          payload.physical_vendors = JSON.parse(reqData.physical_vendors);
        let payload1 = { ...payload };
        if (reqData.file) {
          await deleteFromS3Image(findVendorC.image);
          let imageUrl = await uploadToS3Image({
            file: reqData?.file,
            platform: "admin",
            folder: "vendor",
          });
          payload.image = imageUrl;
        }

        let findVendor = await Vendor.findOne({
          _id: new Types.ObjectId(reqData.id),
          status: "ACTIVE",
        }).lean();
        if (findVendor) {
          let VendorCollection = await connectToDatabaseAndGetCollection(
            findVendor._id,
            "admins"
          );
          if (reqData.file) {
            let findBrand = await Brand.findById(findVendor.brand);
            const findVendorServer = await VendorCollection.findById(
              findVendor._id
            );
            await deleteFromS3Image(findVendorServer.image);
            let imageUrl1 = await uploadToS3Image({
              file: reqData?.file,
              platform: "vendor",
              folder: "vendor",
              brand: findBrand.name,
            });
            payload1.image = imageUrl1;
          }
          await VendorCollection.updateOne(
            { _id: new Types.ObjectId(reqData.id) },
            payload1
          );
        }

        await Vendor.updateOne(
          { _id: new Types.ObjectId(reqData.id) },
          payload
        );

        // await RiskLimit.create({ vendor_id : reqData.id, added_by : reqData.authData._id });
        response = new Response(200, "T").custom(`Vendor Updated Successfully`);
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async userFields(reqData) {
    let response;
    try {
      const findUserFields = await UserFields.find();
      response = new Response(200, "T", findUserFields).custom(
        "User fields fetched successfully"
      );
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr user fields");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async updateVendorUserFields(reqData) {
    let response;
    try {
      const query = {
        _id: { $in: reqData.field_keys },
        required: true,
      };
      const findUserFields = await UserFields.find(query);
      if (findUserFields && findUserFields.length > 0) {
        response = new Response(409, "F").custom("Invalid Fields");
      } else {
        const where = { _id: new Types.ObjectId(reqData.id) };
        const findVendor = await Vendor.findOne(where);

        if (findVendor) {
          if (findVendor?.user_fields && findVendor.user_fields.length > 0) {
            response = new Response(409, "F").custom(
              "User fields already added"
            );
          } else {
            await Vendor.updateOne(where, {
              $set: { user_fields: reqData.field_keys },
            });
            let VendorCollection = await connectToDatabaseAndGetCollection(
              findVendor._id,
              "user-registration-fields"
            );
            const findAlreadyAdded = await VendorCollection.find();
            if (findAlreadyAdded && findAlreadyAdded.length > 0) {
              response = new Response(409, "F").custom(
                "User fields already added"
              );
            } else {
              const query1 = {
                $or: [{ _id: { $in: reqData.field_keys } }, { required: true }],
              };
              const findUserFields1 = await UserFields.find(query1);
              await VendorCollection.insertMany(findUserFields1);
              response = new Response(200, "T").custom(
                "User fields updated successfully"
              );
            }
          }
        } else {
          response = new Response(404, "F").custom("Vendor not found");
        }
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr update vendor user fields");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async riskLimits(reqData) {
    let response;
    try {
      const params = { vendor_id: new Types.ObjectId(reqData.id) };
      const findData = await RiskLimit.findOne(params);
      if (findData) {
        response = new Response(200, "T", findData).custom(
          "Risk limit fetched successfully"
        );
      } else {
        response = new Response(404, "F").custom("Risk limit not found");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr risk limit");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async updateRiskLimit(reqData) {
    let response;
    try {
      const findData = await RiskLimit.findById(reqData.id);
      if (findData) {
        const updatedData = await RiskLimit.findByIdAndUpdate(
          reqData.id,
          reqData.data,
          { new: true }
        );

        const findVendor = await Vendor.findOne({
          user_type: "SUPERADMIN",
        }).lean();
        let VendorCollection = await connectToDatabaseAndGetCollection(
          findVendor._id,
          "risk-limits"
        );
        await VendorCollection.findOneAndUpdate({}, reqData.data);

        response = new Response(200, "T", updatedData).custom(
          "Risk limit updated successfully"
        );
      } else {
        response = new Response(404, "F").custom("Risk limit not found");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr risk limit");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async addVendorDatabase(reqData) {
    let response;
    const { name, host, port, user_name, password } = reqData;
    try {
      const where = { _id: reqData.id };
      const findVendor = await Vendor.findOne(where);
      if (findVendor) {
        const findDatabase = await VendorDatabase.findOne({
          $or: [{ user_name: user_name }, { name: name }, { host: host }],
        });
        if (findDatabase || findVendor?.database_id) {
          response = new Response(409, "T").custom("Already Added");
        } else {
          const payload = {
            name: name,
            host: host,
            port: port,
            user_name: user_name,
            password: encryptData(password),
          };
          const newDatabase = await VendorDatabase.create(payload);
          await Vendor.updateOne(where, { database_id: newDatabase });
          response = new Response(200, "T").custom(
            "Vendor Database added successfully"
          );
        }
      } else {
        response = new Response(404, "F").custom("Vendor not found");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr vendor database");
      response = new Response().custom(error.message);
    }
    return response;
  }
}

export default VendorModel;
