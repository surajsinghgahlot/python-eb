import { Mongoose, Schema, Types, model } from "mongoose";

export const riskSchema = new Schema(
  {
    vendor: { 
      redemption_limit: {
        amount: {
          d1: {
            type: Number,
            default: 2250000,
          },
          d7: {
            type: Number,
            default: 9800000,
          },
          d30: {
            type: Number,
            default: 40000000,
          },
        },
        count: {
          d1: {
            type: Number,
            default: 1500,
          },
          d7: {
            type: Number,
            default: 10500,
          },
          d30: {
            type: Number,
            default: 45000,
          },
        },
      },
      withdrawal_limit:{ 
        amount: {
          d1: {
            type: Number,
            default: 100000,
          },
          d7: {
            type: Number,
            default: 700000,
          },
          d30: {
            type: Number,
            default: 3000000,
          },
        },
        count: {
          d1: {
            type: Number,
            default: 1000,
          },
          d7: {
            type: Number,
            default: 7000,
          },
          d30: {
            type: Number,
            default: 30000,
          },
        }
       },
    }, 
    user: { 
      redemption_limit: {
        amount: {
          d1: {
            type: Number,
            default: 1500,
          },
          d7: {
            type: Number,
            default: 10500,
          },
          d30: {
            type: Number,
            default: 45000,
          },
        },
        count: {
          d1: {
            type: Number,
            default: 3,
          },
          d7: {
            type: Number,
            default: 21,
          },
          d30: {
            type: Number,
            default: 90,
          },
        }
      }, 
      withdrawal_limit: {
        amount: {
          d1: {
            type: Number,
            default: 1000,
          },
          d7: {
            type: Number,
            default: 7000,
          },
          d30: {
            type: Number,
            default: 30000,
          },
        },
        count: {
          d1: {
            type: Number,
            default: 2,
          },
          d7: {
            type: Number,
            default: 14,
          },
          d30: {
            type: Number,
            default: 60,
          },
        }
      }
     },
    vendor_id: {
      type: Types.ObjectId,
      required: true,
    },
    added_by: {
      type: Types.ObjectId,
      required: true,
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

let RiskLimit = new model("risk-limit", riskSchema);
export default RiskLimit;



