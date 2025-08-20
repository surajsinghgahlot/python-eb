import './config/db.js'
import app from './app.js';
import * as http from 'http';
import { join, resolve } from 'path';
import { checkAndCreateDir, getLocalIpAddress } from './helpers/core/file-system.js';

const PORT = process.env.PORT || 3000;

const dirname = resolve();

const DIR = [
  `${dirname}/uploads`,
  `${dirname}/uploads/brandImg`,
  `${dirname}/uploads/contactImg`,
];

if(process.env.ENV === 'LOCAL'){
  const localIpAddress = getLocalIpAddress();
  console.log( 'Local IPv4 Address:', "\x1b[32m" , localIpAddress, '\x1b[37m');
}

checkAndCreateDir(DIR);
let httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log('Server is listening on port', "\x1b[31m" , PORT, '\x1b[37m');
});
