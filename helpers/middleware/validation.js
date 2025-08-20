import { check } from "express-validator";
import { titleCase } from "../project/custom.js";

const commonRequired = (key) => {
  return check(key)
    .exists()
    .withMessage(`${titleCase(key, "_")} is Required`)
    .not()
    .isEmpty()
    .withMessage(`${titleCase(key, "_")} can not be empty`);
};

const multiCommonRequired = (labels) => {
  return labels.map((label) => {
    return check(label)
      .exists()
      .withMessage(`${titleCase(label, "_")} is Required`)
      .not()
      .isEmpty()
      .withMessage(`${titleCase(label, "_")} can not be empty`);
  });
};

export default {
  adminCreate: [
    ...multiCommonRequired(["first_name", "last_name", "email", "mobile"]),
    check("password")
      .exists()
      .withMessage("Password is Required")
      .not()
      .isEmpty()
      .withMessage("Password can not be empty")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
      )
      .withMessage(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ],
  signIn: [...multiCommonRequired(["credential", "password"])],
  verificationOtp: [...multiCommonRequired(["id", "otp"])],
  forgotPassword: [commonRequired("email")],
  resendOtp: [commonRequired("id")],
  changePass: [
    commonRequired("id"),
    check("password")
      .exists()
      .withMessage("Password is Required")
      .not()
      .isEmpty()
      .withMessage("Password can not be empty")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
      )
      .withMessage(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ],
  updatePass: [
    ...multiCommonRequired(["id", "oldPassword"]),
    check("newPassword")
      .exists()
      .withMessage("New password is Required")
      .not()
      .isEmpty()
      .withMessage("New password can not be empty")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
      )
      .withMessage(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ],
  updateProfile: [
    ...multiCommonRequired([
      "id",
      "username",
      "name",
      "password",
      "email",
      "mobile",
      "address",
      "city",
      "state",
      "country",
    ]),
    check("password")
      .optional()
      .not()
      .isEmpty()
      .withMessage("Password can not be empty")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
      )
      .withMessage(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
  ],
  addEmail: [...multiCommonRequired(["name", "subject", "message"])],
  addBrand: [
    ...multiCommonRequired([
      "name",
      "code",
      // "sender_id",
      // "sender_name",
      // "sender_email",
      // "url",
      // "mobile",
    ]),
  ],
  updateRoleStatus: [...multiCommonRequired(["id", "status"])],

  addRole: [...multiCommonRequired(["role", "role_code", "permission"])],

  vendorCreate: [
    ...multiCommonRequired([
      "title",
      "first_name",
      "last_name",
      "address",
      "mobile",
      "instance_name",
      "user_name",
      "brand",
      "pan_tan_number",
      "value_type",
    ]),
    check("password")
      .exists()
      .withMessage("Password is Required")
      .not()
      .isEmpty()
      .withMessage("Password can not be empty")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/
      )
      .withMessage(
        "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    check("email")
      .exists()
      .withMessage("Email is Required")
      .not()
      .isEmpty()
      .withMessage("Email can not be empty")
      .isEmail()
      .withMessage("Invalid email"),
  ],

  addCouponOffer: [
    ...multiCommonRequired([
      "offer_name",
      "offer_code",
      "offer_start_date",
      "offer_end_date",
      "redemption_period",
      "quantity",
      "value_type",
      "offer_filter",
    ]),
  ],
  userFields: [commonRequired("field_keys")],

  addVendorDatabase: [
    ...multiCommonRequired([
      "name",
      "host",
      "port",
      "user_name",
      "password",
    ]),
  ],

  addPhysicalGoodVendor: [
    ...multiCommonRequired([
      "first_name",
      "last_name",
      "email",
      "mobile_number",
      "password",
    ]),
  ],
  createPGVendorOrder: [
    ...multiCommonRequired([
      "order_id",
      "points",
      "user_id",
      "physical_good_id",
    ]),
  ],


};
