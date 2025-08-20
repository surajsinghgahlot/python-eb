import { Mongoose, Schema, Types, model } from "mongoose";

let roleSchema = new Schema(
  {
    role: {
      type: String,
    },
    role_code: {
      type: String,
    },
    permission_id: [{
      type: Types.ObjectId, ref: "permissions" 
    }],
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
    updated_at: {
      type: Date,
      default: Date.now,
    },
    added_by: {
      type: Types.ObjectId,
      required: true
    },
  },
  {
    versionKey: false,
  }
);

let Role = new model("role", roleSchema);
export default Role;
