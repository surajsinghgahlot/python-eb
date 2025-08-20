import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes/index.routes.js';
import cookieParser from 'cookie-parser';
import { WhiteList } from './schema/index.js';
// import rateLimit from 'express-rate-limit';

const app = express();
const dirname = path.resolve();

app.use(cookieParser());
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(dirname, "public")));
app.use(express.static(path.join(dirname, "uploads")));

console.log("dirname:", dirname);
console.log("Static path for public:", path.join(dirname, "public"));
console.log("Static path for uploads:", path.join(dirname, "uploads"));


app.use(morgan('dev'));

// Additional simple health check for load balancer
app.get('/health', (req, res) => {
  try {
    res.status(200).send('Health check successful');
  } catch (error) {
    res.status(500).send('Health check failed');
  }
});

// Cache for whitelist URLs to avoid database queries on every request
let whitelistCache = [];
let whitelistCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const whiteList = async () => {
  try {
    // Check if cache is still valid
    const now = Date.now();
    if (whitelistCache.length > 0 && (now - whitelistCacheTime) < CACHE_DURATION) {
      return whitelistCache;
    }
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      console.log("Database not connected, using cached whitelist or allowing all origins");
      return whitelistCache.length > 0 ? whitelistCache : ['*']; // Allow all if no cache and DB not ready
    }
    
    const findList = await WhiteList.find().lean();
    whitelistCache = findList.map((item) => item.url);
    whitelistCacheTime = now;
    return whitelistCache;
  } catch (err) {
    console.log("Error fetching whitelist:", err);
    // Return cached data if available, otherwise allow all origins
    return whitelistCache.length > 0 ? whitelistCache : ['*'];
  }
}

let corsOptions = {
  origin: async (origin, callback) => {
    try {
      const whiteListUrls = await whiteList();
      // console.log("CORS whiteListUrls:", whiteListUrls, origin);  
      if (!origin || whiteListUrls.includes('*') || whiteListUrls.includes(origin)) {
        callback(null, true); 
      } else {
        callback(new Error("Not allowed by CORS")); 
      }
    } catch (err) {
      console.log("CORS error:", err);
      // Allow request if there's an error (fail open for now)
      callback(null, true);
    }
  },
  credentials: true
}

app.use(cors(corsOptions));

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTION');
  next();
});

// ALL INVALID ROUTES
routes(app);

app.get('*', (req, res) => {
  res.status(404).json({
    code: 404,
    info: 'Not Found.',
    status: true,
    message: 'The resource you looking for needs an valid end point.11',
  });
});

export default app;
