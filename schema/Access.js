import mongoose, { Schema, model, Types } from "mongoose";

export const accessSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    created_at:{
      type:Date,
      immutable:true,
    },
    updated_at:{
      type:Date,
    }
  },
  {
    versionKey: false,
  }
);

const Access = model("access", accessSchema);

export default Access;

