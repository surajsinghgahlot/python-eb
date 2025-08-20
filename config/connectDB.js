import mongoose, { Types } from "mongoose";
import { decryptData } from "../helpers/project/enryptDecrypt.js";
import Vendor, { vendorSchema } from "../schema/Vendor.js";
import { accessSchema } from "../schema/Access.js";
import  {userSchema}  from "../schema/User.js";
import Permission, { permissionSchema } from "../schema/Permission.js";
import Access from "../schema/Access.js";
import VendorDatabase from "../schema/VendorDatabase.js";
import { brandSchema } from "../schema/Brand.js";
import { userFieldsSchema } from "../schema/UserFields.js";
import { riskSchema } from "../schema/RiskLimit.js";
import { pointHistorySchema } from "../schema/PointsHistory.js";
import { redeemSchema } from "../schema/Redeem.js";
import { redeemTransactionSchema } from "../schema/RedeemTransaction.js";
// import { adminSchema } from "../schema/Admin.js";

const SchemaObj = {
  vendors: vendorSchema,
  admins: vendorSchema,
  users: userSchema,
  accesses: accessSchema,
  point_history: pointHistorySchema,
  reedem: redeemSchema,
  permissions: permissionSchema,
  brands: brandSchema,
  "user-registration-fields": userFieldsSchema,
  "risk-limits": riskSchema,
  "redeem-transaction": redeemTransactionSchema,
  // "admins" : adminSchema,
};

export async function createVendorDatabase(vendorPayload) {
  if (!vendorPayload) return false;
  try {
    let findAccess = await Access.find().lean();
    let findPermission = await Permission.find().lean();
    const URL = `mongodb://127.0.0.1:27017/${vendorPayload.instance_name}`;
    const connection = await mongoose.createConnection(URL).asPromise();
    const vendorCollection = connection.model("admins", vendorSchema);
    const accessCollection = connection.model("accesses", accessSchema);
    const permissionCollection = connection.model(
      "permissions",
      permissionSchema
    );
    const finalVendorPayload = { ...vendorPayload, user_type: "SUPERADMIN" };
    await vendorCollection.create(finalVendorPayload);
    const accessData = findAccess.map((item) => {
      return { name: item.name };
    });
    const permissionData = findPermission.map((item) => {
      return {
        name: item.name,
        access_id: item.access_id,
        created_at: new Date(),
      };
    });
    await accessCollection.create(accessData);
    await permissionCollection.create(permissionData);

    console.log(`Created Vendor DB - ${vendorPayload.instance_name}`);
    return true;
  } catch (err) {
    console.log(err, "errrrrrrrr");
  }
}

export async function connectToDatabaseAndGetCollection(vendorId, Collection) {
  if (!vendorId && !Collection) return false;
  if (!Object.keys(SchemaObj).includes(Collection)) return false;
  try {
    let findVendor = await Vendor.findOne({
      _id: new Types.ObjectId(vendorId),
    }).lean();

    if (findVendor) {
      let vendorDataBase;
      let URL = "mongodb://127.0.0.1:27017/loyalty-vendor";
      if (process.env.ENV !== "LOCAL" && findVendor?.database_id) {
        vendorDataBase = await VendorDatabase.findOne({
          _id: new Types.ObjectId(findVendor?.database_id),
        });
        if (!vendorDataBase) return false;
        const { name, host, port, user_name, password } = vendorDataBase;
        let decryptPassword = decryptData(password);
        URL = `mongodb://${user_name}:${decryptPassword}@${host}:${port}/${name}`;
      }
      const connection = mongoose.createConnection(URL);
      await connection.asPromise();

      const schema = SchemaObj[Collection];

      if (!schema || typeof schema.obj === "undefined") {
        throw new Error(`Invalid schema for collection: ${Collection}`);
      }

      const collection =
        connection.models[Collection] || connection.model(Collection, schema);

      console.log(
        `✅ Connected to Vendor DB - ${
          findVendor.database_id || "loyalty-vendor"
        }`
      );
      return collection;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err, "errrrrrrrr");
  }
}
