import { Mongoose, Schema, Types, model } from "mongoose";

let dataBaseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    host: {
      type: String,
      required: true,
      unique: true,
    },
    port: {
      type: Number,
      required: true,
    },
    user_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    added_by: {
      type: Types.ObjectId,
      immutable:true,
      required: true
    },
    created_at: {
      type: Date,
      immutable:true,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

let VendorDatabase = new model("vendor_database", dataBaseSchema);
export default VendorDatabase;
