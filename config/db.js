import mongoose from "mongoose";
import { env } from "process";
import dotenv from "dotenv";
import { seedData, seedAccess, seedPoints, seedUserFields } from "./seeder.js";
dotenv.config({ path: "./.env" });

const { DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, LIVE_URL,PORT, ENV } = env;

let URL;
if (ENV === "LOCAL") {
  URL = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
} else {
  // URL = `mongodb://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  URL = LIVE_URL;
}

const connectDB = async () => {
  try {
    mongoose.set({ strictQuery: false });
    // mongoose.set('debug', true);
    await mongoose.connect(URL, {
    });
    // const collectionsCursor = mongoose.connection.db.listCollections();
    // const collections = await collectionsCursor.toArray();
    // const filteredCollections = collections.filter(
    //   (collection) =>
    //     !collection.name.startsWith("system.") &&
    //     collection.name !== "resources" && !collection.name.startsWith("system.") &&
    //     collection.name !== "permissions" && !collection.name.startsWith("system.") &&
    //     collection.name !== "accesses" && !collection.name.startsWith("system.") &&
    //     collection.name !== "users" 
    // );

    // for (const collection of filteredCollections) {
    //   const collectionName = collection.name;
      // const existingResource = await Resource.findOne({ name: collectionName });
      // if (!existingResource) {
      //   const newResource = await Resource.create({ name: collectionName });
      //   console.log(`Resource created for collection: ${newResource.name}`);
      // }
    // }
    await seedData();
    await seedAccess();
    await seedPoints();
    await seedUserFields();
    console.log("DB connected",new Date());

  } catch (err) {
    console.log("Failed to connect to MongoDB", err);
  }
};


connectDB();
