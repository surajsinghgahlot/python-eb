import Role from "../../schema/Role.js";
import Admin from "../../schema/Admin.js";
import crypto from "crypto";
import Response from "../Response.js";
import { extractRequestData } from "../static/request-response.js";
import {Types} from 'mongoose'
function checkPassword(pass) {
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(pass)) {
    return false;
  }
}

function numberInRange(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function paginationHelper(limit = 1000, page = 1) {
  let paginate = { skip: 0 };
  const skipCount = Number(limit) * (Number(page) - 1);
  paginate.skip = Number(skipCount);
  paginate.limit = Number(limit);
  paginate.page = Number(page);
  return paginate;
}

function titleCase(str,splitter) {
  var splitStr = str.toLowerCase().split(splitter || " ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}

function customLookupWithUnwind(from, local, foreign, as, type) {
  return [
    {
      $lookup: {
        from: from,
        localField: local,
        foreignField: foreign,
        as: as,
      },
    },
    {
      $unwind: { path: `$${as}`, preserveNullAndEmptyArrays: type },
    },
  ];
}

function customLookup(from, local, foreign, as) {
  return [
    {
      $lookup: {
        from: from,
        localField: local,
        foreignField: foreign,
        as: as,
      },
    },
  ];
}

function generateOrCondition(fields, searchTerm) {
  const orCondition = fields.map((field) => ({
    [field]: new RegExp(searchTerm, "i"),
  }));

  return [
    {
      $match: {
        $or: orCondition,
      },
    },
  ];
}

function prependMatch(keyName, valueName) {
  const matchStage = {
    $match: {},
  };
  matchStage.$match[keyName] = valueName;
  return [matchStage];
}

let calcPc = async (n1, n2) => {
  if (n2 === 0 && n1 === 0) {
    return "0%";
  } else if (n1 === 0) {
    return "100%";
  } else if (n2 === 0) {
    return "-100%";
  } else {
    let P = n2 == 0 ? 1 : n2;
    return (
      (((n2 - n1) / P) * 100).toLocaleString("fullwide", {
        maximumFractionDigits: 3,
      }) + "%"
    );
  }
};

async function findFirstIndexInArrayOfObjects(arr, key, value) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === value) {
      return i;
    }
  }
  return -1;
}

async function checkPermission(req, res, next) {
  let response;
  try {
    const reqData = extractRequestData(req);
    let findUser = await Admin.findById(req.authData._id).lean();
    if (findUser.user_type === "SUPERADMIN") {
      next();
    } else {
    let condition = [
      ...prependMatch("_id", new Types.ObjectId(findUser.role)),
      {
        $unwind : '$permission_id'
      },
      {
        $match: {
          permission_id: new Types.ObjectId(reqData.permission_id),
        },
      },
    ];

    let findPermission = await Role.aggregate(condition);
    if (findPermission.length > 0) {
      next();
    } else if(!reqData?.permission_id){
      res
      .status(401)
      .json(new Response(401,"F").custom("Permission Required")); 
    } else {
      res
      .status(401)
      .json(new Response(401,"F").custom("Permission not granted")); 
    }
  }
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json(new Response(500, "F").custom(error.message));
  }
  return response
}

function generateRandomCode(length = 10) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let couponCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    couponCode += characters[randomIndex];
  }

  return couponCode;
}

function couponGenerator(codeLength, prefix = "BZ", suffix = "") {
  let uniqueCode = [prefix, "", suffix];
  let length = codeLength
    ? prefix
      ? suffix
        ? codeLength - prefix.length - suffix.length
        : codeLength - prefix.length
      : codeLength
    : 10;
  uniqueCode[1] = generateRandomCode(length);
  return uniqueCode.join("");
}

function randomString(
  length,
  chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
) {
  if (chars.length > 256) {
    throw new Error(
      "Argument chars should not have more than 256 characters; unpredictability may be compromised"
    );
  }

  const randomBytes = crypto.randomBytes(length);
  const charsLength = chars.length;
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % charsLength];
  }

  return result;
}

function generateCustomerId (prefix='BZ',suffix='CUST') {
  let uniqueCode = [prefix, (new Date() - 0), suffix];
  return uniqueCode.join("");
}

const commonRangeOnlyDateFilter = (param_date, start_date, end_date) => {
  const matchFilter = {};
  matchFilter[param_date] = {
    $gte: new Date(new Date(start_date).setHours(0, 0, 0)),
    $lte: new Date(new Date(end_date).setHours(23, 59, 59)),
  };
  return { $match: matchFilter };
};

function generateTransactionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let transactionId = '';
  for (let i = 0; i < 8; i++) {
    transactionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return transactionId;
}

function keyCase(str, splitter) {
  var splitStr = str.toLowerCase().split(" ");
  return splitStr.join(splitter || "_");
}



export {
  checkPassword,
  paginationHelper,
  numberInRange,
  titleCase,
  calcPc,
  findFirstIndexInArrayOfObjects,
  customLookupWithUnwind,
  commonRangeOnlyDateFilter,
  customLookup,
  generateOrCondition,
  prependMatch,
  checkPermission,
  couponGenerator,
  randomString,
  generateCustomerId,
  generateTransactionId,
  keyCase
};
