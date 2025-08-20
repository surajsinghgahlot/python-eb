import { Mongoose, Schema, Types, model } from "mongoose";

export const logsSchema = new Schema(
  {
    method: {
      type: String,
    },
    url: {
      type: String,
    },
    status: {
        type: Number,
    },
    admin_id: {
      type: Types.ObjectId,
      required: true
    },
    module: {
      type: String,
      required: true
    },
    message: {
      type: String,
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

let Logs = new model("admin-logs", logsSchema);
export default Logs;
