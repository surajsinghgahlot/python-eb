import { Mongoose, Schema, Types, model } from "mongoose";

export const vendorSchema = new Schema(
  {
    title: {
      type: String,
    },
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    vender_business_type: {
      type: String,
      enum: ["B2B", "B2C"],
      default: "B2B",
    },
    gst_number: {
      type: String,
    },
    pan_tan_number: {
      type: String,
    },
    uan_number: {
      type: String,
    },
    image: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      immutable:true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    zone: {
      type: String,
      enum: ["EAST", "WEST","NORTH","SOUTH"],
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      immutable:true,
      match: [
        /^[0-9]{10}$/,
        'Please enter a valid 10-digit mobile number',
      ],
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "INACTIVE",
    },
    user_name: {
      type: String,
      unique : true
    },
    password: {
      type: String,
    },
    brand: {
      type: Types.ObjectId,
    },
    instance_name: {
      type: String,
    },
    value_type : {
      type: String,
      enum: ['POINT','VALUE']
    },
    coupon_limit : {
      type: Number,
    },
    database_id: {
      type: Types.ObjectId,
    },
    kyc_on_registration: {
      type: Boolean,
      default: false
    },
    approval_on_registration: {
      type: Boolean,
      default: false
    },
    allow_tds_deduction: {
      type: Boolean,
      default: false
    },
    loyalty_program_name: {
      type: String,
      default: false
    },
    program_otp_validity: {
      type: Number,
      default: 1
    },
    user_fields: [{
      type: Types.ObjectId, ref: "user-registration-fields" 
    }],
    redemption_type: {
      type: [{
        type: String,
        enum: ["CASH", "VOUCHER", "PHYSICAL_GOODS"]
      }],
      default: ["CASH"]
    },
    physical_vendors : [{
      type: Types.ObjectId, ref: "physical-goods-vendors"
    }],
    added_by: {
      type: Types.ObjectId,
      immutable:true,
      required: true,
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

let Vendor = new model("vendor", vendorSchema);
export default Vendor;
