import express from 'express';
import SuperAdminRouter from './superadmin.routes.js';
import PhysicalVendorRouter from './physical-vendor.routes.js';
import VendorThirdPartyRouter from './vendor-third-party.routes.js';

function initialize(app) {
  const apiRouter = express.Router();

  
  apiRouter.use("/admin", (req, res, next) => {
    next(); 
  }, SuperAdminRouter);
  
  apiRouter.use("/vendor-third-party", (req, res, next) => {
    next(); 
  }, VendorThirdPartyRouter);
  
  apiRouter.use("/pv", (req, res, next) => {
    next(); 
  }, PhysicalVendorRouter);

  app.use('/v1/api', apiRouter);
}

export default initialize;
