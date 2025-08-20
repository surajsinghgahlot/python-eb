import { Mongoose, Schema, Types, model } from "mongoose";

export const brandSchema = new Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    sender_id: {
      type: String,
    },
    sender_name: {
      type: String,
    },
    sender_email: {
      type: String,
    },
    url: {
      type: String,
    },
    mobile: {
      type: String,
    },
    image: {
        type: String,
    },
    added_by: {
      type: Types.ObjectId,
      required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "INACTIVE",
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

let Brand = new model("brand", brandSchema);
export default Brand;
