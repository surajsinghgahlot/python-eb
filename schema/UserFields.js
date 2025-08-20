import { Mongoose, Schema, Types, model } from "mongoose";

export const userFieldsSchema = new Schema(
  {
    label: {
      type: String,
    },
    value: {
      type: String,
      required : true
    },
    required: {
      type: Boolean,
    },
    registration: {
      type: Boolean,
    },
    profile: {
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

let userFields = new model("user-registration-field", userFieldsSchema);
export default userFields;
