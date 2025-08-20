import jwt from "jsonwebtoken";
import Response from "./Response.js";
import { Admin, Vendor, PhysicalGoodsVendor } from "../schema/index.js";

/* -------------------------------------------------------------------------- */
/*                               JWT Validation                               */
/* -------------------------------------------------------------------------- */

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_TIMEOUT_DURATION = process.env.ACCESS_TOKEN_TIMEOUT_DURATION;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_TIMEOUT_DURATION =
  process.env.REFRESH_TOKEN_TIMEOUT_DURATION;

let refreshTokens = [];

async function signJwt(payloadData) {
  const jwtPayload = payloadData;

  const addToken = { ...payloadData };

  addToken.token = jwt.sign(jwtPayload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_TIMEOUT_DURATION,
  });

  return addToken;
}

async function signRefreshJwt(payloadData) {
  const jwtPayload = payloadData;

  const refreshToken = { ...payloadData };

  refreshToken.token = jwt.sign(jwtPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_TIMEOUT_DURATION,
  });
  refreshTokens.push(refreshToken.token);

  return refreshToken;
}

const generateAccessToken = async (req, res) => {
  const refreshToken = req?.cookies?.refreshToken || req?.body?.token;
  const { authorization } = req.headers;
  if (!authorization)
    return res
      .status(401)
      .json(
        new Response(401, false).custom(
          `Access denied Authorization in header needed.`
        )
      );
  // const refreshToken = req.body.token
  if (!refreshTokens.includes(refreshToken))
    return res
      .status(403)
      .json(
        new Response(403, false, "Forbidden").custom("Refresh Token Expired")
      );
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const { iat, exp, ...rest } = user;
    const token = jwt.sign(rest, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TIMEOUT_DURATION,
    });
    return res.status(200).json(new Response(200, true, { token }));
  });
};

const decodeToken = async (auth) => {
  return await jwt.verify(auth, process.env.ACCESS_TOKEN_SECRET, {
    ignoreExpiration: true,
  });
};

async function verifyJwt(req, res, next, type) {
  // get token from headers
  const { authorization } = req.headers;
  try {

    if (!authorization) {
      // no authorization
      res
        .status(401)
        .json(
          new Response(401, "F").custom(
            "Access denied Authorization in header needed."
          )
        );
    } else if (authorization) {
      const verifyValidToken = jwt.decode(authorization);
      if (!verifyValidToken) {
        res
          .status(401)
          .json(
            new Response(401, "F").custom("Invalid token in headers provided.")
          );
      } else {
        let findUserWithAuth ;
        const userTypeObj = {
          admin: Admin,
          pv: PhysicalGoodsVendor,
          vendor: Vendor
        }
        let userType = findUserWithAuth?.user_type;
        let id = verifyValidToken.vendor_id || verifyValidToken._id
        if(type === "vendor"){
          userType = "VENDOR";
        }
        findUserWithAuth = await userTypeObj[type].findById(id);

        if(type === "pv" && !findUserWithAuth){
          findUserWithAuth = await Admin.findById(id);
          userType = findUserWithAuth?.user_type;
        }
        if(type === "vendor"){
          userType = "VENDOR";
        }
        // if(isAdmin){
        //   findUserWithAuth = await Admin.findById(verifyValidToken._id);
        // }else{
        //   findUserWithAuth = await Vendor.findById(verifyValidToken?.vendor_id || verifyValidToken._id );
        // }

        jwt.verify(authorization, ACCESS_TOKEN_SECRET, (err, user) => {
          if (err)
            return res
              .status(403)
              .json(new Response(403, "F").custom(`Token Expired`));

          if (user.status === "INACTIVE") {
            res
              .status(401)
              .json(
                new Response(401, "F").custom(
                  `Your account is ${user.status}. Please contact to administrator`
                )
              );
          } else if (user.is_deleted === "DELETED") {
            res
              .status(401)
              .json(new Response(401, "F").custom(`Admin not found`));
          } else if (findUserWithAuth) {
            req.authData = user;
            req.authData.user_type = userType;        
            if(type === "vendor"){
              req.authData.physical_vendors = findUserWithAuth?.physical_vendors || [];
            }
            next();
          } else {
            res
              .status(401)
              .json(
                new Response(401, "F").custom(
                  "Invalid Authorization in headers."
                )
              );
          }
        });
      }
    }
  } catch (error) {
    console.log(error,'error')
    if (error.message === "invalid signature") {
      res
        .status(401)
        .json(
          new Response(401, "F").custom("Login Again (Invalid JWT Signature).")
        );
    } else {
      res.status(500).json(new Response(500).custom(error.message));
    }
  }
}

function verifyJwtAdmin(req, res, next){
    verifyJwt(req, res, next,"admin")
}

function verifyJwtPV(req, res, next){
    verifyJwt(req, res, next,"pv")
}
  
function verifyJwtVendor(req, res, next){
  verifyJwt(req, res, next,"vendor")
}

async function logout(req, res) {
  const refreshToken = req?.cookies?.refreshToken;
  let data = await [...refreshTokens].filter((token) => token !== refreshToken);
  refreshTokens = data;
  res.clearCookie("refreshToken", { httpOnly: true });
  return res
    .status(204)
    .json(new Response(204, "F").custom("Logout Successfully"));
}

async function checkUserType(req, res, next, user_type) {
  try {
    // get token from headers
    const { authorization } = req.headers;
    // decode token
    const decoded = await decodeToken(authorization);

    //check user role
    if (decoded.user_type === user_type && decoded.status === "ACTIVE") {
      next();
    } else if (decoded.user_type === "SUPER_ADMIN") {
      next();
    } else {
      return res
        .status(401)
        .json(new Response(401, "F").custom("Unauthorized user"));
    }
  } catch (error) {
    res.status(500).json(new Response(500).custom(error.message));
  }
}

async function isSuperAdmin(req, res, next) {
  checkUserType(req, res, next, "SUPERADMIN");
}

async function isAdmin(req, res, next) {
  checkUserType(req, res, next, "ADMIN");
}

export {
  signJwt,
  verifyJwtAdmin,
  verifyJwtVendor,
  isAdmin,
  isSuperAdmin,
  generateAccessToken,
  signRefreshJwt,
  logout,
  verifyJwtPV
};
