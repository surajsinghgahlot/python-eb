import { Mongoose, Schema, Types, model } from "mongoose";

const trackingSchema = new Schema(
  {
    status: {
      type: String,
      enum: [
        "BOOKING_REQUESTED",
        "BOOKING_CONFIRMED",
        "SHIPMENT_AT_WAREHOUSE",
        "DEPARTED",
        "ARRIVED",
        "DELIVERED",
        "REJECTED"
      ],
      default: "BOOKING_REQUESTED",
    },
    status_date: { type: Date, default: Date.now() },
  },
  {
    _id: false,
    versionKey: false,
  }
);

const pgOrderSchema = new Schema(
  {
    order_id: {
      type: String,
      immutable: true,
      required: true,
    },
    points: {
      type: String,
      immutable: true,
      required: true,
    },
    vendor_id: {
      type: Types.ObjectId,
      immutable: true,
      required: true,
    },
    user_id: {
      type: Types.ObjectId,
      ref: "users",
      immutable: true,
      required: true,
    },
    physical_good_id: {
      type: Types.ObjectId,
      ref: "physical-goods",
      immutable: true,
    },
    tracking_number: {
      type: String,
    },
    expected_delivery_date: {
      type: String,
    },
    tracking_status: {
      type: [trackingSchema],
      default: [
        {
          status: "BOOKING_REQUESTED",
          status_date: Date.now(),
        },
      ],
    },
    documents: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    reason: {
      type: String,
    },
    created_at: {
      type: Date,
      immutable: true,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    updated_by: {
      type: Types.ObjectId,
    },
  },
  {
    versionKey: false,
  }
);

let PGOrders = new model("physical-goods-orders", pgOrderSchema);
export default PGOrders;
