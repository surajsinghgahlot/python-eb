import { Mongoose, Schema, Types, model } from "mongoose";

export const adminSchema = new Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
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
    balance: {
      type: Number,
      default: 0,
    },
    emp_id :{
      type : String,
    },
    added_by :{
      type : Types.ObjectId,
      // required: true,
    },
    user_type: {
      type: String,
      enum: ["SUPERADMIN", "ADMIN","LOYALTYADMIN"],
      required: true
    },
    role: {
      type: Types.ObjectId
      // required: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE"],
        default: "ACTIVE",
      },
  },
  {
    versionKey: false,
  }
);

let Admin = new model("admins", adminSchema);
export default Admin;
