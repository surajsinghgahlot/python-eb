import { Schema, Types } from "mongoose";

export const pointHistorySchema = new Schema(
  {
    points: { type: Number, required: true, immutable: true },
    type: { type: String, enum: ["CREDIT", "DEBIT"] },
    transaction_type: { type: String },
    user_id: { type: Types.ObjectId, required: true, immutable: true },
    coupon_id: { type: Types.ObjectId, immutable: true },
    created_at: { type: Date, immutable: true, default: Date.now },
    redeem_type: { type: String, enum: ["GV", "TRAVEl", "PHYSICALGOOD"] },
    transaction_id: { type: String, required: true, immutable: true },
    remarks: { type: String },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"] },
    collection_id: { type: Types.ObjectId },
  },
  { versionKey: false }
);
