import { Schema, Types, model } from "mongoose";

let domainWhitelistSchema = new Schema(
  {
    url: {
      type: String,
    },
    created_at: {
      type: Date,
      immutable:true,
      default: Date.now,
    },
    added_by: {
      type: Types.ObjectId,
      immutable:true,
      required: true
    },
  },
  {
    versionKey: false,
  }
);

let domainWhitelist = new model("domain-whitelist", domainWhitelistSchema);
export default domainWhitelist;
