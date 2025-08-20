import mongoose, { Schema, model, Types } from "mongoose";

export const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    access_id: {
      type: Types.ObjectId,
    },
    created_at:{
      type:Date,
      immutable:true,
      default:Date.now
    }
  },
  {
    versionKey: false,
  }
);

const Permission = model("permission", permissionSchema);

export default Permission;