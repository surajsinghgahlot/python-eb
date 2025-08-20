import { Schema, Types, model } from "mongoose";

const handleDecimal = (value) => {
  if (String(value).includes(".")) return Number(value).toFixed(2);
  else return value;
};

export const pointsSchema = new Schema(
  {
    value: {
      type: Number,
      set: handleDecimal,
    },
    updated_by: {
      type: Types.ObjectId,
      // required: true,
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

let Points = new model("points", pointsSchema);
export default Points;
