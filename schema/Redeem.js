import { Schema, Types } from "mongoose";

export const redeemSchema = new Schema(
  {
    points: {
      type: Number,
      required: true,
      immutable: true,
    },
    transaction_id: {
      type: String,
      required: true,
      immutable: true,
    },
    user_id: {
      type: Types.ObjectId,
    },
    remarks: {
      type: String,
    },
    type: {
      type: String,
      enum: ["GV", "TRAVEl", "PHYSICALGOOD"],
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
    },

    meta_data: {
      type: Object,
      default: {},
    },
    created_at: {
      type: Date,
      immutable: true,
      default: Date.now,
    },
  },
  { versionKey: false }
);
