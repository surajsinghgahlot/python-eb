import { Mongoose, Schema, Types, model } from "mongoose";
import { titleCase } from "../helpers/project/custom.js";

const vendorSchema = new Schema(
  {
    first_name: {
      type: String,
      set: titleCase,
      required: true
    },
    last_name: {
      type: String,
      set: titleCase,
      required: true
    },
    business_name: {
      type: String,
      set: titleCase,
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"],
    },
    password: {
      type: String,
      required: true
    },
    added_by: {
      type: Types.ObjectId,
      immutable:true,
      required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
    },
    otp: {
      type: String,
    },
    created_at: {
      type: Date,
      immutable:true,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

let Vendors = new model("physical-goods-vendor", vendorSchema);
export default Vendors;
