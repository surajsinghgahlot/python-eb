import { Mongoose, Schema, Types, model } from "mongoose";

export const locationSchema = new Schema(
  {
    name: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pin_code: {
      type: String,
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

let Location = new model("location", locationSchema);
export default Location;
