import axios from "axios";
import Response from "../helpers/Response.js";
import {
  customLookupWithUnwind,
  generateOrCondition,
  generateTransactionId,
  keyCase,
  paginationHelper,
  prependMatch,
} from "../helpers/project/custom.js";
import {
  deleteFromS3Image,
  uploadToS3Image,
} from "../helpers/third-party/awsConfig.js";
import {
  Category,
  PhysicalGoodsVendor,
  PhysicalGood,
  Admin,
  PGVendorOrders,
  User,
} from "../schema/index.js";
import bcrypt from "bcryptjs";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import { Types } from "mongoose";
import { connectToDatabaseAndGetCollection } from "../config/connectDB.js";
import PGOrders from "../schema/PGOrders.js";
import pLimit from "p-limit";

class CategoryModel {
  static async profile(reqData) {
    let response;
    try {
      let findVendor = await PhysicalGoodsVendor.findById(
        reqData.authData._id
      ).lean();
      const resData = { ...findVendor, user_type: "PHYSICALVENDOR" };
      response = new Response(200, "T", resData).custom("Data fetched...");
    } catch (error) {
      console.log(error, "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async addCategory(reqData) {
    let response;
    try {
      const { name, code, parent_id, authData } = reqData;

      let parentCategory = null;
      let level = 1;

      if (parent_id) {
        parentCategory = await Category.findOne({ categoryId: parent_id });
        if (!parentCategory) {
          return new Response(404, "F").custom("Parent category not found");
        }
        level = parentCategory.level + 1;
      }

      let query = { name: name };

      if (reqData.parent_id) {
        query.parent_id = parentCategory._id;
      }

      let findCategory = await Category.findOne(query);

      if (findCategory) {
        return new Response(409, "F").custom(
          "Category name or code already exists in this level"
        );
      }

      let categoryData = {
        name,
        code,
        description: reqData.description,
        level,
        added_by: authData._id,
        categoryId: reqData.categoryId,
        vendor_id: reqData.vendor_id,
      };

      if (parentCategory?._id) {
        categoryData.parent_id = parentCategory._id;
      }

      let newCategory = await Category.create(categoryData);

      response = new Response(201, "T", newCategory).custom(
        "Category created successfully"
      );
    } catch (error) {
      console.log(error, "THis is my error console");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async updateCategory(reqData) {
    let response;
    try {
      let existingCategory = await Category.findById(reqData.id);
      if (!existingCategory) {
        return new Response(404, "F").custom("Category not found");
      }

      let duplicateCategory = await Category.findOne({
        _id: { $ne: reqData.id },
        $or: [{ name: reqData.name }],
      });

      if (duplicateCategory) {
        return new Response(409, "F").custom(
          "Category with same name or code already exists"
        );
      }

      let updatedCategory = await Category.findByIdAndUpdate(
        reqData.id,
        {
          ...reqData,
          updated_at: new Date(),
        },
        { new: true }
      );

      response = new Response(200, "T", updatedCategory).custom(
        "Category updated successfully"
      );
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async categoryList(reqData) {
    let response;
    try {
      const pagination = paginationHelper(reqData.limit, reqData.page);

      let condition = [];

      if (reqData.search) {
        condition.push({
          $match: {
            name: { $regex: reqData.search, $options: "i" },
          },
        });
      }

      condition.push({
        $sort: { name: 1 },
      });

      condition.push({
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "parent_id",
          as: "subcategories",
        },
      });

      condition.push({
        $lookup: {
          from: "categories",
          localField: "subcategories._id",
          foreignField: "parent_id",
          as: "subcategories.children",
        },
      });

      const countPipeline = [...condition];
      const totalData = await Category.aggregate(countPipeline);
      pagination.totalRecord = totalData.length;

      condition.push({ $skip: pagination.skip });
      condition.push({ $limit: pagination.limit });

      const data = await Category.aggregate(condition);

      response = new Response(200, "T", data).custom("Read...");
      response.pagination = pagination;
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async deleteCategory(reqData) {
    let response;
    try {
      if (reqData.id) {
        await Category.deleteOne({ _id: reqData.id });
        response = new Response(200, "T").custom("Deleted....");
      } else {
        response = new Response(422, "F").custom("Please select category");
      }
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async vendorList(reqData) {
    let response;
    try {
      console.log('123')
      let condition = [
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $lookup: {
            from: "vendors",
            let: { pgID: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$$pgID", { $ifNull: ["$physical_vendors", []] }],
                  },
                },
              },
              ...customLookupWithUnwind(
                "brands",
                "brand",
                "_id",
                "brand",
                true
              ),
              {
                $project: {
                  first_name: 1,
                  last_name: 1,
                  brand_name: "$brand.name",
                },
              },
            ],
            as: "vendor",
          },
        },
      ];

      const pagination = paginationHelper(reqData.limit, reqData.page);

      const tCount = await PhysicalGoodsVendor.aggregate(condition);
      pagination.totalRecord = tCount.length;

      if (reqData.search) {
        condition.push({
          $match: { name: new RegExp(reqData?.search, "i") },
        });
      }
      if (reqData?.status) {
        condition.push({
          $match: { status: reqData?.status },
        });
      }

      condition.push({
        $skip: pagination.skip,
      });

      condition.push({
        $limit: pagination.limit,
      });

      let data = await PhysicalGoodsVendor.aggregate(condition);
      response = new Response(200, "T", data).custom("Read...");
      response.pagination = pagination;
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async addVendor(reqData) {
    let response;
    try {
      const { email, mobile_number, password } = reqData;
      const encryptedPassword = await bcrypt.hash(password, 10);

      let findEmail = await PhysicalGoodsVendor.findOne({ email });
      let findMobile = await PhysicalGoodsVendor.findOne({ mobile_number });
      findEmail = await Admin.findOne({ email });

      if (findEmail) {
        response = new Response(409, "F").custom("Email already exists");
      } else if (findMobile) {
        response = new Response(409, "F").custom("Mobile already exists");
      } else {
        let payload = {
          ...reqData,
          password: encryptedPassword,
          added_by: reqData.authData._id,
        };

        let newVendor = await PhysicalGoodsVendor.create(payload);
        response = new Response(201, "T", newVendor).custom(
          "Vendor Created Successfully"
        );
      }
    } catch (error) {
      console.log(error, "error add vendor");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async updateVendor(reqData) {
    let response;
    try {
      const { id } = reqData;

      if (!id) {
        return new Response(400, "F").custom("Vendor ID is required");
      }

      const findVendor = await PhysicalGoodsVendor.findById(id);
      if (!findVendor) {
        return new Response(404, "F").custom("Vendor not found");
      }

      let payload = { ...reqData, added_by: reqData.authData._id };

      if (reqData.status) {
        if (reqData?.status) {
          payload = { status: reqData.status, updated_at: new Date() };
        }
      } else {
        const findEmail = await PhysicalGoodsVendor.findOne({
          email: reqData.email,
        });
        const findMobile = await PhysicalGoodsVendor.findOne({
          mobile_number: reqData?.mobile_number,
        });

        if (findEmail && findEmail._id.toString() !== id) {
          response = new Response(409, "F").custom("Email already exists");
          return response;
        } else if (findMobile && findMobile._id.toString() !== id) {
          response = new Response(409, "F").custom("Mobile already exists");
          return response;
        }

        if (reqData.password) {
          payload.password = await bcrypt.hash(reqData.password, 10);
        }
      }

      await PhysicalGoodsVendor.updateOne({ _id: id }, payload);

      response = new Response(200, "T").custom("Vendor Updated Successfully");
    } catch (error) {
      console.log(error, "error update vendor");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static addPhysicalGood = async (reqData) => {
    let response;
    try {
      let vendor_id = reqData?.vendor_id;
      if (reqData.authData?.user_type === "PHYSICALVENDOR") {
        vendor_id = reqData.authData._id;
      }

      let findOldProduct = await PhysicalGood.findOne({
        code: reqData.code,
      });

      let findCategory = await Category.findOne({
        _id: reqData.category_id,
      });
      if (!findCategory) {
        return (response = new Response(404, "F").custom(
          "Please select a valid category"
        ));
      }
      let findVendor = await PhysicalGoodsVendor.findOne({
        _id: vendor_id,
      });
      if (!findVendor) {
        return (response = new Response(404, "F").custom("Vendor not found"));
      }
      if (findOldProduct) {
        response = new Response(409, "F").custom("Product already exists");
      } else {
        let payload = {
          ...reqData,
          vendor_id,
          name: reqData.name,
          added_by: reqData.authData._id,
        };

        let imgArr = [];
        if (reqData.files && reqData.files.length > 0) {
          let imgs = await Promise.all(
            reqData?.files.map(async (element) => {
              let imageUrl = await uploadToS3Image({
                file: element,
                platform: "physical_vendor",
                folder: "physicalgood",
              });

              if (imageUrl) {
                return Promise.resolve(imageUrl);
              }
            })
          ).then((values) => {
            return values;
          });

          imgs.map((element, index) => {
            if (reqData.primary_index && index === +reqData.primary_index) {
              imgArr.unshift(element);
            } else {
              imgArr.push(element);
            }
          });
        }
        if (imgArr.length > 0) {
          payload["images"] = imgArr;
        }

        await PhysicalGood.create(payload);

        response = new Response(200, "T").custom("Item created..");
      }
    } catch (error) {
      console.log(error, "messGE");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static physicalGoodList = async (reqData) => {
    let response;
    try {
      let vendor_ids = reqData?.vendor_id ? [reqData.vendor_id] : null;
      if (reqData.authData?.user_type === "PHYSICALVENDOR") {
        vendor_ids = [reqData.authData._id];
      }
      if (reqData.authData?.user_type === "VENDOR") {
        vendor_ids = reqData?.authData?.physical_vendors || [];
      }

      let condition = [
        ...customLookupWithUnwind(
          "categories",
          "category_id",
          "_id",
          "category",
          true
        ),
        ...customLookupWithUnwind(
          "admins",
          "added_by",
          "_id",
          "added_by",
          true
        ),
        ...customLookupWithUnwind(
          "physical-goods-vendors",
          "vendor_id",
          "_id",
          "vendor",
          true
        ),
        {
          $addFields: {
            added_by: {
              $concat: ["$added_by.first_name", " ", "$added_by.last_name"],
            },
          },
        },
        {
          $project: {
            name: 1,
            _id: 1,
            images: 1,
            code: 1,
            description: 1,
            size: 1,
            unit: 1,
            qty: 1,
            price: 1,
            discount: 1,
            model_no: 1,
            brand: 1,
            status: 1,
            added_by: 1,
            redeemable_value: 1,
            vendor: {
              _id: "$vendor_id",
              name: {
                $concat: ["$vendor.first_name", " ", "$vendor.last_name"],
              },
              mobile_number: "$vendor.mobile_number",
              business_name: "$vendor.business_name",
            },
            category: {
              _id: "$category._id",
              name: "$category.name",
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (vendor_ids && Array.isArray(vendor_ids)) {
        const vendor_IDS = vendor_ids.map((id) => new Types.ObjectId(id));
        condition.push({
          $match: {
            "vendor._id": { $in: vendor_IDS },
          },
        });
      }
      if (reqData.id) {
        condition.push(...prependMatch("_id", new Types.ObjectId(reqData.id)));
      } else {
        if (reqData.category_id) {
          condition.push(
            ...prependMatch(
              "category._id",
              new Types.ObjectId(reqData.category_id)
            )
          );
        }

        if (reqData.search) {
          const searchFields = ["name", "code"];
          condition.push(...generateOrCondition(searchFields, reqData.search));
        }
      }
      if (reqData?.status || reqData.authData?.user_type === "VENDOR") {
        const status =
          reqData.authData?.user_type === "VENDOR" ? "ACTIVE" : reqData?.status;
        condition.push(...prependMatch("status", status));
      }

      let pagination = paginationHelper(reqData?.limit, reqData?.page);

      let totalRecordCondition = [...condition];
      if (reqData.page && reqData.limit) {
        condition = [
          ...condition,
          {
            $skip: pagination.skip,
          },
          {
            $limit: pagination.limit,
          },
        ];
      }

      const condition1 = [
        {
          $facet: {
            data: condition,
            totalCount: [...totalRecordCondition, { $count: "count" }],
          },
        },
        {
          $project: {
            data: 1,
            totalRecord: { $arrayElemAt: ["$totalCount.count", 0] },
          },
        },
      ];

      const findData = await PhysicalGood.aggregate(condition1);
      pagination.totalRecord = findData[0].totalRecord;
      response = new Response(200, "T", findData[0].data).custom(
        "Physical Good Fetched Successfully"
      );
      response.pagination = pagination;
    } catch (err) {
      console.error(err, "err get physical good list");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  };

  static updatePhysicalGood = async (reqData) => {
    let response;
    try {
      let findOldProduct = await PhysicalGood.findById({ _id: reqData.id });
      let findSimilarProductCode = await PhysicalGood.findOne({
        $and: [{ _id: { $ne: reqData.id } }, { code: reqData.code }],
      });
      if (!findOldProduct) {
        response = new Response(404, "F").custom("Product not found");
      } else if (findSimilarProductCode) {
        response = new Response(409, "F").custom(
          "Product code is already in use"
        );
      } else {
        let payload = {
          ...reqData,
          added_by: reqData.authData._id,
          updated_at: new Date(),
        };

        if (reqData.status) {
          payload = { status: reqData.status };
        } else {
          let imgArr = Array.isArray(reqData.images) ? [...reqData.images] : [];

          if (Array.isArray(findOldProduct?.images)) {
            let filterImage = findOldProduct.images.filter((e) => {
              return !imgArr.includes(e); // remove if old image not in new request
            });

            if (filterImage.length > 0) {
              await Promise.all(
                filterImage.map(async (element) => {
                  let url = `image/admin/physicalgood${element}`;
                  await deleteFromS3Image(url);
                })
              );
            }
          }

          if (Array.isArray(reqData.files) && reqData.files.length > 0) {
            const uploadedImages = await Promise.all(
              reqData.files.map(async (file) => {
                return await uploadToS3Image({
                  file,
                  // platform: "vendor",
                  platform: "physical_vendor",
                  folder: "physicalgood",
                  brand: findOldProduct.name,
                });
              })
            );

            const validImgs = uploadedImages.filter(Boolean);

            validImgs.forEach((img, index) => {
              if (reqData.primary_index && index === +reqData.primary_index) {
                imgArr.unshift(img);
              } else {
                imgArr.push(img);
              }
            });
          }

          if (
            reqData.primary_index !== undefined &&
            (!Array.isArray(reqData.files) || reqData.files.length === 0)
          ) {
            const index = parseInt(reqData.primary_index);
            if (!isNaN(index) && index >= 0 && index < imgArr.length) {
              const [img] = imgArr.splice(index, 1);
              imgArr.unshift(img);
            }
          }

          payload["images"] = imgArr;

          if (reqData.name) {
            payload["name"] = reqData.name;
          }
        }
        await PhysicalGood.updateOne(
          { _id: reqData.id },
          { ...payload },
          { new: true }
        );

        response = new Response(200, "T").custom("Item updated");
      }
    } catch (error) {
      console.log(error, "error");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async bulkUploadPhysicalGoods(reqData) {
    let response;
    const requiredKeys = ["name", "category_id", "price"];
    const errorData = [];
    const duplicateData = [];
    const validData = [];

    try {
      if (reqData.req) {
        reqData.req.setTimeout(0);
        reqData.res?.setTimeout(0);
      }

      const workbook = xlsx.read(reqData.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const { vendor_id } = reqData;
      if (!vendor_id) {
        return new Response(400, "F").custom(
          "Vendor ID is required for bulk upload"
        );
      }
      if (!sheetData.length) {
        return new Response(422, "F").custom("Excel file is empty");
      }

      const formattedData = sheetData.map((row) => {
        const paramKeys = {};
        for (let key in row) {
          paramKeys[keyCase(key)] = row[key];
        }
        return paramKeys;
      });

      for (const row of formattedData) {
        const missing = requiredKeys.filter((k) => !row[k]);
        if (missing.length) {
          errorData.push({ ...row, error: `${missing.join(", ")} required` });
        }
      }

      const categoryIds = [...new Set(formattedData.map((d) => d.category_id))];
      const categories = await Category.find({
        _id: { $in: categoryIds },
      }).lean();
      const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

      formattedData.forEach((row) => {
        if (!categoryMap.has(row.category_id)) {
          errorData.push({ ...row, error: "Invalid Category ID" });
        }
      });

      const names = formattedData.map((d) => d.name);
      const codes = formattedData.map((d) => d.code).filter(Boolean);
      const existingGoods = await PhysicalGood.find({
        vendor_id,
        $or: [{ name: { $in: names } }, { code: { $in: codes } }],
      }).lean();
      const duplicateSet = new Set(
        existingGoods.map((g) => `${g.name}_${g.category_id}`)
      );

      formattedData.forEach((row) => {
        if (duplicateSet.has(`${row.name}_${row.category_id}`)) {
          duplicateData.push(row);
        }
      });

      const limit = pLimit(5);

      const uploadImage = async (imagePath) => {
        try {
          let fileObject;
          const isRemote = /^https?:\/\//i.test(imagePath);

          if (isRemote) {
            const res = await axios.get(imagePath, {
              responseType: "arraybuffer",
            });
            if (res.status !== 200) throw new Error(`Failed to fetch image`);
            fileObject = {
              originalname: path.basename(imagePath.split("?")[0]),
              buffer: Buffer.from(res.data),
            };
          } else {
            const fullPath = path.isAbsolute(imagePath)
              ? imagePath
              : path.join(__dirname, imagePath);
            if (!fs.existsSync(fullPath)) throw new Error(`Image not found`);
            fileObject = {
              originalname: path.basename(fullPath),
              buffer: fs.readFileSync(fullPath),
            };
          }

          return await uploadToS3Image({
            file: fileObject,
            platform: "physical_vendor",
            folder: "physicalgood",
          });
        } catch (err) {
          return { error: err.message };
        }
      };

      const BATCH_SIZE = 20;
      for (let i = 0; i < formattedData.length; i += BATCH_SIZE) {
        const batch = formattedData.slice(i, i + BATCH_SIZE);

        const processedBatch = await Promise.all(
          batch.map(async (row) => {
            if (errorData.find((err) => err.name === row.name)) return null;
            if (duplicateData.find((dup) => dup.name === row.name)) return null;

            const imageColumns = Object.keys(row).filter((key) =>
              /^imageurl\d*$/i.test(key)
            );

            let imagePaths = [];
            for (const col of imageColumns) {
              if (row[col]) {
                imagePaths.push(
                  ...row[col]
                    .toString()
                    .split(",")
                    .map((img) => img.trim())
                    .filter(Boolean)
                );
              }
            }
            imagePaths = [...new Set(imagePaths)];

            const results = await Promise.allSettled(
              imagePaths.map((p) => limit(() => uploadImage(p)))
            );

            const imgArr = [];
            results.forEach((res, idx) => {
              if (res.status === "fulfilled" && !res.value?.error) {
                imgArr.push(res.value);
              }
            });

            if (imgArr.length === 0) {
              errorData.push({
                ...row,
                error: `All provided images are invalid or failed to upload`,
              });
              return null;
            }

            return {
              ...row,
              images: imgArr,
              added_by: reqData.authData._id,
              vendor_id,
            };
          })
        );

        validData.push(...processedBatch.filter(Boolean));
      }

      if (validData.length) {
        await PhysicalGood.insertMany(validData, { ordered: false });
      }

      if (errorData.length) {
        response = new Response(400, "F", {
          validData,
          duplicateData,
          errorData,
        }).custom("Upload completed with some errors");
      } else if (duplicateData.length) {
        response = new Response(409, "F", {
          validData,
          duplicateData,
          errorData,
        }).custom("Upload completed with duplicate data");
      } else {
        response = new Response(200, "T", {
          validData,
          duplicateData,
          errorData,
        }).custom("Upload complete");
      }
    } catch (error) {
      console.error("Bulk upload error:", error.message);
      response = new Response(500, "F").custom(
        `Internal Server Error: ${error.message}`
      );
    }

    return response;
  }

  static async pgVendorOrderList(reqData) {
    let response;
    try {
      let vendor_ids = reqData?.vendor_id ? [reqData.vendor_id] : null;
      if (reqData.authData?.user_type === "PHYSICALVENDOR") {
        vendor_ids = [reqData.authData._id];
      }
      if (reqData.authData?.user_type === "VENDOR") {
        vendor_ids = reqData?.authData?.physical_vendors || [];
      }

      let condition = [
        // ...customLookupWithUnwind(
        //   "vendors",
        //   "vendor_id",
        //   "_id",
        //   "vendor",
        //   true
        // ),
        {
          $lookup: {
            from: "vendors",
            let: { vendorId: "$vendor_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$vendorId", "$_id"],
                  },
                },
              },
              ...customLookupWithUnwind(
                "brands",
                "brand",
                "_id",
                "brand",
                true
              ),
              {
                $project: {
                  name: {
                    $concat: ["$first_name", " ", "$last_name"],
                  },
                  brand_name: "$brand.name",
                },
              },
            ],
            as: "vendor",
          },
        },
        {
          $unwind: `$vendor`,
        },
        ...customLookupWithUnwind("users", "user_id", "_id", "user", true),
        ...customLookupWithUnwind(
          "physical_goods",
          "physical_good_id",
          "_id",
          "pg",
          true
        ),
        ...customLookupWithUnwind(
          "physical-goods-vendors",
          "pg.vendor_id",
          "_id",
          "pgVendor",
          true
        ),
        ...customLookupWithUnwind(
          "categories",
          "pg.category_id",
          "_id",
          "category",
          true
        ),
        {
          $project: {
            all_status: "$tracking_status",
            tracking_status: {
              $arrayElemAt: ["$tracking_status.status", -1],
            },
            order_id: 1,
            status: 1,
            tracking_number: 1,
            expected_delivery_date: 1,
            documents: 1,
            created_at: 1,
            updated_at: 1,
            physical_good: {
              _id: "$pg._id",
              name: "$pg.name",
              code: "$pg.code",
              model_no: "$pg.model_no",
              images: "$pg.images",
              brand: "$pg.brand",
              size: "$pg.size",
              unit: "$pg.unit",
              price: "$pg.price",
              redeemable_value: "$pg.redeemable_value",
              category: "$category.name",
            },
            // vendor: {
            //   _id: "$vendor._id",
            //   name: {
            //     $concat: ["$vendor.first_name", " ", "$vendor.last_name"],
            //   },
            // },
            vendor: 1,
            pgVendor: {
              first_name: 1,
              last_name: 1,
              business_name: 1,
            },
            user: {
              _id: "$user._id",
              name: { $concat: ["$user.first_name", " ", "$user.last_name"] },
              address: "$user.address",
              city: "$user.city",
              state: "$user.state",
              country: "$user.country",
              pin_code: "$user.pin_code",
              mobile_number: "$user.mobile_number",
            },
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
      ];

      if (vendor_ids && Array.isArray(vendor_ids)) {
        const vendor_IDS = vendor_ids.map((id) => new Types.ObjectId(id));
        condition.push({
          $match: {
            "vendor._id": { $in: vendor_IDS },
          },
        });
      }

      if (reqData.search) {
        condition.push(...generateOrCondition(["order_id"], reqData.search));
      }
      if (reqData.user_id) {
        condition.push(...prependMatch("user_id", reqData.user_id));
      }
      if (reqData.id) {
        condition.push(...prependMatch("_id", new Types.ObjectId(reqData.id)));
      }

      let pagination = paginationHelper(reqData?.limit, reqData?.page);

      let totalRecordCondition = [...condition];
      if (reqData.page && reqData.limit) {
        condition = [
          ...condition,
          {
            $skip: pagination.skip,
          },
          {
            $limit: pagination.limit,
          },
        ];
      }

      let condition1 = [
        {
          $facet: {
            data: condition,
            totalCount: [...totalRecordCondition, { $count: "count" }],
          },
        },
        {
          $project: {
            data: 1,
            totalRecord: { $arrayElemAt: ["$totalCount.count", 0] },
          },
        },
      ];

      if (reqData.id) {
        const findData = await PGVendorOrders.aggregate(condition1);
        console.log(findData, "findData");
        response = new Response(200, "T", findData[0].data[0]).custom(
          "Order Fetched Successfully"
        );
      } else {
        const findData = await PGVendorOrders.aggregate(condition1);
        pagination.totalRecord = findData[0].totalRecord;
        response = new Response(200, "T", findData[0].data).custom(
          "Order Fetched Successfully"
        );
        response.pagination = pagination;
      }
    } catch (err) {
      console.error(err, "err get pg vendor order list");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  }

  static async createpgVendorOrder(reqData) {
    let response;
    try {
      const { order_id, points, user_id, physical_good_id, vendor_id } =
        reqData;
      let payload = {
        order_id: order_id,
        points: points,
        user_id: user_id,
        physical_good_id: physical_good_id,
        vendor_id: vendor_id,
      };

      console.log(payload, "payload create pg vendor order");
      if (!payload.vendor_id)
        return new Response(404, "F").custom("Vendor Require to Create Order");
      const findUser = await User.findById(user_id).lean();

      const findPG = await PhysicalGood.findById(physical_good_id).lean();
      if (!findUser) return new Response(404, "F").custom("User Not Found");
      if (!findPG)
        return new Response(404, "F").custom("Physical Good Not Found");

      const createOrder = await PGVendorOrders.create(payload);

      response = new Response(200, "T", createOrder).custom(
        "Order Created Successfully"
      );
    } catch (err) {
      console.error(err, "err create pg vendor order");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  }

  static async updatePGVendorOrder(reqData) {
    let response;
    try {
      if (!reqData.id) return new Response(422, "F").custom("Id Require");
      const findPGVendorOrder = await PGVendorOrders.findById(
        reqData.id
      ).lean();
      if (!findPGVendorOrder)
        return new Response(404, "F").custom("Order Not Found");

      let payload = {
        updated_by: reqData.authData._id,
        updated_at: new Date(),
      };
      if (
        (reqData?.status && reqData.status === "ACCEPTED") ||
        findPGVendorOrder.status === "ACCEPTED"
      ) {
        payload.status = reqData.status;
        if (reqData?.tracking_status && reqData?.tracking_status_date) {
          const findExist = findPGVendorOrder.tracking_status.find(
            (itm) => itm.status === reqData?.tracking_status
          );
          if (!findExist) {
            payload["$push"] = {
              tracking_status: {
                status: reqData.tracking_status,
                status_date: reqData.tracking_status_date,
              },
            };
          }
        }
        if (reqData?.tracking_number)
          payload.tracking_number = reqData.tracking_number;
        if (reqData?.expected_delivery_date)
          payload.expected_delivery_date = reqData.expected_delivery_date;
        if (reqData.files && reqData.files.length > 0) {
          let imgs = await Promise.all(
            reqData?.files.map(async (element) => {
              let imageUrl = await uploadToS3Image({
                file: element,
                platform: "physical_vendor",
                folder: "pgDocuments",
              });
              if (imageUrl) {
                return Promise.resolve(imageUrl);
              }
            })
          ).then((values) => {
            return values;
          });

          if (imgs.length > 0) {
            payload.documents = imgs;
          }
        }
      } else if (reqData.status) {
        payload.status = reqData.status;
      } else {
        return new Response(400, "F", {}).custom("Please Provide Valid Status");
      }

      const updatedOrder = await PGVendorOrders.findOneAndUpdate(
        { _id: reqData.id },
        payload,
        { new: true }
      );

      console.log();
      response = new Response(200, "T", updatedOrder).custom(
        "Order Updated Successfully"
      );
    } catch (err) {
      console.error(err, "err update pg vendor order");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  }

  static async orderConfirmation(reqData) {
    let response;
    try {
      let { id, status } = reqData;

      if (!id || !status)
        return new Response(422, "F").custom("Order ID is required");

      let findPGOrder = await PGVendorOrders.findById(id).lean();

      if (!findPGOrder) return new Response(404, "F").custom("Order not found");
      if (findPGOrder.status !== "PENDING")
        return new Response(400, "F").custom(
          `Order is already ${findPGOrder.status.toLowerCase()}`
        );

      let payload = {
        updated_by: reqData.authData._id,
        updated_at: new Date(),
        status: status,
        updated_at: new Date(),
        updated_by: reqData.authData._id,
        reason: reqData.reason || "",
      };

      if (reqData.status === "ACCEPTED") {
        findPGOrder.tracking_status.push({
          status: "BOOKING_CONFIRMED",
          status_date: new Date(),
        });

        payload.tracking_status = findPGOrder.tracking_status;
      } else if (reqData.status === "REJECTED") {
        findPGOrder.tracking_status.push({
          status: "REJECTED",
          status_date: new Date(),
        });

        payload.tracking_status = findPGOrder.tracking_status;
      }
      let updatedOrder = await PGVendorOrders.findOneAndUpdate(
        { _id: id },
        { ...payload },
        { new: true }
      );

      if (
        updatedOrder.status === reqData.status &&
        reqData.status === "REJECTED"
      ) {
        let adminCollection = await connectToDatabaseAndGetCollection(
          findPGOrder.vendor_id,
          "admins"
        );

        let findAdmin = await adminCollection.findById(findPGOrder.user_id);

        if (!findAdmin) {
          adminCollection = await connectToDatabaseAndGetCollection(
            findPGOrder.vendor_id,
            "users"
          );

          findAdmin = await adminCollection.findById(findPGOrder.user_id);
        }

        if (!findAdmin) {
          return (response = new Response(404, "F").custom(`Order not found`));
        }
        const updateAdmin = await adminCollection.updateOne(
          { _id: findPGOrder.user_id },
          {
            $inc: { balance: 5 },
          }
        );

        let redeemTranscationHistory = await connectToDatabaseAndGetCollection(
          findPGOrder.vendor_id,
          "redeem-transaction"
        );

        let findRedeemTransaction =
          await redeemTranscationHistory.findOneAndUpdate(
            {
              beneficiary_id: findPGOrder.user_id,
              status: "PENDING",
            },
            {
              status: "REJECTED",
            },
            {
              new: true,
            }
          );

        response = new Response(200, "T", findPGOrder).custom(
          `Order ${reqData.status}`
        );
      } else if (
        updatedOrder.status === reqData.status &&
        reqData.status === "ACCEPTED"
      ) {
        let redeemTranscationHistory = await connectToDatabaseAndGetCollection(
          findPGOrder.vendor_id,
          "redeem-transaction"
        );

        let findRedeemTransaction =
          await redeemTranscationHistory.findOneAndUpdate(
            {
              beneficiary_id: findPGOrder.user_id,
              status: "PENDING",
            },
            {
              status: "COMPLETED",
            },
            {
              new: true,
            }
          );
        response = new Response(200, "T").custom(`Success`);
      } else {
        response = new Response(400, "F").custom(
          `Something went wrong, please try again`
        );
      }
    } catch (err) {
      console.error(err, "err create pg vendor order");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  }

  static async trackingStatusUpdate(reqData) {
    let response;
    try {
      let { id, tracking_status } = reqData;

      if (!id && !tracking_status)
        return new Response(422, "F").custom("Order ID is required");

      let findPGOrder = await PGVendorOrders.findById(id).lean();
      if (!findPGOrder) return new Response(404, "F").custom("Order not found");
      if (findPGOrder.status !== "ACCEPTED")
        return new Response(406, "F").custom(
          `Tracking status can be updated only for accepted order`
        );

      let payload = {
        updated_by: reqData.authData._id,
        updated_at: new Date(),
      };

      let imgArr = [];

      if (reqData.files && reqData.files.length > 0) {
        let imgs = await Promise.all(
          reqData?.files.map(async (element) => {
            let imageUrl = await uploadToS3Image({
              file: element,
              platform: "physical_vendor",
              folder: "pgDocuments",
            });

            if (imageUrl) {
              return Promise.resolve(imageUrl);
            }
          })
        ).then((values) => {
          return values;
        });

        imgs.map((element, index) => {
          if (reqData.primary_index && index === +reqData.primary_index) {
            imgArr.unshift(element);
          } else {
            imgArr.push(element);
          }
        });
      }
      if (imgArr.length > 0) {
        payload["documents"] = imgArr;
      }

      if (reqData.tracking_number) {
        payload.tracking_number = reqData.tracking_number;
      }

      if (reqData.expected_delivery_date) {
        payload.expected_delivery_date = reqData.expected_delivery_date;
      }

      payload.tracking_status = findPGOrder.tracking_status;

      payload.tracking_status.push({
        status: reqData.tracking_status,
        status_date: new Date(),
      });

      let updatedOrder = await PGVendorOrders.findOneAndUpdate(
        { _id: id },
        { ...payload },
        { new: true }
      );

      return new Response(200, "T", updatedOrder).custom(
        `Tracking status updated successfully`
      );
    } catch (err) {
      console.error(err, "err create pg vendor order");
      response = new Response(500, "F", {}).custom(err.message);
    }
    return response;
  }

  static removeImages = async (reqData) => {
    let response;
    try {
      let findOldPGOrder = await PGOrders.findById({
        _id: reqData.id,
      }).lean();

      if (!findOldPGOrder) {
        response = new Response(404, "F").custom("Order not found");
      } else {
        if (reqData.image) {
          let findImage = findOldPGOrder.documents.find((e) => {
            return e === reqData.image;
          });

          if (findImage) {
            let deleteData = await deleteFromS3Image(findImage);

            let removeImge = await PGOrders.findByIdAndUpdate(
              { _id: reqData.id },
              { $pull: { documents: reqData.image } },
              { new: true }
            );
            response = new Response(200, "T").custom("Image removed..");
          } else {
            response = new Response(404, "F").custom("Image not found");
          }
        } else {
          response = new Response(404, "F").custom("Image not found");
        }
      }
    } catch (error) {
      console.log(error, "error");
      response = new Response().custom(error.message);
    }
    return response;
  };

  static async bulkAddCategories(reqData) {
    let response;
    try {
      const { categories, authData, vendor_id } = reqData;

      if (!Array.isArray(categories) || categories.length === 0) {
        return new Response(400, "F").custom("No categories provided");
      }

      const idMapping = {};
      const insertedCategories = [];

      const insertBatch = async (batch) => {
        for (const category of batch) {
          const { name, categoryId, parent_id, description, isActive, level } =
            category;

          let parentCategory = null;
          let finalLevel = level || 1;

          if (parent_id && parent_id !== 0) {
            const parentMongoId = idMapping[parent_id];
            if (!parentMongoId) {
              console.log(`Skipping ${name} for now — parent not yet created`);
              continue;
            }
            parentCategory = await Category.findById(parentMongoId);
            finalLevel = parentCategory.level + 1;
          }

          let query = { name };
          if (parentCategory?._id) {
            query.parent_id = parentCategory._id;
          }

          let findCategory = await Category.findOne(query);
          if (findCategory) {
            console.log(`Skipping duplicate category: ${name}`);
            idMapping[categoryId] = findCategory._id;
            continue;
          }

          let categoryData = {
            name,
            code: null,
            description: description || null,
            level: finalLevel,
            isActive: isActive ?? 1,
            added_by: authData._id,
            categoryId,
            vendor_id: vendor_id,
          };

          if (parentCategory?._id) {
            categoryData.parent_id = parentCategory._id;
          }

          const newCategory = await Category.create(categoryData);

          idMapping[categoryId] = newCategory._id;
          insertedCategories.push(newCategory);
        }
      };

      await insertBatch(
        categories.filter((cat) => !cat.parentInt || cat.parentInt === 0)
      );

      let remaining = categories.filter(
        (cat) => cat.parentInt && cat.parentInt !== 0
      );
      let lastRemainingCount = -1;

      while (remaining.length > 0 && remaining.length !== lastRemainingCount) {
        lastRemainingCount = remaining.length;
        await insertBatch(remaining);
        remaining = remaining.filter((cat) => !idMapping[cat.categoryId]);
      }

      if (remaining.length > 0) {
        console.warn(
          "Some categories could not be inserted due to missing parents:",
          remaining
        );
      }

      response = new Response(201, "T", insertedCategories).custom(
        `${insertedCategories.length} categories created successfully`
      );
    } catch (error) {
      console.log(error, "Error in bulkAddCategories");
      response = new Response().custom(error.message);
    }
    return response;
  }

  static async deleteMultipleCategory(reqData) {
    let response;
    try {
      // await Category.deleteMany({ categoryId: { $exists: true, $ne: null } });
      let findPhysicalGood = await PhysicalGood.find({
        vendor_id: "689c5c20d7bd4f14c13dfb67",
      });

      let allImageKeys = findPhysicalGood.flatMap((item) => {
        if (Array.isArray(item.images)) {
          return item.images.map((img) => img.key);
        }
        return [];
      });

      allImageKeys = [...new Set(allImageKeys)];

      if (allImageKeys.length) {
        await deleteFromS3Image(allImageKeys);
      }

      await PhysicalGood.deleteMany({ vendor_id: "689c5c20d7bd4f14c13dfb67" });
      response = new Response(200, "T").custom("Deleted....");
    } catch (error) {
      response = new Response().custom(error.message);
    }
    return response;
  }
}

export default CategoryModel;
