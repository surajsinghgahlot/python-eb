import { Mongoose, Schema, Types, model } from "mongoose";

let physicalGoodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category_id: {
      type: Types.ObjectId,
      ref: "categories",
      required: true,
    },
    productId: {
      type: String,
    },
    vendor_id: {
      type: Types.ObjectId,
      ref: "physical-goods-vendors",
      required: true,
    },
    code: {
      type: String,
      // unique: true,
    },
    model_no: {
      type: String,
    },
    images: { type: [String] },
    description: {
      type: String,
    },
    brand: {
      type: String,
    },
    size: {
      type: String,
    },
    unit: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    shipping_price: {
      type: Number,
    },
    cgst: {
      type: Number,
      // required: true,
    },
    sgst: {
      type: Number,
      // required: true,
    },
    igst: {
      type: Number,
      // required: true,
    },
    discount: {
      type: Number,
    },
    redeemable_value: {
      type: Number,
      // immutable: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    added_by: {
      type: Types.ObjectId,
    },
    created_at: {
      type: Date,
      immutable: true,
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

let PhysicalGood = new model("physical_good", physicalGoodSchema);
export default PhysicalGood;
