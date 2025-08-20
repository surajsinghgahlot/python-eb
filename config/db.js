import mongoose from "mongoose";
import { seedData, seedAccess, seedPoints, seedUserFields } from "./seeder.js";

// Environment variables are now provided by AWS Elastic Beanstalk
// Only load dotenv for local development
if (process.env.NODE_ENV === 'development' || process.env.ENV === 'LOCAL') {
  const dotenv = await import('dotenv');
  dotenv.config({ path: "./.env" });
}

let URL;
if (process.env.ENV === "LOCAL") {
  URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
} else {
  // URL = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
  URL = process.env.LIVE_URL_DB;
}

const connectDB = async () => {
  try {
    mongoose.set({ strictQuery: false });
    // mongoose.set('debug', true);
    
    // Add proper connection options with timeouts and retries
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferMaxEntries: 0,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
      w: 'majority'
    };
    
    await mongoose.connect(URL, connectionOptions);
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise();
    
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
    // Exit process if database connection fails
    process.exit(1);
  }
};


connectDB();
