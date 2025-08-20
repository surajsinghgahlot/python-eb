import { Mongoose, Schema, Types, model } from "mongoose";

export const userSchema = new Schema(
  {
    first_name: {
      type: String,
    },
    last_name: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    mobile_number: {
      type: String,
      required: true,
      unique: true,
      match: [
        /^[0-9]{10}$/,
        'Please enter a valid 10-digit mobile number',
      ],
    },
    gender: {
      type: String,
      enum: ['MALE','FEMALE','OTHER'],
    },
    date_of_birth: {
      type: Date,
    },
    anniversary: {
      type: Date,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    pin_code: {
      type: String,
    },
    gst_number: {
      type: String,
    },
    customer_id: {
      type: String,
      uppercase: true,
      unique: true,
    },
    profile_photo: {
      type: String,
    },
    is_registered: {
      type: Boolean,
      default: false
    },
    is_profile_completed: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ["ACTIVE",'BLOCKED'],
      default: "ACTIVE"
    },
    // user_type: {
    //   type: Types.ObjectId,
    // },
    vendors : [{
      type: Types.ObjectId, ref: "vendors" 
    }],
    workshop_name: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    vehicle_type: {
      type: String,
      enum: ["TWO_WHEELER","FOUR_WHEELER","COMMERCIAL"]
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

let Users = new model("user", userSchema);
export default Users;

const userAllField = [
  "first_name",
  "last_name",
  "email",
  "mobile_number",
  "gender",
  "date_of_birth",
  "anniversary",
  "address",
  "country",
  "state",
  "city",
  "pin_code",
  "accupation",
  "customer_id",
  "profile_photo",
]

export const checkIsProfileCompleted = ( dataObj ) => {
  let keyFilteredData = []
  for(let key in dataObj){
    if(userAllField.includes(key) && dataObj[key]) {
      keyFilteredData.push(key)
    }
  }
  return userAllField.length === keyFilteredData.length
}
