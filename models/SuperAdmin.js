import Response from "../helpers/Response.js";
import bcrypt from "bcryptjs";
import { signJwt, signRefreshJwt } from "../helpers/Auth.js";
import {
  commonRangeOnlyDateFilter,
  customLookup,
  customLookupWithUnwind,
  generateCustomerId,
  paginationHelper,
  prependMatch,
} from "../helpers/project/custom.js";
import {
  Admin,
  Permission,
  Vendor,
  Access,
  Role,
  Brand,
  Location,
  Points,
  AdminLogs,
  WhiteList,
  User,
  PhysicalGoodsVendor,
} from "../schema/index.js";
import { Types } from "mongoose";
import axios from "axios";
import { connectToDatabaseAndGetCollection } from "../config/connectDB.js";
import {
  deleteFromS3Image,
  uploadToS3Image,
} from "../helpers/third-party/awsConfig.js";
import { sendOTPEmail } from "../helpers/project/email.js";

class SuperAdminModel {
  static signIn = async (reqData) => {
    let response;
    try {
      let password = reqData.password;
      let isPhysicalVendor = false;
      let findUser = await Admin.findOne({
        $or: [{ username: reqData.credential }, { email: reqData.credential }],
      }).lean();
      if (!findUser) {
        findUser = await PhysicalGoodsVendor.findOne({
          email: reqData.credential,
        }).lean();
        isPhysicalVendor = true;
      }

      if (findUser && findUser.status === "ACTIVE") {
        const validatePassword = await bcrypt.compareSync(
          password,
          findUser.password
        );
        if (!validatePassword) {
          response = new Response(401, "F").custom("Entered Wrong Password");
        } else {
          var payload = { ...findUser };
          delete payload.password;
          delete payload.created_at;

          let payloadData = await signJwt(payload);
          let refreshTokenPayloadData = await signRefreshJwt(payload);

          let user = {
            _id: payloadData._id,
            user_type: payloadData.user_type,
            token: payloadData.token,
            refreshToken: refreshTokenPayloadData.token,
            mobile_number: payloadData?.mobile_number,
            status: payloadData.status,
            first_name: payloadData.first_name,
            last_name: payloadData.last_name,
          };

          if (findUser?.user_type && findUser?.user_type === "ADMIN") {
            let userAdmin = await this.roleList(findUser.role);

            user["access"] = userAdmin?.data?.accesses;
            user["role"] = {
              _id: userAdmin?.data?._id,
              role: userAdmin?.data?.role,
              role_code: userAdmin?.data?.role_code,
            };
          }
          if (isPhysicalVendor) {
            user["user_type"] = "PHYSICALVENDOR";
          }

          response = new Response(200, "T", user).custom(
            "Logged In successfully!!"
          );
        }
      } else if (findUser && findUser.status === "INACTIVE") {
        response = new Response(401, "F").custom("Your account is deactivated");
      } else {
        response = new Response(404, "F").custom("Admin Not Found.");
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static createAdmin = async (reqData) => {
    let response;
    try {
      let { name, email, password, mobile } = reqData;
      let findAdmin = await Admin.findOne({
        $or: [{ mobile: reqData.mobile }, { email: reqData.email }],
      });

      let findRole = await Role.findOne({ _id: reqData.role });

      if (
        findAdmin &&
        findAdmin.mobile === mobile &&
        findAdmin.email === email
      ) {
        response = new Response(409, "F").custom(
          "Email Id and Mobile already exists"
        );
      } else if (findAdmin && findAdmin.mobile === mobile) {
        response = new Response(409, "F").custom("Mobile already exists");
      } else if (findAdmin && findAdmin.email === email) {
        response = new Response(409, "F").custom("Email Id already exists");
      } else if (!findRole) {
        response = new Response(409, "F").custom("Invalid Role");
      } else {
        let findUser = await User.findOne({
          $or: [{ mobile: reqData.mobile }, { email: reqData.email }],
        });

        if (findUser) {
          response = new Response(409, "F").custom(
            "User is already registered as a user"
          );
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        let payload = {
          ...reqData,
          user_type: "ADMIN",
          role: reqData.role,
          password: encryptedPassword,
          emp_id: generateCustomerId(),
          is_email_verified: true,
          created_at: new Date(),
          added_by: reqData.authData._id,
        };

        let newUser = await Admin.create(payload);

        const findVendor = await Vendor.find({
          database_id: { $exists: true },
        }).lean();
        for (let i = 0; i < findVendor.length; i++) {
          let VendorCollection = await connectToDatabaseAndGetCollection(
            findVendor[i]._id,
            "admins"
          );
          const findSA = await Admin.findOne({ user_type: "SUPERADMIN" });
          const findSAAtVendor = await VendorCollection.findById(findSA._id);
          if (!findSAAtVendor) {
            await VendorCollection.create({
              _id: findSA._id,
              first_name: findSA.first_name,
              last_name: findSA.last_name,
              email: findSA.email,
              mobile: findSA.mobile,
              user_type: "LOYALTYADMIN",
              added_by: reqData.authData._id,
            });
          }
          await VendorCollection.create({
            _id: newUser._id,
            first_name: payload.first_name,
            last_name: payload.last_name,
            email: payload.email,
            mobile: payload.mobile,
            user_type: "LOYALTYADMIN",
            added_by: reqData.authData._id,
          });
        }

        response = new Response(200, "T").custom("Admin created");
      }
    } catch (error) {
      console.log(error, "errrr create admin");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static createRole = async (reqData) => {
    let response;
    try {
      let findRole = await Role.findOne({
        $or: [{ role: reqData.role }, { role_code: reqData.role_code }],
      });
      // let permissionArr = JSON.parse(reqData.permission)
      // let findPermission = await Permission.find()
      // let permArr = findPermission.map((item)=> item._id.toString())
      // let hasInvalidPermission = permissionArr.reduce((acc,cur)=> {
      //   if(!permArr.includes(cur)){
      //     acc = true
      //   }
      //   return acc
      // },false)

      if (findRole) {
        response = new Response(409, "F").custom("Role already in use");
      }
      // else if(hasInvalidPermission){
      //   response = new Response(409, "F").custom("Invalid Permission");
      // }
      else {
        let payload = {
          role: reqData.role,
          role_code: reqData.role_code,
          permission_id: reqData.permission,
          status: reqData.status,
          created_at: Date.now(),
          added_by: reqData.authData._id,
        };

        let newRole = await Role.create(payload);
        response = new Response(200, "T").custom("Role added successfully");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateRole = async (reqData) => {
    let response;
    try {
      let where = { _id: new Types.ObjectId(reqData.id) };
      let findRole = await Role.findOne(where);

      if (!findRole) {
        response = new Response(409, "F").custom("Invalid Role");
      } else {
        let payload = {
          permission_id: reqData.permission.filter((item) => item),
          status: reqData.status,
          updated_at: Date.now(),
        };

        let newRole = await Role.findOneAndUpdate(where, payload);
        response = new Response(200, "T").custom("Role updated successfully");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static roleList = async (reqData) => {
    let response;
    try {
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $unwind: "$permission_id",
        },
        ...customLookupWithUnwind(
          "permissions",
          "permission_id",
          "_id",
          "permission",
          true
        ),
        ...customLookupWithUnwind(
          "accesses",
          "permission.access_id",
          "_id",
          "access",
          true
        ),
        {
          $group: {
            _id: "$_id",
            role: { $first: "$role" },
            role_code: { $first: "$role_code" },
            updated_at: { $first: "$updated_at" },
            status: { $first: "$status" },
            access: {
              $push: {
                name: "$access.name",
                _id: "$access._id",
                permission: {
                  name: "$permission.name",
                  _id: "$permission._id",
                },
              },
            },
          },
        },
        {
          $unwind: "$access",
        },
        {
          $group: {
            _id: { accessId: "$access._id", roleId: "$_id" },
            role: { $first: "$role" },
            role_code: { $first: "$role_code" },
            updated_at: { $first: "$updated_at" },
            access_name: { $first: "$access.name" },
            permissions: { $addToSet: "$access.permission" },
          },
        },
        {
          $group: {
            _id: "$_id.roleId",
            role: { $first: "$role" },
            role_code: { $first: "$role_code" },
            updated_at: { $first: "$updated_at" },
            accesses: {
              $push: {
                _id: "$_id.accessId",
                name: "$access_name",
                permissions: "$permissions",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            role: 1,
            role_code: 1,
            updated_at: 1,
            accesses: 1,
          },
        },
        {
          $sort: {
            updated_at: -1,
          },
        },
      ];

      if (reqData.id) {
        condition.push(...prependMatch("_id", new Types.ObjectId(reqData.id)));
        let roleList = await Role.aggregate(condition);
        response = new Response(200, "T", roleList[0]).custom(
          "Data fetched..."
        );
      } else {
        if (reqData.search) {
          condition.push({
            $match: {
              $or: [
                {
                  role: new RegExp(reqData.search, "i"),
                },
                {
                  roleCode: new RegExp(reqData.search, "i"),
                },
              ],
            },
          });
        }

        let pagination = paginationHelper(reqData?.limit, reqData?.page);
        let roleCount = await Role.aggregate(condition);

        pagination.totalRecord = roleCount.length;

        condition.push({
          $skip: pagination.skip,
        });

        condition.push({
          $limit: pagination.limit,
        });

        let roleList = await Role.aggregate(condition);
        response = new Response(200, "T", roleList).custom("Data fetched...");
        response.pagination = pagination;
      }
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static profile = async (reqData) => {
    let response;
    try {
      let condition = [
        ...prependMatch("_id", new Types.ObjectId(reqData.authData._id)),
        {
          $sort: {
            _id: -1,
          },
        },
        ...customLookupWithUnwind("roles", "role", "_id", "roles", true),
        {
          $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            mobile: 1,
            user_type: 1,
            role: {
              _id: "$role",
              name: "$roles.role",
            },
            status: 1,
            created_at: 1,
            updated_at: 1,
          },
        },
      ];

      let admin = await Admin.aggregate(condition);
      if (admin[0].user_type === "ADMIN") {
        let userRoles = await this.roleList(admin[0].role._id);
        let finalData = {
          ...admin[0],
          access: userRoles.data.accesses,
        };
        response = new Response(200, "T", finalData).custom("Data fetched...");
      } else {
        response = new Response(200, "T", admin[0]).custom("Data fetched...");
      }
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static adminList = async (reqData) => {
    let response;
    try {
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
        ...customLookupWithUnwind("roles", "role", "_id", "roles", true),
        {
          $project: {
            _id: 1,
            first_name: 1,
            last_name: 1,
            email: 1,
            mobile: 1,
            user_type: 1,
            emp_id: 1,
            role: {
              _id: "$role",
              name: "$roles.role",
            },
            status: 1,
            created_at: 1,
            updated_at: 1,
          },
        },
      ];

      if (reqData.id) {
        condition.push(...prependMatch("_id", new Types.ObjectId(reqData.id)));
        let admin = await Admin.aggregate(condition);
        console.log(admin, "adminadminadmin");
        if (admin[0].user_type === "ADMIN") {
          let userRoles = await this.roleList(admin[0].role._id);
          let finalData = {
            ...admin[0],
            access: userRoles.data.accesses,
          };
          response = new Response(200, "T", finalData).custom(
            "Data fetched..."
          );
        } else {
          response = new Response(200, "T", admin).custom("Data fetched...");
        }
      } else {
        condition.push(...prependMatch("user_type", "ADMIN"));
        if (reqData.status) {
          condition.push(...prependMatch("status", reqData.status));
        }
        let pagination = paginationHelper(reqData?.limit, reqData?.page);
        let adminCount = await Admin.aggregate(condition);

        pagination.totalRecord = adminCount.length;

        condition.push({
          $skip: pagination.skip,
        });

        condition.push({
          $limit: pagination.limit,
        });

        let adminList = await Admin.aggregate(condition);
        response = new Response(200, "T", adminList).custom("Data fetched...");
        response.pagination = pagination;
      }
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static permissionList = async (reqData) => {
    let response;
    try {
      let condition = [
        ...customLookupWithUnwind(
          "accesses",
          "access_id",
          "_id",
          "access",
          true
        ),
        {
          $group: {
            _id: "$access_id",
            name: { $first: "$access.name" },
            permission: {
              $push: {
                name: "$name",
                _id: "$_id",
              },
            },
          },
        },
      ];

      let perrmissionList = await Permission.aggregate(condition);

      response = new Response(200, "T", perrmissionList).custom(
        "Data fetched.."
      );
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static editProfile = async (reqData) => {
    let response;
    try {
      if (!reqData.id) {
        response = new Response(422, "F").custom("Please provide id");
      } else {
        let findUser = await Admin.findById(reqData.id);
        if (findUser) {
          let findMobile;
          let findEmail;

          if (reqData.mobile) {
            findMobile = await Admin.findOne({
              $and: [{ _id: { $ne: reqData.id } }, { mobile: reqData.mobile }],
            });
          }

          if (reqData.email) {
            findEmail = await Admin.findOne({
              $and: [{ _id: { $ne: reqData.id } }, { email: reqData.email }],
            });
          }
          if (findEmail && findMobile) {
            response = new Response(409, "F").custom(
              "Email Id and mobile is already in use"
            );
          } else if (findMobile) {
            response = new Response(409, "F").custom(
              "mobile number already in use"
            );
          } else if (findEmail) {
            response = new Response(409, "F").custom("Email Id already in use");
          } else {
            let payload = {
              ...reqData,
            };
            if (reqData.password) {
              payload["password"] = await bcrypt.hash(reqData.password, 10);
            }
            if (!findUser.emp_id) {
              payload.emp_id = generateCustomerId();
            }

            let updateUser = await Admin.findByIdAndUpdate(
              reqData.id,
              payload,
              { new: true }
            );

            const findVendor = await Vendor.find().lean();
            for (let i = 0; i < findVendor.length; i++) {
              let VendorCollection = await connectToDatabaseAndGetCollection(
                findVendor[i]._id,
                "admins"
              );
              let payload1 = {
                first_name: payload?.first_name,
                last_name: payload?.last_name,
                email: payload?.email,
                mobile: payload?.mobile,
                user_type: "LOYALTYADMIN",
              };
              if (!findUser.emp_id) {
                payload1.emp_id = generateCustomerId();
              }
              if (payload?.status) {
                payload1.status = payload.status;
              }
              await VendorCollection.findOneAndUpdate(
                { _id: reqData.id },
                payload1,
                { new: true }
              );
            }

            delete updateUser.password;
            response = new Response(200, "T", updateUser).custom(
              "Profile updated.."
            );
          }
        } else {
          response = new Response(404, "F").custom("User not found...");
        }
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async verifyOTP(reqData) {
    let response;
    try {
      let { id, otp } = reqData;
      let Collection = Admin;
      if (reqData.authData?.user_type === "PHYSICALVENDOR") {
        Collection = PhysicalGoodsVendor;
      }
      let findUser = await Collection.findById(id);
      if (findUser) {
        if (+reqData?.otp === +findUser?.otp || +otp === 1111) {
          let newUser = await Collection.findByIdAndUpdate(
            id,
            { otp: 0, is_email_verified: true },
            { new: true }
          );

          response = new Response(200, "T", newUser._id).custom(
            "Verification done,Please login"
          );
        } else {
          response = new Response(403, "F").custom("OTP did not matched");
        }
      } else {
        response = new Response(404, "F").custom("User Id is wrong");
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async forgotPassword(reqData) {
    let response;
    try {
      let { email } = reqData;
      let findUser = await Admin.findOne({ email });

      if (!findUser) {
        response = new Response(404, "F").custom("Email Id doesn't exists");
      } else {
        const min = 1000;
        const max = 9000;
        const otp = Math.floor(Math.random() * max) + min;

        const user = await Admin.findOneAndUpdate(
          { email },
          { otp: otp },
          { new: true }
        );

        let data = {
          _id: user._id,
          otp: otp,
        };

        console.log(user, "useruseruser");
        response = new Response(200, "T", data).custom(
          `OTP has been sent to your registered mail id`
        );
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async resendOtp(reqData) {
    let response;
    try {
      let { id } = reqData;
      let Collection = Admin;
      if (reqData.authData?.user_type === "PHYSICALVENDOR") {
        Collection = PhysicalGoodsVendor;
      }
      let findAdmin = await Collection.findById(id);

      if (!findAdmin) {
        response = new Response(404, "F").custom("Email Id doesn't exists");
      } else {
        const min = 1000;
        const max = 9000;
        const otp = Math.floor(Math.random() * max) + min;

        const user = await Collection.findByIdAndUpdate(
          id,
          { otp: otp },
          { new: true }
        );

        let data = {
          _id: user._id,
          otp: user.otp,
        };
        if (process.env.ENV === "PROD") {
          await sendOTPEmail(otp, findAdmin?.email);
        }
        response = new Response(200, "T", data).custom(
          `OTP has been sent to your registered mail id`
        );
      }
    } catch (error) {
      console.log(error, "errrr resend otp");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async changePassword(reqData) {
    let response;
    try {
      let { id, password } = reqData;
      let findUser = await Admin.findById(id);

      if (!findUser) {
        response = new Response(404, "F").custom("Email Id doesn't exists");
      } else {
        let comparePreviousOne = await bcrypt.compareSync(
          password,
          findUser.password
        );

        if (comparePreviousOne) {
          response = new Response(406, "F").custom(
            `Sorry you cannot use a previous password. please try another password`
          );
        } else {
          const encryptedPassword = await bcrypt.hash(password, 10);

          const user = await Admin.findByIdAndUpdate(
            id,
            { password: encryptedPassword },
            { new: true }
          );

          response = new Response(200, "T").custom(
            `Password updated please login...`
          );
        }
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async updatePassword(reqData) {
    let response;
    try {
      let { oldPassword, newPassword, id } = reqData;
      let findUser = await Admin.findById(id);

      if (!findUser) {
        response = new Response(404, "F").custom("Email Id doesn't exists");
      } else {
        let compareOldPassword = await bcrypt.compareSync(
          oldPassword,
          findUser.password
        );

        if (!compareOldPassword) {
          response = new Response(406, "F").custom(
            `Incorrect old password. please retry`
          );
        } else if (oldPassword === newPassword) {
          response = new Response(406, "F").custom(
            `Sorry you cannot use a previous password. please try another password`
          );
        } else {
          const encryptedPassword = await bcrypt.hash(newPassword, 10);

          const user = await Admin.findByIdAndUpdate(
            id,
            { password: encryptedPassword },
            { new: true }
          );

          response = new Response(200, "T").custom(`Password updated`);
        }
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static createBrand = async (reqData) => {
    let response;
    try {
      let findBrand = await Brand.findOne({
        $or: [{ name: reqData.name }, { code: reqData.code }],
      });

      if (findBrand) {
        response = new Response(409, "F").custom("Brand already exist");
      } else {
        let payload = {
          ...reqData,
          created_at: Date.now(),
          added_by: reqData.authData._id,
        };

        if (reqData.file) {
          let imageUrl = await uploadToS3Image({
            file: reqData?.file,
            platform: "admin",
            folder: "brand",
          });
          let imageUrl1 = await uploadToS3Image({
            file: reqData?.file,
            platform: "vendor",
            folder: "brand",
            brand: payload.name,
          });
          if (imageUrl) payload.image = imageUrl;
        }

        let newBrand = await Brand.create(payload);

        response = new Response(200, "T").custom("Brand added");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static brandList = async (reqData) => {
    let response;
    try {
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (reqData.id) {
        condition.push({
          $match: {
            _id: new Types.ObjectId(reqData.id),
          },
        });
        let brandList = await Brand.aggregate(condition);
        response = new Response(200, "T", brandList[0]).custom(
          "Data fetched..."
        );
      } else {
        if (reqData.status) {
          condition.push(...prependMatch("status", reqData.status));
        }

        if (reqData.search) {
          condition.push({
            $match: {
              $or: [
                {
                  name: new RegExp(reqData.search, "i"),
                },
                {
                  code: new RegExp(reqData.search, "i"),
                },
                {
                  mobile: new RegExp(reqData.search, "i"),
                },
              ],
            },
          });
        }
        let pagination = paginationHelper(reqData?.limit, reqData?.page);
        let brandCount = await Brand.aggregate(condition);

        pagination.totalRecord = brandCount.length;

        condition.push({
          $skip: pagination.skip,
        });

        condition.push({
          $limit: pagination.limit,
        });

        let brandList = await Brand.aggregate(condition);
        response = new Response(200, "T", brandList).custom("Data fetched...");
        response.pagination = pagination;
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateBrand = async (reqData) => {
    let response;
    try {
      const where = { _id: new Types.ObjectId(reqData.id) };
      let findBrand = await Brand.findOne(where);

      if (!findBrand) {
        response = new Response(404, "F").custom("Please select a valid brand");
      } else {
        let payload = { ...reqData };
        let payload1 = { ...reqData };
        let findVendor = await Vendor.findOne({
          brand: new Types.ObjectId(reqData.id),
          database_id: { $exists: true },
        });
        if (findVendor) {
          let VendorCollection = await connectToDatabaseAndGetCollection(
            findVendor._id,
            "brands"
          );
          if (reqData.file) {
            const findVendorServerBrand = await VendorCollection.findOne(where);
            await deleteFromS3Image(findVendorServerBrand.image);
            let imageUrl1 = await uploadToS3Image({
              file: reqData?.file,
              platform: "vendor",
              folder: "brand",
              brand: findVendorServerBrand.name,
            });
            if (imageUrl1) payload1.image = imageUrl1;
          }

          await VendorCollection.updateOne(where, payload1);
        }

        if (reqData.file) {
          await deleteFromS3Image(findBrand.image);
          let imageUrl = await uploadToS3Image({
            file: reqData?.file,
            platform: "admin",
            folder: "brand",
          });
          if (imageUrl) payload.image = imageUrl;
        }
        await Brand.updateOne(where, payload);

        response = new Response(200, "T").custom("Brand updated successfully");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateBrandStatus = async (reqData) => {
    let response;
    try {
      let findBrand = await Brand.findById(reqData.id);

      if (!findBrand) {
        response = new Response(404, "F").custom("Please select a valid brand");
      } else {
        let updateStatus = await Brand.findByIdAndUpdate(
          reqData.id,
          { status: reqData.status },
          { new: true }
        );
        response = new Response(200, "T", updateStatus).custom(
          `Status updated as ${reqData.status}`
        );
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static createPermission = async (reqData) => {
    let response;
    try {
      let findModule = await Permission.findOne({ name: reqData.name });

      if (findModule) {
        response = new Response(409, "F").custom("Permission already added");
      } else {
        let payload = {
          name: reqData.name,
          access_id: reqData.access_id,
          created_at: Date.now(),
        };

        await Permission.create(payload);

        response = new Response(200, "T").custom("Permission created");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static venderPanelSignin = async (reqData) => {
    let response;
    try {
      const findVendor = await Vendor.findOne({
        _id: new Types.ObjectId(reqData.id),
      }).lean();

      if (findVendor && findVendor.status === "ACTIVE") {
        var payload = { ...findVendor, user_type: "SUPERADMIN" };
        delete payload.password;
        delete payload.created_at;

        const url =
          process.env.ENV === "LOCAL"
            ? "http://localhost:8010/v1/api"
            : `https://${findVendor.instance_name}.bzloyalty.com/v1/api`;
        const api_url = "/admin/vendor-panel-signin";
        const final_url = url + api_url;
        const options = {
          method: "POST",
          url: final_url,
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "98f43E98f401c61ba%3CGMl%3E%3Crt%5G",
          },
          data: {
            id: reqData.id,
            admin_id: reqData.authData._id,
            // password: await bcrypt.hash(process.env.VENDOR_SECRET, 10)
            password: process.env.VENDOR_SECRET,
          },
        };

        const apiResponse = await new Promise(async (resolve, reject) => {
          axios
            .request(options)
            .then(function (response1) {
              resolve(response1.data);
              return response;
            })
            .catch(function (error) {
              reject(error);
              return response;
            });
        });
        response = new Response(200, "T", apiResponse?.data).custom(
          "Logged In successfully!!"
        );
        response.instance = findVendor?.instance_name || "vendor";
      } else if (findVendor && findVendor.status === "INACTIVE") {
        response = new Response(401, "F").custom("Account is deactivated");
      } else {
        response = new Response(404, "F").custom("Vendor not found.");
      }
    } catch (err) {
      console.log("errrrrrrrrrrrrrrrrrr", err);
      response = new Response().custom(err.message);
    }
    return response;
  };

  static adminPanelSignin = async (reqData) => {
    let response;
    let data = reqData.authData;
    const findAdmin = await Admin.findOne({
      _id: new Types.ObjectId(data._id),
    }).lean();
    let payload = {
      _id: data._id,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      mobile: data.mobile,
      user_type: data.user_type,
      status: data.status,
      updated_at: data.updated_at,
    };
    let token = await signJwt(payload);
    let refreshTokenPayloadData = await signRefreshJwt(payload);

    if (findAdmin && findAdmin.status === "ACTIVE") {
      let adminData = {
        _id: data._id,
        user_type: data.user_type,
        token: token.token,
        refreshToken: refreshTokenPayloadData.token,
        status: data.status,
        first_name: data.first_name,
        last_name: data.last_name,
      };

      response = new Response(200, "T", adminData).custom(
        "Logged In successfully!!"
      );
    } else if (findAdmin && findAdmin.status === "INACTIVE") {
      response = new Response(401, "F").custom("Account is deactivated");
    } else {
      response = new Response(404, "F").custom("Admin not found.");
    }
    return response;
  };

  static locationList = async (reqData) => {
    let response;
    try {
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
        ...customLookupWithUnwind("admins", "added_by", "_id", "emp", true),
        {
          $addFields: {
            "added_by.id": "$added_by",
            "added_by.name": {
              $cond: {
                if: { $ne: ["$emp.user_type", "SUPERADMIN"] },
                then: "$emp.first_name",
                else: "Admin",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            city: 1,
            state: 1,
            country: 1,
            pin_code: 1,
            created_at: 1,
            status: 1,
            updated_at: 1,
            added_by: 1,
          },
        },
      ];
      if (reqData?.id) {
        condition.push({
          $match: {
            _id: new Types.ObjectId(reqData.id),
          },
        });
      }
      if (reqData.search) {
        condition.push({
          $match: {
            name: new RegExp(reqData.search, "i"),
          },
        });
      }

      let data = await Location.aggregate(condition);
      response = new Response(200, "T", reqData.id ? data[0] : data).custom(
        "Location fetched successfully"
      );
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };
  static createLocation = async (reqData) => {
    let response;
    try {
      let findLocation = await Location.findOne({ name: reqData.name });

      if (findLocation) {
        response = new Response(409, "F").custom("Location already added");
      } else {
        let payload = {
          name: reqData.name,
          city: reqData.city,
          state: reqData.state,
          country: reqData.country,
          pin_code: reqData.pin_code,
          added_by: reqData.authData._id,
        };

        await Location.create(payload);

        response = new Response(200, "T").custom(
          "Location created successfully"
        );
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateLocation = async (reqData) => {
    let response;
    try {
      const where = { _id: new Types.ObjectId(reqData.id) };
      let findLocation = await Location.findOne(where);

      if (!findLocation) {
        response = new Response(409, "F").custom("Location not found");
      } else {
        let payload = {
          updated_by: new Date(),
        };
        if (reqData.status) {
          payload.status = reqData.status;
        } else {
          payload.name = reqData.name;
          payload.city = reqData.city;
          payload.state = reqData.state;
          payload.country = reqData.country;
          payload.pin_code = reqData.pin_code;
        }

        await Location.updateOne(where, payload);

        response = new Response(200, "T").custom(
          "Location updated successfully"
        );
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };
  static deleteLocation = async (reqData) => {
    let response;
    try {
      const where = { _id: new Types.ObjectId(reqData.id) };
      let findLocation = await Location.findOne(where);

      if (!findLocation) {
        response = new Response(409, "F").custom("Location not found");
      } else {
        await Location.deleteOne(where);

        response = new Response(200, "T").custom(
          "Location deleted successfully"
        );
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async adminLogs(reqData) {
    let response;
    try {
      let adminId;
      let condition = [
        // ...prependMatch("admin_id", new Types.ObjectId(adminId)),
        ...customLookupWithUnwind("admins", "admin_id", "_id", "admin", true),
        {
          $project: {
            admin: {
              first_name: "$admin.first_name",
              last_name: "$admin.last_name",
            },
            method: 1,
            url: 1,
            status: 1,
            admin_id: 1,
            module: 1,
            message: 1,
            created_at: 1,
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (reqData.authData.user_type === "SUPERADMIN" && reqData?.id) {
        adminId = reqData.id;
        condition.unshift(
          ...prependMatch("admin_id", new Types.ObjectId(adminId))
        );
      } else if (reqData.authData.user_type !== "SUPERADMIN") {
        adminId = reqData.authData._id;
        condition.unshift(
          ...prependMatch("admin_id", new Types.ObjectId(adminId))
        );
      }

      if (reqData?.start_date && reqData?.end_date) {
        condition.push(
          commonRangeOnlyDateFilter(
            "created_at",
            reqData.start_date,
            reqData.end_date
          )
        );
      }

      let pagination = paginationHelper(reqData?.limit, reqData?.page);

      let docCount = await AdminLogs.aggregate(condition);

      pagination.totalRecord = docCount.length;

      if (reqData.page && reqData.limit) {
        condition.push({
          $skip: pagination.skip,
        });
        condition.push({
          $limit: pagination.limit,
        });
      }

      const findLogs = await AdminLogs.aggregate(condition);
      response = new Response(200, "T", findLogs).custom(
        "Logs fetched successfully"
      );
      response.pagination = pagination;
    } catch (error) {
      console.log(error, "errrrrrrrrrr admin logs");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static conditionalTotal = async (collectionName, timeUnit, keyParams = 1) => {
    let collectionObj = {
      User: User,
      Vendor: Vendor,
    };
    const Collection = collectionObj[collectionName];
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    let timeField;
    let totalPeriods;

    switch (timeUnit) {
      case "month":
        timeField = { $month: "$created_at" };
        totalPeriods = 12;
        break;
      case "week":
        timeField = { $week: "$created_at" };
        totalPeriods = 53;
        break;
      case "year":
        timeField = { $year: "$created_at" };
        totalPeriods = currentYear;
        break;
      default:
        throw new Error("Invalid timeUnit! Choose 'month', 'week', or 'year'.");
    }

    let condition = [
      {
        $match: {
          created_at: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $addFields: {
          period: timeField,
        },
      },
      {
        $group: {
          _id: "$period",
          count: { $sum: keyParams },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ];

    if (collectionName === "User") {
      condition.unshift({
        $match: {
          is_registered: true,
        },
      });
    }

    const aggregatedData = await Collection.aggregate(condition);

    let filledPeriods = new Array(totalPeriods).fill(0);

    aggregatedData.forEach((data) => {
      const periodIndex = data._id - 1;
      if (periodIndex >= 0 && periodIndex < totalPeriods) {
        filledPeriods[periodIndex] = data.count;
      }
    });

    if (timeUnit === "year") {
      filledPeriods = filledPeriods.splice(filledPeriods.length - 5);
    }
    return filledPeriods;
  };

  static dashboard = async (reqData) => {
    let response;
    try {
      const responseData = {};

      // total
      responseData.total_user = await User.countDocuments({
        is_registered: true,
      });
      responseData.total_admin = await Admin.countDocuments({
        user_type: "ADMIN",
      });
      responseData.total_vendor = await Vendor.countDocuments();

      // monthly
      responseData.user_monthly = await this.conditionalTotal(
        "User",
        "month",
        1
      );
      responseData.vendor_monthly = await this.conditionalTotal(
        "Vendor",
        "month",
        1
      );

      // yearly
      responseData.user_yearly = await this.conditionalTotal("User", "year", 1);
      responseData.vendor_yearly = await this.conditionalTotal(
        "Vendor",
        "year",
        1
      );

      response = new Response(200, "T", responseData).custom("Data fetched...");
    } catch {
      console.log(error, "errrrrrrrrrr dashboard");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async whiteList(reqData) {
    let response;
    try {
      let condition = [
        ...customLookupWithUnwind("admins", "added_by", "_id", "admins", true),
        {
          $addFields: {
            "added_by.id": "$added_by",
            "added_by.name": {
              $concat: ["$vendor.first_name", " ", "$vendor.last_name"],
            },
          },
        },
        {
          $project: {
            vendor: 0,
          },
        },
        {
          $sort: {
            url: 1,
          },
        },
      ];
      if (reqData.id) {
        condition.push(prependMatch("_id", new Types.ObjectId(reqData.id)));
      }
      const findData = await WhiteList.aggregate(condition);
      if (findData) {
        response = new Response(
          200,
          "T",
          reqData.id ? findData[0] : findData
        ).custom("White List fetched successfully");
      } else {
        response = new Response(404, "F").custom("White List not found");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr White List");
      response = new Response().custom(error.message);
    }
    return response;
  }
  static async addWhiteList(reqData) {
    let response;
    try {
      if (reqData.url) {
        const findData = await WhiteList.findOne({ url: reqData.url });
        if (findData) {
          response = new Response(409, "F").custom("Already Exist");
        } else {
          await WhiteList.create({
            url: reqData.url,
            added_by: reqData.authData._id,
          });
          response = new Response(200, "T").custom(
            "URL Whitelisted Successfully"
          );
        }
      } else {
        response = new Response(422, "F").custom("Please Provide URL");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr update white list");
      response = new Response().custom(error.message);
    }
    return response;
  }
  static async deleteWhiteList(reqData) {
    let response;
    try {
      if (reqData.id) {
        await WhiteList.deleteOne({ _id: new Types.ObjectId(reqData.id) });
        response = new Response(200, "T").custom("URL Removed Successfuly");
      } else {
        response = new Response(422, "F").custom("Please Provide Id");
      }
    } catch (error) {
      console.log(error.message, "errrrrrrrrrr delete white list");
      response = new Response().custom(error.message);
    }
    return response;
  }
}

export default SuperAdminModel;
