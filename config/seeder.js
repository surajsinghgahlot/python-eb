import bcrypt from "bcryptjs";
import Response from "../helpers/Response.js";
import { Admin, Access, Points, Permission, UserFields } from "../schema/index.js";
import fs from "fs";
import { join, resolve } from "path";
const ROOT_DIR = resolve();

export async function seedData() {
  try {
    const findAdmin = await Admin.findOne({
      email: "loyalty@gmail.com",
      // mobile: "",
    });
    const tempPassword = "loyalty@123";

    const encryptedPassword = await bcrypt.hash(tempPassword, 10);

    if (!findAdmin) {
      const seeding = await Admin.create({
        email: "loyalty@gmail.com",
        first_name: "BZ loyalty",
        last_name: "loyalty",
        password: encryptedPassword,
        user_type: "SUPERADMIN",
        mobile:"1212121212"
      });
    }
    return true;
  } catch (err) {
    console.log(err);
    return new Response().custom(err.msg);
  }
}

export async function seedAccess() {
  try {
    const filePath = join(ROOT_DIR, "config/Static/access.json");
    const jsonString = await fs.readFileSync(filePath, "utf8");
    const access = JSON.parse(jsonString);

    for await (let elem of access) {
      let findaccess = await Access.findOne({
        name: elem.name,
      });
      if (!findaccess) {
        findaccess = await Access.create({
          name: elem.name,
        });
      }

      let permission = elem.permission;
      for await(let elem1 of permission){
        const findPermission = await Permission.findOne({ name: elem1 })
        if(!findPermission){
          const seeding1 = await Permission.create({
            name: elem1,
            access_id: findaccess._id
          });
        }
      }

    }
    return true;
  } catch (err) {
    console.log(err);
    return new Response().custom(err.msg);
  }
}

export async function seedPoints() {
  try {
    const findPoints = await Points.find()
    if(!findPoints || (findPoints && findPoints.length===0)){
      await Points.create({
        value : 0.1
      })
    }
    return true;
  } catch (err) {
    console.log(err);
    return new Response().custom(err.msg);
  }
}

export async function seedUserFields() {
  try {
    const filePath = join(ROOT_DIR, "config/Static/userFields.json");
    const jsonString = await fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(jsonString);

    for await (let elem of jsonData) {
      const findaccess = await UserFields.findOne({
        value: elem.value,
      });
      if (!findaccess) {
        const payload = {
          label : elem?.label,
          value : elem?.value,
          required: elem?.required,
          registration: elem?.registration,
          profile: elem?.profile,
        }
        await UserFields.create(payload);
      }

    }
    return true;
  } catch (err) {
    console.log(err);
    return new Response().custom(err.msg);
  }
}
