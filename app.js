import path from 'path';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
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

app.get('/v1/api/health-status', (req, res) => {
  res.json({
    code : 200,
    status : true,
    message : "System is Healthy"
  });
});

const whiteList = async () => {
  const findList = await WhiteList.find()
  return findList.map((item)=> item.url)
}

let corsOptions = {
  origin:  async (origin, callback) => {
    try {
      const whiteListUrls = await whiteList();
      // console.log("CORS whiteListUrls:", whiteListUrls,origin);  
      if (!origin || whiteListUrls.includes(origin)) {
        callback(null, true); 
      } else {
        callback(new Error("Not allowed by CORS")); 
      }
    } catch (err) {
      callback(err);
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
