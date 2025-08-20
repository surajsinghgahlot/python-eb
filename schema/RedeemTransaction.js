import { Schema, model, Types } from "mongoose";

export const redeemTransactionSchema = new Schema(
  {
    amount: {
      type: Number,
      required:true,
      immutable:true,
    },
    transaction_id: {
      type: String,
      required:true,
      immutable:true,
    },
    payment_gateway: {
      type: String,
    },
    pg_transaction_id: {
      type: String,
    },
    transfer_mode: {
      type: String,
      enum : ["upi","banktransfer","adjusted"],
      immutable:true,
    },
    beneficiary_id: {
      type: Types.ObjectId,
      immutable:true,
    },
    account_number:{
        type: String,
    },
    ifsc:{
        type: String,
    },
    upi_id:{
        type: String,
    },
    remarks:{
        type: String,
    },
    transfer_service_charge:{
        type: Number,
    },
    transfer_service_tax:{
        type: Number,
    },
    status :{
        type: String,
        enum : ["PENDING","COMPLETED","REJECTED","FAILED"],
        default : "PENDING"
    },
    pg_status :{
        type: String,
    },
    approved_by: {
      type: Types.ObjectId,
      immutable:true,
    },
    added_by: {
      type: Types.ObjectId,
      immutable:true,
    },
    is_uploaded: {
      type: Boolean,
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

let RedeemTransaction = new model("redeem-transaction", redeemTransactionSchema);
export default RedeemTransaction;
