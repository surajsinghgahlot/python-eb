import Response from "../helpers/Response.js";
import {
  customLookupWithUnwind,
  paginationHelper,
  prependMatch,
} from "../helpers/project/custom.js";
import { Types } from "mongoose";
import { User } from "../schema/index.js";

class UserModel {
  static userList = async (reqData) => {
    let response;
    try {
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
        ...prependMatch("is_registered", true),
      ];

      if (reqData.id) {
        condition.push({
          $match: {
            _id: new Types.ObjectId(reqData.id),
          },
        });
        let userList = await User.aggregate(condition);
        response = new Response(200, "T", userList[0]).custom(
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
                  first_name: new RegExp(reqData.search, "i"),
                },
                {
                  last_name: new RegExp(reqData.search, "i"),
                },
                {
                  email: new RegExp(reqData.search, "i"),
                },
                {
                  mobile_number: new RegExp(reqData.search, "i"),
                },
                {
                  customer_id: new RegExp(reqData.search, "i"),
                },
              ],
            },
          });
        }
        let pagination = paginationHelper(reqData?.limit, reqData?.page);
        let userCount = await User.aggregate(condition);

        pagination.totalRecord = userCount.length;

        condition.push({
          $skip: pagination.skip,
        });

        condition.push({
          $limit: pagination.limit,
        });

        let userList = await User.aggregate(condition);
        response = new Response(200, "T", userList).custom("Data fetched...");
        response.pagination = pagination;
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  };

  static updateUser = async (reqData) => {
    let response;
    try {
      let where = { _id: new Types.ObjectId(reqData.id) };
      let findUser = await User.findOne(where);

      if (!findUser) {
        response = new Response(409, "F").custom("User not found");
      } else {
        let payload = {
          status: reqData.status,
          updated_at: Date.now(),
        };

        let newUser = await User.updateOne(where, payload);
        response = new Response(200, "T").custom("User updated successfully");
      }
    } catch (error) {
      console.log(error, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static userVendorWise = async (reqData) => {
    let response;
    try {
      let condition = [
        ...prependMatch("_id", new Types.ObjectId(reqData.id)),
        {
          $unwind: { path: "$vendors" },
        },
        ...customLookupWithUnwind("vendors", "vendors", "_id", "vendor", true),
        ...customLookupWithUnwind(
          "brands",
          "vendor.brand",
          "_id",
          "brand",
          true
        ),
        {
          $project: {
            vendor: {
              id: "$vendor._id",
              first_name: "$vendor.first_name",
              last_name: "$vendor.last_name",
              email: "$vendor.email",
              mobile: "$vendor.mobile",
              image: "$vendor.image",
            },
            brand: {
              id: "$brand._id",
              name: "$brand.name",
              code: "$brand.code",
              image: "$brand.image",
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];
      let userList = await User.aggregate(condition);
      response = new Response(200, "T", userList).custom("Data fetched...");
    } catch (err) {
      console.log(err, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(err.message);
    }
    return response;
  };
}

export default UserModel;
